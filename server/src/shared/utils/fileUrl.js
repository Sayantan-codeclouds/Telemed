export const getProfileImageFilename = (value) => {
  if (typeof value !== "string" || !value.trim()) {
    return null;
  }

  // Preserve full external URLs and data URIs
  if (/^https?:\/\//i.test(value.trim()) || value.trim().startsWith("data:")) {
    return value.trim();
  }

  return (
    value
      .trim()
      .split(/[?#]/, 1)[0]
      .replace(/\\/g, "/")
      .split("/")
      .pop() || null
  );
};

const APP_URL_CACHE_TTL_MS = 60_000;
let cachedAppUrl = null;
let cachedAppUrlAt = 0;
let refreshInFlight = null;

const refreshAppUrlCache = () => {
  if (refreshInFlight) return refreshInFlight;

  refreshInFlight = import("../../pharmacy/vrio.service.js")
    .then(({ getCrmSettingsService }) => getCrmSettingsService())
    .then((settings) => {
      cachedAppUrl = settings?.appUrl?.trim() || null;
    })
    .catch(() => {
      // Ignore lookup failure; env var fallback still applies below.
    })
    .finally(() => {
      cachedAppUrlAt = Date.now();
      refreshInFlight = null;
    });

  return refreshInFlight;
};

/**
 * Resolves the active backend/app domain for building asset URLs.
 *
 * APP_URL wins: an environment knows its own host best, and letting the shared
 * CRM setting override it would make local/staging serve production asset URLs.
 * The DB value is the fallback for when APP_URL isn't reaching the process
 * (the original reason images fell back to localhost in production).
 *
 * Stays synchronous (many call sites format images without awaiting) by serving
 * the last-known DB value and refreshing it in the background on a short TTL.
 */
export const getEffectiveAppUrl = () => {
  if (Date.now() - cachedAppUrlAt > APP_URL_CACHE_TTL_MS) {
    refreshAppUrlCache();
  }

  return (
    process.env.APP_URL ||
    cachedAppUrl ||
    process.env.RENDER_EXTERNAL_URL ||
    (process.env.NODE_ENV === "production" ? "https://telemed-zuls.onrender.com" : "http://localhost:5000")
  ).replace(/\/+$/, "");
};

export const getProfileImage = (filename) => {
  if (!filename || typeof filename !== "string") {
    return null;
  }

  const trimmed = filename.trim();

  // If already a full URL or data URI, return as-is
  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith("data:")) {
    return trimmed;
  }

  const imageFilename = getProfileImageFilename(trimmed);
  if (!imageFilename) {
    return null;
  }

  const appUrl = getEffectiveAppUrl();
  return `${appUrl}/uploads/profile-images/${imageFilename}`;
};

export const formatProfileImage = (entity) => {
  if (!entity) {
    return entity;
  }

  const value = entity.toObject ? entity.toObject() : entity;

  let formatted = { ...value };
  if (Object.prototype.hasOwnProperty.call(value, "profileImage")) {
    formatted.profileImage = getProfileImage(value.profileImage);
  }
  if (Object.prototype.hasOwnProperty.call(value, "signature") && value.signature) {
    formatted.signature = getProfileImage(value.signature);
  }
  if (Object.prototype.hasOwnProperty.call(value, "clinicStamp") && value.clinicStamp) {
    formatted.clinicStamp = getProfileImage(value.clinicStamp);
  }

  return formatted;
};

export const formatAppointmentProfileImages = (appointment) => {
  if (!appointment) {
    return appointment;
  }

  const value = appointment.toObject ? appointment.toObject() : appointment;

  return {
    ...value,
    doctor: formatProfileImage(value.doctor),
    patient: formatProfileImage(value.patient),
  };
};

export const formatChatMessageProfileImage = (message) => {
  if (!message) {
    return message;
  }

  const value = message.toObject ? message.toObject() : message;

  return {
    ...value,
    senderId: formatProfileImage(value.senderId),
  };
};

export const getLabReportUrl = (filename) => {
  if (!filename || typeof filename !== "string") {
    return null;
  }

  const trimmed = filename.trim();
  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith("data:")) {
    return trimmed;
  }

  const cleanFilename = trimmed
    .split(/[?#]/, 1)[0]
    .replace(/\\/g, "/")
    .split("/")
    .pop();

  if (!cleanFilename) {
    return null;
  }

  const appUrl = getEffectiveAppUrl();
  return `${appUrl}/uploads/lab-reports/${cleanFilename}`;
};

export const formatLabReport = (report) => {
  if (!report) return report;
  const value = report.toObject ? report.toObject() : report;
  return {
    ...value,
    fileUrl: getLabReportUrl(value.fileUrl),
    patient: formatProfileImage(value.patient),
    doctor: formatProfileImage(value.doctor),
  };
};

