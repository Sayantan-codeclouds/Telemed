import jwt from "jsonwebtoken";
import Doctor from "./doctor.model.js";

export const authenticateDoctor = async (
  req,
  res,
  next
) => {

  try {

    const authHeader =
      req.headers.authorization;

    if (
      !authHeader ||
      !authHeader.startsWith("Bearer ")
    ) {

      return res.status(401).json({
        success: false,
        message: "Unauthorized.",
      });

    }

    const token =
      authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    const doctor =
      await Doctor.findById(
        decoded.doctorId
      );

    if (!doctor) {
      return res.status(401).json({
        success: false,
        message: "Doctor not found.",
      });
    }

    if (doctor.status === "INACTIVE" || doctor.status === "SUSPENDED") {
      return res.status(403).json({
        success: false,
        message: "Doctor account is deactivated or suspended by admin.",
      });
    }

    req.doctor = doctor;

    next();

  } catch (error) {

    return res.status(401).json({
      success: false,
      message: "Invalid token.",
    });

  }

};