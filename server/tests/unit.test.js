// Unit checks that need no server or database: secret encryption,
// settings masking/overrides, coupon rules, model invariants and TOTP.
import { load, createChecks } from "./helpers/harness.js";

const { check, report } = createChecks();

// --- secretBox ---
process.env.SETTINGS_ENCRYPTION_KEY = "test-key-1";
const box = await load("shared/utils/secretBox.js");
const enc = box.encryptSecret("sk-live-123");
check("encrypts with prefix", enc.startsWith("enc:v1:") && !enc.includes("sk-live-123"));
check("round-trips", box.decryptSecret(enc) === "sk-live-123");
check("re-encrypting is a no-op", box.encryptSecret(enc) === enc);
check("legacy plain text passes through", box.decryptSecret("plain-key") === "plain-key");
process.env.SETTINGS_ENCRYPTION_KEY = "wrong-key";
check("wrong key -> empty string", box.decryptSecret(enc) === "");
delete process.env.SETTINGS_ENCRYPTION_KEY;
check("no key -> stored unencrypted", box.encryptSecret("abc") === "abc");
check("no key + encrypted value -> empty", box.decryptSecret(enc) === "");

// --- masking / overrides ---
const crm = await load("pharmacy/vrio.service.js");
const masked = crm.maskCrmSettings({ apiKey: "secret", smtpPass: "", campaignId: 5, aiApiKey: "k" });
check("secrets masked, empty left empty, others kept",
  masked.apiKey === crm.SECRET_MASK && masked.smtpPass === "" && masked.campaignId === 5 && masked.aiApiKey === crm.SECRET_MASK);
const merged = crm.applySettingsOverrides(
  { mailApiKey: "saved", mailProvider: "resend", smtpHost: "a" },
  { mailApiKey: crm.SECRET_MASK, mailProvider: "smtp", smtpHost: "b", aiApiKey: "" }
);
check("overrides: mask keeps saved secret, plain fields override",
  merged.mailApiKey === "saved" && merged.mailProvider === "smtp" && merged.smtpHost === "b" && merged.aiApiKey === undefined);

// --- coupon model ---
const { default: Coupon } = await load("coupons/coupon.model.js");
const pct = new Coupon({ code: "X", title: "t", type: "PERCENTAGE", discountAmount: 150 });
check("percentage > 100 rejected", Boolean(pct.validateSync()?.errors?.discountAmount));
const fixed = new Coupon({ code: "Y", title: "t", type: "FIXED", discountAmount: 150 });
check("fixed 150 allowed", !fixed.validateSync()?.errors?.discountAmount);
const today = new Date();
const todayUtcMidnight = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
const expToday = new Coupon({ code: "Z", title: "t", type: "FIXED", discountAmount: 5, validUntil: todayUtcMidnight });
check("coupon expiring today is still valid today", expToday.isValid(100).valid === true);
const expYesterday = new Coupon({ code: "W", title: "t", type: "FIXED", discountAmount: 5, validUntil: new Date(todayUtcMidnight - 86400000) });
check("coupon that expired yesterday is invalid", expYesterday.isValid(100).valid === false);
const minOrder = new Coupon({ code: "M", title: "t", type: "FIXED", discountAmount: 5, minOrderAmount: 50 });
check("currency sign used in message", minOrder.isValid(10, "₹").message.includes("₹50"));

// --- admin model: 2FA secrets not selected by default ---
const { default: Admin } = await load("admin/admin.model.js");
check("2FA secrets are select:false",
  Admin.schema.path("twoFactorSecret").options.select === false &&
  Admin.schema.path("twoFactorPendingSecret").options.select === false);
check("doctor PENDING_APPROVAL status allowed",
  (await load("doctors/doctor.model.js")).default.schema.path("status").enumValues.includes("PENDING_APPROVAL"));

// --- TOTP (RFC 6238 test vectors) ---
const totp = await load("shared/utils/totp.js");
const rfcSecret = "GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ"; // base32("12345678901234567890")
check("TOTP matches RFC 6238 vector at T=59", totp.generateTotpCode(rfcSecret, 59000) === "287082");
check("TOTP matches RFC 6238 vector at T=1111111109", totp.generateTotpCode(rfcSecret, 1111111109000) === "081804");
const secret = totp.generateTotpSecret();
check("TOTP accepts the current code", totp.verifyTotpCode(secret, totp.generateTotpCode(secret)));
check("TOTP accepts the previous step (clock drift)", totp.verifyTotpCode(secret, totp.generateTotpCode(secret, Date.now() - 30000)));
check("TOTP rejects codes two steps old", !totp.verifyTotpCode(secret, totp.generateTotpCode(secret, Date.now() - 90000)));
check("TOTP rejects non-numeric input", !totp.verifyTotpCode(secret, "abc"));

// --- regex escaping ---
const { default: escapeRegex } = await load("shared/utils/escapeRegex.js");
const literal = "a.b*(c)[d]\\e$^+?{}|";
check("escapeRegex matches its input literally", new RegExp(`^${escapeRegex(literal)}$`).test(literal) && !new RegExp(`^${escapeRegex("a.b")}$`).test("aXb"));

report();
