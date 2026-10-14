// End-to-end checks of the admin changes against a throwaway in-memory MongoDB.
// No real CRM, mail or AI credentials are loaded (the project's .env is not read).
import http from "http";
import crypto from "crypto";
import { MongoMemoryServer } from "mongodb-memory-server";

import { load, createChecks } from "./helpers/harness.js";

const { check, report } = createChecks();

process.env.JWT_SECRET = "e2e-secret";
process.env.SETTINGS_ENCRYPTION_KEY = "e2e-encryption-key";
process.env.CRON_SECRET = "cron";
delete process.env.ENABLE_DEMO_TOOLS;

const mongod = await MongoMemoryServer.create();
const { default: mongoose } = await import("mongoose");
await mongoose.connect(mongod.getUri());

const { default: app } = await load("app.js");
const { default: Admin } = await load("admin/admin.model.js");
const { default: Patient } = await load("patients/patient.model.js");
const { default: Doctor } = await load("doctors/doctor.model.js");
const { default: Appointment } = await load("appointments/appointment.model.js");
const { default: Prescription } = await load("prescriptions/prescription.model.js");
const { Medicine, Order } = await load("pharmacy/pharmacy.model.js");
const { CrmSettings } = await load("pharmacy/crmSettings.model.js");
const { default: AuditLog } = await load("admin/auditLog.model.js");
const { default: Notification } = await load("notifications/notification.model.js");
const { generateTotpCode } = await load("shared/utils/totp.js");
const { default: hashToken } = await load("shared/utils/hashToken.js");
// Tokens are stored hashed: tests plant a known raw token, as an email link would carry.
const plantToken = async (Model, id, field) => {
  const raw = crypto.randomBytes(16).toString("hex");
  await Model.updateOne({ _id: id }, { [field]: hashToken(raw) });
  return raw;
};
const bcrypt = (await import("bcrypt")).default;

const server = http.createServer(app);
await new Promise((r) => server.listen(0, r));
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
const waitForAudit = () => new Promise((r) => setTimeout(r, 150));

// ---------- admins ----------
const hash = await bcrypt.hash("Sup3rSecret!", 10);
await Admin.create([
  { firstName: "Sue", lastName: "Per", email: "super@x.test", password: hash, role: "SuperAdmin" },
  { firstName: "Ada", lastName: "Min", email: "admin@x.test", password: hash, role: "Admin" },
  { firstName: "Cus", lastName: "Sup", email: "support@x.test", password: hash, role: "CustomerSupport" },
]);
const login = async (email) => (await call("POST", "/admin/login", { body: { email, password: "Sup3rSecret!" } })).json?.data?.token;
let superTok = await login("super@x.test");
const adminTok = await login("admin@x.test");
const supportTok = await login("support@x.test");
check("admins can log in", superTok && adminTok && supportTok);
await waitForAudit();
check("login is audited", (await AuditLog.countDocuments({ action: "LOGIN" })) === 3);

// ---------- role checks ----------
check("CustomerSupport cannot create coupons", (await call("POST", "/coupons/admin", { token: supportTok, body: { code: "X", title: "x", discountAmount: 100 } })).status === 403);
check("CustomerSupport cannot list gift cards", (await call("GET", "/gift-cards", { token: supportTok })).status === 403);
check("CustomerSupport cannot delete tickets", (await call("DELETE", "/support/admin/tickets/6650f0f0f0f0f0f0f0f0f0f0", { token: supportTok })).status === 403);
check("Admin cannot read full CRM settings", (await call("GET", "/admin/crm-settings", { token: adminTok })).status === 403);
check("Admin can read settings summary", (await call("GET", "/admin/crm-settings/summary", { token: adminTok })).status === 200);
check("Admin cannot create admin users", (await call("POST", "/admin/users", { token: adminTok, body: { firstName: "a", lastName: "b", email: "n@x.test", password: "12345678", role: "SuperAdmin" } })).status === 403);

// ---------- CRM settings: masking, encryption, validation ----------
let r = await call("PUT", "/admin/crm-settings", { token: superTok, body: { apiKey: "vrio-real-key", smtpPass: "smtp-pass", isEnabled: false } });
check("settings save", r.status === 200, JSON.stringify(r.json));
const raw = await CrmSettings.collection.findOne({});
check("secrets encrypted at rest", raw.apiKey.startsWith("enc:v1:") && raw.smtpPass.startsWith("enc:v1:"));
r = await call("GET", "/admin/crm-settings", { token: superTok });
const mask = r.json.data.apiKey;
check("GET masks secrets", mask && mask !== "vrio-real-key" && r.json.data.smtpPass === mask);
r = await call("PUT", "/admin/crm-settings", { token: superTok, body: { apiKey: mask, currencySign: "₹" } });
const { getCrmSettingsService } = await load("pharmacy/vrio.service.js");
check("saving the mask keeps the real secret", (await getCrmSettingsService()).apiKey === "vrio-real-key");
check("invalid URL rejected", (await call("PUT", "/admin/crm-settings", { token: superTok, body: { frontendUrl: "javascript:alert(1)" } })).status === 400);
check("null value does not 500", (await call("PUT", "/admin/crm-settings", { token: superTok, body: { apiKey: null } })).status === 200);
await call("PUT", "/admin/crm-settings", { token: superTok, body: { apiKey: "vrio-real-key", isEnabled: false } });
await waitForAudit();
const settingsAudit = await AuditLog.findOne({ path: "/api/admin/crm-settings" }).sort({ createdAt: -1 });
check("settings change audited with secret redacted", settingsAudit?.changes?.apiKey === "[redacted]");

// ---------- admin-created patient ----------
r = await call("POST", "/admin/patients", { token: adminTok, body: { firstName: "Pat", lastName: "One", email: "pat@x.test", phone: "9000000001" } });
check("create patient without password", r.status === 201 && r.json.setupEmailSent === false, JSON.stringify(r.json));
let pat = await Patient.findOne({ email: "pat@x.test" });
check("no invented gender/blood group", pat.gender === null && pat.bloodGroup === null);
check("set-password token issued (stored hashed)", /^[0-9a-f]{64}$/.test(pat.resetPasswordToken || ""));
check("stored hash is not itself a working token", (await call("POST", "/patients/reset-password", { body: { token: pat.resetPasswordToken, password: "PatientPass1" } })).status === 400);
r = await call("POST", "/patients/reset-password", { body: { token: await plantToken(Patient, pat._id, "resetPasswordToken"), password: "PatientPass1" } });
check("patient sets password via link", r.status === 200);
const patTok = (await call("POST", "/patients/login", { body: { email: "pat@x.test", password: "PatientPass1" } })).json?.data?.token;
check("patient can log in", Boolean(patTok));
check("short admin-set password rejected", (await call("POST", "/admin/patients", { token: adminTok, body: { firstName: "Pat", lastName: "Two", email: "p2@x.test", phone: "9000000002", password: "short" } })).status === 400);

// ---------- pharmacy: prescription + stock ----------
const rxMed = await Medicine.create({ name: "Semaglutide", price: 100, requiresPrescription: true, stockQuantity: 3 });
const otcMed = await Medicine.create({ name: "Paracetamol", price: 10, requiresPrescription: false, stockQuantity: 2 });
const order = (items, extra = {}) => call("POST", "/pharmacy/orders", { token: patTok, body: { items, shippingAddress: { line1: "1 St", city: "C", state: "S", pincode: "1", country: "US" }, paymentDetails: { cardNumber: "4111111111111111" }, ...extra } });
r = await order([{ medicineId: rxMed._id, quantity: 1 }]);
check("Rx medicine blocked without prescription", r.status === 400 && /prescription/i.test(r.json?.message), JSON.stringify(r.json));
const doc = await Doctor.create({ firstName: "Doc", lastName: "Tor", email: "doc@x.test", password: "DoctorPass1", phone: "1", isEmailVerified: true, status: "ACTIVE" });
const appt = await Appointment.create({ patient: pat._id, doctor: doc._id, appointmentDate: new Date(), slot: { start: "09:00", end: "10:00" }, roomId: crypto.randomUUID(), status: "COMPLETED" });
await Prescription.create({ appointment: appt._id, doctor: doc._id, patient: pat._id, diagnosis: "x", medicines: [{ name: "Semaglutide 0.5mg", dosage: "1", frequency: "1", duration: "1" }], validUntil: new Date(Date.now() + 86400000) });
r = await order([{ medicineId: rxMed._id, quantity: 2 }]);
check("Rx medicine allowed with valid prescription", r.status === 201, JSON.stringify(r.json));
check("stock decremented", (await Medicine.findById(rxMed._id)).stockQuantity === 1);
r = await order([{ medicineId: rxMed._id, quantity: 2 }]);
check("over-stock order rejected", r.status === 400);
r = await order([{ medicineId: otcMed._id, quantity: 2 }]);
check("buying last units marks out of stock", r.status === 201 && (await Medicine.findById(otcMed._id)).inStock === false);
check("out-of-stock item rejected", (await order([{ medicineId: otcMed._id, quantity: 1 }])).status === 400);

// ---------- coupons ----------
r = await call("POST", "/coupons/admin", { token: adminTok, body: { code: "ONCE", title: "once", type: "FIXED", discountAmount: 5, usageLimitPerPatient: 1 } });
check("coupon created", r.status === 201 || r.status === 200, JSON.stringify(r.json));
check("percentage > 100 rejected", (await call("POST", "/coupons/admin", { token: adminTok, body: { code: "BIG", title: "big", type: "PERCENTAGE", discountAmount: 150 } })).status === 400);
await Medicine.updateOne({ _id: rxMed._id }, { stockQuantity: 10, inStock: true });
r = await order([{ medicineId: rxMed._id, quantity: 1 }], { couponCode: "ONCE" });
check("coupon first use ok + server discount", r.status === 201 && r.json?.data?.discountAmount === 5, JSON.stringify(r.json?.message || r.json?.data?.discountAmount));
check("coupon apply shows per-patient limit", (await call("POST", "/coupons/apply", { token: patTok, body: { code: "ONCE", orderTotal: 100 } })).status === 400);
check("coupon second use rejected at checkout", (await order([{ medicineId: rxMed._id, quantity: 1 }], { couponCode: "ONCE" })).status === 400);
check("currency sign used in coupon messages", /₹/.test((await call("POST", "/coupons/apply", { body: { code: "ONCE", orderTotal: 100 } })).json?.message || ""));

// ---------- order cancel / refund ----------
const paidOrder = await Order.findOne({ patient: pat._id, couponCode: "ONCE" });
r = await call("PATCH", `/admin/pharmacy/orders/${paidOrder._id}/status`, { token: supportTok, body: { status: "CANCELLED" } });
check("cancel paid order -> REFUND_PENDING", r.status === 200 && r.json.data.paymentStatus === "REFUND_PENDING", JSON.stringify(r.json));
check("CONFIRMED status now accepted", (await call("PATCH", `/admin/pharmacy/orders/${(await Order.findOne({ patient: pat._id, status: { $ne: "CANCELLED" } }))._id}/status`, { token: supportTok, body: { status: "CONFIRMED" } })).status === 200);
r = await call("PATCH", `/admin/pharmacy/orders/${paidOrder._id}/status`, { token: supportTok, body: { paymentStatus: "REFUNDED" } });
check("mark refunded", r.status === 200 && r.json.data.paymentStatus === "REFUNDED");
check("patient notified of cancellation + refund", (await Notification.countDocuments({ recipient: pat._id, type: "PHARMACY", title: { $in: ["❌ Order Cancelled", "💸 Refund Issued"] } })) === 2);

// ---------- doctor approval ----------
r = await call("POST", "/doctors/register", { body: { firstName: "New", lastName: "Doc", email: "newdoc@x.test", password: "DoctorPass1", phone: "2" } });
let newDoc = await Doctor.findOne({ email: "newdoc@x.test" });
check("self-registered doctor is pending", r.status === 201 && newDoc.status === "PENDING_APPROVAL", JSON.stringify(r.json));
check("doctor verification token stored hashed", /^[0-9a-f]{64}$/.test(newDoc.verificationToken || ""));
await call("POST", "/doctors/verify-email", { body: { token: await plantToken(Doctor, newDoc._id, "verificationToken") } });
r = await call("POST", "/doctors/login", { body: { email: "newdoc@x.test", password: "DoctorPass1" } });
check("pending doctor cannot log in", r.status >= 400 && !r.json?.data?.token && /awaiting/i.test(r.json?.message), `status=${r.status} ${JSON.stringify(r.json)}`);
check("pending doctor hidden from public list", !((await call("GET", "/doctors")).json.data || []).some((d) => d.email === "newdoc@x.test"));
await call("PATCH", `/admin/doctors/${newDoc._id}/status`, { token: adminTok, body: { status: "ACTIVE" } });
check("approved doctor can log in", Boolean((await call("POST", "/doctors/login", { body: { email: "newdoc@x.test", password: "DoctorPass1" } })).json?.data?.token));

// ---------- admin reschedule rules ----------
const future = await Appointment.create({ patient: pat._id, doctor: doc._id, appointmentDate: new Date(Date.now() + 3 * 86400000), slot: { start: "09:00", end: "10:00" }, roomId: crypto.randomUUID(), status: "CONFIRMED" });
check("reschedule to COMPLETED rejected", (await call("PATCH", `/admin/appointments/${future._id}/reschedule`, { token: adminTok, body: { newDate: "2030-01-07", newSlot: { start: "09:00", end: "10:00" }, newStatus: "COMPLETED" } })).status === 400);

// ---------- soft delete ----------
r = await call("DELETE", `/admin/patients/${pat._id}`, { token: adminTok });
pat = await Patient.findById(pat._id);
check("patient soft-deleted (record kept, inactive)", r.status === 200 && pat && pat.status === "INACTIVE" && pat.deletedEmail === "pat@x.test");
check("patient's orders kept", (await Order.countDocuments({ patient: pat._id })) > 0);
check("upcoming appointment cancelled", (await Appointment.findById(future._id)).status === "CANCELLED");
check("deleted patient cannot log in", (await call("POST", "/patients/login", { body: { email: "pat@x.test", password: "PatientPass1" } })).status !== 200);
check("deleted patient hidden from admin list", !((await call("GET", "/admin/patients", { token: adminTok })).json.data || []).some((p) => String(p._id) === String(pat._id)));
check("email can be registered again", (await call("POST", "/patients/register", { body: { firstName: "Pat", lastName: "Again", email: "pat@x.test", phone: "9000000001", password: "PatientPass1", confirmPassword: "PatientPass1" } })).status === 201);
r = await call("DELETE", `/admin/doctors/${doc._id}`, { token: superTok });
check("doctor soft-deleted, prescriptions kept", r.status === 200 && (await Prescription.countDocuments({ doctor: doc._id })) === 1);

// ---------- pagination ----------
r = await call("GET", "/admin/patients?page=1&limit=1", { token: adminTok });
check("pagination metadata", r.json.data.length === 1 && r.json.pagination?.total === (await Patient.countDocuments({ deletedAt: null })), JSON.stringify(r.json.pagination));
check("unpaged list unchanged", !("pagination" in (await call("GET", "/admin/patients", { token: adminTok })).json));

// ---------- demo tools ----------
check("demo seeding disabled by default", (await call("POST", "/admin/seed-demo", { token: superTok })).status === 403);
process.env.ENABLE_DEMO_TOOLS = "true";
r = await call("POST", "/admin/seed-demo", { token: superTok });
check("demo seeding works when enabled", r.status === 201, `status=${r.status} ${JSON.stringify(r.json)}`);
check("seeding no longer creates a known-password SuperAdmin", !(await Admin.findOne({ email: "admin@teleclinic.com" })));
const realOrdersBefore = await Order.countDocuments({ patient: pat._id });
r = await call("POST", "/admin/clear-demo", { token: superTok });
check("clear removes demo accounts only", r.status === 200 && !(await Doctor.findOne({ email: "dr.arun@teleclinic.com" })) && (await Order.countDocuments({ patient: pat._id })) === realOrdersBefore && (await Appointment.countDocuments({ _id: future._id })) === 1, JSON.stringify(r.json));

// ---------- sessions + 2FA ----------
const oldTok = superTok;
r = await call("PATCH", "/admin/profile/password", { token: superTok, body: { currentPassword: "Sup3rSecret!", newPassword: "N3wSecret!!" } });
superTok = r.json?.data?.token;
check("password change returns fresh token", r.status === 200 && Boolean(superTok));
check("old token revoked", (await call("GET", "/admin/profile", { token: oldTok })).status === 401);
check("fresh token works", (await call("GET", "/admin/profile", { token: superTok })).status === 200);
r = await call("POST", "/admin/profile/2fa/setup", { token: superTok });
const secret = r.json?.data?.secret;
check("2FA setup returns secret", Boolean(secret));
check("2FA enable rejects wrong code", (await call("POST", "/admin/profile/2fa/enable", { token: superTok, body: { code: "000000" } })).status === 400);
r = await call("POST", "/admin/profile/2fa/enable", { token: superTok, body: { code: generateTotpCode(secret) } });
check("2FA enable with valid code", r.status === 200 && Boolean(r.json?.data?.token));
r = await call("POST", "/admin/login", { body: { email: "super@x.test", password: "N3wSecret!!" } });
check("login asks for code", r.status === 200 && r.json.data.twoFactorRequired === true && !r.json.data.token);
check("login rejects bad code", (await call("POST", "/admin/login", { body: { email: "super@x.test", password: "N3wSecret!!", totpCode: "000000" } })).status === 401);
r = await call("POST", "/admin/login", { body: { email: "super@x.test", password: "N3wSecret!!", totpCode: generateTotpCode(secret) } });
check("login succeeds with code", r.status === 200 && Boolean(r.json.data.token));
check("2FA secret never returned by admin list", !JSON.stringify((await call("GET", "/admin/users", { token: r.json.data.token })).json).includes(secret));

// ---------- audit log ----------
r = await call("GET", "/admin/audit-logs?page=1&limit=100", { token: (await call("POST", "/admin/login", { body: { email: "super@x.test", password: "N3wSecret!!", totpCode: generateTotpCode(secret) } })).json.data.token });
check("audit log lists actions", r.status === 200 && r.json.data.some((l) => l.action.includes("/api/admin/patients/:id")));
check("audit log hides passwords", !JSON.stringify(r.json.data).includes("N3wSecret!!") && !JSON.stringify(r.json.data).includes("Sup3rSecret!"));
check("audit log is SuperAdmin-only", (await call("GET", "/admin/audit-logs", { token: adminTok })).status === 403);

server.close();
await mongoose.disconnect();
await mongod.stop();
report();
