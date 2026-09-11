import { useState, useRef } from "react";
import {
  UploadCloud,
  FileText,
  Image as ImageIcon,
  X,
  Loader2,
  Calendar,
  Building2,
  Stethoscope,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import api from "@/api/axios";

const REPORT_TYPES = [
  { value: "BLOOD_TEST", label: "Blood Test / Hematology" },
  { value: "IMAGING_SCAN", label: "Imaging & Scans (X-Ray, MRI, CT, Ultrasound)" },
  { value: "PATHOLOGY", label: "Pathology & Biopsy" },
  { value: "URINE_ANALYSIS", label: "Urine / Renal Analysis" },
  { value: "CARDIOLOGY", label: "Cardiology (ECG, 2D Echo)" },
  { value: "COVID_19", label: "COVID-19 / Infectious Disease" },
  { value: "OTHER", label: "Other Diagnostic Report" },
];

export default function LabReportUploadModal({
  isOpen,
  onClose,
  doctors = [],
  onSuccess,
}) {
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [reportType, setReportType] = useState("BLOOD_TEST");
  const [testDate, setTestDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [labName, setLabName] = useState("");
  const [doctorId, setDoctorId] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("PENDING_REVIEW");
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  if (!isOpen) return null;

  const handleFileSelect = (selectedFile) => {
    if (!selectedFile) return;

    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/jpg",
      "image/webp",
    ];

    if (!allowedTypes.includes(selectedFile.type)) {
      toast.error("Only PDF and image files (PNG, JPG, WEBP) are supported.");
      return;
    }

    if (selectedFile.size > 15 * 1024 * 1024) {
      toast.error("File size cannot exceed 15MB.");
      return;
    }

    setFile(selectedFile);
    if (!title) {
      // Pre-fill title without extension
      const cleanName = selectedFile.name.replace(/\.[^/.]+$/, "");
      setTitle(cleanName);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      toast.error("Please select a report file to upload.");
      return;
    }

    if (!title.trim()) {
      toast.error("Please enter a title for this lab report.");
      return;
    }

    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title.trim());
    formData.append("reportType", reportType);
    formData.append("testDate", testDate);
    formData.append("labName", labName.trim());
    formData.append("status", status);
    formData.append("notes", notes.trim());
    if (doctorId) {
      formData.append("doctorId", doctorId);
    }

    try {
      const res = await api.post("/lab-reports", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success(res.data?.message || "Lab report uploaded successfully!");
      if (onSuccess) {
        onSuccess(res.data.data);
      }
      onClose();
    } catch (err) {
      console.error("Upload error:", err);
      toast.error(
        err.response?.data?.message || "Failed to upload report. Please try again."
      );
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <Card className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border-0 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-emerald-50/50 via-white to-teal-50/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">Upload Lab Report</h3>
              <p className="text-xs text-slate-500">
                Attach blood test, scan, or diagnostic pathology records
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1 text-xs">
            {/* Drop Zone */}
            <div>
              <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                Report File (PDF or Image, max 15MB) *
              </label>
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 text-center transition cursor-pointer flex flex-col items-center justify-center ${
                  dragOver
                    ? "border-emerald-500 bg-emerald-50/50"
                    : file
                    ? "border-emerald-300 bg-emerald-50/20"
                    : "border-slate-200 hover:border-slate-300 bg-slate-50/50"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf,image/*"
                  className="hidden"
                  onChange={(e) => handleFileSelect(e.target.files?.[0])}
                />

                {file ? (
                  <div className="flex items-center gap-3 text-left">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                      {file.type === "application/pdf" ? (
                        <FileText className="w-5 h-5" />
                      ) : (
                        <ImageIcon className="w-5 h-5" />
                      )}
                    </div>
                    <div className="overflow-hidden">
                      <p className="font-bold text-slate-900 text-xs truncate max-w-[240px]">
                        {file.name}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {formatFileSize(file.size)} • Click or drop to replace
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <UploadCloud className="w-8 h-8 text-slate-400 mb-2" />
                    <p className="font-bold text-slate-700 text-xs">
                      Drag and drop your report here, or <span className="text-emerald-600">browse</span>
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Supports PDF, PNG, JPG, WEBP (up to 15MB)
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Title */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700 uppercase tracking-wider block">
                Report Title *
              </label>
              <Input
                placeholder="e.g. Complete Blood Count (CBC), Chest X-Ray..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="h-10 text-xs rounded-xl"
              />
            </div>

            {/* Category and Date Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase tracking-wider block">
                  Category
                </label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="w-full h-10 px-3 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                >
                  {REPORT_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase tracking-wider block">
                  Test / Sample Date
                </label>
                <Input
                  type="date"
                  value={testDate}
                  onChange={(e) => setTestDate(e.target.value)}
                  className="h-10 text-xs rounded-xl"
                />
              </div>
            </div>

            {/* Lab Name & Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase tracking-wider block">
                  Diagnostic Lab / Hospital
                </label>
                <Input
                  placeholder="e.g. Quest Diagnostics, Metropolis..."
                  value={labName}
                  onChange={(e) => setLabName(e.target.value)}
                  className="h-10 text-xs rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase tracking-wider block">
                  Report Finding Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full h-10 px-3 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="PENDING_REVIEW">Pending Doctor Review</option>
                  <option value="NORMAL">Normal / Within Range</option>
                  <option value="ABNORMAL">Abnormal / Action Needed</option>
                  <option value="CRITICAL">Critical Alert</option>
                </select>
              </div>
            </div>

            {/* Share with Doctor (Optional) */}
            {doctors.length > 0 && (
              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase tracking-wider block">
                  Share with Doctor <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <select
                  value={doctorId}
                  onChange={(e) => setDoctorId(e.target.value)}
                  className="w-full h-10 px-3 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Keep in my private records (not shared yet)</option>
                  {doctors.map((doc) => (
                    <option key={doc._id} value={doc._id}>
                      Dr. {doc.firstName} {doc.lastName} ({doc.specialization || "General"})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Clinical Notes */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700 uppercase tracking-wider block">
                Doctor Instructions / Patient Notes <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <textarea
                rows={2}
                placeholder="e.g., Fasting blood sugar was 110 mg/dL, doctor requested repeat test..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-3 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 resize-none"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-5 sm:p-6 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50/50">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={uploading}
              className="rounded-xl h-10 px-5 text-xs font-bold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!file || !title.trim() || uploading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-10 px-6 text-xs font-bold gap-2 shadow-md shadow-emerald-500/20"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Uploading Report...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" /> Save Lab Report
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
