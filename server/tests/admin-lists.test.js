import http from "http";
import crypto from "crypto";
import { MongoMemoryServer } from "mongodb-memory-server";

import { load, createChecks } from "./helpers/harness.js";

const { check, report } = createChecks();
process.env.JWT_SECRET = "e2e-secret";

const mongod = await MongoMemoryServer.create();
const { default: mongoose } = await import("mongoose");
await mongoose.connect(mongod.getUri());
const { default: app } = await load("app.js");
const { default: Admin } = await load("admin/admin.model.js");
const { default: Patient } = await load("patients/patient.model.js");
const { default: Doctor } = await load("doctors/doctor.model.js");
const { default: Appointment } = await load("appointments/appointment.model.js");
const { Order } = await load("pharmacy/pharmacy.model.js");
const bcrypt = (await import("bcrypt")).default;

const server = http.createServer(app);
await new Promise((r) => server.listen(0, r));
const base = `http://127.0.0.1:${server.address().port}/api`;
const get = async (path, token) => (await fetch(base + path, { headers: { Authorization: `Bearer ${token}` } })).json();

await Admin.create({ firstName: "S", lastName: "A", email: "s@x.test", password: await bcrypt.hash("Passw0rd!", 10), role: "SuperAdmin" });
const tok = (await (await fetch(base + "/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: "s@x.test", password: "Passw0rd!" }) })).json()).data.token;

// 30 patients, a few named/gendered/inactive, one soft-deleted
const pats = [];
for (let i = 0; i < 30; i++) {
  pats.push(await Patient.create({ firstName: i === 0 ? "John" : `p${String(i).padStart(2, "0")}`, lastName: i === 0 ? "Smith" : "Test", email: `p${i}@x.test`, phone: `90000000${String(i).padStart(2, "0")}`, password: "x", gender: i % 2 ? "Female" : "Male", status: i < 5 ? "INACTIVE" : "ACTIVE" }));
}
await Patient.updateOne({ _id: pats[29]._id }, { deletedAt: new Date() });

let r = await get("/admin/patients?page=1&limit=10", tok);
check("patients page 1 of 10", r.data.length === 10 && r.pagination.total === 29 && r.pagination.pages === 3, JSON.stringify(r.pagination));
check("patient counts exclude deleted", r.counts.all === 29 && r.counts.inactive === 5 && r.counts.active === 24, JSON.stringify(r.counts));
check("no secrets in rows", !("password" in r.data[0]) && !("resetPasswordToken" in r.data[0]));
r = await get("/admin/patients?page=3&limit=10", tok);
check("last page has remainder", r.data.length === 9);
r = await get("/admin/patients?page=1&limit=10&search=john%20smith", tok);
check("multi-word name search", r.data.length === 1 && r.data[0].email === "p0@x.test", JSON.stringify(r.data.map((p) => p.email)));
r = await get("/admin/patients?page=1&limit=50&search=" + encodeURIComponent("(.*"), tok);
check("regex characters are literal", Array.isArray(r.data) && r.data.length === 0);
r = await get("/admin/patients?page=1&limit=50&status=INACTIVE&gender=male", tok);
check("status + gender filter", r.data.length === 3 && r.data.every((p) => p.status !== "ACTIVE" && p.gender === "Male"), r.data.length);
r = await get("/admin/patients?page=1&limit=3&sort=name-asc", tok);
check("name sort (case-insensitive)", r.data[0].firstName === "John" || r.data[0].firstName === "p01", r.data.map((p) => p.firstName).join(","));
r = await get("/admin/patients", tok);
check("unpaged full list unchanged", Array.isArray(r.data) && r.data.length === 29 && !r.pagination);

// doctors
const docs = [];
for (let i = 0; i < 6; i++) {
  docs.push(await Doctor.create({ firstName: `d${i}`, lastName: "Doc", email: `d${i}@x.test`, password: "DoctorPass1", phone: `${i}`, specialization: i < 2 ? "Cardiologist" : "Dermatologist", consultationFee: 100 * (i + 1), status: i === 0 ? "PENDING_APPROVAL" : i === 1 ? "INACTIVE" : "ACTIVE", payoutSettings: { accountNumber: "123456789" } }));
}
r = await get("/admin/doctors?page=1&limit=10&sort=fee-desc", tok);
check("doctor fee sort", r.data[0].consultationFee === 600);
check("doctor counts incl pending", r.counts.all === 6 && r.counts.pending === 1 && r.counts.inactive === 2 && r.counts.active === 4, JSON.stringify(r.counts));
check("doctor bank details not returned", !JSON.stringify(r.data).includes("123456789"));
r = await get("/admin/doctors?page=1&limit=10&specialization=cardiologist&status=PENDING_APPROVAL", tok);
check("doctor spec + pending filter", r.data.length === 1 && r.data[0].email === "d0@x.test");
check("unpaged doctor list hides bank details", !JSON.stringify(await get("/admin/doctors", tok)).includes("123456789"));

// appointments
for (let i = 0; i < 12; i++) {
  await Appointment.create({ patient: pats[i % 3]._id, doctor: docs[i % 2]._id, appointmentDate: new Date(Date.now() + i * 86400000), slot: { start: "09:00", end: "10:00" }, roomId: crypto.randomUUID(), status: i < 4 ? "COMPLETED" : "PENDING", consultationFee: i * 10, reason: i === 7 ? "Persistent migraine" : "Checkup" });
}
r = await get("/admin/appointments?page=1&limit=5", tok);
check("appointments paged + populated", r.data.length === 5 && r.data[0].patient?.firstName && r.pagination.total === 12);
check("appointment status counts", r.counts.all === 12 && r.counts.byStatus.COMPLETED === 4 && r.counts.byStatus.PENDING === 8, JSON.stringify(r.counts));
r = await get("/admin/appointments?page=1&limit=50&search=john", tok);
check("appointment search by patient name", r.data.length === 4 && r.data.every((a) => a.patient.firstName === "John"));
r = await get("/admin/appointments?page=1&limit=50&search=migraine", tok);
check("appointment search by reason", r.data.length === 1);
r = await get("/admin/appointments?page=1&limit=50&search=cardio", tok);
// Both doctors used in these appointments (d0, d1) are cardiologists.
check("appointment search by doctor specialization", r.data.length === 12 && r.data.every((a) => a.doctor.specialization === "Cardiologist"), r.data.length);
r = await get("/admin/appointments?page=1&limit=3&status=PENDING&sort=appt-date-asc", tok);
check("appointment status filter + date sort", r.data.every((a) => a.status === "PENDING") && new Date(r.data[0].appointmentDate) < new Date(r.data[1].appointmentDate));

// orders
const mk = (i, extra) => Order.create({ patient: pats[i % 2]._id, items: [{ name: "x", quantity: 1, price: 5 }], totalAmount: 5, shippingAddress: { line1: "1 St", city: "C", state: "S", pincode: "1" }, status: i % 3 === 0 ? "SHIPPED" : "PROCESSING", vrioOrderId: `VRIO-${1000 + i}`, ...extra });
for (let i = 0; i < 9; i++) await mk(i, i < 3 ? { orderType: "CONSULTATION" } : i < 6 ? { orderType: "PHARMACY" } : {});
r = await get("/admin/pharmacy/orders?page=1&limit=4", tok);
check("orders paged", r.data.length === 4 && r.pagination.total === 9);
check("order revenue excludes nothing cancelled here (9 x 5)", r.counts.revenue === 45, r.counts.revenue);
check("order counts by type (missing = pharmacy)", r.counts.byType.CONSULTATION === 3 && r.counts.byType.PHARMACY === 6 && r.counts.byStatus.SHIPPED === 3, JSON.stringify(r.counts));
r = await get("/admin/pharmacy/orders?page=1&limit=50&type=PHARMACY", tok);
check("pharmacy type includes legacy orders", r.data.length === 6);
r = await get("/admin/pharmacy/orders?page=1&limit=50&search=VRIO-1004", tok);
check("order search by CRM id", r.data.length === 1);
const one = await Order.findOne();
r = await get(`/admin/pharmacy/orders?page=1&limit=50&search=${String(one._id).slice(-6)}`, tok);
check("order search by partial order id", r.data.some((o) => o._id === String(one._id)));
r = await get("/admin/pharmacy/orders?page=1&limit=50&search=john", tok);
check("order search by patient name", r.data.length === 5 && r.data.every((o) => o.patient.firstName === "John"), r.data.length);

server.close();
await mongoose.disconnect();
await mongod.stop();
report();
