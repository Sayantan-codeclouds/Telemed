import {
  registerPatient,
  loginPatient,
  verifyPatientEmail,
  forgotPassword,
  resetPassword,
  getPatientProfile,
  updatePatientProfile,
  uploadPatientProfilePhoto,
  changePatientPassword,
} from "./patient.service.js";

import Patient from "./patient.model.js";
import { getProfileImage } from "../shared/utils/fileUrl.js";

/* ---------------- Register ---------------- */

export const register = async (req, res) => {
  try {
    const result = await registerPatient(req.body);
    return res.status(201).json({
      success: true,
      message: "Patient registered successfully.",
      data: {
        id: result.patient._id,
        firstName: result.patient.firstName,
        lastName: result.patient.lastName,
        email: result.patient.email,
        verificationToken: result.verificationToken,
      },
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

/* ---------------- Login ---------------- */

export const login = async (req, res) => {
  try {
    const result = await loginPatient(req.body);
    return res.status(200).json({
      success: true,
      message: "Login successful.",
      data: {
        token: result.token,
        patient: {
          id: result.patient._id,
          firstName: result.patient.firstName,
          lastName: result.patient.lastName,
          email: result.patient.email,
          profileImage: getProfileImage(result.patient.profileImage),
        },
      },
    });
  } catch (error) {
    return res.status(401).json({ success: false, message: error.message });
  }
};

/* ---------------- Verify Email ---------------- */

export const verifyEmail = async (req, res) => {
  try {
    await verifyPatientEmail(req.body.token);
    return res.status(200).json({ success: true, message: "Email verified successfully." });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

/* ---------------- Forgot Password ---------------- */

export const forgotPasswordController = async (req, res) => {
  try {
    const result = await forgotPassword(req.body.email);
    return res.status(200).json({
      success: true,
      message: "Password reset token generated.",
      data: result,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

/* ---------------- Reset Password ---------------- */

export const resetPasswordController = async (req, res) => {
  try {
    await resetPassword(req.body);
    return res.status(200).json({ success: true, message: "Password reset successfully." });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

/* ---------------- Get Profile ---------------- */

export const getProfile = async (req, res) => {
  try {
    const patient = await getPatientProfile(req.patient._id);
    return res.status(200).json({ success: true, data: patient });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

/* ---------------- Update Profile ---------------- */

export const updateProfile = async (req, res) => {
  try {
    const patient = await updatePatientProfile(req.patient._id, req.body);
    return res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      data: patient,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

/* ---------------- Upload Profile Photo ---------------- */

export const uploadProfilePhoto = async (req, res) => {
  try {
    const image = await uploadPatientProfilePhoto(req.patient._id, req.file);
    return res.status(200).json({ success: true, image });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
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
    await changePatientPassword(req.patient._id, currentPassword, newPassword);
    return res.json({ success: true, message: "Password changed successfully." });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
