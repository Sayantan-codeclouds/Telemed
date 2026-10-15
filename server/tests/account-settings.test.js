// Account settings: password changes for patients and doctors, doctor
// availability rules, prescription rules and medicine stock handling.
import http from "http";
import crypto from "crypto";
import { MongoMemoryServer } from "mongodb-memory-server";
import { load, createChecks } from "./helpers/harness.js";

const { check, report } = createChecks();

process.env.JWT_SECRET = "settings-secret";

const mongod = await MongoMemoryServer.create();
const { default: mongoose } = await import("mongoose");
await mongoose.connect(mongod.getUri());
const { default: app } = await load("app.js");
const { default: Admin } = await load("admin/admin.model.js");
const { default: Patient } = await load("patients/patient.model.js");
const { default: Doctor } = await load("doctors/doctor.model.js");
const { default: Appointment } = await load("appointments/appointment.model.js");
const { Medicine } = await load("pharmacy/pharmacy.model.js");
const bcrypt = (await import("bcrypt")).default;

const server = http.createServer(app);
await new Promise((resolve) => server.listen(0, resolve));
const base = `http://127.0.0.1:${server.address().port}/api`;
const call = async (method, path, { token, body } = {}) => {
  const res = await fetch(base + path, {
    method,
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  let json = null;
  try { json = await res.json(); } catch {}
  return { status: res.status, json };
};

// ---- patient password change ----
await Patient.create({ firstName: "Pat", lastName: "One", email: "p@x.test", phone: "9000000001", password: await bcrypt.hash("OldPass123", 10), isEmailVerified: true });
const patTok = (await call("POST", "/patients/login", { body: { email: "p@x.test", password: "OldPass123" } })).json.data.token;
check("patient wrong current password rejected", (await call("PATCH", "/patients/change-password", { token: patTok, body: { currentPassword: "nope", newPassword: "NewPass123" } })).json?.message === "Current password is incorrect.");
let r = await call("PATCH", "/patients/change-password", { token: patTok, body: { currentPassword: "OldPass123", newPassword: "NewPass123" } });
check("patient can change password", r.status === 200, JSON.stringify(r.json));
check("patient logs in with the new password", (await call("POST", "/patients/login", { body: { email: "p@x.test", password: "NewPass123" } })).status === 200);

// ---- doctor password change ----
const doctor = await Doctor.create({ firstName: "Doc", lastName: "Tor", email: "d@x.test", password: "OldPass123", phone: "1", isEmailVerified: true, status: "ACTIVE", consultationFee: 100 });
const docTok = (await call("POST", "/doctors/login", { body: { email: "d@x.test", password: "OldPass123" } })).json.data.token;
r = await call("PATCH", "/doctors/change-password", { token: docTok, body: { currentPassword: "OldPass123", newPassword: "NewPass123" } });
check("doctor can change password", r.status === 200, JSON.stringify(r.json));
check("doctor logs in with the new password", (await call("POST", "/doctors/login", { body: { email: "d@x.test", password: "NewPass123" } })).status === 200);

// ---- availability ----
const day = (name, slots) => ({ day: name, enabled: true, slots });
check("overlapping slots rejected", /overlap/.test((await call("PUT", "/doctors/availability", { token: docTok, body: { availability: [day("Monday", [{ start: "09:00", end: "13:00" }, { start: "10:00", end: "11:00" }])] } })).json?.message || ""));
check("same day listed twice rejected", (await call("PUT", "/doctors/availability", { token: docTok, body: { availability: [day("Monday", [{ start: "09:00", end: "10:00" }]), day("Monday", [{ start: "11:00", end: "12:00" }])] } })).status === 400);
check("back-to-back slots allowed", (await call("PUT", "/doctors/availability", { token: docTok, body: { availability: [day("Monday", [{ start: "10:00", end: "11:00" }, { start: "09:00", end: "10:00" }])] } })).status === 200);

// ---- prescriptions only for real visits ----
const patient = await Patient.findOne({ email: "p@x.test" });
const mkAppt = (status) => Appointment.create({ patient: patient._id, doctor: doctor._id, appointmentDate: new Date(), slot: { start: "09:00", end: "10:00" }, roomId: crypto.randomUUID(), status });
const rx = (appointmentId, extra = {}) => call("POST", "/prescriptions", { token: docTok, body: { appointmentId: String(appointmentId), diagnosis: "Flu", medicines: [{ name: "Paracetamol", dosage: "500mg", frequency: "1-0-1", duration: "3 days" }], ...extra } });
check("no prescription for a cancelled appointment", (await rx((await mkAppt("CANCELLED"))._id)).status === 400);
check("no prescription for a pending appointment", (await rx((await mkAppt("PENDING"))._id)).status === 400);
check("prescription during a confirmed visit", (await rx((await mkAppt("CONFIRMED"))._id)).status === 201);
check("validity over 365 days rejected", (await rx((await mkAppt("COMPLETED"))._id, { validityDays: 1000 })).status === 400);

// ---- medicine stock ----
await Admin.create({ firstName: "S", lastName: "A", email: "s@x.test", password: await bcrypt.hash("Passw0rd!", 10), role: "SuperAdmin" });
const adminTok = (await call("POST", "/admin/login", { body: { email: "s@x.test", password: "Passw0rd!" } })).json.data.token;
r = await call("POST", "/admin/pharmacy/medicines", { token: adminTok, body: { name: "Zinc", price: 10, stockQuantity: 0 } });
const zinc = await Medicine.findOne({ name: "Zinc" });
check("creating with 0 stock keeps 0 and is out of stock", r.status === 201 && zinc.stockQuantity === 0 && zinc.inStock === false, JSON.stringify(r.json?.message || ""));
check("can't mark in stock with no units", /no units left/.test((await call("PATCH", `/admin/pharmacy/medicines/${zinc._id}/stock`, { token: adminTok, body: { inStock: true } })).json?.message || ""));
await call("PUT", `/admin/pharmacy/medicines/${zinc._id}`, { token: adminTok, body: { stockQuantity: 25, inStock: true } });
check("restocking through edit works", (await Medicine.findById(zinc._id)).stockQuantity === 25);
check("negative stock rejected", (await call("PUT", `/admin/pharmacy/medicines/${zinc._id}`, { token: adminTok, body: { stockQuantity: -3 } })).status === 400);
await call("PUT", `/admin/pharmacy/medicines/${zinc._id}`, { token: adminTok, body: { stockQuantity: 0 } });
check("setting quantity to 0 marks it out of stock", (await Medicine.findById(zinc._id)).inStock === false);

// ---- default availability for admin-created doctors ----
r = await call("POST", "/admin/doctors", { token: adminTok, body: { firstName: "New", lastName: "Doctor", email: "newdoc@x.test", phone: "555", password: "DoctorPass1", hospital: "City Clinic" } });
const created = await Doctor.findOne({ email: "newdoc@x.test" });
const monday = created?.availability.find((d) => d.day === "Monday");
const expectedSlots = ["09:00-10:00", "10:00-11:00", "11:00-12:00", "12:00-13:00", "17:00-18:00", "18:00-19:00", "19:00-20:00"];
check("admin-created doctor gets one-hour default slots", r.status === 201 && JSON.stringify(monday?.slots.map((s) => `${s.start}-${s.end}`)) === JSON.stringify(expectedSlots), JSON.stringify(monday?.slots));
check("default covers Monday to Friday only", created.availability.length === 5 && !created.availability.some((d) => ["Saturday", "Sunday"].includes(d.day)));
const nextMonday = new Date();
nextMonday.setUTCDate(nextMonday.getUTCDate() + ((8 - nextMonday.getUTCDay()) % 7 || 7));
const free = (await call("GET", `/doctors/${created._id}/available-slots?date=${nextMonday.toISOString().slice(0, 10)}`)).json?.data || [];
check("all 7 hourly slots are offered for booking", free.length === 7, JSON.stringify(free));

server.close();
await mongoose.disconnect();
await mongod.stop();
report();
