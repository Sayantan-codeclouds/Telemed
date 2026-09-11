import crypto from "crypto";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import Doctor from "./doctor.model.js";
import Appointment from "../appointments/appointment.model.js";
import {
  sendDoctorVerificationEmail,
  sendDoctorResetPasswordEmail,
} from "../mail/mail.service.js";
import { formatProfileImage } from "../shared/utils/fileUrl.js";

export const verifyDoctorEmail = async (token) => {
  const doctor = await Doctor.findOne({
    verificationToken: token,
    verificationTokenExpires: {
      $gt: new Date(),
    },
  });

  if (!doctor) {
    throw new Error("Invalid or expired verification token.");
  }

  doctor.isEmailVerified = true;
  doctor.verificationToken = null;
  doctor.verificationTokenExpires = null;
  await doctor.save();

  return doctor;
};

export const registerDoctor = async (data) => {
  const existingDoctor = await Doctor.findOne({
    email: data.email.toLowerCase(),
  });

  if (existingDoctor) {
    throw new Error("Doctor with this email already exists.");
  }

  const verificationToken = crypto.randomBytes(32).toString("hex");

  const doctor = new Doctor({
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email.toLowerCase(),
    password: data.password,
    phone: data.phone,
    verificationToken,
    verificationTokenExpires: new Date(
      Date.now() + 24 * 60 * 60 * 1000
    ),
  });

  await doctor.save();

  await sendDoctorVerificationEmail(
    doctor.email,
    verificationToken
  );

  return {
    doctor,
    verificationToken,
  };
};

export const getDoctorProfile = async (doctorId) => {
  const doctor = await Doctor.findById(doctorId).select("-password");

  if (!doctor) {
    throw new Error("Doctor not found.");
  }

  return formatProfileImage(doctor);
};

export const loginDoctor = async (data) => {
  const doctor = await Doctor.findOne({
    email: data.email.toLowerCase(),
  });

  if (!doctor) {
    throw new Error("Invalid email or password.");
  }

  if (!doctor.isEmailVerified) {
    throw new Error("Please verify your email before logging in.");
  }

  if (doctor.status === "INACTIVE" || doctor.status === "SUSPENDED") {
    throw new Error("Your doctor account has been deactivated by administrator.");
  }

  const isPasswordValid = await doctor.comparePassword(data.password);

  if (!isPasswordValid) {
    throw new Error("Invalid email or password.");
  }

  const token = jwt.sign(
    {
      doctorId: doctor._id,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );

  return {
    token,
    doctor,
  };
};

export const updateDoctorProfile = async (doctorId, data) => {
  const doctor = await Doctor.findById(doctorId);

  if (!doctor) {
    throw new Error("Doctor not found.");
  }

  doctor.firstName = data.firstName ?? doctor.firstName;
  doctor.lastName = data.lastName ?? doctor.lastName;
  doctor.phone = data.phone ?? doctor.phone;
  doctor.specialization = data.specialization ?? doctor.specialization;
  doctor.qualification = data.qualification ?? doctor.qualification;
  doctor.experience = data.experience ?? doctor.experience;
  doctor.licenseNumber = data.licenseNumber ?? doctor.licenseNumber;
  doctor.consultationFee = data.consultationFee ?? doctor.consultationFee;
  doctor.biography = data.biography ?? doctor.biography;
  doctor.hospital = data.hospital ?? doctor.hospital;
  doctor.languages = data.languages ?? doctor.languages;
  doctor.address = {
    ...doctor.address,
    ...(data.address || {}),
  };
  if (data.signature !== undefined) {
    doctor.signature = data.signature;
  }
  if (data.clinicStamp !== undefined) {
    doctor.clinicStamp = data.clinicStamp;
  }

  await doctor.save();

  return formatProfileImage(doctor);
};

export const uploadDoctorProfilePhoto = async (doctorId, filename) => {
  const doctor = await Doctor.findById(doctorId);

  if (!doctor) {
    throw new Error("Doctor not found.");
  }

  doctor.profileImage = filename;
  await doctor.save();

  return formatProfileImage(doctor);
};

export const uploadDoctorSignatureAndStamp = async (doctorId, { signatureFilename, stampFilename }) => {
  const doctor = await Doctor.findById(doctorId);

  if (!doctor) {
    throw new Error("Doctor not found.");
  }

  if (signatureFilename) {
    doctor.signature = signatureFilename;
  }
  if (stampFilename) {
    doctor.clinicStamp = stampFilename;
  }
  await doctor.save();

  return formatProfileImage(doctor);
};

export const getDoctorAvailability = async (doctorId) => {
  const doctor = await Doctor.findById(doctorId);

  if (!doctor) {
    throw new Error("Doctor not found.");
  }

  return doctor.availability || [];
};

export const updateDoctorAvailability = async (doctorId, availability) => {
  const doctor = await Doctor.findById(doctorId);

  if (!doctor) {
    throw new Error("Doctor not found.");
  }

  const validDays = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

  // Validate slot constraints before saving
  for (const item of availability || []) {
    if (!validDays.includes(item.day)) continue;
    if (item.enabled && Array.isArray(item.slots)) {
      for (const s of item.slots) {
        if (!s.start || !s.end) continue;
        const start = s.start.trim();
        const end = s.end.trim();

        if (!timeRegex.test(start) || !timeRegex.test(end)) {
          throw new Error(
            `Invalid time format on ${item.day} (${start} to ${end}). Please use HH:mm (24-hour) time.`
          );
        }

        if (end <= start) {
          throw new Error(
            `Invalid time window on ${item.day}: ${start} to ${end}. End time must be strictly after start time (e.g. 17:00 to 20:00 or 21:00, not 01:00).`
          );
        }
      }
    }
  }

  const sanitized = (availability || [])
    .filter((item) => validDays.includes(item.day))
    .map((item) => ({
      day: item.day,
      enabled: Boolean(item.enabled),
      slots: (item.slots || [])
        .filter((s) => s.start && s.end)
        .map((s) => ({ start: s.start.trim(), end: s.end.trim() })),
    }));

  doctor.availability = sanitized;
  await doctor.save();

  return doctor.availability;
};

export const forgotDoctorPassword = async (email) => {
  const doctor = await Doctor.findOne({
    email: email.toLowerCase(),
  });

  if (!doctor) {
    throw new Error("Doctor not found.");
  }

  const resetToken = crypto.randomBytes(32).toString("hex");

  doctor.resetPasswordToken = resetToken;
  doctor.resetPasswordTokenExpires = new Date(Date.now() + 60 * 60 * 1000);

  await doctor.save();

  await sendDoctorResetPasswordEmail(doctor.email, resetToken);
};

export const resetDoctorPassword = async (token, password) => {
  const doctor = await Doctor.findOne({
    resetPasswordToken: token,
    resetPasswordTokenExpires: {
      $gt: new Date(),
    },
  });

  if (!doctor) {
    throw new Error("Invalid or expired reset token.");
  }

  doctor.password = password;
  doctor.resetPasswordToken = null;
  doctor.resetPasswordTokenExpires = null;
  await doctor.save();
};

export const getAllDoctors = async () => {
  const doctors = await Doctor.find({
    status: "ACTIVE",
    isEmailVerified: true,
  })
    .select(
      "-password -verificationToken -verificationTokenExpires -resetPasswordToken -resetPasswordTokenExpires"
    )
    .sort({
      firstName: 1,
    });

  return doctors.map(formatProfileImage);
};

export const getDoctorById = async (doctorId) => {
  const doctor = await Doctor.findById(doctorId).select(
    "-password -verificationToken -verificationTokenExpires -resetPasswordToken -resetPasswordTokenExpires"
  );

  if (!doctor) {
    throw new Error("Doctor not found.");
  }

  return formatProfileImage(doctor);
};

export const getDoctorAvailableSlots = async (doctorId, date) => {
  const doctor = await Doctor.findById(doctorId);

  if (!doctor) {
    throw new Error("Doctor not found.");
  }

  let dayName;
  let parsedDate;
  if (typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    const [y, m, d] = date.split("-").map(Number);
    parsedDate = new Date(y, m - 1, d);
    dayName = parsedDate.toLocaleDateString("en-US", { weekday: "long" });
  } else {
    parsedDate = new Date(date);
    dayName = parsedDate.toLocaleDateString("en-US", { weekday: "long" });
  }

  const availability = (doctor.availability || []).find((item) => item.day === dayName);

  if (!availability || !availability.enabled) {
    return [];
  }

  const startOfDay = new Date(parsedDate);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(parsedDate);
  endOfDay.setHours(23, 59, 59, 999);

  const bookedAppointments = await Appointment.find({
    doctor: doctorId,
    appointmentDate: {
      $gte: startOfDay,
      $lte: endOfDay,
    },
    status: {
      $in: ["PENDING", "CONFIRMED", "IN_PROGRESS"],
    },
  });

  const bookedSlots = bookedAppointments.map(
    (appointment) => `${appointment.slot?.start}-${appointment.slot?.end}`
  );

  const availableSlots = (availability.slots || []).filter(
    (slot) => slot.start && slot.end && !bookedSlots.includes(`${slot.start}-${slot.end}`)
  );

  return availableSlots;
};

export const changeDoctorPassword = async (doctorId, currentPassword, newPassword) => {
  const doctor = await Doctor.findById(doctorId);
  if (!doctor) throw new Error("Doctor not found.");

  const isMatch = await bcrypt.compare(currentPassword, doctor.password);
  if (!isMatch) throw new Error("Current password is incorrect.");

  if (newPassword.length < 8) throw new Error("New password must be at least 8 characters.");

  doctor.password = await bcrypt.hash(newPassword, 10);
  await doctor.save();

  return { message: "Password changed successfully." };
};

