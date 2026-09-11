import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import Patient from "./patient.model.js";
import {
  sendPatientVerificationEmail,
  sendResetPasswordEmail,
} from "../mail/mail.service.js";
import { registerPatientSchema } from "./patient.validation.js";
import fs from "fs";
import path from "path";
import upload from "../shared/multer.js";
import {
  formatProfileImage,
  getProfileImage,
  getProfileImageFilename,
} from "../shared/utils/fileUrl.js";

export const registerPatient = async (patientData) => {
  // Validate request
  const validatedData = registerPatientSchema.parse(patientData);

  // Check email
  const existingEmail = await Patient.findOne({
    email: validatedData.email.toLowerCase(),
  });

  if (existingEmail) {
    throw new Error("Email already registered.");
  }

  // Check phone
  const existingPhone = await Patient.findOne({
    phone: validatedData.phone,
  });

  if (existingPhone) {
    throw new Error("Phone number already registered.");
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(validatedData.password, 10);

  // Verification token
  const verificationToken = crypto.randomBytes(32).toString("hex");
  const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

  // Create patient
  const patient = await Patient.create({
    firstName: validatedData.firstName,
    lastName: validatedData.lastName,
    email: validatedData.email.toLowerCase(),
    phone: validatedData.phone,
    password: hashedPassword,
    verificationToken,
    verificationTokenExpires,
  });

  try {
    await sendPatientVerificationEmail(patient, verificationToken);
  } catch (error) {
    console.error("Email sending failed:", error.message);
  }

  return {
    patient,
    verificationToken,
  };
};

export const loginPatient = async ({ email, password }) => {
  const patient = await Patient.findOne({
    email: email.toLowerCase(),
  }).select("+password");

  if (!patient) {
    throw new Error("Invalid email or password.");
  }

  if (!patient.isEmailVerified) {
    throw new Error("Please verify your email before logging in.");
  }

  if (patient.status === "INACTIVE" || patient.status === "BLOCKED") {
    throw new Error("Your patient account has been deactivated by administrator.");
  }

  const isPasswordValid = await bcrypt.compare(password, patient.password);

  if (!isPasswordValid) {
    throw new Error("Invalid email or password.");
  }

  const token = jwt.sign(
    {
      patientId: patient._id,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );

  return {
    token,
    patient,
  };
};

export const verifyPatientEmail = async (token) => {
  const patient = await Patient.findOne({
    verificationToken: token,
  });

  if (!patient) {
    throw new Error("Invalid verification token.");
  }

  if (
    patient.verificationTokenExpires &&
    patient.verificationTokenExpires < new Date()
  ) {
    throw new Error("Verification token has expired.");
  }

  patient.isEmailVerified = true;
  patient.verificationToken = null;
  patient.verificationTokenExpires = null;

  await patient.save();

  return formatProfileImage(patient);
};

export const forgotPassword = async (email) => {
  const patient = await Patient.findOne({
    email: email.toLowerCase(),
  });

  if (!patient) {
    throw new Error("Patient not found.");
  }

  const resetToken = crypto.randomBytes(32).toString("hex");

  patient.resetPasswordToken = resetToken;
  patient.resetPasswordTokenExpires = new Date(Date.now() + 60 * 60 * 1000);

  await patient.save();

  await sendResetPasswordEmail(patient.email, resetToken);

  return {
    email: patient.email,
  };
};

export const resetPassword = async (data) => {
  const patient = await Patient.findOne({
    resetPasswordToken: data.token,
    resetPasswordTokenExpires: {
      $gt: new Date(),
    },
  });

  if (!patient) {
    throw new Error("Invalid or expired reset token.");
  }

  const hashedresetPassword = await bcrypt.hash(data.password, 10);

  patient.password = hashedresetPassword;
  patient.resetPasswordToken = null;
  patient.resetPasswordTokenExpires = null;

  await patient.save();

  return patient;
};

export const getPatientProfile = async (patientId) => {
  const patient = await Patient.findById(patientId).select("-password");

  if (!patient) {
    throw new Error("Patient not found.");
  }

  return formatProfileImage(patient);
};

export const updatePatientProfile = async (patientId, profileData) => {
  const patient = await Patient.findById(patientId);

  if (!patient) {
    throw new Error("Patient not found.");
  }

  // Basic Information
  patient.firstName = profileData.firstName;
  patient.lastName = profileData.lastName;
  patient.phone = profileData.phone;
  patient.gender = profileData.gender;
  patient.dateOfBirth = profileData.dateOfBirth || null;
  patient.bloodGroup = profileData.bloodGroup;

  // Height
  patient.height = {
    value: profileData.height?.value || null,
    unit: profileData.height?.unit || "cm",
  };

  // Weight
  patient.weight = {
    value: profileData.weight?.value || null,
    unit: profileData.weight?.unit || "kg",
  };

  // Address
  patient.address = {
    line1: profileData.address?.line1 || "",
    line2: profileData.address?.line2 || "",
    city: profileData.address?.city || "",
    state: profileData.address?.state || "",
    country: profileData.address?.country || "",
    pincode: profileData.address?.pincode || "",
  };

  // Emergency Contact
  patient.emergencyContact = {
    name: profileData.emergencyContact?.name || "",
    relationship: profileData.emergencyContact?.relationship || "",
    phone: profileData.emergencyContact?.phone || "",
  };

  patient.medicalConditions = profileData.medicalConditions || [];
  patient.allergies = profileData.allergies || [];
  patient.currentMedications = profileData.currentMedications || [];
  patient.pastSurgeries = profileData.pastSurgeries || [];

  await patient.save();

  return formatProfileImage(
    await Patient.findById(patientId).select("-password")
  );
};

export const uploadPatientProfilePhoto = async (patientId, file) => {
  if (!file) {
    throw new Error("Please select an image.");
  }

  const patient = await Patient.findById(patientId);

  if (!patient) {
    throw new Error("Patient not found.");
  }

  // Delete previous image
  if (patient.profileImage) {
    const oldImage = path.join(
      process.cwd(),
      "src",
      "uploads",
      "profile-images",
      getProfileImageFilename(patient.profileImage)
    );

    if (fs.existsSync(oldImage)) {
      fs.unlinkSync(oldImage);
    }
  }

  patient.profileImage = file.filename;

  await patient.save();

  return getProfileImage(patient.profileImage);
};

export const changePatientPassword = async (patientId, currentPassword, newPassword) => {
  const patient = await Patient.findById(patientId);
  if (!patient) throw new Error("Patient not found.");

  const isMatch = await bcrypt.compare(currentPassword, patient.password);
  if (!isMatch) throw new Error("Current password is incorrect.");

  if (newPassword.length < 8) throw new Error("New password must be at least 8 characters.");

  patient.password = await bcrypt.hash(newPassword, 10);
  await patient.save();

  return { message: "Password changed successfully." };
};
