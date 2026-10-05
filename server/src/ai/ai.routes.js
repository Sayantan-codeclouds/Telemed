import express from "express";
import {
  getHealthAdvice,
  receptionistIntake,
  generateConsultationSummary,
  readPrescriptionToCart,
  analyzeLabReport,
} from "./ai.controller.js";

import { authenticateDoctorOrPatient } from "../shared/middleware/authenticateDoctorOrPatient.js";
import rateLimit from "../shared/middleware/rateLimit.js";

const router = express.Router();

// Every AI endpoint calls a paid model and some read medical records,
// so all of them require a signed-in doctor or patient.
router.use(authenticateDoctorOrPatient);
router.use(rateLimit({ windowMs: 60 * 1000, max: 20, message: "Too many AI requests. Please wait a minute and try again." }));

// Conversational AI Health & Wellness Advice
router.post("/health-advice", getHealthAdvice);

// Patient Intake Triage & Doctor Matching
router.post("/receptionist-intake", receptionistIntake);

// Consultation Summary Generator
router.post("/consultation-summary", generateConsultationSummary);

// AI Prescription Reader & Auto-Cart Matcher
router.post("/read-prescription-to-cart", readPrescriptionToCart);

// AI Lab Report PDF Analyzer
router.post("/analyze-lab-report", analyzeLabReport);

export default router;
