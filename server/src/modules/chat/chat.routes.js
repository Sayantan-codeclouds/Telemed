import express from "express";
import { getChatMessages } from "./chat.controller.js";

const router = express.Router();

// Get all chat messages for an appointment
router.get("/:appointmentId", getChatMessages);

export default router;