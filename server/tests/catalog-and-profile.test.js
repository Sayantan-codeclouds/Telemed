// Specialization renames, gift card creation against the CRM, and patient
// profile updates. Vrio is never contacted: its host is answered by a stub.
import http from "http";
import { MongoMemoryServer } from "mongodb-memory-server";
import { load, createChecks } from "./helpers/harness.js";

const { check, report } = createChecks();

process.env.JWT_SECRET = "catalog-secret";
process.env.VRIO_BASE_URL = "https://vrio.stub";

const realFetch = globalThis.fetch;
let vrioGiftCardStatus = 401;
globalThis.fetch = async (url, opts) => {
  if (String(url).startsWith("https://vrio.stub")) {
    const body = vrioGiftCardStatus === 200 ? { data: { gift_card_id: 9, gift_card_code: "VRIO-GC-1" } } : { error: { message: "Invalid API key" } };
    return new Response(JSON.stringify(body), { status: vrioGiftCardStatus, headers: { "Content-Type": "application/json" } });
  }
  return realFetch(url, opts);
};

const mongod = await MongoMemoryServer.create();
const { default: mongoose } = await import("mongoose");
await mongoose.connect(mongod.getUri());
const { default: app } = await load("app.js");
const { default: Admin } = await load("admin/admin.model.js");
const { default: Doctor } = await load("doctors/doctor.model.js");
const { default: Patient } = await load("patients/patient.model.js");
const { default: GiftCard } = await load("giftcards/giftcard.model.js");
const bcrypt = (await import("bcrypt")).default;

const server = http.createServer(app);
await new Promise((resolve) => server.listen(0, resolve));
const base = `http://127.0.0.1:${server.address().port}/api`;
const call = async (method, path, { token, body } = {}) => {
  const res = await realFetch(base + path, {
    method,
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  let json = null;
  try { json = await res.json(); } catch {}
  return { status: res.status, json };
};

await Admin.create({ firstName: "S", lastName: "A", email: "s@x.test", password: await bcrypt.hash("Passw0rd!", 10), role: "SuperAdmin" });
const adminTok = (await call("POST", "/admin/login", { body: { email: "s@x.test", password: "Passw0rd!" } })).json.data.token;

// ---- specialization rename carries doctors over ----
const created = await call("POST", "/specializations/admin", { token: adminTok, body: { name: "Skin Care" } });
check("specialization created", created.status === 201 || created.status === 200, JSON.stringify(created.json));
await Doctor.create({ firstName: "D", lastName: "One", email: "d1@x.test", password: "DoctorPass1", phone: "1", specialization: "skin care", isEmailVerified: true, status: "ACTIVE" });
await Doctor.create({ firstName: "D", lastName: "Two", email: "d2@x.test", password: "DoctorPass1", phone: "2", specialization: "Cardiology", isEmailVerified: true, status: "ACTIVE" });
const specId = created.json.data._id;
check("rename works", (await call("PUT", `/specializations/admin/${specId}`, { token: adminTok, body: { name: "Dermatology" } })).status === 200);
check("doctors move to the new name (case-insensitive match)", (await Doctor.findOne({ email: "d1@x.test" })).specialization === "Dermatology");
check("other doctors untouched", (await Doctor.findOne({ email: "d2@x.test" })).specialization === "Cardiology");

// ---- gift card creation vs live CRM ----
await call("PUT", "/admin/crm-settings", { token: adminTok, body: { isEnabled: true, crmProvider: "vrio", apiKey: "bad-key" } });
let r = await call("POST", "/gift-cards", { token: adminTok, body: { gift_card_total: 50 } });
check("CRM live + Vrio rejects -> creation fails with the reason", r.status === 502 && /Invalid API key/.test(r.json?.message || ""), JSON.stringify(r.json));
check("no local-only gift card left behind", (await GiftCard.countDocuments()) === 0);
vrioGiftCardStatus = 200;
r = await call("POST", "/gift-cards", { token: adminTok, body: { gift_card_total: 50 } });
check("CRM live + Vrio accepts -> card created with Vrio's code", (r.status === 201 || r.status === 200) && (await GiftCard.findOne({ giftCardCode: "VRIO-GC-1" })) !== null, JSON.stringify(r.json));
vrioGiftCardStatus = 401;
await call("PUT", "/admin/crm-settings", { token: adminTok, body: { isEnabled: false } });
r = await call("POST", "/gift-cards", { token: adminTok, body: { gift_card_total: 25 } });
check("CRM disabled -> local gift card created", (r.status === 201 || r.status === 200) && (await GiftCard.countDocuments()) === 2, JSON.stringify(r.json));

// ---- patient profile keeps medical history when omitted ----
await Patient.create({ firstName: "Pat", lastName: "One", email: "p@x.test", phone: "9000000001", password: await bcrypt.hash("Passw0rd!", 10), isEmailVerified: true, allergies: ["Penicillin"], medicalConditions: ["Asthma"] });
const patTok = (await call("POST", "/patients/login", { body: { email: "p@x.test", password: "Passw0rd!" } })).json.data.token;
r = await call("PUT", "/patients/profile", { token: patTok, body: { firstName: "Pat", lastName: "One", phone: "9000000001" } });
const patient = await Patient.findOne({ email: "p@x.test" });
check("profile update without history keeps allergies/conditions", r.status === 200 && patient.allergies.join() === "Penicillin" && patient.medicalConditions.join() === "Asthma", JSON.stringify(r.json?.message || ""));
await call("PUT", "/patients/profile", { token: patTok, body: { firstName: "Pat", lastName: "One", phone: "9000000001", allergies: ["Penicillin", "  Latex  ", ""] } });
check("sent lists replace history (trimmed, blanks dropped)", (await Patient.findOne({ email: "p@x.test" })).allergies.join("|") === "Penicillin|Latex");

// ---- partial profile updates keep everything not sent ----
await Patient.updateOne(
  { email: "p@x.test" },
  { gender: "Female", bloodGroup: "B+", height: { value: 160, unit: "cm" }, address: { line1: "1 Main St", city: "Pune", country: "India" }, emergencyContact: { name: "Asha", relationship: "Sister", phone: "123" } }
);
r = await call("PUT", "/patients/profile", { token: patTok, body: { phone: "9000000009" } });
let saved = await Patient.findOne({ email: "p@x.test" });
check(
  "phone-only update keeps name, gender, blood group, height, address, contact",
  r.status === 200 && saved.phone === "9000000009" && saved.firstName === "Pat" && saved.gender === "Female" && saved.bloodGroup === "B+" &&
    saved.height?.value === 160 && saved.address?.city === "Pune" && saved.emergencyContact?.name === "Asha",
  JSON.stringify(r.json?.message || "")
);
await call("PUT", "/patients/profile", { token: patTok, body: { address: { city: "Mumbai" } } });
saved = await Patient.findOne({ email: "p@x.test" });
check("partial address update merges (other address lines kept)", saved.address.city === "Mumbai" && saved.address.line1 === "1 Main St");
r = await call("PUT", "/patients/profile", { token: patTok, body: { gender: "", bloodGroup: null } });
saved = await Patient.findOne({ email: "p@x.test" });
check("empty gender / blood group clears them (no enum error)", r.status === 200 && saved.gender === null && saved.bloodGroup === null, JSON.stringify(r.json?.message || ""));
r = await call("PUT", "/patients/profile", {
  token: patTok,
  body: { firstName: "Pat", lastName: "One", phone: "9000000009", gender: "Male", bloodGroup: "O-", dateOfBirth: null, height: { value: null, unit: "cm" }, weight: { value: 70, unit: "kg" }, address: { line1: "", line2: "", city: "", state: "", country: "", pincode: "" }, emergencyContact: { name: "", relationship: "", phone: "" }, medicalConditions: [], allergies: [], currentMedications: [], pastSurgeries: [] },
});
saved = await Patient.findOne({ email: "p@x.test" });
check("full form save (as the app sends it) still replaces everything", r.status === 200 && saved.bloodGroup === "O-" && saved.weight.value === 70 && saved.address.city === "" && saved.allergies.length === 0);

server.close();
await mongoose.disconnect();
await mongod.stop();
report();
