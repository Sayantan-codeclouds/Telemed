import crypto from "crypto";
import { execFileSync } from "child_process";
import { MongoMemoryServer } from "mongodb-memory-server";

import { load, createChecks, SERVER_DIR } from "./helpers/harness.js";

const { check, report } = createChecks();

const mongod = await MongoMemoryServer.create();
const uri = mongod.getUri("backfill");
const { default: mongoose } = await import("mongoose");
await mongoose.connect(uri);
const { default: Appointment } = await load("appointments/appointment.model.js");
const { Order } = await load("pharmacy/pharmacy.model.js");


const patient = new mongoose.Types.ObjectId();
const doctor = new mongoose.Types.ObjectId();
const mkAppt = (status, updatedAt) =>
  Appointment.create({ patient, doctor, appointmentDate: new Date("2026-09-01"), slot: { start: "09:00", end: "10:00" }, roomId: crypto.randomUUID(), status }).then(async (a) => {
    if (updatedAt) await Appointment.collection.updateOne({ _id: a._id }, { $set: { updatedAt } });
    return a;
  });
const mkOrder = (appointment, extra = {}) =>
  Order.create({ patient, orderType: "CONSULTATION", ...(appointment ? { appointment: appointment._id } : {}), items: [{ name: "Consultation", quantity: 1, price: 100 }], totalAmount: 100, shippingAddress: { line1: "1", city: "c", state: "s", pincode: "1" }, status: "DELIVERED", paymentStatus: "PAID", ...extra });

const cancelled = await mkAppt("CANCELLED", new Date("2026-09-20"));
const rejected = await mkAppt("REJECTED", new Date("2026-09-25"));
const oldCancelled = await mkAppt("CANCELLED", new Date("2026-01-05"));
const completed = await mkAppt("COMPLETED");
const appointmentSideOnly = await mkAppt("CANCELLED", new Date("2026-09-22"));

const o1 = await mkOrder(cancelled);
const o2 = await mkOrder(rejected);
const o3 = await mkOrder(oldCancelled);
const o4 = await mkOrder(completed);
const o5 = await mkOrder(null); // linked only from the appointment side
await Appointment.updateOne({ _id: appointmentSideOnly._id }, { order: o5._id });
const alreadyFlagged = await mkAppt("CANCELLED", new Date("2026-09-21"));
const o6 = await mkOrder(alreadyFlagged, { paymentStatus: "REFUND_PENDING", status: "CANCELLED" });

const run = (...args) =>
  execFileSync(process.execPath, ["scripts/backfill-consultation-refunds.js", ...args], {
    cwd: SERVER_DIR,
    env: { ...process.env, MONGO_URI: uri },
    encoding: "utf8",
  });

const statusOf = async (o) => (await Order.findById(o._id)).paymentStatus;

let out = run();
check("dry run finds the 4 eligible orders", /Found 4 paid consultation order/.test(out), out);
check("dry run changes nothing", (await statusOf(o1)) === "PAID" && (await statusOf(o2)) === "PAID");

out = run("--since=2026-09-01");
check("--since limits to recent cancellations (3)", /Found 3 /.test(out), out);

out = run("--apply", "--since=2026-09-01");
check("--apply flags them", /Flagged 3 order/.test(out), out);
check("cancelled order flagged", (await statusOf(o1)) === "REFUND_PENDING" && (await Order.findById(o1._id)).status === "CANCELLED");
check("rejected order flagged", (await statusOf(o2)) === "REFUND_PENDING");
check("order linked only from the appointment flagged", (await statusOf(o5)) === "REFUND_PENDING");
check("older cancellation outside --since untouched", (await statusOf(o3)) === "PAID");
check("completed visit untouched", (await statusOf(o4)) === "PAID");
check("already-flagged order untouched", (await statusOf(o6)) === "REFUND_PENDING");
check("re-running is safe (nothing left in range)", /Found 0 /.test(run("--apply", "--since=2026-09-01")));

let badArg = false;
try { run("--since=not-a-date"); } catch (e) { badArg = /Invalid --since/.test(String(e.stderr)); }
check("invalid --since rejected", badArg);

await mongoose.disconnect();
await mongod.stop();
report();
