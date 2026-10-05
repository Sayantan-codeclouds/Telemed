import crypto from "crypto";

/**
 * Time-based one-time passwords (RFC 6238) compatible with Google
 * Authenticator, Microsoft Authenticator, 1Password, Authy, etc.
 * 30-second steps, 6 digits, HMAC-SHA1, ±1 step tolerance for clock drift.
 */

const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
const STEP_SECONDS = 30;
const DIGITS = 6;

const base32Encode = (buffer) => {
  let bits = 0;
  let value = 0;
  let output = "";
  for (const byte of buffer) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) output += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  return output;
};

const base32Decode = (input) => {
  const clean = String(input).toUpperCase().replace(/[^A-Z2-7]/g, "");
  let bits = 0;
  let value = 0;
  const bytes = [];
  for (const char of clean) {
    value = (value << 5) | BASE32_ALPHABET.indexOf(char);
    bits += 5;
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return Buffer.from(bytes);
};

/** New random secret (160 bits), base32-encoded for authenticator apps. */
export const generateTotpSecret = () => base32Encode(crypto.randomBytes(20));

const codeForCounter = (secret, counter) => {
  const message = Buffer.alloc(8);
  message.writeBigUInt64BE(BigInt(counter));
  const hmac = crypto.createHmac("sha1", base32Decode(secret)).update(message).digest();
  const offset = hmac[hmac.length - 1] & 0xf;
  const binary = (hmac.readUInt32BE(offset) & 0x7fffffff) % 10 ** DIGITS;
  return String(binary).padStart(DIGITS, "0");
};

/** Current code for a secret (used by tests). */
export const generateTotpCode = (secret, timeMs = Date.now()) =>
  codeForCounter(secret, Math.floor(timeMs / 1000 / STEP_SECONDS));

/** True if `code` matches the current, previous or next 30-second step. */
export const verifyTotpCode = (secret, code, timeMs = Date.now()) => {
  if (!secret || typeof code !== "string") return false;
  const candidate = code.replace(/\s+/g, "");
  if (!/^\d{6}$/.test(candidate)) return false;

  const counter = Math.floor(timeMs / 1000 / STEP_SECONDS);
  for (const drift of [-1, 0, 1]) {
    const expected = Buffer.from(codeForCounter(secret, counter + drift));
    if (crypto.timingSafeEqual(expected, Buffer.from(candidate))) return true;
  }
  return false;
};

/** otpauth:// URI that authenticator apps accept (manual entry or QR). */
export const buildOtpAuthUrl = ({ secret, accountName, issuer = "TeleClinic Admin" }) =>
  `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(accountName)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=${DIGITS}&period=${STEP_SECONDS}`;
