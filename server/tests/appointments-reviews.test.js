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
const { default: Review } = await load("reviews/review.model.js");
const { default: Notification } = await load("notifications/notification.model.js");
const { Order } = await load("pharmacy/pharmacy.model.js");
const bcrypt = (await import("bcrypt")).default;

const server = http.createServer(app);
await new Promise((r) => server.listen(0, r));
const base = `http://127.0.0.1:${server.address().port}/api`;
const call = async (method, path, { token, body } = {}) => {
  const res = await fetch(base + path, { method, headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: body ? JSON.stringify(body) : undefined });
  let json = null;
  try { json = await res.json(); } catch {}
  return { status: res.status, json };
};

// ---- accounts ----
const pw = await bcrypt.hash("Passw0rd!", 10);
await Admin.create([
  { firstName: "S", lastName: "A", email: "s@x.test", password: pw, role: "SuperAdmin" },
  { firstName: "C", lastName: "S", email: "cs@x.test", password: pw, role: "CustomerSupport" },
]);
const adminTok = async (email) => (await call("POST", "/admin/login", { body: { email, password: "Passw0rd!" } })).json.data.token;
const superTok = await adminTok("s@x.test");
const csTok = await adminTok("cs@x.test");
await call("PUT", "/admin/crm-settings", { token: superTok, body: { isEnabled: false } });

const allDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => ({ day, enabled: true, slots: [{ start: "09:00", end: "10:00" }, { start: "10:00", end: "11:00" }] }));
const mkDoctor = (n) => Doctor.create({ firstName: `Doc${n}`, lastName: "Tor", email: `d${n}@x.test`, password: "DoctorPass1", phone: `${n}`, isEmailVerified: true, status: "ACTIVE", consultationFee: 100, availability: allDays });
const doc = await mkDoctor(1);
const otherDoc = await mkDoctor(2);
const docTok = (await call("POST", "/doctors/login", { body: { email: "d1@x.test", password: "DoctorPass1" } })).json.data.token;
const otherDocTok = (await call("POST", "/doctors/login", { body: { email: "d2@x.test", password: "DoctorPass1" } })).json.data.token;
const mkPatient = async (n) => {
  await Patient.create({ firstName: `Pat${n}`, lastName: "Ient", email: `p${n}@x.test`, phone: `90000000${n}`, password: pw, isEmailVerified: true });
  return (await call("POST", "/patients/login", { body: { email: `p${n}@x.test`, password: "Passw0rd!" } })).json.data.token;
};
const patTok = await mkPatient(1);
const pat2Tok = await mkPatient(2);
const pat = await Patient.findOne({ email: "p1@x.test" });

const dayStr = (offsetDays) => {
  const d = new Date(Date.now() + offsetDays * 86400000);
  return d.toISOString().slice(0, 10);
};
const book = (token, date, start = "09:00", doctorId = doc._id) =>
  call("POST", "/appointments", { token, body: { doctorId: String(doctorId), appointmentDate: date, slot: { start, end: String(Number(start.slice(0, 2)) + 1).padStart(2, "0") + ":00" }, reason: "Persistent headache" } });

// ---- 4. past dates ----
check("booking a past date rejected", /past/.test((await book(patTok, dayStr(-5))).json?.message || ""));
let r = await book(patTok, dayStr(3));
check("booking a future date works", r.status === 201, JSON.stringify(r.json));
const apptA = r.json.data;
check("reschedule to a past date rejected", /past/.test((await call("PATCH", `/appointments/${apptA._id}/reschedule`, { token: patTok, body: { newDate: dayStr(-3), newSlot: { start: "10:00", end: "11:00" } } })).json?.message || ""));
check("admin reschedule to a past date rejected", (await call("PATCH", `/admin/appointments/${apptA._id}/reschedule`, { token: superTok, body: { newDate: dayStr(-3), newSlot: { start: "10:00", end: "11:00" } } })).status === 400);

// ---- 9. readable validation errors ----
r = await call("POST", "/appointments", { token: patTok, body: { doctorId: String(doc._id), appointmentDate: dayStr(2), slot: { start: "09:00", end: "10:00" }, reason: "x" } });
check("validation error is a readable sentence", r.status === 400 && r.json.message === "Please enter the reason for consultation.", r.json?.message);

// ---- 2. status transitions ----
const setStatus = (id, status, token = docTok) => call("PATCH", `/appointments/${id}/status`, { token, body: { status } });
check("doctor can't jump CONFIRMED->COMPLETED via status", (await setStatus(apptA._id, "COMPLETED")).status === 400);
r = await book(patTok, dayStr(4));
const apptB = r.json.data;
await Appointment.updateOne({ _id: apptB._id }, { status: "PENDING" });
check("doctor rejects a pending appointment", (await setStatus(apptB._id, "REJECTED")).status === 200);
check("rejected consultation order flagged for refund", (await Order.findOne({ appointment: apptB._id }))?.paymentStatus === "REFUND_PENDING");
check("rejected appointment can't be revived to COMPLETED", (await setStatus(apptB._id, "COMPLETED")).status === 400);
check("ending a rejected consultation is refused", (await call("PATCH", `/appointments/${apptB._id}/end`, { token: docTok })).status === 400);
check("patient can't reschedule a rejected appointment", (await call("PATCH", `/appointments/${apptB._id}/reschedule`, { token: patTok, body: { newDate: dayStr(5), newSlot: { start: "10:00", end: "11:00" } } })).status === 400);
check("ending a confirmed consultation works", (await call("PATCH", `/appointments/${apptA._id}/end`, { token: docTok })).status === 200);
check("ending it again is a harmless no-op", (await call("PATCH", `/appointments/${apptA._id}/end`, { token: patTok })).status === 200);

// ---- 3. patient cancel -> refund flag + doctor notified ----
r = await book(patTok, dayStr(6));
const apptC = r.json.data;
check("patient cancels", (await call("PATCH", `/appointments/${apptC._id}/cancel`, { token: patTok })).status === 200);
check("cancelled consultation order flagged for refund", (await Order.findOne({ appointment: apptC._id }))?.paymentStatus === "REFUND_PENDING");
check("doctor notified of patient cancellation", (await Notification.countDocuments({ recipient: doc._id, title: /Cancelled by Patient/ })) === 1);
check("cancelling twice is refused", (await call("PATCH", `/appointments/${apptC._id}/cancel`, { token: patTok })).status === 400);

// ---- 6. review eligibility ----
check("review without a completed consultation refused", /after completing a consultation/.test((await call("POST", "/reviews", { token: pat2Tok, body: { doctorId: String(doc._id), rating: 5 } })).json?.message || ""));
check("review on a not-completed appointment refused", (await call("POST", "/reviews", { token: patTok, body: { doctorId: String(doc._id), appointmentId: apptC._id, rating: 5 } })).status === 400);
check("fractional rating refused", (await call("POST", "/reviews", { token: patTok, body: { doctorId: String(doc._id), rating: 4.5 } })).status === 400);
r = await call("POST", "/reviews", { token: patTok, body: { doctorId: String(doc._id), appointmentId: apptA._id, rating: 2, review: "Late", isAnonymous: true } });
check("review after completed consultation works", r.status === 201 || r.status === 200, JSON.stringify(r.json));
const reviewId = (await Review.findOne({ patient: pat._id }))._id;

// ---- 5. anonymity ----
const received = (await call("GET", "/reviews/doctor-received", { token: docTok })).json.data;
check("doctor sees anonymous reviewer as 'Verified Patient' with no id", received[0].patient.firstName === "Verified" && !received[0].patient._id && !JSON.stringify(received).includes("Pat1"));
check("doctor can't see which visit an anonymous review is about", received[0].appointment === null);
const pub = (await call("GET", `/reviews/doctor/${doc._id}`)).json.data;
check("public list hides anonymous reviewer id", !pub.reviews[0].patient._id && !JSON.stringify(pub).includes(String(pat._id)));
r = await call("POST", `/reviews/${reviewId}/reply`, { token: docTok, body: { replyText: "Sorry!" } });
check("reply response doesn't reveal anonymous reviewer", r.status === 200 && !JSON.stringify(r.json).includes("Pat1"), JSON.stringify(r.json).slice(0, 200));

// ---- 1. review deletion ----
check("doctor can't delete a review about them", (await call("DELETE", `/reviews/${reviewId}`, { token: docTok })).status === 403);
check("other doctor can't delete it either", (await call("DELETE", `/reviews/${reviewId}`, { token: otherDocTok })).status === 403);
check("CustomerSupport can't delete reviews", (await call("DELETE", `/reviews/${reviewId}`, { token: csTok })).status === 403);
check("another patient can't delete it", (await call("DELETE", `/reviews/${reviewId}`, { token: pat2Tok })).status === 404);
check("review still exists", Boolean(await Review.findById(reviewId)));
check("author can delete their own review", (await call("DELETE", `/reviews/${reviewId}`, { token: patTok })).status === 200);

// ---- 7. no reviews = unrated ----
const fresh = await Doctor.findById(otherDoc._id);
check("new doctor stored as unrated (0), not 5.0", fresh.averageRating === 0 && fresh.totalReviews === 0);
check("doctor with deleted reviews returns to unrated", (await Doctor.findById(doc._id)).averageRating === 0);
check("public summary for unrated doctor is 0", (await call("GET", `/reviews/doctor/${otherDoc._id}`)).json.data.averageRating === 0);

// ---- 8. support notifications ----
await call("POST", "/support/submit", { token: patTok, body: { subject: "Billing question", message: "Was I charged twice?" } });
check("support ticket notification delivered", (await Notification.countDocuments({ recipient: pat._id, type: "SUPPORT" })) === 1);

// ---- 9. AI input checks (rejection paths only: no AI provider is called) ----
check("AI rejects non-string message", (await call("POST", "/ai/health-advice", { token: patTok, body: { message: { evil: true } } })).status === 400);
check("AI rejects empty lab request", (await call("POST", "/ai/analyze-lab-report", { token: patTok, body: { reportText: 42 } })).status === 400);

server.close();
await mongoose.disconnect();
await mongod.stop();
report();
