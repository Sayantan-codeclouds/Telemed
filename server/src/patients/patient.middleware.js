import jwt from "jsonwebtoken";
import Patient from "./patient.model.js";

export const authenticatePatient = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authentication token missing.",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const patient = await Patient.findById(decoded.patientId);

    if (!patient) {
      return res.status(401).json({
        success: false,
        message: "Patient not found.",
      });
    }

    if (patient.status === "INACTIVE" || patient.status === "BLOCKED") {
      return res.status(403).json({
        success: false,
        message: "Patient account is deactivated or blocked by administrator.",
      });
    }

    req.patient = patient;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token.",
    });
  }
};