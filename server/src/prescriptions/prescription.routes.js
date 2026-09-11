import express from "express";
import { authenticateDoctor } from "../doctors/doctor.middleware.js";
import { authenticatePatient } from "../patients/patient.middleware.js";
import validate from "../shared/middleware/validate.js";
import { createPrescriptionSchema } from "./prescription.validation.js";
import {
  createPrescription,
  getPrescriptionByAppointment,
  getPatientPrescriptions,
  getDoctorPrescriptions,
  sendRecheckupReminder,
  checkDueRecheckupReminders,
} from "./prescription.controller.js";

const router = express.Router();

// Create or update prescription (doctor only)
router.post("/", authenticateDoctor, validate(createPrescriptionSchema), createPrescription);

// Trigger recheckup reminder manually (doctor)
router.post("/:id/send-recheckup-reminder", authenticateDoctor, sendRecheckupReminder);

// Check & send due reminders (cron or system trigger)
router.post("/check-reminders", checkDueRecheckupReminders);

// Get prescription for a specific appointment (patient or doctor)
router.get("/appointment/:appointmentId", getPrescriptionByAppointment);

// Patient's prescription history
router.get("/patient", authenticatePatient, getPatientPrescriptions);

// Doctor's written prescriptions
router.get("/doctor", authenticateDoctor, getDoctorPrescriptions);

export default router;
