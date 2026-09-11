import express from "express";
import {
  getEarnings,
  getPayouts,
  requestPayout,
  getPayoutSettings,
  updatePayoutSettings,
  getAdminPayouts,
  updateAdminPayoutStatus,
} from "./payout.controller.js";
import { authenticateDoctor } from "../doctors/doctor.middleware.js";
import { authenticateAdmin } from "../admin/admin.middleware.js";

const router = express.Router();

// ==========================================
// Doctor Portal Routes
// ==========================================

// Get doctor financial earnings KPIs, ledger, and monthly trend
router.get("/doctors/earnings", authenticateDoctor, getEarnings);
router.get("/doctor/earnings", authenticateDoctor, getEarnings);

// Doctor payout requests history
router.get("/doctors/payouts", authenticateDoctor, getPayouts);
router.get("/doctor/payouts", authenticateDoctor, getPayouts);

// Doctor requests a new withdrawal
router.post("/doctors/payouts", authenticateDoctor, requestPayout);
router.post("/doctor/payouts", authenticateDoctor, requestPayout);

// Doctor payout bank / UPI settings
router.get("/doctors/payout-settings", authenticateDoctor, getPayoutSettings);
router.get("/doctor/payout-settings", authenticateDoctor, getPayoutSettings);
router.put("/doctors/payout-settings", authenticateDoctor, updatePayoutSettings);
router.put("/doctor/payout-settings", authenticateDoctor, updatePayoutSettings);

// ==========================================
// Admin & Operations Portal Routes
// ==========================================

// List all doctor payouts
router.get("/admin/payouts", authenticateAdmin, getAdminPayouts);

// Approve, process, disburse, or reject payout
router.patch("/admin/payouts/:id/status", authenticateAdmin, updateAdminPayoutStatus);

export default router;
