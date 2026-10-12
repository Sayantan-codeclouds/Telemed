import asyncHandler from "../shared/utils/asyncHandler.js";
import {
  loginAdmin,
  getDashboardStats,
  getAllPatients,
  createPatientService,
  updatePatientStatus,
  deletePatientService,
  getAllDoctorsAdmin,
  createDoctorService,
  updateDoctorStatus,
  updateDoctorCommissionService,
  deleteDoctorService,
  getAllAppointments,
  deleteAppointmentService,
  rescheduleAppointmentByAdminService,
  seedDemoDataService,
  clearDemoDataService,
  getAllAdminUsersService,
  createAdminUserService,
  updateAdminRoleService,
  updateAdminStatusService,
  deleteAdminUserService,
  getAdminProfileService,
  updateAdminProfileService,
  uploadAdminProfilePhotoService,
  changeAdminPasswordService,
  startTwoFactorSetupService,
  enableTwoFactorService,
  disableTwoFactorService,
} from "./admin.service.js";
import {
  getMedicinesService,
  createMedicineService,
  updateMedicineService,
  toggleMedicineStockService,
  deleteMedicineService,
  getAllOrdersAdminService,
  updateOrderStatusAdminService,
  refundOrderAdminService,
  resendOrderInvoiceAdminService,
  createOrderService,
} from "../pharmacy/pharmacy.service.js";
import {
  getCrmSettingsService,
  updateCrmSettingsService,
  maskCrmSettings,
} from "../pharmacy/vrio.service.js";
import { sendTestEmailService } from "../mail/mail.service.js";
import { recordAdminAction } from "../shared/middleware/adminAudit.js";
import AuditLog from "./auditLog.model.js";
import { parseListQuery } from "./adminList.js";
import {
  listPatientsAdmin,
  listDoctorsAdmin,
  listAppointmentsAdmin,
  listOrdersAdmin,
} from "./adminList.service.js";
import { testAiConnectionService } from "../ai/ai.service.js";

/* =================== Auth =================== */

export const login = asyncHandler(async (req, res) => {
  const result = await loginAdmin(req.body);

  if (result.token) {
    await recordAdminAction({
      admin: { _id: result.admin.id, email: result.admin.email, role: result.admin.role },
      action: "LOGIN",
      method: "POST",
      path: req.originalUrl.split("?")[0],
      statusCode: 200,
      ip: req.ip || "",
    });
  }

  res.status(200).json({
    success: true,
    message: "Login successful.",
    data: result,
  });
});

/* =================== Dashboard =================== */

export const dashboard = asyncHandler(async (req, res) => {
  const stats = await getDashboardStats();

  res.status(200).json({
    success: true,
    data: stats,
  });
});

/* =================== Patients =================== */

// With ?page the admin pages get one page plus counts (server-side search,
// filters and sort); without it the full list is returned (e.g. pickers).
export const getPatients = asyncHandler(async (req, res) => {
  const paging = parseListQuery(req.query);
  if (paging) {
    return res.status(200).json(
      await listPatientsAdmin(paging, { status: req.query.status, gender: req.query.gender, sort: req.query.sort })
    );
  }
  res.status(200).json({ success: true, data: await getAllPatients() });
});

// null = admin set the password; true/false = whether the set-password email went out.
const setupEmailNote = (setupEmailSent) => {
  if (setupEmailSent === true) return " A set-password link has been emailed to them.";
  if (setupEmailSent === false) return " The set-password email could not be sent; ask them to use \"Forgot password\".";
  return "";
};

export const createPatient = asyncHandler(async (req, res) => {
  const { patient, setupEmailSent } = await createPatientService(req.body);

  res.status(201).json({
    success: true,
    message: `Patient ${patient.firstName} ${patient.lastName} created successfully!${setupEmailNote(setupEmailSent)}`,
    data: patient,
    setupEmailSent,
  });
});

export const changePatientStatus = asyncHandler(async (req, res) => {
  const patient = await updatePatientStatus(
    req.params.id,
    req.body.status
  );

  res.status(200).json({
    success: true,
    message: "Patient status updated.",
    data: patient,
  });
});

export const deletePatient = asyncHandler(async (req, res) => {
  const result = await deletePatientService(req.params.id);

  res.status(200).json({
    success: true,
    message: result.message,
  });
});

/* =================== Doctors =================== */

export const getDoctors = asyncHandler(async (req, res) => {
  const paging = parseListQuery(req.query);
  if (paging) {
    return res.status(200).json(
      await listDoctorsAdmin(paging, {
        status: req.query.status,
        specialization: req.query.specialization,
        sort: req.query.sort,
      })
    );
  }
  res.status(200).json({ success: true, data: await getAllDoctorsAdmin() });
});

export const createDoctor = asyncHandler(async (req, res) => {
  const { doctor, setupEmailSent } = await createDoctorService(req.body);

  res.status(201).json({
    success: true,
    message: `Dr. ${doctor.firstName} ${doctor.lastName} created successfully!${setupEmailNote(setupEmailSent)}`,
    data: doctor,
    setupEmailSent,
  });
});

export const changeDoctorStatus = asyncHandler(async (req, res) => {
  const doctor = await updateDoctorStatus(
    req.params.id,
    req.body.status
  );

  res.status(200).json({
    success: true,
    message: "Doctor status updated.",
    data: doctor,
  });
});

export const updateDoctorCommission = asyncHandler(async (req, res) => {
  const result = await updateDoctorCommissionService(
    req.params.id,
    req.body.commissionPercent
  );

  res.status(200).json({
    success: true,
    message: `Commission rate for Dr. ${result.firstName} ${result.lastName} updated to ${result.platformCommissionPercent}% (${result.doctorPayoutPercent}% payout).`,
    data: result,
  });
});

export const deleteDoctor = asyncHandler(async (req, res) => {
  const result = await deleteDoctorService(req.params.id);

  res.status(200).json({
    success: true,
    message: result.message,
  });
});

/* =================== Appointments =================== */

export const getAppointments = asyncHandler(async (req, res) => {
  const paging = parseListQuery(req.query);
  if (paging) {
    return res.status(200).json(await listAppointmentsAdmin(paging, { status: req.query.status, sort: req.query.sort }));
  }
  res.status(200).json({ success: true, data: await getAllAppointments() });
});

export const deleteAppointment = asyncHandler(async (req, res) => {
  const result = await deleteAppointmentService(req.params.id);

  res.status(200).json({
    success: true,
    message: result.message,
  });
});

export const rescheduleAppointmentByAdmin = asyncHandler(async (req, res) => {
  const appointment = await rescheduleAppointmentByAdminService(
    req.params.id,
    {
      newDate: req.body.newDate,
      newSlot: req.body.newSlot,
      reason: req.body.reason,
      newStatus: req.body.newStatus,
      adminUser: req.admin,
    }
  );

  res.status(200).json({
    success: true,
    message: "Appointment rescheduled successfully by admin.",
    data: appointment,
  });
});

/* =================== Demo Controls =================== */

export const seedDemoData = asyncHandler(async (req, res) => {
  const result = await seedDemoDataService();

  res.status(201).json({
    success: true,
    message: result.message,
    data: result.data,
  });
});

export const clearDemoData = asyncHandler(async (req, res) => {
  const result = await clearDemoDataService();

  res.status(200).json({
    success: true,
    message: result.message,
  });
});

/* =================== Pharmacy Inventory Controls =================== */

export const getAdminMedicines = asyncHandler(async (req, res) => {
  const medicines = await getMedicinesService(req.query);

  res.status(200).json({
    success: true,
    data: medicines,
  });
});

export const createAdminMedicine = asyncHandler(async (req, res) => {
  const medicine = await createMedicineService(req.body);

  res.status(201).json({
    success: true,
    message: "Medicine added to pharmacy catalog.",
    data: medicine,
  });
});

export const updateAdminMedicine = asyncHandler(async (req, res) => {
  const medicine = await updateMedicineService(req.params.id, req.body);

  res.status(200).json({
    success: true,
    message: "Medicine details updated successfully.",
    data: medicine,
  });
});

export const toggleAdminMedicineStock = asyncHandler(async (req, res) => {
  const medicine = await toggleMedicineStockService(
    req.params.id,
    req.body.inStock,
    req.body.stockQuantity
  );

  res.status(200).json({
    success: true,
    message: `Medicine is now ${medicine.inStock ? "IN STOCK" : "OUT OF STOCK"}.`,
    data: medicine,
  });
});

export const deleteAdminMedicine = asyncHandler(async (req, res) => {
  const result = await deleteMedicineService(req.params.id);

  res.status(200).json({
    success: true,
    message: result.message,
  });
});

/* =================== Pharmacy Orders Controls =================== */

export const getAdminOrders = asyncHandler(async (req, res) => {
  const paging = parseListQuery(req.query);
  if (paging) {
    return res.status(200).json(await listOrdersAdmin(paging, { status: req.query.status, type: req.query.type }));
  }
  res.status(200).json({ success: true, data: await getAllOrdersAdminService() });
});

export const updateAdminOrderStatus = asyncHandler(async (req, res) => {
  const order = await updateOrderStatusAdminService(
    req.params.id,
    req.body.status,
    req.body.paymentStatus
  );

  res.status(200).json({
    success: true,
    message:
      order.paymentStatus === "REFUND_PENDING"
        ? `Order status updated to ${order.status}. Issue the refund in the CRM, then mark it refunded.`
        : `Order status updated to ${order.status}.`,
    data: order,
  });
});

export const refundAdminOrder = asyncHandler(async (req, res) => {
  const { order, refundedAmount, fullyRefunded } = await refundOrderAdminService(req.params.id, req.admin);
  res.status(200).json({
    success: true,
    message: fullyRefunded
      ? `Refund of ${refundedAmount.toFixed(2)} issued through the CRM. The patient has been notified.`
      : `Only ${refundedAmount.toFixed(2)} could be refunded automatically; refund the rest in the CRM, then mark it refunded.`,
    data: order,
  });
});

export const resendAdminOrderInvoice = asyncHandler(async (req, res) => {
  const result = await resendOrderInvoiceAdminService(req.params.id);

  res.status(200).json(result);
});

export const createAdminOrderForCustomer = asyncHandler(async (req, res) => {
  const { patientId, ...orderData } = req.body;

  if (!patientId) {
    return res.status(400).json({
      success: false,
      message: "Patient ID is required to place an order on behalf of a customer.",
    });
  }

  const clientIp =
    req.body.ip_address ||
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.socket?.remoteAddress ||
    "127.0.0.1";
  const userAgent = req.body.user_agent || req.headers["user-agent"] || "Mozilla/5.0 (Admin Assisted Checkout)";
  const sessionId = req.body.session_id || `admin_moto_${Date.now().toString(36)}`;

  const enrichedData = {
    ...orderData,
    ip_address: clientIp,
    user_agent: userAgent,
    session_id: sessionId,
    order_notes: orderData.order_notes || `Created via Admin/Support by ${req.admin?.firstName} ${req.admin?.lastName} (${req.admin?.role || "Support"})`,
  };

  const order = await createOrderService(patientId, enrichedData);

  res.status(201).json({
    success: true,
    message: `Order successfully created for customer! Confirmation invoice dispatched to email.`,
    data: order,
  });
});

/* =================== Vrio CRM Settings Controls =================== */

export const getAdminCrmSettings = asyncHandler(async (req, res) => {
  const settings = await getCrmSettingsService();

  res.status(200).json({
    success: true,
    data: maskCrmSettings(settings),
  });
});

// Non-secret settings any admin role may read (e.g. which CRM is active).
export const getAdminCrmSettingsSummary = asyncHandler(async (req, res) => {
  const settings = await getCrmSettingsService();

  res.status(200).json({
    success: true,
    data: {
      crmProvider: settings.crmProvider || "vrio",
      currencySign: settings.currencySign || "$",
      isEnabled: Boolean(settings.isEnabled),
      isTestMode: Boolean(settings.isTestMode),
    },
  });
});

export const updateAdminCrmSettings = asyncHandler(async (req, res) => {
  const settings = await updateCrmSettingsService(req.body);

  res.status(200).json({
    success: true,
    message: "Settings updated successfully.",
    data: maskCrmSettings(settings),
  });
});

// The Settings page sends its current (possibly unsaved) values so the test
// buttons check what is on screen. Only the relevant keys are accepted.
const pickOverrides = (source, keys) => {
  if (!source || typeof source !== "object") return null;
  const picked = {};
  for (const key of keys) {
    if (source[key] !== undefined) picked[key] = source[key];
  }
  return picked;
};

const MAIL_OVERRIDE_KEYS = [
  "mailProvider", "mailApiKey", "mailFromEmail", "resendApiKey", "resendFromEmail",
  "smtpHost", "smtpPort", "smtpUser", "smtpPass", "smtpSecure",
];
const AI_OVERRIDE_KEYS = ["aiProvider", "aiApiKey", "aiModel", "aiCustomBaseUrl", "groqApiKey"];

export const sendAdminTestEmail = asyncHandler(async (req, res) => {
  const { targetEmail } = req.body;
  if (!targetEmail || !targetEmail.includes("@")) {
    return res.status(400).json({
      success: false,
      message: "Please enter a valid recipient email address.",
    });
  }

  const result = await sendTestEmailService(
    targetEmail.trim(),
    pickOverrides(req.body.settings, MAIL_OVERRIDE_KEYS)
  );
  res.status(200).json({
    success: true,
    message: `Test email dispatched successfully via ${result.providerDisplay || result.provider}!`,
    data: result,
  });
});

export const testAdminAiConnection = asyncHandler(async (req, res) => {
  const result = await testAiConnectionService(pickOverrides(req.body?.settings, AI_OVERRIDE_KEYS));
  res.status(200).json({
    success: true,
    message: `Connected to ${result.providerName || result.provider}! Response received in ${result.latencyMs}ms.`,
    data: result,
  });
});

/* =================== Audit Log =================== */

export const getAuditLogs = asyncHandler(async (req, res) => {
  const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 200);
  const page = Math.max(Number(req.query.page) || 1, 1);

  const [logs, total] = await Promise.all([
    AuditLog.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    AuditLog.countDocuments(),
  ]);

  res.status(200).json({
    success: true,
    data: logs,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

/* =================== Admin Users (Team Management) =================== */

export const getAdminUsers = asyncHandler(async (req, res) => {
  const users = await getAllAdminUsersService();
  res.status(200).json({
    success: true,
    data: users,
  });
});

export const createAdminUser = asyncHandler(async (req, res) => {
  const user = await createAdminUserService(req.body);
  res.status(201).json({
    success: true,
    message: "Admin team member created successfully.",
    data: user,
  });
});

export const updateAdminUserRole = asyncHandler(async (req, res) => {
  const user = await updateAdminRoleService(req.params.id, req.body.role, req.admin._id);
  res.status(200).json({
    success: true,
    message: `Role updated to '${user.role}' successfully.`,
    data: user,
  });
});

export const updateAdminUserStatus = asyncHandler(async (req, res) => {
  const user = await updateAdminStatusService(req.params.id, req.body.status, req.admin._id);
  res.status(200).json({
    success: true,
    message: `Status updated to '${user.status}' successfully.`,
    data: user,
  });
});

export const deleteAdminUser = asyncHandler(async (req, res) => {
  const result = await deleteAdminUserService(req.params.id, req.admin._id);
  res.status(200).json(result);
});

/* =================== Admin Self-Profile Controls =================== */

export const getAdminProfile = asyncHandler(async (req, res) => {
  const profile = await getAdminProfileService(req.admin._id);
  res.status(200).json({
    success: true,
    data: profile,
  });
});

export const updateAdminProfile = asyncHandler(async (req, res) => {
  const updated = await updateAdminProfileService(req.admin._id, req.body);
  res.status(200).json({
    success: true,
    message: "Profile updated successfully.",
    data: updated,
  });
});

export const uploadAdminProfilePhoto = asyncHandler(async (req, res) => {
  const result = await uploadAdminProfilePhotoService(req.admin._id, req.file);
  res.status(200).json({
    success: true,
    message: "Profile photo uploaded successfully.",
    image: result.profileImage,
    data: result.admin,
  });
});

export const changeAdminPassword = asyncHandler(async (req, res) => {
  const result = await changeAdminPasswordService(req.admin._id, req.body);
  res.status(200).json({
    success: true,
    message: result.message,
    // Existing tokens were revoked; the client swaps in this one.
    data: { token: result.token },
  });
});

/* =================== Two-Factor Login =================== */

export const startTwoFactorSetup = asyncHandler(async (req, res) => {
  const result = await startTwoFactorSetupService(req.admin._id);
  res.status(200).json({ success: true, data: result });
});

export const enableTwoFactor = asyncHandler(async (req, res) => {
  const result = await enableTwoFactorService(req.admin._id, req.body?.code);
  res.status(200).json({
    success: true,
    message: "Two-factor login enabled. Other sessions have been signed out.",
    data: result,
  });
});

export const disableTwoFactor = asyncHandler(async (req, res) => {
  const result = await disableTwoFactorService(req.admin._id, req.body || {});
  res.status(200).json({
    success: true,
    message: "Two-factor login disabled.",
    data: result,
  });
});


