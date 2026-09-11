import asyncHandler from "../shared/utils/asyncHandler.js";
import {
  createPrescriptionService,
  getPrescriptionByAppointmentService,
  getPatientPrescriptionsService,
  getDoctorPrescriptionsService,
  triggerRecheckupReminderService,
  checkAndSendDueRecheckupRemindersService,
} from "./prescription.service.js";

export const createPrescription = asyncHandler(async (req, res) => {
  const prescription = await createPrescriptionService(req.doctor._id, req.body);
  res.status(201).json({
    success: true,
    message: "Prescription saved successfully.",
    data: prescription,
  });
});

export const getPrescriptionByAppointment = asyncHandler(async (req, res) => {
  const prescription = await getPrescriptionByAppointmentService(
    req.params.appointmentId,
    req.doctor?._id || req.patient?._id
  );

  res.status(200).json({
    success: true,
    data: prescription,
  });
});

export const getPatientPrescriptions = asyncHandler(async (req, res) => {
  const prescriptions = await getPatientPrescriptionsService(req.patient._id);
  res.status(200).json({
    success: true,
    data: prescriptions,
  });
});

export const getDoctorPrescriptions = asyncHandler(async (req, res) => {
  const prescriptions = await getDoctorPrescriptionsService(req.doctor._id);
  res.status(200).json({
    success: true,
    data: prescriptions,
  });
});

export const sendRecheckupReminder = asyncHandler(async (req, res) => {
  const result = await triggerRecheckupReminderService(req.params.id, req.doctor || req.admin);
  res.status(200).json({
    success: true,
    message: result.message,
    data: result,
  });
});

export const checkDueRecheckupReminders = asyncHandler(async (req, res) => {
  const result = await checkAndSendDueRecheckupRemindersService();
  res.status(200).json({
    success: true,
    message: `Scanned prescriptions. Sent ${result.sentCount} reminders.`,
    data: result,
  });
});
