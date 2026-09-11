import asyncHandler from "../shared/utils/asyncHandler.js";
import {
  runReceptionistIntake,
  generateConsultationSummaryService,
  getHealthAdviceService,
  readPrescriptionToCartService,
  analyzeLabReportService,
} from "./ai.service.js";

export const getHealthAdvice = asyncHandler(async (req, res) => {
  const { message, history, patientContext } = req.body;

  if (!message || !message.trim()) {
    return res.status(400).json({
      success: false,
      message: "Message is required.",
    });
  }

  const result = await getHealthAdviceService({ message, history, patientContext });
  res.status(200).json({
    success: true,
    data: result,
  });
});

export const receptionistIntake = asyncHandler(async (req, res) => {
  const result = await runReceptionistIntake(req.body);
  res.status(200).json({
    success: true,
    data: result,
  });
});

export const generateConsultationSummary = asyncHandler(async (req, res) => {
  const { appointmentId } = req.body;
  if (!appointmentId) {
    return res.status(400).json({
      success: false,
      message: "Appointment ID is required.",
    });
  }

  const result = await generateConsultationSummaryService(appointmentId);
  res.status(200).json({
    success: true,
    message: "AI consultation summary generated successfully.",
    data: result,
  });
});

export const readPrescriptionToCart = asyncHandler(async (req, res) => {
  const { prescriptionId, prescriptionData } = req.body;

  const result = await readPrescriptionToCartService({
    prescriptionId,
    prescriptionData,
  });

  res.status(200).json({
    success: true,
    message: "Prescription analyzed and matched with pharmacy medicines.",
    data: result,
  });
});

export const analyzeLabReport = asyncHandler(async (req, res) => {
  const { reportText, message, history, mode } = req.body;

  if (!reportText && !message) {
    return res.status(400).json({
      success: false,
      message: "Report text or message is required.",
    });
  }

  const result = await analyzeLabReportService({ reportText, message, history, mode });
  res.status(200).json({
    success: true,
    data: result,
  });
});
