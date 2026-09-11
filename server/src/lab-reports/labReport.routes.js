import express from "express";
import jwt from "jsonwebtoken";
import multerLabReports from "../shared/multerLabReports.js";
import Doctor from "../doctors/doctor.model.js";
import Patient from "../patients/patient.model.js";

import {
  uploadLabReport,
  getMyLabReports,
  getPatientReportsForDoctor,
  getSingleLabReport,
  deleteMyLabReport,
} from "./labReport.controller.js";

import { authenticatePatient } from "../patients/patient.middleware.js";
import { authenticateDoctor } from "../doctors/doctor.middleware.js";

const router = express.Router();

const authenticateDoctorOrPatient = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ success: false, message: "Authorization token required." });
    }
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.doctorId) {
      const doctor = await Doctor.findById(decoded.doctorId);
      if (doctor) {
        req.doctor = doctor;
        return next();
      }
    }

    if (decoded.patientId) {
      const patient = await Patient.findById(decoded.patientId);
      if (patient) {
        req.patient = patient;
        return next();
      }
    }

    return res
      .status(401)
      .json({ success: false, message: "User not found or invalid token." });
  } catch (err) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid or expired token." });
  }
};

// =====================================
// Patient Lab Report Routes
// =====================================

// Upload a lab report
router.post(
  "/",
  authenticatePatient,
  multerLabReports.single("file"),
  uploadLabReport
);

// Get all lab reports for logged-in patient
router.get("/", authenticatePatient, getMyLabReports);

// Delete a lab report
router.delete("/:id", authenticatePatient, deleteMyLabReport);

// =====================================
// Doctor Lab Report Routes
// =====================================

// Get lab reports for a specific patient (doctor access)
router.get(
  "/doctor/patient/:patientId",
  authenticateDoctor,
  getPatientReportsForDoctor
);

// =====================================
// Shared Routes
// =====================================

// Get single lab report details
router.get("/:id", authenticateDoctorOrPatient, getSingleLabReport);

export default router;
