import express from "express";
import jwt from "jsonwebtoken";
import Doctor from "../doctors/doctor.model.js";
import Patient from "../patients/patient.model.js";

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

const authenticateDoctorOrPatient = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "Authorization token required." });
    }
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.doctorId) {
      const doctor = await Doctor.findById(decoded.doctorId);
      if (doctor) {
        req.doctor = doctor;
        req.consultationUser = { id: doctor._id, type: "DOCTOR" };
        return next();
      }
    }

    if (decoded.patientId) {
      const patient = await Patient.findById(decoded.patientId);
      if (patient) {
        req.patient = patient;
        req.consultationUser = { id: patient._id, type: "PATIENT" };
        return next();
      }
    }

    return res.status(401).json({ success: false, message: "User not found or invalid token." });
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid or expired token." });
  }
};

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