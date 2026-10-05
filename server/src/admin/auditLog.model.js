import mongoose from "mongoose";

/**
 * Record of an action taken by an admin (settings changes, deletes, role
 * changes, refunds, orders placed for customers, ...). Written by the audit
 * middleware; never edited.
 */
const auditLogSchema = new mongoose.Schema(
  {
    admin: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", index: true },
    adminEmail: { type: String, default: "" },
    adminRole: { type: String, default: "" },
    // e.g. "PATCH /api/admin/doctors/:id/status"
    action: { type: String, required: true },
    method: { type: String, required: true },
    path: { type: String, required: true },
    targetId: { type: String, default: null },
    statusCode: { type: Number },
    // Names of the fields sent, plus non-sensitive values (secrets are redacted).
    changes: { type: mongoose.Schema.Types.Mixed, default: {} },
    ip: { type: String, default: "" },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

auditLogSchema.index({ createdAt: -1 });

export default mongoose.model("AdminAuditLog", auditLogSchema);
