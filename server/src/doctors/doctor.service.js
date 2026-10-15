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
import Admin from "../admin/admin.model.js";
import AppError from "../shared/errors/AppError.js";
import { createNotificationService } from "../notifications/notification.service.js";
import hashToken from "../shared/utils/hashToken.js";

export const verifyDoctorEmail = async (token) => {
  // Only accept a plain string so query operators like { $ne: null } can't be injected.
  if (typeof token !== "string" || !token) {
    throw new Error("Invalid or expired verification token.");
  }

  const doctor = await Doctor.findOne({
    verificationToken: hashToken(token),
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
    // Self-registered doctors can't practise until an admin verifies their credentials.
    status: "PENDING_APPROVAL",
    verificationToken: hashToken(verificationToken),
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

  if (doctor.status === "PENDING_APPROVAL") {
    throw new Error("Your account is awaiting verification by our team. You'll be notified once it's approved.");
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

// Fields patients rely on to trust a doctor; changes after approval need review.
const CREDENTIAL_FIELDS = ["licenseNumber", "qualification", "specialization"];

// Signature / stamp images are stored inline and drawn into prescription PDFs:
// PNG or JPEG data URLs only, ~500 KB max.
const MAX_IMAGE_DATA_URL_LENGTH = 700000;
const assertSignatureImage = (value, label) => {
  if (value === "" || value === null) return;
  if (typeof value !== "string" || !/^data:image\/(png|jpeg);base64,[A-Za-z0-9+/=]+$/.test(value)) {
    throw new Error(`${label} must be a PNG or JPEG image.`);
  }
  if (value.length > MAX_IMAGE_DATA_URL_LENGTH) {
    throw new Error(`${label} image is too large (max about 500 KB).`);
  }
};

const PRIVATE_DOCTOR_FIELDS = [
  "password",
  "verificationToken",
  "verificationTokenExpires",
  "resetPasswordToken",
  "resetPasswordTokenExpires",
  "payoutSettings",
];

export const updateDoctorProfile = async (doctorId, data) => {
  const doctor = await Doctor.findById(doctorId);

  if (!doctor) {
    throw new Error("Doctor not found.");
  }

  if (data.consultationFee !== undefined && data.consultationFee !== null) {
    const fee = Number(data.consultationFee);
    if (!Number.isFinite(fee) || fee < 0 || fee > 100000) {
      throw new Error("Consultation fee must be a number between 0 and 100,000.");
    }
    doctor.consultationFee = Math.round(fee * 100) / 100;
  }
  if (data.experience !== undefined && data.experience !== null) {
    const years = Number(data.experience);
    if (!Number.isFinite(years) || years < 0 || years > 80) {
      throw new Error("Experience must be between 0 and 80 years.");
    }
    doctor.experience = years;
  }
  // Only new images are checked: the form re-sends unchanged (possibly legacy) values.
  if (data.signature !== undefined && data.signature !== doctor.signature) {
    assertSignatureImage(data.signature, "Signature");
  }
  if (data.clinicStamp !== undefined && data.clinicStamp !== doctor.clinicStamp) {
    assertSignatureImage(data.clinicStamp, "Clinic stamp");
  }

  // Credentials: applied directly while the account awaits approval (the
  // approval reviews them); for an approved doctor they are held for review.
  const changedCredentials = {};
  for (const field of CREDENTIAL_FIELDS) {
    const value = data[field];
    if (value !== undefined && value !== null && String(value).trim() !== String(doctor[field] || "").trim()) {
      changedCredentials[field] = String(value).trim();
    }
  }
  let credentialChangePending = false;
  if (Object.keys(changedCredentials).length > 0) {
    if (doctor.status === "ACTIVE") {
      doctor.pendingCredentialChanges = {
        ...(doctor.pendingCredentialChanges?.toObject?.() || doctor.pendingCredentialChanges || {}),
        ...changedCredentials,
        requestedAt: new Date(),
      };
      credentialChangePending = true;
    } else {
      Object.assign(doctor, changedCredentials);
    }
  }

  doctor.firstName = data.firstName ?? doctor.firstName;
  doctor.lastName = data.lastName ?? doctor.lastName;
  doctor.phone = data.phone ?? doctor.phone;
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

  if (credentialChangePending) {
    await notifyAdminsOfCredentialChange(doctor).catch(() => {});
  }

  const result = formatProfileImage(doctor);
  for (const field of PRIVATE_DOCTOR_FIELDS) delete result[field];
  return { ...result, credentialChangePending };
};

const notifyAdminsOfCredentialChange = async (doctor) => {
  const admins = await Admin.find({ role: { $in: ["SuperAdmin", "Admin"] }, status: "ACTIVE" }).select("_id");
  await Promise.all(
    admins.map((admin) =>
      createNotificationService({
        recipient: admin._id,
        recipientModel: "Admin",
        title: "🩺 Doctor credentials to review",
        message: `Dr. ${doctor.firstName} ${doctor.lastName} changed their licence/qualification/specialization. Review it in Doctors.`,
        type: "DOCTOR_APPROVAL",
        link: "/admin/doctors",
      }).catch(() => {})
    )
  );
};

/** Admin: apply or discard a doctor's pending credential changes. */
export const reviewDoctorCredentialChangesService = async (doctorId, approve) => {
  const doctor = await Doctor.findOne({ _id: doctorId, deletedAt: null });
  if (!doctor) throw AppError.notFound("Doctor not found.");
  const pending = doctor.pendingCredentialChanges;
  if (!pending) throw AppError.badRequest("This doctor has no credential changes waiting for review.");

  if (approve) {
    for (const field of CREDENTIAL_FIELDS) {
      if (pending[field] !== undefined && pending[field] !== null) doctor[field] = pending[field];
    }
  }
  doctor.pendingCredentialChanges = null;
  await doctor.save();

  await createNotificationService({
    recipient: doctor._id,
    recipientModel: "Doctor",
    title: approve ? "✅ Credential update approved" : "❌ Credential update not approved",
    message: approve
      ? "Your updated licence/qualification/specialization is now shown on your profile."
      : "Your licence/qualification/specialization change was not approved. Contact support for details.",
    type: "DOCTOR_APPROVAL",
    link: "/doctor/profile",
  }).catch(() => {});

  return { _id: doctor._id, approved: Boolean(approve) };
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

  // Each day once, and no overlapping slots (overlaps could be booked twice).
  const seenDays = new Set();
  for (const item of availability || []) {
    if (!validDays.includes(item.day)) continue;
    if (seenDays.has(item.day)) {
      throw new Error(`${item.day} is listed more than once. Combine its time slots into one day.`);
    }
    seenDays.add(item.day);
    const slots = (item.slots || [])
      .filter((s) => s.start && s.end)
      .map((s) => ({ start: s.start.trim(), end: s.end.trim() }))
      .sort((a, b) => a.start.localeCompare(b.start));
    for (let i = 1; i < slots.length; i++) {
      if (slots[i].start < slots[i - 1].end) {
        throw new Error(
          `Slots on ${item.day} overlap (${slots[i - 1].start}-${slots[i - 1].end} and ${slots[i].start}-${slots[i].end}). Each slot is one bookable appointment, so they must not overlap.`
        );
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

  // Don't reveal whether the email is registered; the caller responds the same either way.
  if (!doctor) {
    return;
  }

  const resetToken = crypto.randomBytes(32).toString("hex");

  doctor.resetPasswordToken = hashToken(resetToken);
  doctor.resetPasswordTokenExpires = new Date(Date.now() + 60 * 60 * 1000);

  await doctor.save();

  await sendDoctorResetPasswordEmail(doctor.email, resetToken);
};

export const resetDoctorPassword = async (token, password) => {
  // Only accept a plain string so query operators like { $ne: null } can't be injected.
  if (typeof token !== "string" || !token) {
    throw new Error("Invalid or expired reset token.");
  }
  if (typeof password !== "string" || password.length < 8) {
    throw new Error("Password must be at least 8 characters.");
  }

  const doctor = await Doctor.findOne({
    resetPasswordToken: hashToken(token),
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

// Public doctor endpoints must not expose credentials, bank/payout details,
// or the signature and stamp images used to sign prescriptions.
const PUBLIC_DOCTOR_EXCLUDED_FIELDS =
  "-password -verificationToken -verificationTokenExpires -resetPasswordToken -resetPasswordTokenExpires -payoutSettings -signature -clinicStamp";

export const getAllDoctors = async () => {
  const doctors = await Doctor.find({
    status: "ACTIVE",
    isEmailVerified: true,
  })
    .select(
      PUBLIC_DOCTOR_EXCLUDED_FIELDS
    )
    .sort({
      firstName: 1,
    });

  return doctors.map(formatProfileImage);
};

export const getDoctorById = async (doctorId) => {
  const doctor = await Doctor.findById(doctorId).select(
    PUBLIC_DOCTOR_EXCLUDED_FIELDS
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
  let startOfDay;
  let endOfDay;
  if (typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    // Bookings store "YYYY-MM-DD" as UTC midnight (new Date("YYYY-MM-DD")),
    // so look up booked slots by the same UTC day regardless of server timezone.
    const [y, m, d] = date.split("-").map(Number);
    parsedDate = new Date(Date.UTC(y, m - 1, d));
    dayName = parsedDate.toLocaleDateString("en-US", { weekday: "long", timeZone: "UTC" });
    startOfDay = parsedDate;
    endOfDay = new Date(Date.UTC(y, m - 1, d, 23, 59, 59, 999));
  } else {
    parsedDate = new Date(date);
    dayName = parsedDate.toLocaleDateString("en-US", { weekday: "long" });
    startOfDay = new Date(parsedDate);
    startOfDay.setHours(0, 0, 0, 0);
    endOfDay = new Date(parsedDate);
    endOfDay.setHours(23, 59, 59, 999);
  }

  const availability = (doctor.availability || []).find((item) => item.day === dayName);

  if (!availability || !availability.enabled) {
    return [];
  }

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

  // The schema's pre("save") hook hashes the password; hashing here too
  // would store a hash-of-a-hash and lock the doctor out.
  doctor.password = newPassword;
  await doctor.save();

  return { message: "Password changed successfully." };
};

