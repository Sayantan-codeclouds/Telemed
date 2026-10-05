import express from "express";
import { authenticateAdmin, authorizeRoles } from "../admin/admin.middleware.js";
import rateLimit from "../shared/middleware/rateLimit.js";
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

// Public code checks are limited so coupon codes can't be brute-forced.
const codeCheckLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 30 });

// Public / Patient Cart route
router.post("/apply", codeCheckLimiter, applyCoupon);

// Direct Vrio Discount Code Validator (Admin or Public Tool)
// Diagnostic call that uses the platform's Vrio API key: admins only.
router.post("/vrio-validate", authenticateAdmin, authorizeRoles("SuperAdmin", "Admin"), validateVrioDiscount);
router.post("/validate-discount", authenticateAdmin, authorizeRoles("SuperAdmin", "Admin"), validateVrioDiscount);

// Protected Admin Routes
router.get("/admin", authenticateAdmin, authorizeRoles("SuperAdmin", "Admin"), getCoupons);
router.get("/admin/:id", authenticateAdmin, authorizeRoles("SuperAdmin", "Admin"), getCoupon);
router.post("/admin", authenticateAdmin, authorizeRoles("SuperAdmin", "Admin"), createCoupon);
router.put("/admin/:id", authenticateAdmin, authorizeRoles("SuperAdmin", "Admin"), updateCoupon);
router.delete("/admin/:id", authenticateAdmin, authorizeRoles("SuperAdmin", "Admin"), deleteCoupon);

export default router;
