import express from "express";
import { authenticateAdmin } from "../admin/admin.middleware.js";
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
router.post("/apply", applyGiftCard);

// Admin Gift Cards CRUD
router.get("/", authenticateAdmin, getGiftCards);
router.get("/:id", authenticateAdmin, getGiftCard);
router.post("/", authenticateAdmin, createGiftCard);
router.patch("/:id", authenticateAdmin, updateGiftCard);
router.put("/:id", authenticateAdmin, updateGiftCard);
router.delete("/:id", authenticateAdmin, deleteGiftCard);

export default router;
