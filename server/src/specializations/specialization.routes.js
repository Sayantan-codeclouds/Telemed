import express from "express";
import { authenticateAdmin, authorizeRoles } from "../admin/admin.middleware.js";
import {
  getActiveSpecializations,
  getAllSpecializationsAdmin,
  createSpecialization,
  updateSpecialization,
  deleteSpecialization,
  toggleSpecializationStatus,
} from "./specialization.controller.js";

const router = express.Router();

// Public route for active specializations (used by doctor profile, filters, patient booking)
router.get("/", getActiveSpecializations);

// Admin routes
router.get("/admin", authenticateAdmin, authorizeRoles("SuperAdmin", "Admin"), getAllSpecializationsAdmin);
router.post("/admin", authenticateAdmin, authorizeRoles("SuperAdmin", "Admin"), createSpecialization);
router.put("/admin/:id", authenticateAdmin, authorizeRoles("SuperAdmin", "Admin"), updateSpecialization);
router.delete("/admin/:id", authenticateAdmin, authorizeRoles("SuperAdmin", "Admin"), deleteSpecialization);
router.patch("/admin/:id/toggle", authenticateAdmin, authorizeRoles("SuperAdmin", "Admin"), toggleSpecializationStatus);

export default router;
