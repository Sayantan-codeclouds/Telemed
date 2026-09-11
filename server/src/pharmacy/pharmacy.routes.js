import express from "express";
import { authenticatePatient } from "../patients/patient.middleware.js";
import { authenticateAdmin } from "../admin/admin.middleware.js";
import {
  getMedicines,
  getMedicineById,
  createOrder,
  getPatientOrders,
  getAllOrdersAdmin,
  getPublicPharmacySettings,
} from "./pharmacy.controller.js";

const router = express.Router();

// Public / Patient Settings & Medicine Catalog
router.get("/settings", getPublicPharmacySettings);
router.get("/medicines", getMedicines);
router.get("/medicines/:id", getMedicineById);

// Patient Orders
router.post("/orders", authenticatePatient, createOrder);
router.get("/orders/my-orders", authenticatePatient, getPatientOrders);

// Admin Orders
router.get("/orders/admin", authenticateAdmin, getAllOrdersAdmin);

export default router;
