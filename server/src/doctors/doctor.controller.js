import {
  registerDoctor,
  loginDoctor,
  verifyDoctorEmail,
  getDoctorProfile,
  updateDoctorProfile,
  uploadDoctorProfilePhoto,
  uploadDoctorSignatureAndStamp,
  getDoctorAvailability,
  updateDoctorAvailability,
  forgotDoctorPassword,
  resetDoctorPassword,
  getAllDoctors,
  getDoctorById,
  getDoctorAvailableSlots,
  changeDoctorPassword,
} from "./doctor.service.js";
import { getProfileImage } from "../shared/utils/fileUrl.js";

export const verifyEmail = async (req, res) => {
  try {
    await verifyDoctorEmail(req.body.token);

    return res.status(200).json({
      success: true,
      message: "Email verified successfully.",
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const register = async (req, res) => {
  try {
    const result = await registerDoctor(req.body);

    return res.status(201).json({
      success: true,
      message: "Doctor registered successfully.",
      data: {
        id: result.doctor._id,
        firstName: result.doctor.firstName,
        lastName: result.doctor.lastName,
        email: result.doctor.email,
      },
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const login = async (req, res) => {
  try {
    const result = await loginDoctor(req.body);

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      data: {
        token: result.token,
        doctor: {
          id: result.doctor._id,
          firstName: result.doctor.firstName,
          lastName: result.doctor.lastName,
          email: result.doctor.email,
          profileImage: getProfileImage(result.doctor.profileImage),
          specialization: result.doctor.specialization,
        },
      },
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.message,
    });
  }
};

export const getProfile = async (req, res) => {
  try {
    const doctor = await getDoctorProfile(req.doctor._id);

    return res.status(200).json({
      success: true,
      data: doctor,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const uploadProfilePhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image uploaded.",
      });
    }

    const doctor = await uploadDoctorProfilePhoto(
      req.doctor._id,
      req.file.filename
    );

    return res.status(200).json({
      success: true,
      message: "Profile photo updated successfully.",
      data: doctor,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const uploadSignatureAndStamp = async (req, res) => {
  try {
    const signatureFile = req.files?.signature?.[0];
    const stampFile = req.files?.clinicStamp?.[0];

    if (!signatureFile && !stampFile) {
      return res.status(400).json({
        success: false,
        message: "No signature or stamp file uploaded.",
      });
    }

    const doctor = await uploadDoctorSignatureAndStamp(req.doctor._id, {
      signatureFilename: signatureFile?.filename,
      stampFilename: stampFile?.filename,
    });

    return res.status(200).json({
      success: true,
      message: "Credentials updated successfully.",
      data: doctor,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const doctor = await updateDoctorProfile(req.doctor._id, req.body);

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      data: doctor,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAvailability = async (req, res) => {
  try {
    const availability = await getDoctorAvailability(req.doctor._id);

    return res.json({
      success: true,
      data: availability,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateAvailability = async (req, res) => {
  try {
    const availability = await updateDoctorAvailability(
      req.doctor._id,
      req.body.availability
    );

    return res.json({
      success: true,
      message: "Availability updated successfully.",
      data: availability,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const forgotPasswordController = async (req, res) => {
  try {
    await forgotDoctorPassword(req.body.email);

    return res.status(200).json({
      success: true,
      message: "Password reset email sent successfully.",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const resetPasswordController = async (req, res) => {
  try {
    const { token, password } = req.body;

    await resetDoctorPassword(token, password);

    return res.status(200).json({
      success: true,
      message: "Password reset successfully.",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getDoctors = async (req, res) => {
  try {
    const doctors = await getAllDoctors();

    return res.json({
      success: true,
      data: doctors,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getDoctor = async (req, res) => {
  try {
    const doctor = await getDoctorById(req.params.id);

    return res.json({
      success: true,
      data: doctor,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAvailableSlots = async (req, res) => {
  try {
    const slots = await getDoctorAvailableSlots(
      req.params.id,
      req.query.date
    );

    return res.json({
      success: true,
      data: slots,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/* ---------------- Change Password ---------------- */

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Both currentPassword and newPassword are required.",
      });
    }
    await changeDoctorPassword(req.doctor._id, currentPassword, newPassword);
    return res.json({ success: true, message: "Password changed successfully." });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

