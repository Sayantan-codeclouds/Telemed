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
} from "./admin.service.js";
import {
  getMedicinesService,
  createMedicineService,
  updateMedicineService,
  toggleMedicineStockService,
  deleteMedicineService,
  getAllOrdersAdminService,
  updateOrderStatusAdminService,
  resendOrderInvoiceAdminService,
  createOrderService,
} from "../pharmacy/pharmacy.service.js";
import {
  getCrmSettingsService,
  updateCrmSettingsService,
} from "../pharmacy/vrio.service.js";
import { sendTestEmailService } from "../mail/mail.service.js";
import { testAiConnectionService } from "../ai/ai.service.js";

/* =================== Auth =================== */

export const login = asyncHandler(async (req, res) => {
  const result = await loginAdmin(req.body);

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

export const getPatients = asyncHandler(async (req, res) => {
  const patients = await getAllPatients();

  res.status(200).json({
    success: true,
    data: patients,
  });
});

export const createPatient = asyncHandler(async (req, res) => {
  const patient = await createPatientService(req.body);

  res.status(201).json({
    success: true,
    message: `Patient ${patient.firstName} ${patient.lastName} created successfully!`,
    data: patient,
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
  const doctors = await getAllDoctorsAdmin();

  res.status(200).json({
    success: true,
    data: doctors,
  });
});

export const createDoctor = asyncHandler(async (req, res) => {
  const doctor = await createDoctorService(req.body);

  res.status(201).json({
    success: true,
    message: `Dr. ${doctor.firstName} ${doctor.lastName} created successfully!`,
    data: doctor,
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
  const appointments = await getAllAppointments();

  res.status(200).json({
    success: true,
    data: appointments,
  });
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
  const orders = await getAllOrdersAdminService();

  res.status(200).json({
    success: true,
    data: orders,
  });
});

export const updateAdminOrderStatus = asyncHandler(async (req, res) => {
  const order = await updateOrderStatusAdminService(
    req.params.id,
    req.body.status
  );

  res.status(200).json({
    success: true,
    message: `Order status updated to ${order.status}.`,
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
    data: settings,
  });
});

export const updateAdminCrmSettings = asyncHandler(async (req, res) => {
  const settings = await updateCrmSettingsService(req.body);

  res.status(200).json({
    success: true,
    message: "Settings updated successfully.",
    data: settings,
  });
});

export const sendAdminTestEmail = asyncHandler(async (req, res) => {
  const { targetEmail } = req.body;
  if (!targetEmail || !targetEmail.includes("@")) {
    return res.status(400).json({
      success: false,
      message: "Please enter a valid recipient email address.",
    });
  }

  const result = await sendTestEmailService(targetEmail.trim());
  res.status(200).json({
    success: true,
    message: `Test email dispatched successfully via ${result.providerDisplay || result.provider}!`,
    data: result,
  });
});

export const testAdminAiConnection = asyncHandler(async (req, res) => {
  const result = await testAiConnectionService();
  res.status(200).json({
    success: true,
    message: `Connected to ${result.providerName || result.provider}! Response received in ${result.latencyMs}ms.`,
    data: result,
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
  });
});


