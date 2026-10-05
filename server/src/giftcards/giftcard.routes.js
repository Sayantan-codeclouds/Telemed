import express from "express";
import { authenticateAdmin, authorizeRoles } from "../admin/admin.middleware.js";
import rateLimit from "../shared/middleware/rateLimit.js";
import {
  getGiftCards,
  getGiftCard,
  createGiftCard,
  updateGiftCard,
  deleteGiftCard,
  applyGiftCard,
} from "./giftcard.controller.js";

const router = express.Router();

// Public / Patient Gift Card validation & apply
// Limited so gift card codes can't be brute-forced.
router.post("/apply", rateLimit({ windowMs: 15 * 60 * 1000, max: 30 }), applyGiftCard);

// Admin Gift Cards CRUD
router.get("/", authenticateAdmin, authorizeRoles("SuperAdmin", "Admin"), getGiftCards);
router.get("/:id", authenticateAdmin, authorizeRoles("SuperAdmin", "Admin"), getGiftCard);
router.post("/", authenticateAdmin, authorizeRoles("SuperAdmin", "Admin"), createGiftCard);
router.patch("/:id", authenticateAdmin, authorizeRoles("SuperAdmin", "Admin"), updateGiftCard);
router.put("/:id", authenticateAdmin, authorizeRoles("SuperAdmin", "Admin"), updateGiftCard);
router.delete("/:id", authenticateAdmin, authorizeRoles("SuperAdmin", "Admin"), deleteGiftCard);

export default router;
