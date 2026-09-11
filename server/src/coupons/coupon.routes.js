import express from "express";
import { authenticateAdmin } from "../admin/admin.middleware.js";
import {
  getCoupons,
  getCoupon,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  applyCoupon,
  validateVrioDiscount,
} from "./coupon.controller.js";

const router = express.Router();

// Public / Patient Cart route
router.post("/apply", applyCoupon);

// Direct Vrio Discount Code Validator (Admin or Public Tool)
router.post("/vrio-validate", validateVrioDiscount);
router.post("/validate-discount", validateVrioDiscount);

// Protected Admin Routes
router.get("/admin", authenticateAdmin, getCoupons);
router.get("/admin/:id", authenticateAdmin, getCoupon);
router.post("/admin", authenticateAdmin, createCoupon);
router.put("/admin/:id", authenticateAdmin, updateCoupon);
router.delete("/admin/:id", authenticateAdmin, deleteCoupon);

export default router;
