import express from "express";
import jwt from "jsonwebtoken";
import Patient from "../patients/patient.model.js";
import Doctor from "../doctors/doctor.model.js";
import { authenticateAdmin } from "../admin/admin.middleware.js";
import {
  submitSupportTicket,
  getMySupportTickets,
  getAllSupportTicketsAdmin,
  updateSupportTicketAdmin,
  deleteSupportTicketAdmin,
} from "./support.controller.js";

const router = express.Router();

/**
 * Helper middleware that optionally identifies patient or doctor from token
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (decoded.patientId) {
        const patient = await Patient.findById(decoded.patientId);
        if (patient) req.patient = patient;
      } else if (decoded.doctorId) {
        const doctor = await Doctor.findById(decoded.doctorId);
        if (doctor) req.doctor = doctor;
      } else if (decoded.adminId || decoded.role === "admin") {
        req.admin = decoded;
      }
    }
  } catch (err) {
    // Ignore invalid token for public submit
  }
  next();
};

/**
 * Required auth for patient or doctor
 */
const requirePatientOrDoctorAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "Authentication required." });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.patientId) {
      const patient = await Patient.findById(decoded.patientId);
      if (patient) {
        req.patient = patient;
        return next();
      }
    }

    if (decoded.doctorId) {
      const doctor = await Doctor.findById(decoded.doctorId);
      if (doctor) {
        req.doctor = doctor;
        return next();
      }
    }

    return res.status(401).json({ success: false, message: "Valid user session not found." });
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid or expired token." });
  }
};

// ── Patient & Doctor Routes ──
router.post("/submit", optionalAuth, submitSupportTicket);
router.get("/my-tickets", requirePatientOrDoctorAuth, getMySupportTickets);

// ── Admin Routes ──
router.get("/admin/tickets", authenticateAdmin, getAllSupportTicketsAdmin);
router.patch("/admin/tickets/:id", authenticateAdmin, updateSupportTicketAdmin);
router.delete("/admin/tickets/:id", authenticateAdmin, deleteSupportTicketAdmin);

export default router;
