import jwt from "jsonwebtoken";
import Patient from "../../patients/patient.model.js";
import Doctor from "../../doctors/doctor.model.js";
import Admin from "../../admin/admin.model.js";

export const authenticateAny = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authentication token required.",
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.patientId) {
      const patient = await Patient.findById(decoded.patientId);
      if (patient) {
        req.patient = patient;
        req.user = patient;
        return next();
      }
    }

    if (decoded.doctorId) {
      const doctor = await Doctor.findById(decoded.doctorId);
      if (doctor) {
        req.doctor = doctor;
        req.user = doctor;
        return next();
      }
    }

    if (decoded.adminId) {
      const admin = await Admin.findById(decoded.adminId);
      if (admin) {
        req.admin = admin;
        req.user = admin;
        return next();
      }
    }

    return res.status(401).json({
      success: false,
      message: "User not found or token invalid.",
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token.",
    });
  }
};
