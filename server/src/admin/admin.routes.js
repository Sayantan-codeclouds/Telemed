import express from "express";
import { authenticateAdmin, authorizeRoles } from "./admin.middleware.js";
import validate from "../shared/middleware/validate.js";
import { adminLoginSchema } from "./admin.validation.js";
import upload from "../shared/multer.js";

import {
  login,
  dashboard,
  getAdminProfile,
  updateAdminProfile,
  uploadAdminProfilePhoto,
  changeAdminPassword,
  getPatients,
  createPatient,
  changePatientStatus,
  deletePatient,
  getDoctors,
  createDoctor,
  changeDoctorStatus,
  updateDoctorCommission,
  deleteDoctor,
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
  createAdminOrderForCustomer,
  getAdminCrmSettings,
  updateAdminCrmSettings,
  sendAdminTestEmail,
  testAdminAiConnection,
  getAdminUsers,
  createAdminUser,
  updateAdminUserRole,
  updateAdminUserStatus,
  deleteAdminUser,
} from "./admin.controller.js";

const router = express.Router();

// Auth
router.post("/login", validate(adminLoginSchema), login);

// Protected Admin Routes
router.use(authenticateAdmin);

// Admin Self-Profile Management (All authenticated admin roles)
router.get("/profile", getAdminProfile);
router.put("/profile", updateAdminProfile);
router.put("/profile/photo", upload.single("photo"), uploadAdminProfilePhoto);
router.patch("/profile/password", changeAdminPassword);

// Dashboard
router.get("/dashboard", dashboard);

// Admin Team & RBAC Management
router.get("/users", authorizeRoles("SuperAdmin", "Admin"), getAdminUsers);
router.post("/users", authorizeRoles("SuperAdmin", "Admin"), createAdminUser);
router.patch("/users/:id/role", authorizeRoles("SuperAdmin"), updateAdminUserRole);
router.patch("/users/:id/status", authorizeRoles("SuperAdmin"), updateAdminUserStatus);
router.delete("/users/:id", authorizeRoles("SuperAdmin"), deleteAdminUser);

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

// CRM & Platform Settings (SuperAdmin / Admin)
router.get("/crm-settings", authorizeRoles("SuperAdmin", "Admin"), getAdminCrmSettings);
router.put("/crm-settings", authorizeRoles("SuperAdmin"), updateAdminCrmSettings);
router.post("/mail/test-email", authorizeRoles("SuperAdmin", "Admin"), sendAdminTestEmail);
router.post("/ai/test-connection", authorizeRoles("SuperAdmin", "Admin"), testAdminAiConnection);

// Demo Data Seeder & Cleaner (SuperAdmin only)
router.post("/seed-demo", authorizeRoles("SuperAdmin"), seedDemoData);
router.post("/clear-demo", authorizeRoles("SuperAdmin"), clearDemoData);

export default router;
