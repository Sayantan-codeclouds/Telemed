import fs from "fs";
import path from "path";
import LabReport from "./labReport.model.js";
import Doctor from "../doctors/doctor.model.js";
import Patient from "../patients/patient.model.js";
import Appointment from "../appointments/appointment.model.js";
import { createNotificationService } from "../notifications/notification.service.js";
import { formatLabReport } from "../shared/utils/fileUrl.js";

export const createLabReport = async (patientId, file, data) => {
  if (!file) {
    throw new Error("Please upload a report file (PDF or image).");
  }

  const patient = await Patient.findById(patientId);
  if (!patient) {
    throw new Error("Patient not found.");
  }

  const relativeFilename = path.basename(file.path);

  const report = await LabReport.create({
    patient: patientId,
    doctor: data.doctorId || null,
    appointment: data.appointmentId || null,
    title: data.title || file.originalname,
    reportType: data.reportType || "OTHER",
    testDate: data.testDate ? new Date(data.testDate) : new Date(),
    labName: data.labName || "",
    notes: data.notes || "",
    fileUrl: relativeFilename,
    fileName: file.originalname,
    fileType: file.mimetype,
    fileSize: file.size,
    status: data.status || "PENDING_REVIEW",
  });

  // If a doctor is associated, notify them
  if (data.doctorId) {
    const doctor = await Doctor.findById(data.doctorId);
    if (doctor) {
      await createNotificationService({
        recipient: doctor._id,
        recipientModel: "Doctor",
        title: "📄 New Lab Report Uploaded",
        message: `${patient.firstName} ${patient.lastName} uploaded a new lab report: "${report.title}".`,
        type: "APPOINTMENT",
        link: "/doctor/appointments",
      });
    }
  }

  const populated = await LabReport.findById(report._id)
    .populate("doctor", "firstName lastName specialization")
    .populate("patient", "firstName lastName");

  return formatLabReport(populated);
};

export const getPatientLabReports = async (patientId, query = {}) => {
  const filter = { patient: patientId };
  if (query.reportType && query.reportType !== "ALL") {
    filter.reportType = query.reportType;
  }
  if (query.search) {
    filter.title = { $regex: query.search, $options: "i" };
  }

  const reports = await LabReport.find(filter)
    .populate("doctor", "firstName lastName specialization")
    .sort({ testDate: -1, createdAt: -1 });

  return reports.map(formatLabReport);
};

export const getDoctorPatientLabReports = async (doctorId, patientId) => {
  // Return reports for this patient: either assigned to this doctor, or all if patient has had an appointment with this doctor
  const hasConsulted = await Appointment.exists({
    doctor: doctorId,
    patient: patientId,
  });

  if (!hasConsulted) {
    // Check if specifically assigned to this doctor
    const reports = await LabReport.find({
      patient: patientId,
      doctor: doctorId,
    })
      .populate("patient", "firstName lastName profileImage")
      .sort({ testDate: -1, createdAt: -1 });

    return reports.map(formatLabReport);
  }

  const reports = await LabReport.find({ patient: patientId })
    .populate("patient", "firstName lastName profileImage")
    .sort({ testDate: -1, createdAt: -1 });

  return reports.map(formatLabReport);
};

export const getLabReportById = async (reportId, userId, userType) => {
  const report = await LabReport.findById(reportId)
    .populate("doctor", "firstName lastName specialization")
    .populate("patient", "firstName lastName");

  if (!report) {
    throw new Error("Lab report not found.");
  }

  if (userType === "PATIENT" && String(report.patient._id) !== String(userId)) {
    throw new Error("Unauthorized access to this report.");
  }

  return formatLabReport(report);
};

export const deleteLabReport = async (reportId, patientId) => {
  const report = await LabReport.findOne({
    _id: reportId,
    patient: patientId,
  });

  if (!report) {
    throw new Error("Report not found or unauthorized.");
  }

  // Attempt to delete physical file
  try {
    const filename = path.basename(report.fileUrl);
    const filePath = path.join(process.cwd(), "src", "uploads", "lab-reports", filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (err) {
    console.error("Error removing lab report file:", err);
  }

  await LabReport.deleteOne({ _id: reportId });

  return { message: "Report deleted successfully." };
};
