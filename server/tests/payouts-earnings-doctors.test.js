// Payouts, doctor earnings, payout settings, doctor profile rules and admin
// account management. Throwaway in-memory MongoDB; mail is not configured,
// so nothing is sent.
import http from "http";
import crypto from "crypto";
import { MongoMemoryServer } from "mongodb-memory-server";
import { load, createChecks } from "./helpers/harness.js";

const { check, report } = createChecks();

process.env.JWT_SECRET = "payouts-secret";

const mongod = await MongoMemoryServer.create();
const { default: mongoose } = await import("mongoose");
await mongoose.connect(mongod.getUri());
const { default: app } = await load("app.js");
const { default: Admin } = await load("admin/admin.model.js");
const { default: Doctor } = await load("doctors/doctor.model.js");
const { default: Patient } = await load("patients/patient.model.js");
const { default: Appointment } = await load("appointments/appointment.model.js");
const { default: Payout } = await load("payouts/payout.model.js");
const { default: Notification } = await load("notifications/notification.model.js");
const { default: GiftCard } = await load("giftcards/giftcard.model.js");
const { Order, Medicine } = await load("pharmacy/pharmacy.model.js");
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

// ---- accounts ----
const pw = await bcrypt.hash("Passw0rd!", 10);
await Admin.create([
  { firstName: "S", lastName: "A", email: "s@x.test", password: pw, role: "SuperAdmin" },
  { firstName: "A", lastName: "D", email: "a@x.test", password: pw, role: "Admin" },
  { firstName: "C", lastName: "S", email: "cs@x.test", password: pw, role: "CustomerSupport" },
]);
const adminLogin = async (email, password = "Passw0rd!") => (await call("POST", "/admin/login", { body: { email, password } })).json?.data?.token;
const superTok = await adminLogin("s@x.test");
const adminTok = await adminLogin("a@x.test");
const csTok = await adminLogin("cs@x.test");
await call("PUT", "/admin/crm-settings", { token: superTok, body: { isEnabled: false, currencySign: "$" } });

const doctor = await Doctor.create({
  firstName: "Asha", lastName: "Rao", email: "doc@x.test", password: "DoctorPass1", phone: "1",
  isEmailVerified: true, status: "ACTIVE", consultationFee: 200, platformCommissionPercent: 10,
  licenseNumber: "LIC-1", qualification: "MD", specialization: "Cardiology",
});
const docTok = (await call("POST", "/doctors/login", { body: { email: "doc@x.test", password: "DoctorPass1" } })).json.data.token;
const patient = await Patient.create({ firstName: "Pat", lastName: "One", email: "p@x.test", phone: "9000000001", password: pw, isEmailVerified: true });
const patTok = (await call("POST", "/patients/login", { body: { email: "p@x.test", password: "Passw0rd!" } })).json.data.token;

// ---- earnings frozen per consultation ----
const mkAppt = (extra = {}) =>
  Appointment.create({ patient: patient._id, doctor: doctor._id, appointmentDate: new Date(), slot: { start: "09:00", end: "10:00" }, roomId: crypto.randomUUID(), status: "CONFIRMED", consultationFee: 200, listFee: 200, ...extra });

const a1 = await mkAppt();
await call("PATCH", `/appointments/${a1._id}/end`, { token: docTok });
const a1Saved = await Appointment.findById(a1._id);
check("completion freezes earnings (200 gross, 10%, 180 net)", a1Saved.earnings?.grossFee === 200 && a1Saved.earnings.commissionPercent === 10 && a1Saved.earnings.netAmount === 180);

// coupon: patient paid 150 of a 200 listed fee — doctor still earns on 200
const a2 = await mkAppt({ consultationFee: 150, listFee: 200 });
await call("PATCH", `/appointments/${a2._id}/end`, { token: docTok });
check("coupon discount absorbed by platform (gross = listed fee)", (await Appointment.findById(a2._id)).earnings.grossFee === 200);

// legacy completed appointment without a snapshot
const legacy = await mkAppt({ status: "COMPLETED", listFee: null, consultationFee: 100 });
await Appointment.collection.updateOne({ _id: legacy._id }, { $unset: { earnings: "", listFee: "" } });

await call("PATCH", `/admin/doctors/${doctor._id}/commission`, { token: adminTok, body: { commissionPercent: 50 } });
let earnings = (await call("GET", "/doctors/earnings", { token: docTok })).json.data;
check("commission change doesn't rewrite past consultations", earnings.consultationLedger.find((r) => String(r._id) === String(a1._id)).netAmount === 180);
check("legacy consultation frozen once at the current rate", (await Appointment.findById(legacy._id)).earnings?.commissionPercent === 50);
check("net total = sum of frozen per-visit amounts", earnings.summary.netEarnings === 180 + 180 + 50, earnings.summary.netEarnings);

// refunded consultation excluded
const a3 = await mkAppt();
await call("PATCH", `/appointments/${a3._id}/end`, { token: docTok });
await Order.create({ patient: patient._id, appointment: a3._id, orderType: "CONSULTATION", items: [{ name: "c", quantity: 1, price: 200 }], totalAmount: 200, shippingAddress: { line1: "1", city: "c", state: "s", pincode: "1" }, paymentStatus: "REFUNDED", status: "CANCELLED" });
earnings = (await call("GET", "/doctors/earnings", { token: docTok })).json.data;
check("refunded consultation not counted in earnings", !earnings.consultationLedger.some((r) => String(r._id) === String(a3._id)) && earnings.summary.refundedConsultationsCount === 1);

// ---- payout settings: password, validation, alert ----
check("payout settings need the current password", (await call("PUT", "/doctors/payout-settings", { token: docTok, body: { upiId: "asha@bank", preferredMethod: "UPI" } })).status === 400);
check("wrong password rejected", (await call("PUT", "/doctors/payout-settings", { token: docTok, body: { upiId: "asha@bank", preferredMethod: "UPI", currentPassword: "nope" } })).json?.message === "Current password is incorrect.");
check("invalid UPI rejected", (await call("PUT", "/doctors/payout-settings", { token: docTok, body: { upiId: "not-a-upi", preferredMethod: "UPI", currentPassword: "DoctorPass1" } })).status === 400);
check("method without its details rejected", /PayPal email/.test((await call("PUT", "/doctors/payout-settings", { token: docTok, body: { preferredMethod: "PAYPAL", currentPassword: "DoctorPass1" } })).json?.message || ""));
let r = await call("PUT", "/doctors/payout-settings", { token: docTok, body: { upiId: "asha@okbank", preferredMethod: "UPI", currentPassword: "DoctorPass1" } });
check("valid change saved", r.status === 200 && r.json.data.upiId === "asha@okbank");
check("doctor alerted about the change", (await Notification.countDocuments({ recipient: doctor._id, title: /Payout details changed/ })) === 1);

// ---- withdrawals + admin payout workflow ----
check("currency from settings in messages", /\$100/.test((await call("POST", "/doctors/payouts", { token: docTok, body: { amount: 50 } })).json?.message || ""));
r = await call("POST", "/doctors/payouts", { token: docTok, body: { amount: 150 } });
check("withdrawal requested to the chosen method", r.status === 201 && r.json.data.payoutMethod === "UPI");
const payoutId = r.json.data._id;
check("CustomerSupport can't manage payouts", (await call("GET", "/admin/payouts", { token: csTok })).status === 403);
check("admin sees payout requests", (await call("GET", "/admin/payouts", { token: adminTok })).json.data.length === 1);
check("marking paid needs a transfer reference", /reference/.test((await call("PATCH", `/admin/payouts/${payoutId}/status`, { token: adminTok, body: { status: "PAID" } })).json?.message || ""));
r = await call("PATCH", `/admin/payouts/${payoutId}/status`, { token: adminTok, body: { status: "PAID", referenceNumber: "UTR123" } });
check("payout marked paid with reference + who did it", r.status === 200 && (await Payout.findById(payoutId)).processedBy === "a@x.test");
check("paid payout can't be reopened/rejected", (await call("PATCH", `/admin/payouts/${payoutId}/status`, { token: adminTok, body: { status: "REJECTED", rejectionReason: "oops" } })).status === 400);
const p2 = (await call("POST", "/doctors/payouts", { token: docTok, body: { amount: 100 } })).json.data._id;
check("rejecting needs a reason", (await call("PATCH", `/admin/payouts/${p2}/status`, { token: adminTok, body: { status: "REJECTED" } })).status === 400);
check("rejected with a reason", (await call("PATCH", `/admin/payouts/${p2}/status`, { token: adminTok, body: { status: "REJECTED", rejectionReason: "Wrong UPI" } })).status === 200);
check("rejected payout is final", (await call("PATCH", `/admin/payouts/${p2}/status`, { token: adminTok, body: { status: "PAID", referenceNumber: "X" } })).status === 400);

// ---- doctor profile rules ----
check("negative fee rejected", (await call("PUT", "/doctors/profile", { token: docTok, body: { consultationFee: -5 } })).status === 400);
check("absurd fee rejected", (await call("PUT", "/doctors/profile", { token: docTok, body: { consultationFee: 100001 } })).status === 400);
r = await call("PUT", "/doctors/profile", { token: docTok, body: { consultationFee: 0 } });
check("free (0) fee allowed", r.status === 200 && r.json.data.consultationFee === 0);
check("profile response has no secrets", !("password" in r.json.data) && !("payoutSettings" in r.json.data) && !("resetPasswordToken" in r.json.data));

r = await call("PUT", "/doctors/profile", { token: docTok, body: { licenseNumber: "LIC-FAKE", qualification: "MBBS, MD, DM" } });
let docNow = await Doctor.findById(doctor._id);
check("approved doctor's credential edit held for review", r.status === 200 && r.json.data.credentialChangePending === true && docNow.licenseNumber === "LIC-1" && docNow.pendingCredentialChanges?.licenseNumber === "LIC-FAKE");
check("admins notified of credential change", (await Notification.countDocuments({ recipientModel: "Admin", title: /credentials to review/ })) === 2);
check("public profile still shows old licence", (await call("GET", `/doctors/${doctor._id}`)).json.data.licenseNumber === "LIC-1");
check("CustomerSupport can't review credentials", (await call("PATCH", `/admin/doctors/${doctor._id}/credentials`, { token: csTok, body: { approve: true } })).status === 403);
check("admin approves", (await call("PATCH", `/admin/doctors/${doctor._id}/credentials`, { token: adminTok, body: { approve: true } })).status === 200);
docNow = await Doctor.findById(doctor._id);
check("approved changes applied and cleared", docNow.licenseNumber === "LIC-FAKE" && docNow.qualification === "MBBS, MD, DM" && docNow.pendingCredentialChanges === null);
await call("PUT", "/doctors/profile", { token: docTok, body: { specialization: "Dermatology" } });
await call("PATCH", `/admin/doctors/${doctor._id}/credentials`, { token: adminTok, body: { approve: false } });
check("rejected changes discarded", (await Doctor.findById(doctor._id)).specialization === "Cardiology");
const pendingDoc = await Doctor.create({ firstName: "New", lastName: "Doc", email: "new@x.test", password: "DoctorPass1", phone: "2", isEmailVerified: true, status: "PENDING_APPROVAL" });
const { updateDoctorProfile } = await load("doctors/doctor.service.js");
await updateDoctorProfile(pendingDoc._id, { licenseNumber: "LIC-NEW" });
check("unapproved doctor's credentials apply directly (reviewed at approval)", (await Doctor.findById(pendingDoc._id)).licenseNumber === "LIC-NEW");

// signatures / stamps
const png = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
check("SVG signature rejected", (await call("PUT", "/doctors/profile", { token: docTok, body: { signature: "data:image/svg+xml;utf8,<svg/>" } })).status === 400);
check("external URL stamp rejected", (await call("PUT", "/doctors/profile", { token: docTok, body: { clinicStamp: "https://evil.test/pixel.png" } })).status === 400);
check("PNG signature accepted", (await call("PUT", "/doctors/profile", { token: docTok, body: { signature: png } })).status === 200);
await Doctor.updateOne({ _id: doctor._id }, { clinicStamp: "https://legacy.test/stamp.png" });
check("unchanged legacy stamp re-sent with the form is accepted", (await call("PUT", "/doctors/profile", { token: docTok, body: { signature: png, clinicStamp: "https://legacy.test/stamp.png" } })).status === 200);
const bigPng = "data:image/png;base64," + "A".repeat(600000);
check("a ~450 KB image fits the request limit", (await call("PUT", "/doctors/profile", { token: docTok, body: { signature: bigPng } })).status === 200);
check("an over-limit image is rejected with a clear message", /too large/.test((await call("PUT", "/doctors/profile", { token: docTok, body: { signature: "data:image/png;base64," + "A".repeat(720000) } })).json?.message || ""));

// ---- admin accounts ----
check("admin with a short password rejected", (await call("POST", "/admin/users", { token: superTok, body: { firstName: "N", lastName: "A", email: "n@x.test", password: "1", role: "Admin" } })).status === 400);
check("admin with an invalid email rejected", (await call("POST", "/admin/users", { token: superTok, body: { firstName: "N", lastName: "A", email: "nope", password: "Longenough1", role: "Admin" } })).status === 400);
const target = await Admin.findOne({ email: "cs@x.test" });
await Admin.updateOne({ _id: target._id }, { twoFactorEnabled: true, twoFactorSecret: "JBSWY3DPEHPK3PXP" });
check("Admin role can't reset passwords", (await call("PATCH", `/admin/users/${target._id}/password`, { token: adminTok, body: { newPassword: "TempPass123" } })).status === 403);
check("can't reset your own password here", (await call("PATCH", `/admin/users/${(await Admin.findOne({ email: "s@x.test" }))._id}/password`, { token: superTok, body: { newPassword: "TempPass123" } })).status === 400);
check("reset needs 8+ characters", (await call("PATCH", `/admin/users/${target._id}/password`, { token: superTok, body: { newPassword: "short" } })).status === 400);
r = await call("PATCH", `/admin/users/${target._id}/password`, { token: superTok, body: { newPassword: "TempPass123", resetTwoFactor: true } });
check("SuperAdmin resets another admin's password + 2FA", r.status === 200);
check("their old session is signed out", (await call("GET", "/admin/profile", { token: csTok })).status === 401);
check("they can sign in with the temporary password (no 2FA prompt)", Boolean(await adminLogin("cs@x.test", "TempPass123")));

// ---- orders record gift card usage ----
const med = await Medicine.create({ name: "Vitamin C", price: 100, stockQuantity: 5 });
await GiftCard.create({ giftCardCode: "GC40", totalAmount: 40, balanceAmount: 40, isActive: true });
r = await call("POST", "/pharmacy/orders", { token: patTok, body: { items: [{ medicineId: med._id, quantity: 1 }], gift_cards: [{ gift_card_code: "GC40" }], shippingAddress: { line1: "1", city: "c", state: "s", pincode: "1" }, paymentDetails: { cardNumber: "4111111111111111" } } });
check("order records gift card code and amount for invoices", r.status === 201 && r.json.data.giftCardCode === "GC40" && r.json.data.giftCardAmount === 40, JSON.stringify(r.json?.message || ""));

server.close();
await mongoose.disconnect();
await mongod.stop();
report();
