import jwt from "jsonwebtoken";
import Doctor from "../../doctors/doctor.model.js";
import Patient from "../../patients/patient.model.js";

/**
 * Accepts either a doctor or a patient token.
 *
 * Sets req.doctor or req.patient (plus req.consultationUser = { id, type })
 * so handlers shared by both sides of a consultation can check ownership.
 * Deactivated, blocked or suspended accounts are rejected, matching the
 * single-role middlewares.
 */
export const authenticateDoctorOrPatient = async (req, res, next) => {
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
        if (doctor.status !== "ACTIVE") {
          return res.status(403).json({
            success: false,
            message: "Doctor account is deactivated or suspended by admin.",
          });
        }
        req.doctor = doctor;
        req.consultationUser = { id: doctor._id, type: "DOCTOR" };
        return next();
      }
    }

    if (decoded.patientId) {
      const patient = await Patient.findById(decoded.patientId);
      if (patient) {
        if (patient.status === "INACTIVE" || patient.status === "BLOCKED") {
          return res.status(403).json({
            success: false,
            message: "Patient account is deactivated or blocked by administrator.",
          });
        }
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

/**
 * Throws a 403-style error unless the request's doctor/patient is a
 * participant of the given appointment document.
 */
export const assertAppointmentParticipant = (appointment, req) => {
  const doctorId = String(appointment.doctor?._id || appointment.doctor);
  const patientId = String(appointment.patient?._id || appointment.patient);

  const allowed =
    (req.doctor && String(req.doctor._id) === doctorId) ||
    (req.patient && String(req.patient._id) === patientId);

  if (!allowed) {
    const err = new Error("You are not a participant of this appointment.");
    err.statusCode = 403;
    throw err;
  }
};

/** Fields that must never leave the server when populating a user. */
export const PRIVATE_USER_FIELDS =
  "-password -verificationToken -verificationTokenExpires -resetPasswordToken -resetPasswordTokenExpires -payoutSettings";
