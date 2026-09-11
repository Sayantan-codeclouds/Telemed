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
  AlertCircle,
  Stethoscope,
  Building2,
  IndianRupee,
  ChevronRight,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Eye,
  Trash2,
  Bot,
  Star,
  Receipt,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import api from "@/api/axios";
import DoctorReviewModal from "@/components/patient/DoctorReviewModal";
import RescheduleModal from "@/components/patient/RescheduleModal";
import { useCurrency } from "@/contexts/CurrencyContext";
import { getProfileImageUrl } from "@/utils/imageUrl";

const STATUS_TABS = [
  { key: "ALL", label: "All Consultations" },
  { key: "UPCOMING", label: "Upcoming & Active" },
  { key: "PENDING", label: "Pending Doctor Review" },
  { key: "COMPLETED", label: "Completed Visits" },
  { key: "CANCELLED", label: "Cancelled" },
];

export default function Appointments() {
  const navigate = useNavigate();
  const { formatPrice, currencySign } = useCurrency();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("ALL");
  const [search, setSearch] = useState("");
  const [cancellingId, setCancellingId] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [reviewModalAppointment, setReviewModalAppointment] = useState(null);
  const [rescheduleAppointment, setRescheduleAppointment] = useState(null);
  const [myReviews, setMyReviews] = useState([]);

  const fetchAppointments = async () => {
    try {
      const res = await api.get("/appointments/patient");
      setAppointments(res.data?.data || []);
    } catch (err) {
      console.error("Failed to load appointments:", err);
      toast.error("Failed to load appointments.");
    } finally {
      setLoading(false);
    }
  };

  const fetchPatientReviews = async () => {
    try {
      const res = await api.get("/reviews/my-reviews");
      setMyReviews(res.data?.data || []);
    } catch {
      // Quiet fail
    }
  };

  useEffect(() => {
    fetchAppointments();
    fetchPatientReviews();
  }, []);

  const getExistingReview = (appt) => {
    if (!appt || !myReviews || myReviews.length === 0) return null;
    return myReviews.find(
      (r) =>
        (r.appointment && String(r.appointment?._id || r.appointment) === String(appt._id)) ||
        String(r.doctor?._id || r.doctor) === String(appt.doctor?._id || appt.doctor)
    );
  };

  const handleCancelAppointment = async (appointmentId, doctorName) => {
    if (!window.confirm(`Are you sure you want to cancel your consultation with Dr. ${doctorName}?`)) {
      return;
    }

    setCancellingId(appointmentId);
    try {
      await api.patch(`/appointments/${appointmentId}/cancel`);
      toast.success("Appointment cancelled successfully.");
      setAppointments((prev) =>
        prev.map((appt) =>
          appt._id === appointmentId ? { ...appt, status: "CANCELLED" } : appt
        )
      );
      if (selectedAppointment?._id === appointmentId) {
        setSelectedAppointment((prev) => ({ ...prev, status: "CANCELLED" }));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to cancel appointment.");
    } finally {
      setCancellingId(null);
    }
  };

  const counts = useMemo(() => {
    return {
      ALL: appointments.length,
      UPCOMING: appointments.filter(
        (a) => a.status === "CONFIRMED" || a.status === "IN_PROGRESS"
      ).length,
      PENDING: appointments.filter((a) => a.status === "PENDING").length,
      COMPLETED: appointments.filter((a) => a.status === "COMPLETED").length,
      CANCELLED: appointments.filter(
        (a) => a.status === "CANCELLED" || a.status === "REJECTED"
      ).length,
    };
  }, [appointments]);

  const filteredAppointments = useMemo(() => {
    return appointments.filter((appt) => {
      const term = search.toLowerCase().trim();
      const docName = `${appt.doctor?.firstName || ""} ${appt.doctor?.lastName || ""}`.toLowerCase();
      const spec = (appt.doctor?.specialization || "").toLowerCase();
      const reasonText = (appt.reason || "").toLowerCase();

      const matchesSearch =
        !term || docName.includes(term) || spec.includes(term) || reasonText.includes(term);

      let matchesTab = true;
      if (activeTab === "UPCOMING") {
        matchesTab = appt.status === "CONFIRMED" || appt.status === "IN_PROGRESS";
      } else if (activeTab === "CANCELLED") {
        matchesTab = appt.status === "CANCELLED" || appt.status === "REJECTED";
      } else if (activeTab !== "ALL") {
        matchesTab = appt.status === activeTab;
      }

      return matchesSearch && matchesTab;
    });
  }, [appointments, activeTab, search]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        <p className="text-sm font-semibold text-slate-500">Loading your consultations...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Executive Header Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-8 sm:p-10 border border-slate-800 shadow-xl shadow-blue-950/20">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-cyan-300 text-xs font-semibold border border-white/10 backdrop-blur-md">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              TeleClinic Encrypted Telehealth Portal
            </div>

            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              My Consultations
            </h1>

            <p className="text-blue-100 text-xs sm:text-sm leading-relaxed">
              Track upcoming video appointments, join encrypted consultation rooms, and review digital prescriptions.
            </p>
          </div>

          <div className="shrink-0">
            <Link to="/patient/doctors">
              <Button className="bg-white text-blue-950 hover:bg-blue-50 font-bold rounded-2xl h-12 px-6 text-xs sm:text-sm shadow-lg gap-2">
                <Stethoscope className="w-4 h-4 text-blue-600" /> Book New Consultation <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Status Tabs Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <button
          onClick={() => setActiveTab("UPCOMING")}
          className={`p-4 rounded-3xl border text-left transition-all cursor-pointer ${
            activeTab === "UPCOMING"
              ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20 scale-101"
              : "bg-white text-slate-800 border-slate-200 hover:border-blue-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider opacity-80">
              Upcoming Visits
            </span>
            <Video className="w-4 h-4" />
          </div>
          <p className="text-2xl font-black mt-1">{counts.UPCOMING}</p>
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
              Pending Review
            </span>
            <Clock className="w-4 h-4" />
          </div>
          <p className="text-2xl font-black mt-1">{counts.PENDING}</p>
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

        <button
          onClick={() => setActiveTab("ALL")}
          className={`p-4 rounded-3xl border text-left transition-all cursor-pointer ${
            activeTab === "ALL"
              ? "bg-slate-900 text-white border-slate-900 shadow-md scale-101"
              : "bg-white text-slate-800 border-slate-200 hover:border-slate-400"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider opacity-80">
              Total History
            </span>
            <CalendarIcon className="w-4 h-4" />
          </div>
          <p className="text-2xl font-black mt-1">{counts.ALL}</p>
        </button>
      </div>

      {/* Search Bar & Tab Strip */}
      <Card className="border border-slate-200/80 shadow-xs rounded-3xl bg-white p-4">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search by doctor, specialization, reason..."
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
              <h2 className="text-xl font-bold text-slate-900">No Consultations Found</h2>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {search
                  ? "No consultations matched your search term."
                  : `You don't have any appointments in the "${STATUS_TABS.find((t) => t.key === activeTab)?.label}" tab.`}
              </p>
            </div>
            <Link to="/patient/doctors">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl h-11 px-6 text-xs mt-2 gap-2">
                <Stethoscope className="w-4 h-4" /> Find Doctors & Book Visit
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredAppointments.map((appt) => {
            const isConfirmed = appt.status === "CONFIRMED" || appt.status === "IN_PROGRESS";
            const isPending = appt.status === "PENDING";
            const isCompleted = appt.status === "COMPLETED";
            const isCancelled = appt.status === "CANCELLED" || appt.status === "REJECTED";
            const isCancelling = cancellingId === appt._id;

            return (
              <Card
                key={appt._id}
                className="border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 rounded-3xl bg-white overflow-hidden"
              >
                <CardContent className="p-6 sm:p-7">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    {/* Left: Doctor & Schedule Info */}
                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 items-start">
                      <img
                        src={getProfileImageUrl(
                          appt.doctor?.profileImage,
                          `${appt.doctor?.firstName || "Dr"} ${appt.doctor?.lastName || ""}`,
                          "0284c7"
                        )}
                        alt={`Dr. ${appt.doctor?.firstName || "Doctor"}`}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(appt.doctor?.firstName || "Dr")}+${encodeURIComponent(appt.doctor?.lastName || "")}&background=0284c7&color=fff&size=150`;
                        }}
                        className="w-20 h-20 sm:w-22 sm:h-22 rounded-2xl object-cover border-2 border-slate-100 shadow-sm shrink-0"
                      />

                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg sm:text-xl font-black text-slate-900">
                            Dr. {appt.doctor?.firstName} {appt.doctor?.lastName}
                          </h3>
                          <Badge className="bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold">
                            {appt.doctor?.specialization || "General Physician"}
                          </Badge>
                          {appt.isRescheduled && (
                            <Badge className="bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-bold">
                              Rescheduled
                            </Badge>
                          )}
                        </div>

                        <p className="text-xs text-slate-500 flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          {appt.doctor?.hospital || "Apollo TeleClinic Network"}
                        </p>

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

                          <span className="text-slate-400 font-semibold">
                            Fee: {formatPrice(appt.consultationFee || appt.doctor?.consultationFee || 500)}
                          </span>

                          {appt.vrioOrderId && (
                            <Link
                              to="/patient/orders"
                              className="inline-flex items-center gap-1.5 font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-xl border border-emerald-200 text-[11px] transition shadow-2xs cursor-pointer"
                              title="Click to view official receipt & payment invoice"
                            >
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Paid • Vrio #{appt.vrioOrderId}</span>
                              <Receipt className="w-3 h-3 text-emerald-600 ml-0.5" />
                            </Link>
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

                      {/* Action Buttons */}
                      <div className="flex flex-wrap items-center gap-2">
                        {isConfirmed && (
                          <Button
                            onClick={() => navigate(`/patient/consultation/${appt._id}`)}
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl h-10 px-4 text-xs gap-1.5 shadow-md shadow-blue-500/20 animate-pulse"
                          >
                            <Video className="w-4 h-4" /> Enter Consultation Room ➔
                          </Button>
                        )}

                        {isCompleted && (
                          <>
                            {(() => {
                              const existing = getExistingReview(appt);
                              return (
                                <Button
                                  onClick={() => setReviewModalAppointment(appt)}
                                  className={`font-bold rounded-xl h-10 px-3.5 text-xs gap-1.5 shadow-sm cursor-pointer ${
                                    existing
                                      ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20"
                                      : "bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-amber-500/20"
                                  }`}
                                >
                                  {existing ? (
                                    <>
                                      <Star className="w-3.5 h-3.5 fill-white text-white" /> ✓ Reviewed ({existing.rating}★)
                                    </>
                                  ) : (
                                    <>
                                      <Star className="w-3.5 h-3.5 fill-slate-950 text-slate-950" /> Rate & Review
                                    </>
                                  )}
                                </Button>
                              );
                            })()}
                            <Link to={`/patient/prescriptions?appointmentId=${appt._id}`}>
                              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl h-10 px-4 text-xs gap-1.5 shadow-sm shadow-emerald-500/20">
                                <FileText className="w-4 h-4" /> View Prescription
                              </Button>
                            </Link>
                          </>
                        )}

                        {/* Reschedule button for Pending or Confirmed visits */}
                        {(isPending || isConfirmed) && (
                          <Button
                            variant="outline"
                            onClick={() => setRescheduleAppointment(appt)}
                            className="border-indigo-200 text-indigo-700 hover:bg-indigo-50 rounded-xl h-10 px-3.5 text-xs font-bold gap-1.5"
                          >
                            <CalendarIcon className="w-3.5 h-3.5 text-indigo-600" />
                            Reschedule
                          </Button>
                        )}

                        {isPending && (
                          <Button
                            variant="outline"
                            disabled={isCancelling}
                            onClick={() =>
                              handleCancelAppointment(
                                appt._id,
                                `${appt.doctor?.firstName} ${appt.doctor?.lastName}`
                              )
                            }
                            className="border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl h-10 px-4 text-xs font-bold gap-1.5"
                          >
                            {isCancelling ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
                            Cancel Request
                          </Button>
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

                  {/* Consultation Reason Cardlet */}
                  {appt.reason && (
                    <div className="mt-4 p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-600 space-y-0.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Reason for Visit
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
                  Consultation Summary
                </span>
                <h3 className="text-lg font-black text-slate-900">
                  Appointment Reference #{selectedAppointment._id.slice(-6).toUpperCase()}
                </h3>
              </div>
              <button
                onClick={() => setSelectedAppointment(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg text-lg"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              {/* Doctor Details */}
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <img
                  src={getProfileImageUrl(
                    selectedAppointment.doctor?.profileImage,
                    `${selectedAppointment.doctor?.firstName || "Dr"} ${selectedAppointment.doctor?.lastName || ""}`,
                    "0284c7"
                  )}
                  alt={`Dr. ${selectedAppointment.doctor?.firstName || "Doctor"}`}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedAppointment.doctor?.firstName || "Dr")}+${encodeURIComponent(selectedAppointment.doctor?.lastName || "")}&background=0284c7&color=fff&size=150`;
                  }}
                  className="w-14 h-14 rounded-2xl object-cover"
                />
                <div className="space-y-0.5">
                  <p className="font-bold text-slate-900 text-sm">
                    Dr. {selectedAppointment.doctor?.firstName} {selectedAppointment.doctor?.lastName}
                  </p>
                  <p className="text-blue-600 font-bold">{selectedAppointment.doctor?.specialization}</p>
                  <p className="text-slate-500">{selectedAppointment.doctor?.hospital}</p>
                </div>
              </div>

              {/* Schedule Info */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Consultation Date</span>
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
                <span className="text-[10px] font-bold text-slate-400 uppercase">Clinical Symptoms / Reason</span>
                <p className="text-slate-800 font-medium leading-relaxed">
                  {selectedAppointment.reason || "General health consultation"}
                </p>
              </div>

              {/* Reschedule History */}
              {selectedAppointment.rescheduleHistory?.length > 0 && (
                <div className="p-3.5 bg-purple-50/60 rounded-2xl border border-purple-100 space-y-2">
                  <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider block">
                    Reschedule History ({selectedAppointment.rescheduleHistory.length})
                  </span>
                  <div className="space-y-1.5">
                    {selectedAppointment.rescheduleHistory.map((item, idx) => (
                      <div
                        key={idx}
                        className="text-[11px] bg-white p-2 rounded-xl border border-purple-100/80 text-slate-700 flex flex-col gap-0.5"
                      >
                        <div className="flex items-center justify-between font-bold">
                          <span>
                            Previously: {new Date(item.previousDate).toLocaleDateString()} (
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

      {/* Doctor Review Modal */}
      {reviewModalAppointment && (
        <DoctorReviewModal
          isOpen={Boolean(reviewModalAppointment)}
          onClose={() => setReviewModalAppointment(null)}
          doctor={reviewModalAppointment.doctor}
          appointmentId={reviewModalAppointment._id}
          existingReview={getExistingReview(reviewModalAppointment)}
          onSuccess={() => {
            fetchAppointments();
            fetchPatientReviews();
          }}
        />
      )}

      {/* Reschedule Modal */}
      {rescheduleAppointment && (
        <RescheduleModal
          isOpen={Boolean(rescheduleAppointment)}
          onClose={() => setRescheduleAppointment(null)}
          appointment={rescheduleAppointment}
          onSuccess={(updatedAppt) => {
            setAppointments((prev) =>
              prev.map((a) => (a._id === updatedAppt._id ? updatedAppt : a))
            );
            if (selectedAppointment?._id === updatedAppt._id) {
              setSelectedAppointment(updatedAppt);
            }
          }}
        />
      )}
    </div>
  );
}