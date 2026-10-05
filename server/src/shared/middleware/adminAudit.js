import AuditLog from "../../admin/auditLog.model.js";

// Values of these fields are never stored, only the fact that they changed.
const SENSITIVE_KEY = /pass|secret|token|key|card|cvv|otp|totp|code$/i;
const MAX_STRING = 200;

const summarizeValue = (key, value) => {
  if (SENSITIVE_KEY.test(key)) return "[redacted]";
  if (value === null || value === undefined) return value;
  if (typeof value === "string") return value.length > MAX_STRING ? `${value.slice(0, MAX_STRING)}…` : value;
  if (typeof value === "number" || typeof value === "boolean") return value;
  if (Array.isArray(value)) return `[${value.length} item(s)]`;
  return "[object]";
};

const summarizeBody = (body) => {
  if (!body || typeof body !== "object") return {};
  const summary = {};
  for (const [key, value] of Object.entries(body)) {
    summary[key] = summarizeValue(key, value);
  }
  return summary;
};

/** Writes one audit entry; failures are logged and never break the request. */
export const recordAdminAction = async ({ admin, action, method, path, targetId = null, statusCode, changes = {}, ip = "" }) => {
  try {
    await AuditLog.create({
      admin: admin?._id,
      adminEmail: admin?.email || "",
      adminRole: admin?.role || "",
      action,
      method,
      path,
      targetId,
      statusCode,
      changes,
      ip,
    });
  } catch (err) {
    console.error("[Audit] Failed to record admin action:", err?.message || err);
  }
};

/**
 * App-level middleware: after any successful state-changing request made
 * with an admin token (req.admin is set by authenticateAdmin), store an
 * audit entry. Covers every admin router without touching each handler.
 */
export const auditAdminActions = (req, res, next) => {
  if (req.method === "GET" || req.method === "HEAD" || req.method === "OPTIONS") {
    return next();
  }

  res.on("finish", () => {
    if (!req.admin || res.statusCode >= 400) return;

    const routePath = `${req.baseUrl || ""}${req.route?.path || ""}` || req.originalUrl.split("?")[0];
    recordAdminAction({
      admin: req.admin,
      action: `${req.method} ${routePath}`,
      method: req.method,
      path: req.originalUrl.split("?")[0],
      targetId: req.params?.id || req.params?.orderId || req.params?.reviewId || null,
      statusCode: res.statusCode,
      changes: summarizeBody(req.body),
      ip: req.ip || "",
    });
  });

  return next();
};
