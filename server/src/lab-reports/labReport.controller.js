import {
  createLabReport,
  getPatientLabReports,
  getDoctorPatientLabReports,
  getLabReportById,
  deleteLabReport,
} from "./labReport.service.js";

export const uploadLabReport = async (req, res) => {
  try {
    const report = await createLabReport(
      req.patient._id,
      req.file,
      req.body
    );

    return res.status(201).json({
      success: true,
      message: "Lab report uploaded successfully.",
      data: report,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getMyLabReports = async (req, res) => {
  try {
    const reports = await getPatientLabReports(req.patient._id, req.query);

    return res.json({
      success: true,
      data: reports,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getPatientReportsForDoctor = async (req, res) => {
  try {
    const reports = await getDoctorPatientLabReports(
      req.doctor._id,
      req.params.patientId
    );

    return res.json({
      success: true,
      data: reports,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getSingleLabReport = async (req, res) => {
  try {
    const userId = req.patient?._id || req.doctor?._id;
    const userType = req.patient ? "PATIENT" : "DOCTOR";

    const report = await getLabReportById(req.params.id, userId, userType);

    return res.json({
      success: true,
      data: report,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteMyLabReport = async (req, res) => {
  try {
    const result = await deleteLabReport(req.params.id, req.patient._id);

    return res.json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
