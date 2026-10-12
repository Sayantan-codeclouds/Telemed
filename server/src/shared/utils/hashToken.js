import crypto from "crypto";

/**
 * One-way hash for single-use tokens (email verification, password reset,
 * account setup). Only the hash is stored, so a database leak doesn't hand
 * out working links; the raw token exists only in the email sent.
 */
const hashToken = (token) => crypto.createHash("sha256").update(String(token)).digest("hex");

export default hashToken;
