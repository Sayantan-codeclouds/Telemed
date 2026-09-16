import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Calendar as CalendarIcon,
  Clock,
  Video,
  FileText,
  Search,
  Loader2,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Eye,
  Check,
  X,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import doctorApi from "@/api/doctorApi";
import { useCurrency } from "@/contexts/CurrencyContext";
import { getProfileImageUrl } from "@/utils/imageUrl";

const STATUS_TABS = [
  { key: "TODAY", label: "Today's Visits" },
  { key: "UPCOMING", label: "Upcoming & Confirmed" },
  { key: "PENDING", label: "Pending Requests" },
  { key: "COMPLETED", label: "Completed Consultations" },
  { key: "ALL", label: "All History" },
];

export default function DoctorAppointments() {
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("TODAY");
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [patientLabReports, setPatientLabReports] = useState([]);
  const [loadingLabReports, setLoadingLabReports] = useState(false);

  const fetchAppointments = async () => {
    try {
      const res = await doctorApi.get("/appointments/doctor");
      setAppointments(res.data?.data || []);
    } catch (err) {
      console.error("Failed to load appointments:", err);
      toast.error("Failed to load clinical appointments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  useEffect(() => {
    if (selectedAppointment?.patient?._id) {
      const fetchPatientReports = async () => {
        setLoadingLabReports(true);
        try {
          const res = await doctorApi.get(
            `/lab-reports/doctor/patient/${selectedAppointment.patient._id}`
          );
          setPatientLabReports(res.data?.data || []);
        } catch (err) {
          console.error("Failed to load patient lab reports:", err);
          setPatientLabReports([]);
        } finally {
          setLoadingLabReports(false);
        }
      };
      fetchPatientReports();
    } else {
      setPatientLabReports([]);
    }
  }, [selectedAppointment]);

  const handleStatusUpdate = async (appointmentId, newStatus) => {
    setUpdatingId(appointmentId);
    try {
      await doctorApi.patch(`/appointments/${appointmentId}/status`, {
        status: newStatus,
      });
      toast.success(`Appointment ${newStatus.toLowerCase()} successfully.`);
      setAppointments((prev) =>
        prev.map((appt) =>
          appt._id === appointmentId ? { ...appt, status: newStatus } : appt
        )
      );
      if (selectedAppointment?._id === appointmentId) {
        setSelectedAppointment((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update appointment status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const counts = useMemo(() => {
    const todayStr = new Date().toDateString();
    return {
      TODAY: appointments.filter(
        (a) => new Date(a.appointmentDate).toDateString() === todayStr
      ).length,
      UPCOMING: appointments.filter(
        (a) => a.status === "CONFIRMED" || a.status === "IN_PROGRESS"
      ).length,
      PENDING: appointments.filter((a) => a.status === "PENDING").length,
      COMPLETED: appointments.filter((a) => a.status === "COMPLETED").length,
      ALL: appointments.length,
    };
  }, [appointments]);

  const filteredAppointments = useMemo(() => {
    const todayStr = new Date().toDateString();

    return appointments.filter((appt) => {
      const term = search.toLowerCase().trim();
      const patientName = `${appt.patient?.firstName || ""} ${appt.patient?.lastName || ""}`.toLowerCase();
      const reasonText = (appt.reason || "").toLowerCase();

      const matchesSearch =
        !term || patientName.includes(term) || reasonText.includes(term);

      let matchesTab = true;
      if (activeTab === "TODAY") {
        matchesTab = new Date(appt.appointmentDate).toDateString() === todayStr;
      } else if (activeTab === "UPCOMING") {
        matchesTab = appt.status === "CONFIRMED" || appt.status === "IN_PROGRESS";
      } else if (activeTab === "ALL") {
        matchesTab = true;
      } else {
        matchesTab = appt.status === activeTab;
      }

      return matchesSearch && matchesTab;
    });
  }, [appointments, activeTab, search]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        <p className="text-sm font-semibold text-slate-500">Loading Clinical Appointments...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16">
      {/* Executive Header Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-slate-950 via-blue-950 to-indigo-950 text-white p-8 sm:p-10 border border-slate-800 shadow-xl shadow-slate-950/20">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-cyan-300 text-xs font-semibold border border-white/10 backdrop-blur-md">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Doctor Clinical Schedule & Appointments
            </div>

            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              Patient Consultations
            </h1>

            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Review and accept patient requests, launch encrypted video consultation rooms, and issue digital prescriptions.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-3">
            <Link to="/doctor/availability">
              <Button className="bg-white text-slate-950 hover:bg-blue-50 font-bold rounded-2xl h-11 px-5 text-xs sm:text-sm shadow-md gap-2">
                <Clock className="w-4 h-4 text-blue-600" /> Edit Working Hours
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Status Tabs Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <button
          onClick={() => setActiveTab("TODAY")}
          className={`p-4 rounded-3xl border text-left transition-all cursor-pointer ${
            activeTab === "TODAY"
              ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20 scale-101"
              : "bg-white text-slate-800 border-slate-200 hover:border-blue-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider opacity-80">
              Today's Queue
            </span>
            <CalendarIcon className="w-4 h-4" />
          </div>
          <p className="text-2xl font-black mt-1">{counts.TODAY}</p>
        </button>

        <button
          onClick={() => setActiveTab("PENDING")}
          className={`p-4 rounded-3xl border text-left transition-all cursor-pointer ${
            activeTab === "PENDING"
              ? "bg-amber-600 text-white border-amber-600 shadow-md shadow-amber-500/20 scale-101"
              : "bg-white text-slate-800 border-slate-200 hover:border-amber-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider opacity-80">
              Pending Requests
            </span>
            <Clock className="w-4 h-4" />
          </div>
          <p className="text-2xl font-black mt-1">{counts.PENDING}</p>
        </button>

        <button
          onClick={() => setActiveTab("UPCOMING")}
          className={`p-4 rounded-3xl border text-left transition-all cursor-pointer ${
            activeTab === "UPCOMING"
              ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20 scale-101"
              : "bg-white text-slate-800 border-slate-200 hover:border-indigo-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider opacity-80">
              Upcoming & Confirmed
            </span>
            <Video className="w-4 h-4" />
          </div>
          <p className="text-2xl font-black mt-1">{counts.UPCOMING}</p>
        </button>

        <button
          onClick={() => setActiveTab("COMPLETED")}
          className={`p-4 rounded-3xl border text-left transition-all cursor-pointer ${
            activeTab === "COMPLETED"
              ? "bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-500/20 scale-101"
              : "bg-white text-slate-800 border-slate-200 hover:border-emerald-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider opacity-80">
              Completed Visits
            </span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <p className="text-2xl font-black mt-1">{counts.COMPLETED}</p>
        </button>
      </div>

      {/* Search Bar & Tab Strip */}
      <Card className="border border-slate-200/80 shadow-xs rounded-3xl bg-white p-4">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search by patient name, reason..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-10 rounded-xl"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  activeTab === tab.key
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Appointment Cards List */}
      {filteredAppointments.length === 0 ? (
        <Card className="border border-slate-200/80 shadow-xs text-center py-20 bg-white rounded-3xl">
          <CardContent className="space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
              <CalendarIcon className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-slate-900">No Appointments in Queue</h2>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {search
                  ? "No consultations matched your search term."
                  : `No appointments found under the "${STATUS_TABS.find((t) => t.key === activeTab)?.label}" tab.`}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredAppointments.map((appt) => {
            const isConfirmed = appt.status === "CONFIRMED" || appt.status === "IN_PROGRESS";
            const isPending = appt.status === "PENDING";
            const isCompleted = appt.status === "COMPLETED";
            const isCancelled = appt.status === "CANCELLED" || appt.status === "REJECTED";
            const isUpdating = updatingId === appt._id;

            return (
              <Card
                key={appt._id}
                className="border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 rounded-3xl bg-white overflow-hidden"
              >
                <CardContent className="p-6 sm:p-7">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    {/* Left: Patient & Schedule Info */}
                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 items-start">
                      <img
                        src={getProfileImageUrl(
                          appt.patient?.profileImage,
                          `${appt.patient?.firstName || "Patient"} ${appt.patient?.lastName || ""}`,
                          "0284c7"
                        )}
                        alt="Patient"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(appt.patient?.firstName || "Patient")}+${encodeURIComponent(appt.patient?.lastName || "")}&background=0284c7&color=fff&size=150`;
                        }}
                        className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-slate-100 shadow-sm shrink-0"
                      />

                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg sm:text-xl font-black text-slate-900">
                            {appt.patient?.firstName} {appt.patient?.lastName || "Patient"}
                          </h3>
                          <Badge className="bg-slate-100 text-slate-700 text-[10px] font-bold">
                            {appt.patient?.gender || "Patient"} • {appt.patient?.bloodGroup || "Blood Group O+"}
                          </Badge>
                          {appt.isRescheduled && (
                            <Badge className="bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-bold">
                              Rescheduled
                            </Badge>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
                          <span className="inline-flex items-center gap-1.5 font-bold text-slate-700 bg-slate-50 px-3 py-1 rounded-xl border border-slate-100">
                            <CalendarIcon className="w-3.5 h-3.5 text-blue-600" />
                            {new Date(appt.appointmentDate).toLocaleDateString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>

                          <span className="inline-flex items-center gap-1.5 font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-xl border border-indigo-100">
                            <Clock className="w-3.5 h-3.5 text-indigo-600" />
                            {appt.slot?.start} - {appt.slot?.end}
                          </span>

                          <span className="text-slate-500 font-semibold">
                            Fee: {formatPrice(appt.consultationFee ?? 500)}
                          </span>

                          {appt.vrioOrderId && (
                            <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200 text-[11px]">
                              <ShieldCheck className="w-3 h-3 text-emerald-600" />
                              Paid • Order #{appt.vrioOrderId}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Status Pill & Action Buttons */}
                    <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-4 shrink-0 border-t lg:border-t-0 pt-4 lg:pt-0 border-slate-100">
                      {/* Status Badge */}
                      <Badge
                        className={`text-xs font-bold px-3 py-1 border gap-1.5 ${
                          isConfirmed
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : isPending
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : isCompleted
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-rose-50 text-rose-700 border-rose-200"
                        }`}
                      >
                        {isConfirmed && <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />}
                        {isPending && <Clock className="w-3 h-3" />}
                        {isCompleted && <CheckCircle2 className="w-3 h-3" />}
                        {isCancelled && <XCircle className="w-3 h-3" />}
                        {appt.status}
                      </Badge>

                      {/* Actions */}
                      <div className="flex flex-wrap items-center gap-2">
                        {isPending && (
                          <>
                            <Button
                              disabled={isUpdating}
                              onClick={() => handleStatusUpdate(appt._id, "CONFIRMED")}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl h-10 px-4 text-xs gap-1.5 shadow-sm shadow-emerald-500/20"
                            >
                              <Check className="w-3.5 h-3.5" /> Accept Request
                            </Button>

                            <Button
                              variant="outline"
                              disabled={isUpdating}
                              onClick={() => handleStatusUpdate(appt._id, "REJECTED")}
                              className="border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl h-10 px-4 text-xs font-bold gap-1.5"
                            >
                              <X className="w-3.5 h-3.5" /> Decline
                            </Button>
                          </>
                        )}

                        {isConfirmed && (
                          <Button
                            onClick={() => navigate(`/doctor/consultation/${appt._id}`)}
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl h-10 px-5 text-xs gap-1.5 shadow-md shadow-blue-500/20 animate-pulse"
                          >
                            <Video className="w-4 h-4" /> Join Video Call ➔
                          </Button>
                        )}

                        {isCompleted && (
                          <Link to={`/doctor/prescriptions?appointmentId=${appt._id}`}>
                            <Button className="bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl h-10 px-4 text-xs gap-1.5 shadow-sm shadow-purple-500/20">
                              <FileText className="w-4 h-4" /> View Prescription
                            </Button>
                          </Link>
                        )}

                        <Button
                          variant="ghost"
                          onClick={() => setSelectedAppointment(appt)}
                          className="h-10 px-3 text-xs text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl font-bold gap-1"
                        >
                          <Eye className="w-4 h-4" /> Details
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Clinical Reason Callout */}
                  {appt.reason && (
                    <div className="mt-4 p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-600 space-y-0.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Chief Complaint / Symptoms
                      </span>
                      <p className="text-slate-800 font-medium line-clamp-2">{appt.reason}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Appointment Details Modal */}
      {selectedAppointment && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border-0 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">
                  Patient Consultation Record
                </span>
                <h3 className="text-lg font-black text-slate-900">
                  Appointment #{selectedAppointment._id.slice(-6).toUpperCase()}
                </h3>
              </div>
              <button
                onClick={() => setSelectedAppointment(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              {/* Patient Details */}
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <img
                  src={getProfileImageUrl(
                    selectedAppointment.patient?.profileImage,
                    `${selectedAppointment.patient?.firstName || "Patient"} ${selectedAppointment.patient?.lastName || ""}`,
                    "0284c7"
                  )}
                  alt="Patient"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedAppointment.patient?.firstName || "Patient")}+${encodeURIComponent(selectedAppointment.patient?.lastName || "")}&background=0284c7&color=fff&size=150`;
                  }}
                  className="w-14 h-14 rounded-2xl object-cover"
                />
                <div className="space-y-0.5">
                  <p className="font-bold text-slate-900 text-sm">
                    {selectedAppointment.patient?.firstName} {selectedAppointment.patient?.lastName}
                  </p>
                  <p className="text-slate-500 font-medium">{selectedAppointment.patient?.email}</p>
                  <p className="text-slate-500">{selectedAppointment.patient?.phone}</p>
                </div>
              </div>

              {/* Schedule Info */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Appointment Date</span>
                  <p className="font-bold text-slate-900">
                    {new Date(selectedAppointment.appointmentDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Time Window</span>
                  <p className="font-bold text-indigo-600">
                    {selectedAppointment.slot?.start} - {selectedAppointment.slot?.end}
                  </p>
                </div>
              </div>

              {/* Reason */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Chief Complaint</span>
                <p className="text-slate-800 font-medium leading-relaxed">
                  {selectedAppointment.reason || "General medical consultation"}
                </p>
              </div>

              {/* Reschedule History */}
              {selectedAppointment.rescheduleHistory?.length > 0 && (
                <div className="p-3.5 bg-purple-50/60 rounded-2xl border border-purple-100 space-y-2">
                  <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider block">
                    Rescheduled by Patient ({selectedAppointment.rescheduleHistory.length} times)
                  </span>
                  <div className="space-y-1.5">
                    {selectedAppointment.rescheduleHistory.map((item, idx) => (
                      <div
                        key={idx}
                        className="text-[11px] bg-white p-2 rounded-xl border border-purple-100 text-slate-700 flex flex-col gap-0.5"
                      >
                        <div className="flex items-center justify-between font-bold">
                          <span>
                            Original Slot: {new Date(item.previousDate).toLocaleDateString()} (
                            {item.previousSlot?.start})
                          </span>
                          <span className="text-[10px] text-slate-400 font-normal">
                            {new Date(item.rescheduledAt).toLocaleDateString()}
                          </span>
                        </div>
                        {item.reason && (
                          <p className="text-slate-500 italic text-[10px]">Reason: {item.reason}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Patient Lab Reports Section */}
              <div className="p-3.5 bg-emerald-50/40 rounded-2xl border border-emerald-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                    Patient Lab Reports & Scans
                  </span>
                  {patientLabReports.length > 0 && (
                    <Badge className="bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      {patientLabReports.length} available
                    </Badge>
                  )}
                </div>

                {loadingLabReports ? (
                  <div className="py-3 flex items-center justify-center text-xs text-slate-400">
                    <Loader2 className="w-4 h-4 animate-spin mr-2 text-emerald-600" />
                    Checking records...
                  </div>
                ) : patientLabReports.length === 0 ? (
                  <p className="text-[11px] text-slate-400 italic">
                    No lab reports uploaded by this patient yet.
                  </p>
                ) : (
                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                    {patientLabReports.map((report) => (
                      <div
                        key={report._id}
                        className="p-2 bg-white rounded-xl border border-slate-100 flex items-center justify-between gap-2"
                      >
                        <div className="overflow-hidden">
                          <p className="font-bold text-slate-800 truncate text-[11px]">
                            {report.title}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {new Date(report.testDate).toLocaleDateString()} • {report.reportType.replace(/_/g, " ")}
                          </p>
                        </div>
                        <a
                          href={report.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-lg text-[10px] shrink-0 border border-emerald-200"
                        >
                          View ➔
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Status */}
              <div className="flex items-center justify-between p-3.5 bg-blue-50/50 rounded-2xl border border-blue-100">
                <span className="font-bold text-slate-700">Current Status:</span>
                <Badge className="font-bold text-xs">{selectedAppointment.status}</Badge>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
              <Button
                onClick={() => setSelectedAppointment(null)}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl h-10 px-5 text-xs"
              >
                Close
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}