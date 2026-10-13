/**
 * Backfill: flag refunds for consultations cancelled/rejected before
 * automatic refund flagging existed.
 *
 * Since that change, cancelling or rejecting a paid consultation marks its
 * order "Refund pending" so it appears in the admin refund flow. Older
 * cancellations kept their order as PAID. This script finds those orders and
 * (only with --apply) flags them. It never moves money: refunds are still
 * issued from the admin Orders page.
 *
 * Some of these may already have been refunded by hand in the CRM — review
 * the dry-run list first, and use --since to limit how far back it goes.
 *
 * Usage:
 *   node scripts/backfill-consultation-refunds.js                 # dry run (lists only)
 *   node scripts/backfill-consultation-refunds.js --since=2026-09-01
 *   node scripts/backfill-consultation-refunds.js --apply [--since=YYYY-MM-DD]
 *
 * Environment: Requires MONGO_URI in server/.env
 */
import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { pathToFileURL } from "url";
import Appointment from "../src/appointments/appointment.model.js";
import { Order } from "../src/pharmacy/pharmacy.model.js";
// Registers the Patient model so orders can be listed with the patient's name.
import "../src/patients/patient.model.js";

/**
 * Paid consultation orders whose appointment is CANCELLED or REJECTED.
 * @param {{ since?: Date|null }} options  only appointments last updated on/after `since`
 */
export const findOrdersToFlag = async ({ since = null } = {}) => {
  const appointments = await Appointment.find({
    status: { $in: ["CANCELLED", "REJECTED"] },
    ...(since ? { updatedAt: { $gte: since } } : {}),
  })
    .select("_id order status appointmentDate updatedAt")
    .lean();

  if (appointments.length === 0) return [];

  const byId = new Map(appointments.map((a) => [String(a._id), a]));
  const orders = await Order.find({
    paymentStatus: "PAID",
    $or: [
      { appointment: { $in: appointments.map((a) => a._id) } },
      // Older records may only be linked from the appointment side.
      { _id: { $in: appointments.map((a) => a.order).filter(Boolean) } },
    ],
  })
    .populate("patient", "firstName lastName email")
    .lean();

  return orders.map((order) => {
    const appointment =
      byId.get(String(order.appointment)) ||
      appointments.find((a) => a.order && String(a.order) === String(order._id));
    return { order, appointment };
  });
};

/** Flags the given orders CANCELLED + REFUND_PENDING. Returns the number changed. */
export const flagOrders = async (orderIds) => {
  if (orderIds.length === 0) return 0;
  const result = await Order.updateMany(
    { _id: { $in: orderIds }, paymentStatus: "PAID" },
    { $set: { status: "CANCELLED", paymentStatus: "REFUND_PENDING" } }
  );
  return result.modifiedCount;
};

const parseArgs = (argv) => {
  const apply = argv.includes("--apply");
  const sinceArg = argv.find((arg) => arg.startsWith("--since="));
  let since = null;
  if (sinceArg) {
    since = new Date(sinceArg.slice("--since=".length));
    if (Number.isNaN(since.getTime())) {
      throw new Error(`Invalid --since date: ${sinceArg}. Use YYYY-MM-DD.`);
    }
  }
  return { apply, since };
};

const main = async () => {
  const { apply, since } = parseArgs(process.argv.slice(2));
  if (!process.env.MONGO_URI) throw new Error("MONGO_URI is not set.");

  await mongoose.connect(process.env.MONGO_URI);
  try {
    const matches = await findOrdersToFlag({ since });

    console.log(
      `Found ${matches.length} paid consultation order(s) for cancelled/rejected appointments${since ? ` updated since ${since.toISOString().slice(0, 10)}` : ""}.`
    );
    for (const { order, appointment } of matches) {
      const who = order.patient ? `${order.patient.firstName} ${order.patient.lastName} <${order.patient.email}>` : "unknown patient";
      console.log(
        `  order ${order._id} | ${order.totalAmount} | ${who} | appointment ${appointment?._id} ${appointment?.status} (updated ${appointment?.updatedAt?.toISOString?.().slice(0, 10) || "?"}) | CRM ${order.vrioOrderId || "-"}`
      );
    }

    if (!apply) {
      console.log("\nDry run: nothing changed. Re-run with --apply to flag these orders as \"Refund pending\".");
      return;
    }

    const changed = await flagOrders(matches.map((m) => m.order._id));
    console.log(`\nFlagged ${changed} order(s) as "Refund pending". Review them in Admin > Orders.`);
  } finally {
    await mongoose.disconnect();
  }
};

// Run only when executed directly (the functions above are importable for tests).
if (import.meta.url === pathToFileURL(process.argv[1] || "").href) {
  main().catch((err) => {
    console.error(err.message || err);
    process.exit(1);
  });
}
