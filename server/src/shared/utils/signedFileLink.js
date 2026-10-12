import crypto from "crypto";

/**
 * Short-lived, unguessable links for private files (lab reports).
 *
 * A link carries the record id and an expiry, signed with HMAC-SHA256, so it
 * can be used directly as an <a href>, <img src> or <iframe src> (no auth
 * header needed) but stops working after `ttlMs` and can't be forged or
 * re-pointed at another record.
 */

const DEFAULT_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours

const getSecret = () => {
  const secret = process.env.FILE_LINK_SECRET || process.env.JWT_SECRET;
  if (!secret) throw new Error("FILE_LINK_SECRET or JWT_SECRET must be set to sign file links.");
  return secret;
};

const sign = (payload) => crypto.createHmac("sha256", getSecret()).update(payload).digest("base64url");

/** Token for `recordId`, valid for `ttlMs`. */
export const createFileToken = (recordId, ttlMs = DEFAULT_TTL_MS) => {
  const payload = Buffer.from(JSON.stringify({ r: String(recordId), e: Date.now() + ttlMs })).toString("base64url");
  return `${payload}.${sign(payload)}`;
};

/** Record id from a valid, unexpired token; otherwise null. */
export const readFileToken = (token) => {
  if (typeof token !== "string" || !token.includes(".")) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;

  const expected = Buffer.from(sign(payload));
  const provided = Buffer.from(signature);
  if (expected.length !== provided.length || !crypto.timingSafeEqual(expected, provided)) return null;

  try {
    const { r, e } = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (typeof r !== "string" || typeof e !== "number" || Date.now() > e) return null;
    return r;
  } catch {
    return null;
  }
};
