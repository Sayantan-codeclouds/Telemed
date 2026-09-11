import express from "express";
import {
  getHealthAdvice,
  receptionistIntake,
  generateConsultationSummary,
  readPrescriptionToCart,
  analyzeLabReport,
} from "./ai.controller.js";

const router = express.Router();

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
