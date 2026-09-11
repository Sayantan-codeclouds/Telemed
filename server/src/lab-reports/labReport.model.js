import mongoose from "mongoose";

const labReportSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
      index: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      default: null,
    },
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      default: null,
    },
    title: {
      type: String,
      required: [true, "Report title is required."],
      trim: true,
      maxlength: 120,
    },
    reportType: {
      type: String,
      enum: [
        "BLOOD_TEST",
        "IMAGING_SCAN",
        "PATHOLOGY",
        "URINE_ANALYSIS",
        "CARDIOLOGY",
        "COVID_19",
        "OTHER",
      ],
      default: "OTHER",
    },
    testDate: {
      type: Date,
      default: Date.now,
    },
    labName: {
      type: String,
      trim: true,
      default: "",
    },
    notes: {
      type: String,
      trim: true,
      default: "",
    },
    fileUrl: {
      type: String,
      required: [true, "Report file is required."],
    },
    fileName: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
      default: "application/pdf",
    },
    fileSize: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["NORMAL", "ABNORMAL", "CRITICAL", "PENDING_REVIEW"],
      default: "PENDING_REVIEW",
    },
  },
  {
    timestamps: true,
  }
);

const LabReport = mongoose.model("LabReport", labReportSchema);

export default LabReport;
