import express from "express";
import { getChatMessages } from "./chat.controller.js";
import { authenticateDoctorOrPatient } from "../../shared/middleware/authenticateDoctorOrPatient.js";

const router = express.Router();

router.get("/:appointmentId", authenticateDoctorOrPatient, getChatMessages);

export default router;
