import express from "express";
import { authenticateAdmin, authorizeRoles } from "./admin.middleware.js";
import validate from "../shared/middleware/validate.js";
import { adminLoginSchema } from "./admin.validation.js";
import upload from "../shared/multer.js";
import rateLimit from "../shared/middleware/rateLimit.js";

import {
  login,
  dashboard,
  getAdminProfile,
  updateAdminProfile,
  uploadAdminProfilePhoto,
  changeAdminPassword,
  startTwoFactorSetup,
  enableTwoFactor,
  disableTwoFactor,
  getPatients,
  createPatient,
  changePatientStatus,
  deletePatient,
  getDoctors,
  createDoctor,
  changeDoctorStatus,
  updateDoctorCommission,
  deleteDoctor,
  reviewDoctorCredentials,
  getAppointments,
  deleteAppointment,
  rescheduleAppointmentByAdmin,
  seedDemoData,
  clearDemoData,
  getAdminMedicines,
  createAdminMedicine,
  updateAdminMedicine,
  toggleAdminMedicineStock,
  deleteAdminMedicine,
  getAdminOrders,
  updateAdminOrderStatus,
  resendAdminOrderInvoice,
  refundAdminOrder,
  createAdminOrderForCustomer,
  getAdminCrmSettings,
  getAdminCrmSettingsSummary,
  getAuditLogs,
  updateAdminCrmSettings,
  sendAdminTestEmail,
  testAdminAiConnection,
  getAdminUsers,
  createAdminUser,
  updateAdminUserRole,
  updateAdminUserStatus,
  deleteAdminUser,
  resetAdminUserPassword,
} from "./admin.controller.js";

const router = express.Router();

// Auth
router.post("/login", rateLimit({ windowMs: 15 * 60 * 1000, max: 20 }), validate(adminLoginSchema), login);

// Protected Admin Routes
router.use(authenticateAdmin);

// Admin Self-Profile Management (All authenticated admin roles)
router.get("/profile", getAdminProfile);
router.put("/profile", updateAdminProfile);
router.put("/profile/photo", upload.single("photo"), uploadAdminProfilePhoto);
router.patch("/profile/password", changeAdminPassword);
router.post("/profile/2fa/setup", startTwoFactorSetup);
router.post("/profile/2fa/enable", enableTwoFactor);
router.post("/profile/2fa/disable", disableTwoFactor);

// Dashboard
router.get("/dashboard", dashboard);

// Admin Team & RBAC Management
router.get("/users", authorizeRoles("SuperAdmin", "Admin"), getAdminUsers);
router.post("/users", authorizeRoles("SuperAdmin"), createAdminUser);
router.patch("/users/:id/role", authorizeRoles("SuperAdmin"), updateAdminUserRole);
router.patch("/users/:id/status", authorizeRoles("SuperAdmin"), updateAdminUserStatus);
router.delete("/users/:id", authorizeRoles("SuperAdmin"), deleteAdminUser);
router.patch("/users/:id/password", authorizeRoles("SuperAdmin"), resetAdminUserPassword);

// Patients
router.get("/patients", getPatients);
router.post("/patients", authorizeRoles("SuperAdmin", "Admin"), createPatient);
router.patch("/patients/:id/status", authorizeRoles("SuperAdmin", "Admin"), changePatientStatus);
router.delete("/patients/:id", authorizeRoles("SuperAdmin", "Admin"), deletePatient);

// Doctors
router.get("/doctors", getDoctors);
router.post("/doctors", authorizeRoles("SuperAdmin", "Admin"), createDoctor);
router.patch("/doctors/:id/status", authorizeRoles("SuperAdmin", "Admin"), changeDoctorStatus);
router.patch("/doctors/:id/commission", authorizeRoles("SuperAdmin", "Admin"), updateDoctorCommission);
router.delete("/doctors/:id", authorizeRoles("SuperAdmin"), deleteDoctor);
router.patch("/doctors/:id/credentials", authorizeRoles("SuperAdmin", "Admin"), reviewDoctorCredentials);

// Appointments
router.get("/appointments", getAppointments);
router.patch("/appointments/:id/reschedule", rescheduleAppointmentByAdmin);
router.delete("/appointments/:id", authorizeRoles("SuperAdmin", "Admin"), deleteAppointment);

// Pharmacy Inventory & Stock Controls
router.get("/pharmacy/medicines", getAdminMedicines);
router.post("/pharmacy/medicines", authorizeRoles("SuperAdmin", "Admin"), createAdminMedicine);
router.put("/pharmacy/medicines/:id", authorizeRoles("SuperAdmin", "Admin"), updateAdminMedicine);
router.patch("/pharmacy/medicines/:id/stock", authorizeRoles("SuperAdmin", "Admin"), toggleAdminMedicineStock);
router.delete("/pharmacy/medicines/:id", authorizeRoles("SuperAdmin"), deleteAdminMedicine);

// Pharmacy Orders Controls
router.get("/pharmacy/orders", getAdminOrders);
router.post("/pharmacy/orders", createAdminOrderForCustomer);
router.patch("/pharmacy/orders/:id/status", updateAdminOrderStatus);
router.post("/pharmacy/orders/:id/resend-invoice", resendAdminOrderInvoice);
// Moves money: managers only.
router.post("/pharmacy/orders/:id/refund", authorizeRoles("SuperAdmin", "Admin"), refundAdminOrder);

// CRM & Platform Settings (SuperAdmin / Admin)
// Full settings (secrets masked) are SuperAdmin-only, like the Settings page.
router.get("/crm-settings", authorizeRoles("SuperAdmin"), getAdminCrmSettings);
router.get("/crm-settings/summary", getAdminCrmSettingsSummary);
router.get("/audit-logs", authorizeRoles("SuperAdmin"), getAuditLogs);
router.put("/crm-settings", authorizeRoles("SuperAdmin"), updateAdminCrmSettings);
router.post("/mail/test-email", authorizeRoles("SuperAdmin"), sendAdminTestEmail);
router.post("/ai/test-connection", authorizeRoles("SuperAdmin"), testAdminAiConnection);

// Demo Data Seeder & Cleaner (SuperAdmin only)
router.post("/seed-demo", authorizeRoles("SuperAdmin"), seedDemoData);
router.post("/clear-demo", authorizeRoles("SuperAdmin"), clearDemoData);

export default router;
