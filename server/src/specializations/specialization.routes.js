import express from "express";
import { authenticateAdmin } from "../admin/admin.middleware.js";
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
router.get("/admin", authenticateAdmin, getAllSpecializationsAdmin);
router.post("/admin", authenticateAdmin, createSpecialization);
router.put("/admin/:id", authenticateAdmin, updateSpecialization);
router.delete("/admin/:id", authenticateAdmin, deleteSpecialization);
router.patch("/admin/:id/toggle", authenticateAdmin, toggleSpecializationStatus);

export default router;
