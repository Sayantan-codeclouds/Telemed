// Checks for: hashed tokens, gift-card balance reservation, private lab-report
// links, Cloudinary signed fetch URLs and Vrio refunds. Vrio is never contacted:
// fetch calls to the Vrio host are answered by a local stub.
import http from "http";
import crypto from "crypto";
import { MongoMemoryServer } from "mongodb-memory-server";

import { load, createChecks } from "./helpers/harness.js";

const { check, report } = createChecks();
process.env.JWT_SECRET = "e2e-secret";
process.env.APP_URL = "http://127.0.0.1:0"; // replaced once the port is known
process.env.FRONTEND_URL = "http://frontend.test";
process.env.VRIO_BASE_URL = "https://vrio.stub";

// ---- fetch stub for the Vrio host ----
const realFetch = globalThis.fetch;
const vrioCalls = [];
let vrioMode = "ok";
globalThis.fetch = async (url, opts = {}) => {
  const u = String(url);
  if (u.startsWith("https://vrio.stub")) {
    vrioCalls.push({ url: u, method: opts.method || "GET", body: opts.body ? JSON.parse(opts.body) : null });
    const json = (status, body) => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
    if (vrioMode === "decline") return json(402, { error: { message: "Card declined" } });
    if (u.includes("/transactions?")) {
      return json(200, { transactions: [
        { transaction_id: 77, transaction_type_id: 1, transaction_total: "100.00" },
        { transaction_id: 78, transaction_type_id: 3, transaction_total: "100.00" }, // a void: must be ignored
      ] });
    }
    if (/\/transactions\/\d+\/refund$/.test(u)) return json(200, { transaction_id: 99, refunded: true });
    if (u.endsWith("/orders")) return json(200, { order_id: 555 });
    return json(404, { error: "unknown stub route" });
  }
  return realFetch(url, opts);
};

const mongod = await MongoMemoryServer.create();
const { default: mongoose } = await import("mongoose");
await mongoose.connect(mongod.getUri());
const { default: app } = await load("app.js");
const { default: Admin } = await load("admin/admin.model.js");
const { default: Patient } = await load("patients/patient.model.js");
const { Medicine, Order } = await load("pharmacy/pharmacy.model.js");
const { default: GiftCard } = await load("giftcards/giftcard.model.js");
const { default: LabReport } = await load("lab-reports/labReport.model.js");
const { createFileToken } = await load("shared/utils/signedFileLink.js");
const { default: hashToken } = await load("shared/utils/hashToken.js");
const bcrypt = (await import("bcrypt")).default;

const server = http.createServer(app);
await new Promise((r) => server.listen(0, r));
const origin = `http://127.0.0.1:${server.address().port}`;
process.env.APP_URL = origin;
const base = `${origin}/api`;

const call = async (method, path, { token, body } = {}) => {
  const res = await realFetch(base + path, { method, headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: body ? JSON.stringify(body) : undefined });
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
const adminLogin = async (email) => (await call("POST", "/admin/login", { body: { email, password: "Passw0rd!" } })).json.data.token;
const superTok = await adminLogin("s@x.test");
const csTok = await adminLogin("cs@x.test");
await call("PUT", "/admin/crm-settings", { token: superTok, body: { isEnabled: false } });

// ---- 1. hashed tokens ----
await call("POST", "/patients/register", { body: { firstName: "Pat", lastName: "One", email: "pat@x.test", phone: "9000000001", password: "PatientPass1", confirmPassword: "PatientPass1" } });
let pat = await Patient.findOne({ email: "pat@x.test" });
check("verification token stored as a hash", /^[0-9a-f]{64}$/.test(pat.verificationToken));
check("the stored hash does not verify", (await call("POST", "/patients/verify-email", { body: { token: pat.verificationToken } })).status === 400);
const rawVerify = "known-raw-token";
await Patient.updateOne({ _id: pat._id }, { verificationToken: hashToken(rawVerify) });
check("raw token from the email verifies", (await call("POST", "/patients/verify-email", { body: { token: rawVerify } })).status === 200);
await call("POST", "/patients/forgot-password", { body: { email: "pat@x.test" } });
pat = await Patient.findById(pat._id);
check("reset token stored as a hash", /^[0-9a-f]{64}$/.test(pat.resetPasswordToken));
const patTok = (await call("POST", "/patients/login", { body: { email: "pat@x.test", password: "PatientPass1" } })).json?.data?.token;
check("patient logs in", Boolean(patTok));

// ---- 2. gift card balance ----
const med = await Medicine.create({ name: "Vitamin D", price: 100, stockQuantity: 10 });
await GiftCard.create({ giftCardCode: "GIFT50", totalAmount: 50, balanceAmount: 50, isActive: true });
const order = (extra = {}) => call("POST", "/pharmacy/orders", { token: patTok, body: { items: [{ medicineId: med._id, quantity: 1 }], shippingAddress: { line1: "1", city: "c", state: "s", pincode: "1" }, paymentDetails: { cardNumber: "4111111111111111" }, ...extra } });
let r = await order({ gift_cards: [{ gift_card_code: "GIFT50", gift_card_apply: 999 }] });
check("order with gift card succeeds", r.status === 201, JSON.stringify(r.json));
check("gift card balance reduced by the server-computed amount (50, not 999)", (await GiftCard.findOne({ giftCardCode: "GIFT50" })).balanceAmount === 0);
check("spent gift card rejected", (await order({ gift_cards: [{ gift_card_code: "GIFT50" }] })).status === 400);
await GiftCard.updateOne({ giftCardCode: "GIFT50" }, { balanceAmount: 30 });
const stockBefore = (await Medicine.findById(med._id)).stockQuantity;
await call("PUT", "/admin/crm-settings", { token: superTok, body: { isEnabled: true, isTestMode: false, crmProvider: "vrio", apiKey: "stub-key" } });
vrioMode = "decline";
r = await order({ gift_cards: [{ gift_card_code: "GIFT50" }] });
check("declined payment -> 400 with the gateway reason", r.status === 400 && /Card declined/.test(r.json?.message || ""), `${r.status} ${JSON.stringify(r.json)}`);
check("declined payment returns gift card balance", (await GiftCard.findOne({ giftCardCode: "GIFT50" })).balanceAmount === 30);
check("declined payment returns stock", (await Medicine.findById(med._id)).stockQuantity === stockBefore);
vrioMode = "ok";

// ---- 3. private lab report links ----
const form = new FormData();
form.append("file", new Blob(["%PDF-1.4 test report"], { type: "application/pdf" }), "cbc.pdf");
form.append("title", "CBC");
const up = await realFetch(base + "/lab-reports", { method: "POST", headers: { Authorization: `Bearer ${patTok}` }, body: form });
check("lab report upload", up.status === 201 || up.status === 200, String(up.status));
const list = (await call("GET", "/lab-reports", { token: patTok })).json.data;
const link = list[0]?.fileUrl || "";
check("fileUrl is a signed API link, not a storage URL", link.startsWith(`${origin}/api/lab-reports/file/`) && !link.includes("/uploads/"), link);
let fres = await realFetch(link);
check("signed link streams the file", fres.status === 200 && (await fres.text()).startsWith("%PDF") && fres.headers.get("content-type") === "application/pdf");
check("frontend may embed it (frame-ancestors), no X-Frame-Options", /frame-ancestors 'self' http:\/\/frontend\.test/.test(fres.headers.get("content-security-policy") || "") && !fres.headers.get("x-frame-options"));
check("download=1 sends attachment", ((await realFetch(link + "?download=1")).headers.get("content-disposition") || "").startsWith("attachment"));
check("tampered link rejected", (await realFetch(link.slice(0, -2) + "xx")).status === 403);
check("expired link rejected", (await realFetch(`${base}/lab-reports/file/${createFileToken(list[0]._id, -1000)}`)).status === 403);
const stored = await LabReport.findById(list[0]._id);
check("direct /uploads/lab-reports access blocked", (await realFetch(`${origin}/uploads/lab-reports/${stored.fileUrl}`)).status === 404);
check("profile images still served statically", (await realFetch(`${origin}/uploads/profile-images/missing.png`)).status === 404); // 404 = route reached static, not the block

// ---- 4. Cloudinary signed fetch URLs (generated locally, no network) ----
process.env.CLOUDINARY_CLOUD_NAME = "demo"; process.env.CLOUDINARY_API_KEY = "k"; process.env.CLOUDINARY_API_SECRET = "s";
const { getCloudFetchUrl } = await load("shared/utils/cloudStorage.js");
const pub = "https://res.cloudinary.com/demo/raw/upload/v1/teleclinic/lab-reports/a.pdf";
check("public asset URL passes through", (await getCloudFetchUrl(pub)) === pub);
const priv = await getCloudFetchUrl("https://res.cloudinary.com/demo/raw/authenticated/s--abc--/v1/teleclinic/lab-reports/a.pdf");
check("authenticated asset gets a signed URL", /\/raw\/authenticated\/s--[^/]+--\/.*teleclinic\/lab-reports\/a\.pdf/.test(priv || ""), priv);
const privImg = await getCloudFetchUrl("https://res.cloudinary.com/demo/image/authenticated/s--abc--/v1/teleclinic/lab-reports/scan.png");
check("authenticated image keeps its format", /\/image\/authenticated\/s--[^/]+--\/.*scan\.png(\?|$)/.test(privImg || ""), privImg);

// ---- 5. Vrio refunds ----
const paid = await Order.create({ patient: pat._id, items: [{ name: "x", quantity: 1, price: 100 }], totalAmount: 100, shippingAddress: { line1: "1", city: "c", state: "s", pincode: "1" }, status: "CANCELLED", paymentStatus: "REFUND_PENDING", vrioOrderId: "12345" });
check("CustomerSupport cannot issue refunds", (await call("POST", `/admin/pharmacy/orders/${paid._id}/refund`, { token: csTok })).status === 403);
vrioCalls.length = 0;
r = await call("POST", `/admin/pharmacy/orders/${paid._id}/refund`, { token: superTok });
const refundCall = vrioCalls.find((c) => c.method === "POST" && c.url.endsWith("/refund"));
check("refund succeeds and marks REFUNDED", r.status === 200 && r.json.data.paymentStatus === "REFUNDED", JSON.stringify(r.json));
check("looked up the order's transactions", vrioCalls.some((c) => c.method === "GET" && c.url.includes("order_id=12345") && c.url.includes("transaction_success=true")));
check("refunded the sale (not the void) for the order total", refundCall?.url.endsWith("/transactions/77/refund") && refundCall.body.refund_amount === "100.00" && vrioCalls.filter((c) => c.url.endsWith("/refund")).length === 1, JSON.stringify(refundCall));
const saved = await Order.findById(paid._id);
check("refund recorded on the order", saved.refundDetails?.transactionIds?.[0] === "77" && saved.refundDetails.amount === 100 && saved.refundDetails.refundedBy === "s@x.test");
check("already refunded order can't be refunded again", (await call("POST", `/admin/pharmacy/orders/${paid._id}/refund`, { token: superTok })).status === 400);
const offline = await Order.create({ patient: pat._id, items: [{ name: "x", quantity: 1, price: 5 }], totalAmount: 5, shippingAddress: { line1: "1", city: "c", state: "s", pincode: "1" }, status: "CANCELLED", paymentStatus: "REFUND_PENDING", vrioOrderId: "VRIO-OFFLINE-1" });
check("offline/test order explains it can't auto-refund", /offline|test mode/i.test((await call("POST", `/admin/pharmacy/orders/${offline._id}/refund`, { token: superTok })).json?.message || ""));
await call("PUT", "/admin/crm-settings", { token: superTok, body: { crmProvider: "sticky" } });
check("non-Vrio CRM gives manual instructions", /Mark refunded/.test((await call("POST", `/admin/pharmacy/orders/${offline._id}/refund`, { token: superTok })).json?.message || ""));

server.close();
await mongoose.disconnect();
await mongod.stop();
report();
