import express from "express";
import { authenticateDoctorOrPatient } from "../shared/middleware/authenticateDoctorOrPatient.js";

import {
  bookAppointment,
  getAppointment,
  getMyAppointments,
  cancelMyAppointment,
  rescheduleMyAppointment,
  getDoctorAppointmentList,
  changeAppointmentStatus,
  endConsultation,
  saveDoctorNotes,
  savePrescription,
  saveAISummary,
} from "./appointment.controller.js";

import {
  authenticatePatient,
} from "../patients/patient.middleware.js";

import {
  authenticateDoctor,
} from "../doctors/doctor.middleware.js";

const router = express.Router();

// =====================================
// Patient Routes
// =====================================

// Book Appointment
router.post(
  "/",
  authenticatePatient,
  bookAppointment
);

// Patient Appointment History
router.get(
  "/patient",
  authenticatePatient,
  getMyAppointments
);

// Cancel My Appointment
router.patch(
  "/:id/cancel",
  authenticatePatient,
  cancelMyAppointment
);

// Reschedule My Appointment
router.patch(
  "/:id/reschedule",
  authenticatePatient,
  rescheduleMyAppointment
);

// =====================================
// Doctor Routes
// =====================================

// Doctor Appointment List

router.get(
  "/doctor",
  authenticateDoctor,
  getDoctorAppointmentList
);

// =====================================
// Shared Routes
// =====================================

// Single Appointment

router.get(
  "/:id",
  authenticateDoctorOrPatient,
  getAppointment
);

// End Consultation (Allowed by Doctor or Patient)
router.patch(
  "/:id/end",
  authenticateDoctorOrPatient,
  endConsultation
);

// Change Status

router.patch(
  "/:id/status",
  authenticateDoctor,
  changeAppointmentStatus
);

// Doctor Notes

router.patch(
  "/:id/doctor-notes",
  authenticateDoctor,
  saveDoctorNotes
);

// Prescription

router.patch(
  "/:id/prescription",
  authenticateDoctor,
  savePrescription
);

// AI Summary

router.patch(
  "/:id/ai-summary",
  authenticateDoctor,
  saveAISummary
);

export default router;