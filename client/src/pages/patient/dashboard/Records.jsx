import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  Activity,
  HeartPulse,
  Calendar,
  Stethoscope,
  Shield,
  Loader2,
  ArrowRight,
  Pill,
  UploadCloud,
  Search,
  Download,
  Trash2,
  Eye,
  FileCheck,
  Building2,
  ExternalLink,
  Plus,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import api from "@/api/axios";
import LabReportUploadModal from "@/components/patient/LabReportUploadModal";

const REPORT_TYPE_FILTERS = [
  { key: "ALL", label: "All Reports" },
  { key: "BLOOD_TEST", label: "Blood Tests" },
  { key: "IMAGING_SCAN", label: "Imaging & Scans" },
  { key: "PATHOLOGY", label: "Pathology" },
  { key: "URINE_ANALYSIS", label: "Urine / Renal" },
  { key: "CARDIOLOGY", label: "Cardiology" },
  { key: "OTHER", label: "Other" },
];

export default function Records() {
  const [profile, setProfile] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [labReports, setLabReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("LAB_REPORTS"); // "LAB_REPORTS" | "EHR_OVERVIEW"
  const [reportTypeFilter, setReportTypeFilter] = useState("ALL");
  const [searchReport, setSearchReport] = useState("");
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [previewReport, setPreviewReport] = useState(null);

  const fetchRecords = async () => {
    try {
      const [profileRes, apptRes, presRes, reportsRes] = await Promise.all([
        api.get("/patients/profile"),
        api.get("/appointments/patient"),
        api.get("/prescriptions/patient"),
        api.get("/lab-reports"),
      ]);

      setProfile(profileRes?.data?.data || null);
      setAppointments(apptRes?.data?.data || []);
      setPrescriptions(presRes?.data?.data || []);
      setLabReports(reportsRes?.data?.data || []);
    } catch (error) {
      console.error("Failed to load medical records:", error);
      toast.error("Failed to load records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  // Unique list of doctors patient has consulted with
  const doctorsList = useMemo(() => {
    const map = new Map();
    appointments.forEach((appt) => {
      if (appt.doctor && appt.doctor._id) {
        map.set(String(appt.doctor._id), appt.doctor);
      }
    });
    return Array.from(map.values());
  }, [appointments]);

  const handleDeleteReport = async (reportId, reportTitle) => {
    if (!window.confirm(`Are you sure you want to delete "${reportTitle}"?`)) {
      return;
    }

    setDeletingId(reportId);
    try {
      await api.delete(`/lab-reports/${reportId}`);
      toast.success("Lab report deleted successfully.");
      setLabReports((prev) => prev.filter((r) => r._id !== reportId));
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete report.");
    } finally {
      setDeletingId(null);
    }
  };

  const filteredLabReports = useMemo(() => {
    return labReports.filter((report) => {
      const matchesType =
        reportTypeFilter === "ALL" || report.reportType === reportTypeFilter;
      const term = searchReport.toLowerCase().trim();
      const matchesSearch =
        !term ||
        report.title?.toLowerCase().includes(term) ||
        report.labName?.toLowerCase().includes(term) ||
        report.notes?.toLowerCase().includes(term);

      return matchesType && matchesSearch;
    });
  }, [labReports, reportTypeFilter, searchReport]);

  const formatFileSize = (bytes) => {
    if (!bytes) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "NORMAL":
        return (
          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-bold">
            Normal Findings
          </Badge>
        );
      case "ABNORMAL":
        return (
          <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-[10px] font-bold">
            Abnormal / Follow-up
          </Badge>
        );
      case "CRITICAL":
        return (
          <Badge className="bg-rose-50 text-rose-700 border-rose-200 text-[10px] font-bold">
            Critical Value
          </Badge>
        );
      default:
        return (
          <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-[10px] font-bold">
            Pending Review
          </Badge>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        <p className="text-sm font-semibold text-slate-500">Loading your medical records...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Medical Records & Lab Reports
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Secure digital vault for your blood tests, diagnostic imaging, prescriptions, and health history
          </p>
        </div>

        <Button
          onClick={() => setIsUploadOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl h-11 px-5 text-xs gap-2 shadow-md shadow-emerald-500/20 self-start sm:self-auto cursor-pointer"
        >
          <UploadCloud className="w-4 h-4" /> Upload Lab Report
        </Button>
      </div>

      {/* Quick Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border border-slate-200/80 shadow-xs bg-white rounded-3xl p-5">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Lab Reports
              </p>
              <p className="text-xl font-black text-slate-900 mt-0.5">
                {labReports.length} Uploaded
              </p>
            </div>
          </div>
        </Card>

        <Card className="border border-slate-200/80 shadow-xs bg-white rounded-3xl p-5">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
              <HeartPulse className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Blood Group
              </p>
              <p className="text-xl font-black text-slate-900 mt-0.5">
                {profile?.bloodGroup || "Not set"}
              </p>
            </div>
          </div>
        </Card>

        <Card className="border border-slate-200/80 shadow-xs bg-white rounded-3xl p-5">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Pill className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Prescriptions
              </p>
              <p className="text-xl font-black text-slate-900 mt-0.5">
                {prescriptions.length} Issued
              </p>
            </div>
          </div>
        </Card>

        <Card className="border border-slate-200/80 shadow-xs bg-white rounded-3xl p-5">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Consultations
              </p>
              <p className="text-xl font-black text-slate-900 mt-0.5">
                {appointments.length} Visits
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tab Navigation Strip */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab("LAB_REPORTS")}
          className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === "LAB_REPORTS"
              ? "bg-emerald-600 text-white shadow-sm shadow-emerald-500/20"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <FileCheck className="w-4 h-4" /> Lab Reports & Scans ({labReports.length})
        </button>

        <button
          onClick={() => setActiveTab("EHR_OVERVIEW")}
          className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === "EHR_OVERVIEW"
              ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Activity className="w-4 h-4" /> Vitals & Health History
        </button>
      </div>

      {/* TAB 1: Lab Reports & Scans */}
      {activeTab === "LAB_REPORTS" && (
        <div className="space-y-6">
          {/* Filter and Search Bar */}
          <Card className="border border-slate-200/80 shadow-xs rounded-3xl bg-white p-4">
            <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search reports by title, lab, notes..."
                  value={searchReport}
                  onChange={(e) => setSearchReport(e.target.value)}
                  className="pl-10 h-10 text-xs rounded-xl"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
                {REPORT_TYPE_FILTERS.map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setReportTypeFilter(f.key)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                      reportTypeFilter === f.key
                        ? "bg-slate-900 text-white shadow-xs"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </Card>

          {/* Reports Grid */}
          {filteredLabReports.length === 0 ? (
            <Card className="border border-slate-200/80 shadow-xs text-center py-16 bg-white rounded-3xl">
              <CardContent className="space-y-4">
                <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                  <FileCheck className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-slate-900">
                    {searchReport || reportTypeFilter !== "ALL"
                      ? "No Matching Reports Found"
                      : "No Lab Reports Uploaded Yet"}
                  </h3>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    {searchReport || reportTypeFilter !== "ALL"
                      ? "Try changing your search term or report category filter."
                      : "Upload your blood tests, X-rays, MRI scans, or pathology reports so you and your doctors have instant access."}
                  </p>
                </div>
                <Button
                  onClick={() => setIsUploadOpen(true)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl h-10 px-6 text-xs gap-2 shadow-md shadow-emerald-500/20 cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Upload First Report
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredLabReports.map((report) => {
                const isPdf = report.fileType?.includes("pdf");
                const formattedDate = new Date(report.testDate).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                });

                return (
                  <Card
                    key={report._id}
                    className="border border-slate-200/80 shadow-xs hover:shadow-md transition-all rounded-3xl bg-white overflow-hidden flex flex-col justify-between"
                  >
                    <div className="p-5 space-y-3.5">
                      {/* Top bar: Category Badge + Status */}
                      <div className="flex items-center justify-between gap-2">
                        <Badge className="bg-slate-100 text-slate-700 text-[10px] font-bold">
                          {report.reportType.replace(/_/g, " ")}
                        </Badge>
                        {getStatusBadge(report.status)}
                      </div>

                      {/* Title & Lab Name */}
                      <div>
                        <h4 className="text-base font-bold text-slate-900 line-clamp-1">
                          {report.title}
                        </h4>
                        {report.labName && (
                          <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                            <Building2 className="w-3.5 h-3.5 text-slate-400" />
                            {report.labName}
                          </p>
                        )}
                      </div>

                      {/* Meta Pills */}
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="inline-flex items-center gap-1 font-semibold text-slate-600 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-100">
                          <Calendar className="w-3 h-3 text-emerald-600" />
                          {formattedDate}
                        </span>
                        <span className="inline-flex items-center gap-1 font-semibold text-slate-600 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-100">
                          <FileText className="w-3 h-3 text-slate-400" />
                          {isPdf ? "PDF" : "Image"} • {formatFileSize(report.fileSize)}
                        </span>
                      </div>

                      {/* Doctor Shared With */}
                      {report.doctor && (
                        <div className="p-2.5 bg-blue-50/50 rounded-xl border border-blue-100 text-[11px] text-blue-900 flex items-center gap-2">
                          <Stethoscope className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span>
                            Shared with Dr. {report.doctor.firstName} {report.doctor.lastName}
                          </span>
                        </div>
                      )}

                      {/* Notes snippet */}
                      {report.notes && (
                        <p className="text-[11px] text-slate-500 line-clamp-2 italic bg-slate-50 p-2 rounded-xl border border-slate-100/70">
                          "{report.notes}"
                        </p>
                      )}
                    </div>

                    {/* Bottom Action Footer */}
                    <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setPreviewReport(report)}
                          className="h-8 px-2.5 text-xs text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl font-bold gap-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" /> View
                        </Button>

                        <a
                          href={report.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          download={report.fileName}
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2.5 text-xs text-slate-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl font-bold gap-1 cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5" /> Download
                          </Button>
                        </a>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={deletingId === report._id}
                        onClick={() => handleDeleteReport(report._id, report.title)}
                        className="h-8 px-2 text-xs text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl cursor-pointer"
                      >
                        {deletingId === report._id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Vitals & EHR Overview */}
      {activeTab === "EHR_OVERVIEW" && (
        <div className="space-y-8">
          {/* Vitals Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border border-slate-200/80 shadow-xs bg-white rounded-3xl p-6">
              <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-600" /> Physical Vitals
              </h3>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Height</span>
                  <span className="font-bold text-slate-900">
                    {profile?.height?.value ? `${profile.height.value} ${profile.height.unit}` : "Not recorded"}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Weight</span>
                  <span className="font-bold text-slate-900">
                    {profile?.weight?.value ? `${profile.weight.value} ${profile.weight.unit}` : "Not recorded"}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Blood Pressure</span>
                  <span className="font-bold text-slate-900">
                    {profile?.bloodPressure || "120/80 mmHg (Normal)"}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-slate-500 font-medium">Blood Group</span>
                  <span className="font-bold text-slate-900">
                    {profile?.bloodGroup || "Not recorded"}
                  </span>
                </div>
              </div>
            </Card>

            <Card className="border border-slate-200/80 shadow-xs bg-white rounded-3xl p-6">
              <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-600" /> Allergies & Chronic Conditions
              </h3>
              <div className="space-y-4 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Known Allergies
                  </span>
                  {profile?.allergies?.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {profile.allergies.map((a, i) => (
                        <Badge key={i} className="bg-amber-50 text-amber-800 border-amber-200">
                          {a}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-400 italic">No known allergies reported.</p>
                  )}
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Medical Conditions
                  </span>
                  {profile?.medicalConditions?.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {profile.medicalConditions.map((c, i) => (
                        <Badge key={i} className="bg-red-50 text-red-800 border-red-200">
                          {c}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-400 italic">No chronic medical conditions recorded.</p>
                  )}
                </div>
              </div>
            </Card>
          </div>

          {/* Recent Consultations */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900">Recent Consultations</h3>
              <Link
                to="/patient/appointments"
                className="text-xs text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1"
              >
                View All Consultations <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {appointments.length === 0 ? (
              <Card className="border border-slate-200/80 shadow-xs text-center py-12 bg-white rounded-3xl">
                <CardContent>
                  <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-700">No consultation records</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Book your first doctor appointment to start your health history
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {appointments.slice(0, 4).map((appt) => (
                  <Card
                    key={appt._id}
                    className="border border-slate-200/80 shadow-xs bg-white rounded-3xl p-5 hover:shadow-md transition space-y-3"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">
                          Dr. {appt.doctor?.firstName} {appt.doctor?.lastName}
                        </h4>
                        <p className="text-xs text-slate-500">
                          {appt.doctor?.specialization || "General Physician"}
                        </p>
                      </div>
                      <Badge className="text-xs">{appt.status}</Badge>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-2xl text-xs space-y-1 border border-slate-100">
                      <span className="text-slate-400 font-semibold uppercase text-[10px]">Reason</span>
                      <p className="text-slate-800 font-medium">{appt.reason || "General Consultation"}</p>
                    </div>

                    <div className="flex justify-between items-center text-xs text-slate-500 pt-2 border-t border-slate-100">
                      <span>{new Date(appt.appointmentDate).toLocaleDateString()}</span>
                      <span>
                        {appt.slot?.start} - {appt.slot?.end}
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Upload Modal */}
      <LabReportUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        doctors={doctorsList}
        onSuccess={(newReport) => {
          setLabReports((prev) => [newReport, ...prev]);
        }}
      />

      {/* Preview Modal */}
      {previewReport && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <Card className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl border-0 overflow-hidden flex flex-col max-h-[92vh]">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
                  Diagnostic Report Preview
                </span>
                <h3 className="text-base font-black text-slate-900">{previewReport.title}</h3>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={previewReport.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-100"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Full View
                </a>
                <button
                  onClick={() => setPreviewReport(null)}
                  className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl text-lg cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-4 flex-1 overflow-y-auto flex items-center justify-center bg-slate-100/50 min-h-[400px]">
              {previewReport.fileType?.includes("pdf") ? (
                <iframe
                  src={previewReport.fileUrl}
                  title={previewReport.title}
                  className="w-full h-[550px] rounded-2xl border border-slate-200"
                />
              ) : (
                <img
                  src={previewReport.fileUrl}
                  alt={previewReport.title}
                  className="max-h-[550px] w-auto max-w-full rounded-2xl object-contain shadow-sm"
                />
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>
                Uploaded on {new Date(previewReport.createdAt).toLocaleDateString()} •{" "}
                {formatFileSize(previewReport.fileSize)}
              </span>
              <Button
                onClick={() => setPreviewReport(null)}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl h-9 px-5 text-xs cursor-pointer"
              >
                Close Preview
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}