import Prescription from "./prescription.model.js";
import Appointment from "../appointments/appointment.model.js";
import Doctor from "../doctors/doctor.model.js";
import AppError from "../shared/errors/AppError.js";
import { createNotificationService } from "../notifications/notification.service.js";
import { sendRecheckupReminderEmail } from "../mail/mail.service.js";

export const createPrescriptionService = async (doctorId, data) => {
  const appointment = await Appointment.findById(data.appointmentId);
  if (!appointment) {
    throw AppError.notFound("Appointment not found.");
  }

  if (appointment.doctor.toString() !== doctorId.toString()) {
    throw AppError.forbidden("You are not the assigned doctor for this appointment.");
  }

  const doctor = await Doctor.findById(doctorId);

  // Determine validity days & dates
  const validityDays = Number(data.validityDays || 14);
  let validUntil = null;
  if (data.validUntil) {
    validUntil = new Date(data.validUntil);
  } else if (data.followUpDate || data.recheckupDate) {
    validUntil = new Date(data.followUpDate || data.recheckupDate);
  } else {
    validUntil = new Date(Date.now() + validityDays * 24 * 60 * 60 * 1000);
  }

  const remindRecheckup = data.remindRecheckup !== undefined ? Boolean(data.remindRecheckup) : true;

  // Create or update existing prescription for this appointment
  let prescription = await Prescription.findOne({ appointment: appointment._id });

  if (prescription) {
    prescription.diagnosis = data.diagnosis;
    prescription.medicines = data.medicines;
    prescription.notes = data.notes || "";
    prescription.validityDays = validityDays;
    prescription.validUntil = validUntil;
    prescription.recheckupDate = validUntil;
    prescription.followUpDate = validUntil;
    prescription.remindRecheckup = remindRecheckup;
    if (doctor?.signature) prescription.signature = doctor.signature;
    if (doctor?.clinicStamp) prescription.clinicStamp = doctor.clinicStamp;
    await prescription.save();
  } else {
    prescription = await Prescription.create({
      appointment: appointment._id,
      doctor: doctorId,
      patient: appointment.patient,
      diagnosis: data.diagnosis,
      medicines: data.medicines,
      notes: data.notes || "",
      signature: doctor?.signature || "",
      clinicStamp: doctor?.clinicStamp || "",
      validityDays,
      validUntil,
      recheckupDate: validUntil,
      followUpDate: validUntil,
      remindRecheckup,
    });
  }

  // Also update summary string on appointment for backward compatibility
  const medSummary = data.medicines.map((m) => `${m.name} (${m.dosage}, ${m.frequency})`).join("; ");
  appointment.prescription = `${data.diagnosis ? `[${data.diagnosis}] ` : ""}${medSummary}`;
  appointment.followUpDate = validUntil;
  await appointment.save();

  return prescription.populate([
    { path: "doctor", select: "firstName lastName specialization qualification licenseNumber hospital signature clinicStamp profileImage" },
    { path: "patient", select: "firstName lastName email phone gender dateOfBirth bloodGroup" },
  ]);
};

/**
 * Send a sweet Recheckup & Prescription Validity reminder to the patient
 * (via In-App Notification & Resend Email)
 */
export const triggerRecheckupReminderService = async (prescriptionId, user = null) => {
  const prescription = await Prescription.findById(prescriptionId)
    .populate("doctor", "firstName lastName specialization hospital")
    .populate("patient", "firstName lastName email phone");

  if (!prescription) {
    throw AppError.notFound("Prescription not found.");
  }

  const doctor = prescription.doctor;
  const patient = prescription.patient;
  const doctorName = `${doctor?.firstName || "Doctor"} ${doctor?.lastName || ""}`.trim();
  const patientName = `${patient?.firstName || "Patient"} ${patient?.lastName || ""}`.trim();
  const formattedDate = prescription.recheckupDate
    ? new Date(prescription.recheckupDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "today";

  // 1. Create In-App Notification
  const notificationTitle = `🌸 Time for your Recheckup with Dr. ${doctorName}`;
  const notificationMessage = `Your prescription validity period is complete (${prescription.validityDays || 14} days). Dr. ${doctorName} would love to check in on your recovery and wellness!`;

  await createNotificationService({
    recipient: patient._id,
    recipientModel: "Patient",
    title: notificationTitle,
    message: notificationMessage,
    type: "RECHECKUP_REMINDER",
    link: "/patient/doctors",
  });

  // 2. Send Sweet Care Email
  let emailSent = false;
  if (patient?.email) {
    try {
      await sendRecheckupReminderEmail({
        patientEmail: patient.email,
        patientName,
        doctorName,
        doctorSpecialization: doctor?.specialization || "General Physician",
        diagnosis: prescription.diagnosis,
        validityDays: prescription.validityDays || 14,
        recheckupDate: formattedDate,
        bookingUrl: `${process.env.FRONTEND_URL || "http://localhost:5173"}/patient/doctors`,
      });
      emailSent = true;
    } catch (emailErr) {
      console.warn("Failed to send recheckup email, in-app notification delivered:", emailErr?.message);
    }
  }

  // Update prescription tracking
  prescription.reminderSent = true;
  prescription.reminderSentAt = new Date();
  if (emailSent) {
    prescription.reminderEmailSent = true;
    prescription.reminderEmailSentAt = new Date();
  }
  await prescription.save();

  return {
    success: true,
    message: `Recheckup reminder successfully sent to ${patientName}!`,
    prescription,
    emailSent,
  };
};

/**
 * Scan for all due prescriptions and send sweet reminders
 */
export const checkAndSendDueRecheckupRemindersService = async () => {
  const now = new Date();
  const duePrescriptions = await Prescription.find({
    remindRecheckup: true,
    reminderSent: { $ne: true },
    recheckupDate: { $lte: now },
  });

  let sentCount = 0;
  for (const pres of duePrescriptions) {
    try {
      await triggerRecheckupReminderService(pres._id);
      sentCount++;
    } catch (err) {
      console.error(`Error sending reminder for prescription ${pres._id}:`, err?.message);
    }
  }

  return {
    checked: duePrescriptions.length,
    sentCount,
  };
};

export const getPrescriptionByAppointmentService = async (appointmentId, userId) => {
  const prescription = await Prescription.findOne({ appointment: appointmentId })
    .populate("doctor", "firstName lastName specialization qualification licenseNumber hospital signature clinicStamp profileImage")
    .populate("patient", "firstName lastName email phone gender dateOfBirth bloodGroup");

  if (!prescription) {
    return null;
  }

  return prescription;
};

export const getPatientPrescriptionsService = async (patientId) => {
  return Prescription.find({ patient: patientId })
    .populate("doctor", "firstName lastName specialization qualification licenseNumber hospital signature clinicStamp profileImage")
    .populate("appointment", "appointmentDate slot status")
    .sort({ createdAt: -1 });
};

export const getDoctorPrescriptionsService = async (doctorId) => {
  return Prescription.find({ doctor: doctorId })
    .populate("doctor", "firstName lastName specialization qualification licenseNumber hospital signature clinicStamp profileImage")
    .populate("patient", "firstName lastName email phone gender dateOfBirth bloodGroup")
    .populate("appointment", "appointmentDate slot status")
    .sort({ createdAt: -1 });
};
