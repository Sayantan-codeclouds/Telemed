import express from "express";
import { authenticateDoctor } from "../doctors/doctor.middleware.js";
import { authenticatePatient } from "../patients/patient.middleware.js";
import { authenticateAdmin } from "../admin/admin.middleware.js";
import { authenticateDoctorOrPatient } from "../shared/middleware/authenticateDoctorOrPatient.js";
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

// Lets a scheduler call the reminder sweep with the CRON_SECRET header;
// anything else must be an authenticated admin.
const authenticateCronOrAdmin = (req, res, next) => {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers["x-cron-secret"] === secret) {
    return next();
  }
  return authenticateAdmin(req, res, next);
};

// Create or update prescription (doctor only)
router.post("/", authenticateDoctor, validate(createPrescriptionSchema), createPrescription);

// Trigger recheckup reminder manually (doctor)
router.post("/:id/send-recheckup-reminder", authenticateDoctor, sendRecheckupReminder);

// Check & send due reminders (cron or system trigger)
router.post("/check-reminders", authenticateCronOrAdmin, checkDueRecheckupReminders);

// Get prescription for a specific appointment (patient or doctor)
router.get("/appointment/:appointmentId", authenticateDoctorOrPatient, getPrescriptionByAppointment);

// Patient's prescription history
router.get("/patient", authenticatePatient, getPatientPrescriptions);

// Doctor's written prescriptions
router.get("/doctor", authenticateDoctor, getDoctorPrescriptions);

export default router;
