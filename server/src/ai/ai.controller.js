import asyncHandler from "../shared/utils/asyncHandler.js";
import AppError from "../shared/errors/AppError.js";
import Appointment from "../appointments/appointment.model.js";
import Prescription from "../prescriptions/prescription.model.js";
import { assertAppointmentParticipant } from "../shared/middleware/authenticateDoctorOrPatient.js";
import {
  runReceptionistIntake,
  generateConsultationSummaryService,
  getHealthAdviceService,
  readPrescriptionToCartService,
  analyzeLabReportService,
} from "./ai.service.js";

// --- Input clean-up: every AI call is billed per token, and bad types must
// give a 400, not crash the prompt builders. ---
const MAX_MESSAGE_CHARS = 4000;
const MAX_REPORT_CHARS = 50000; // the service trims further before prompting
const MAX_HISTORY_TURNS = 20;

const cleanText = (value, max) => (typeof value === "string" ? value.trim().slice(0, max) : "");

const cleanHistory = (history) =>
  (Array.isArray(history) ? history : [])
    .slice(-MAX_HISTORY_TURNS)
    .filter((turn) => turn && typeof turn === "object")
    .map((turn) => {
      // AI turns may be objects ({ reply, directAnswer, ... }); keep only text.
      const raw =
        typeof turn.text === "string"
          ? turn.text
          : [turn.text?.reply, turn.text?.directAnswer].find((value) => typeof value === "string") || "";
      return { sender: turn.sender === "user" ? "user" : "ai", text: raw.slice(0, MAX_MESSAGE_CHARS) };
    })
    .filter((turn) => turn.text);

const cleanStringList = (value) =>
  (Array.isArray(value) ? value : []).filter((item) => typeof item === "string").map((item) => item.slice(0, 100)).slice(0, 30);

const cleanPatientContext = (context) => {
  const source = context && typeof context === "object" ? context : {};
  return {
    age: typeof source.age === "number" || typeof source.age === "string" ? String(source.age).slice(0, 10) : undefined,
    gender: cleanText(source.gender, 30) || undefined,
    allergies: cleanStringList(source.allergies),
    medicalConditions: cleanStringList(source.medicalConditions),
  };
};

export const getHealthAdvice = asyncHandler(async (req, res) => {
  const message = cleanText(req.body?.message, MAX_MESSAGE_CHARS);

  if (!message) {
    return res.status(400).json({
      success: false,
      message: "Message is required.",
    });
  }

  const result = await getHealthAdviceService({
    message,
    history: cleanHistory(req.body?.history),
    patientContext: cleanPatientContext(req.body?.patientContext),
  });
  res.status(200).json({
    success: true,
    data: result,
  });
});

export const receptionistIntake = asyncHandler(async (req, res) => {
  const body = req.body || {};
  const result = await runReceptionistIntake({
    symptoms: cleanText(body.symptoms, MAX_MESSAGE_CHARS),
    chiefComplaint: cleanText(body.chiefComplaint, 500),
    age: typeof body.age === "number" || typeof body.age === "string" ? String(body.age).slice(0, 10) : "",
    gender: cleanText(body.gender, 30),
    duration: cleanText(body.duration, 100),
  });
  res.status(200).json({
    success: true,
    data: result,
  });
});

export const generateConsultationSummary = asyncHandler(async (req, res) => {
  const { appointmentId } = req.body;
  if (!appointmentId) {
    return res.status(400).json({
      success: false,
      message: "Appointment ID is required.",
    });
  }

  const appointment = await Appointment.findById(appointmentId).select("doctor patient");
  if (!appointment) {
    throw AppError.notFound("Appointment not found.");
  }
  try {
    assertAppointmentParticipant(appointment, req);
  } catch (err) {
    throw AppError.forbidden(err.message);
  }

  const result = await generateConsultationSummaryService(appointmentId);
  res.status(200).json({
    success: true,
    message: "AI consultation summary generated successfully.",
    data: result,
  });
});

export const readPrescriptionToCart = asyncHandler(async (req, res) => {
  const { prescriptionId, prescriptionData } = req.body;

  if (prescriptionId) {
    const prescription = await Prescription.findById(prescriptionId).select("doctor patient");
    if (!prescription) {
      throw AppError.notFound("Prescription not found.");
    }
    const ownsPrescription =
      (req.patient && String(prescription.patient) === String(req.patient._id)) ||
      (req.doctor && String(prescription.doctor) === String(req.doctor._id));
    if (!ownsPrescription) {
      throw AppError.forbidden("You do not have access to this prescription.");
    }
  }

  const result = await readPrescriptionToCartService({
    prescriptionId,
    prescriptionData,
  });

  res.status(200).json({
    success: true,
    message: "Prescription analyzed and matched with pharmacy medicines.",
    data: result,
  });
});

export const analyzeLabReport = asyncHandler(async (req, res) => {
  const reportText = cleanText(req.body?.reportText, MAX_REPORT_CHARS);
  const message = cleanText(req.body?.message, MAX_MESSAGE_CHARS);

  if (!reportText && !message) {
    return res.status(400).json({
      success: false,
      message: "Report text or message is required.",
    });
  }

  const result = await analyzeLabReportService({
    reportText,
    message,
    history: cleanHistory(req.body?.history),
    mode: req.body?.mode === "analyze" ? "analyze" : "chat",
  });
  res.status(200).json({
    success: true,
    data: result,
  });
});
