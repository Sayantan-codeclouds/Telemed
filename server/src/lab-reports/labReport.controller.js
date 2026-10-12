import fs from "fs";
import path from "path";
import { Readable } from "stream";
import LabReport from "./labReport.model.js";
import { readFileToken } from "../shared/utils/signedFileLink.js";
import { getCloudFetchUrl } from "../shared/utils/cloudStorage.js";
import { getEffectiveFrontendUrl } from "../mail/mail.service.js";
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

const LAB_REPORT_DIR = path.join(process.cwd(), "src", "uploads", "lab-reports");

/**
 * GET /api/lab-reports/file/:token
 * Streams a lab report file for a signed, unexpired link (issued in the
 * report's `fileUrl` to users allowed to see it). No auth header is needed,
 * so the link works in <a>, <img> and <iframe>; the storage URL is never
 * exposed. Add ?download=1 to download instead of viewing inline.
 */
export const streamLabReportFile = async (req, res) => {
  const reportId = readFileToken(req.params.token);
  if (!reportId) {
    return res.status(403).json({ success: false, message: "This file link is invalid or has expired. Reopen the report to get a new one." });
  }

  try {
    const report = await LabReport.findById(reportId).select("fileUrl fileName fileType");
    if (!report || !report.fileUrl) {
      return res.status(404).json({ success: false, message: "Lab report file not found." });
    }

    const safeName = (report.fileName || "lab-report").replace(/[^\w.\- ]/g, "_");
    const disposition = req.query.download ? "attachment" : "inline";

    res.set({
      "Content-Type": report.fileType || "application/octet-stream",
      "Content-Disposition": `${disposition}; filename="${safeName}"`,
      "Cache-Control": "private, no-store",
      // The patient app previews PDFs in an iframe: allow only our frontend to embed it.
      "Content-Security-Policy": `default-src 'none'; style-src 'unsafe-inline'; frame-ancestors 'self' ${await getEffectiveFrontendUrl()}`,
    });
    res.removeHeader("X-Frame-Options");

    if (/^https?:\/\//i.test(report.fileUrl)) {
      const fetchUrl = await getCloudFetchUrl(report.fileUrl);
      if (!fetchUrl) {
        return res.status(503).json({ success: false, message: "File storage is not configured." });
      }
      const upstream = await fetch(fetchUrl);
      if (!upstream.ok || !upstream.body) {
        return res.status(502).json({ success: false, message: "Could not load the report file from storage." });
      }
      return Readable.fromWeb(upstream.body).pipe(res);
    }

    // Legacy local file: only the bare filename is used, inside the reports folder.
    const filePath = path.join(LAB_REPORT_DIR, path.basename(report.fileUrl));
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: "Lab report file not found." });
    }
    return fs.createReadStream(filePath).pipe(res);
  } catch (error) {
    console.error("[LabReport] Failed to stream file:", error?.message || error);
    if (!res.headersSent) {
      return res.status(500).json({ success: false, message: "Could not load the report file." });
    }
    return res.end();
  }
};
