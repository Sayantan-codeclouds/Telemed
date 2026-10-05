import crypto from "crypto";

/**
 * Encryption at rest for credentials stored in the database (CRM, mail and
 * AI API keys/passwords). AES-256-GCM with a key derived from
 * SETTINGS_ENCRYPTION_KEY. Stored format: "enc:v1:<iv>:<tag>:<ciphertext>".
 *
 * Without SETTINGS_ENCRYPTION_KEY values are stored as before (plain text),
 * so existing deployments keep working until a key is configured.
 */

const PREFIX = "enc:v1:";
let warnedMissingKey = false;

const getKey = () => {
  const secret = process.env.SETTINGS_ENCRYPTION_KEY;
  if (!secret) return null;
  return crypto.createHash("sha256").update(secret).digest();
};

export const isEncryptedSecret = (value) => typeof value === "string" && value.startsWith(PREFIX);

export const isSecretEncryptionEnabled = () => Boolean(getKey());

/** Encrypts a secret for storage; returns it unchanged if empty, already encrypted, or no key is set. */
export const encryptSecret = (value) => {
  if (!value || isEncryptedSecret(value)) return value;
  const key = getKey();
  if (!key) {
    if (!warnedMissingKey) {
      console.warn("[Security] SETTINGS_ENCRYPTION_KEY is not set; integration secrets are stored unencrypted.");
      warnedMissingKey = true;
    }
    return value;
  }
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([cipher.update(String(value), "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${PREFIX}${iv.toString("base64")}:${tag.toString("base64")}:${ciphertext.toString("base64")}`;
};

/**
 * Decrypts a stored secret. Plain-text (legacy) values are returned as-is.
 * If the key is missing or wrong, logs an error and returns "" so the
 * integration reports "not configured" instead of sending garbage.
 */
export const decryptSecret = (value) => {
  if (!isEncryptedSecret(value)) return value;
  const key = getKey();
  if (!key) {
    console.error("[Security] An encrypted setting exists but SETTINGS_ENCRYPTION_KEY is not set.");
    return "";
  }
  try {
    const [ivB64, tagB64, dataB64] = value.slice(PREFIX.length).split(":");
    const decipher = crypto.createDecipheriv("aes-256-gcm", key, Buffer.from(ivB64, "base64"));
    decipher.setAuthTag(Buffer.from(tagB64, "base64"));
    return Buffer.concat([decipher.update(Buffer.from(dataB64, "base64")), decipher.final()]).toString("utf8");
  } catch (err) {
    console.error("[Security] Could not decrypt a stored setting (wrong SETTINGS_ENCRYPTION_KEY?):", err.message);
    return "";
  }
};
