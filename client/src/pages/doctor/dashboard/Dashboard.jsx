import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  Users,
  CalendarDays,
  Clock3,
  TrendingUp,
  Video,
  AlertCircle,
  Clock,
  Loader2,
  Stethoscope,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import doctorApi from "@/api/doctorApi";
import { toast } from "sonner";
import { useCurrency } from "@/contexts/CurrencyContext";

const getSafeStoredDoctor = () => {
  try {
    const raw = localStorage.getItem("doctor");
    if (!raw || raw === "undefined") return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
};

const EMPTY_DASHBOARD = { profile: null, appointments: [], prescriptions: [] };

export default function DoctorDashboard() {
  const { formatPrice, currencySign } = useCurrency();
  const storedDoctor = useMemo(() => getSafeStoredDoctor(), []);

  const {
    data: { profile, appointments, prescriptions } = EMPTY_DASHBOARD,
    isLoading: loading,
    refetch: fetchDashboardData,
  } = useQuery({
    queryKey: ["doctor-dashboard"],
    queryFn: async () => {
      const [profileRes, apptRes, presRes] = await Promise.allSettled([
        doctorApi.get("/doctors/profile"),
        doctorApi.get("/appointments/doctor"),
        doctorApi.get("/prescriptions/doctor"),
      ]);

      return {
        profile: profileRes.status === "fulfilled" ? profileRes.value.data?.data || null : null,
        appointments: apptRes.status === "fulfilled" ? apptRes.value.data?.data || [] : [],
        prescriptions: presRes.status === "fulfilled" ? presRes.value.data?.data || [] : [],
      };
    },
  });

  const doctorName = profile?.firstName || storedDoctor?.firstName || "Doctor";
  const safeAppointments = Array.isArray(appointments) ? appointments : [];

  // Calculate stats from real appointments
  const todayStr = new Date().toDateString();

  const todaysAppointments = safeAppointments.filter((a) => {
    if (!a?.appointmentDate) return false;
    try {
      return new Date(a.appointmentDate).toDateString() === todayStr;
    } catch {
      return false;
    }
  });

  const pendingAppointments = safeAppointments.filter((a) => a?.status === "PENDING");
  const completedAppointments = safeAppointments.filter((a) => a?.status === "COMPLETED");

  // Unique patient count
  const uniquePatients = new Set(
    safeAppointments
      .filter((a) => a?.patient)
      .map((a) => (a.patient?._id || a.patient)?.toString())
      .filter(Boolean)
  );

  // Total Earnings
  const totalEarnings = completedAppointments.reduce((acc, a) => {
    return acc + (Number(a?.consultationFee) || Number(profile?.consultationFee) || 500);
  }, 0);

  // Next upcoming session
  const nextSession =
    safeAppointments.find((a) => a && (a.status === "CONFIRMED" || a.status === "PENDING")) || null;

  const handleUpdateStatus = async (appointmentId, status) => {
    try {
      await doctorApi.patch(`/appointments/${appointmentId}/status`, { status });
      toast.success(`Appointment ${status.toLowerCase()} successfully`);
      fetchDashboardData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update appointment status");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-3">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
        <p className="text-xs text-slate-500 font-medium">Loading clinical portal...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Welcome Banner */}
      <div className="rounded-3xl overflow-hidden bg-gradient-to-r from-emerald-800 via-teal-700 to-emerald-600 text-white p-8 sm:p-10 relative shadow-xl shadow-emerald-600/10">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold tracking-wide">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-200" />
              Verified Physician Portal
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
              Dr. {doctorName} {profile?.lastName || storedDoctor?.lastName || ""}
            </h1>
            <p className="text-emerald-100 text-sm sm:text-base leading-relaxed">
              {profile?.specialization || storedDoctor?.specialization || "General Physician"} • {profile?.hospital || "TeleClinic Virtual Clinic"}
              <br />
              You have <strong>{todaysAppointments.length}</strong> consultation{todaysAppointments.length === 1 ? "" : "s"} scheduled for today.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link to="/doctor/appointments">
                <Button className="bg-white text-emerald-800 hover:bg-emerald-50 font-bold rounded-2xl h-11 px-6 text-xs sm:text-sm shadow-md cursor-pointer">
                  View Appointment Queue <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </Link>
              <Link to="/doctor/availability">
                <button
                  type="button"
                  className="bg-white/20 hover:bg-white/30 border border-white/40 text-white font-bold rounded-2xl h-11 px-5 text-xs sm:text-sm cursor-pointer inline-flex items-center gap-1.5 backdrop-blur-md transition shadow-sm"
                >
                  <Clock3 className="w-4 h-4" /> Set Availability Slots
                </button>
              </Link>
            </div>
          </div>

          <div className="hidden lg:block shrink-0">
            <div className="w-36 h-36 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
              <Stethoscope className="w-20 h-20 text-white/80" />
            </div>
          </div>
        </div>
      </div>

      {/* Live Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="border-0 shadow-sm rounded-3xl bg-white hover:shadow-md transition">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Today's Queue
              </p>
              <h2 className="text-3xl font-black text-slate-900 mt-1">
                {todaysAppointments.length}
              </h2>
              <p className="text-xs text-blue-600 font-semibold mt-1">
                {todaysAppointments.length > 0 ? "Active appointments today" : "No visits today"}
              </p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <CalendarDays className="w-7 h-7" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm rounded-3xl bg-white hover:shadow-md transition">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Total Patients
              </p>
              <h2 className="text-3xl font-black text-slate-900 mt-1">
                {uniquePatients.size}
              </h2>
              <p className="text-xs text-emerald-600 font-semibold mt-1">
                Unique Patients Treated
              </p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Users className="w-7 h-7" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm rounded-3xl bg-white hover:shadow-md transition">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Pending Requests
              </p>
              <h2 className="text-3xl font-black text-slate-900 mt-1">
                {pendingAppointments.length}
              </h2>
              <p className="text-xs text-amber-600 font-semibold mt-1">
                Awaiting Doctor Confirmation
              </p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock3 className="w-7 h-7" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm rounded-3xl bg-white hover:shadow-md transition">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Total Earnings
              </p>
              <h2 className="text-3xl font-black text-slate-900 mt-1">
                {formatPrice ? formatPrice(totalEarnings) : `${currencySign || "$"}${totalEarnings.toFixed(2)}`}
              </h2>
              <p className="text-xs text-purple-600 font-semibold mt-1">
                {completedAppointments.length} Completed Sessions
              </p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <TrendingUp className="w-7 h-7" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: Next Active Consultation & Practice Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Next Scheduled Consultation */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="border-0 shadow-sm rounded-3xl bg-white p-6 sm:p-8 space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                  Upcoming Telemedicine Session
                </span>
                <h2 className="text-2xl font-bold text-slate-900 mt-1">
                  Next Consultation
                </h2>
              </div>
              {nextSession && (
                <Badge
                  className={`text-xs font-bold ${
                    nextSession.status === "CONFIRMED"
                      ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                      : "bg-amber-100 text-amber-800 border-amber-200"
                  }`}
                >
                  {nextSession.status}
                </Badge>
              )}
            </div>

            {nextSession ? (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-700 flex items-center justify-center text-white text-xl font-bold shadow-sm">
                      {nextSession.patient?.firstName?.[0] || "P"}
                      {nextSession.patient?.lastName?.[0] || "T"}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">
                        {nextSession.patient?.firstName || "Patient"} {nextSession.patient?.lastName || ""}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">
                        {nextSession.patient?.gender || "Gender Unspecified"} • {nextSession.patient?.phone || nextSession.patient?.email || "No direct phone"}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-slate-600 font-semibold mt-2">
                        <span className="flex items-center gap-1 text-emerald-700">
                          <CalendarDays className="w-3.5 h-3.5" />
                          {nextSession.appointmentDate ? (
                            new Date(nextSession.appointmentDate).toLocaleDateString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                            })
                          ) : (
                            "Today"
                          )}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-blue-700">
                          <Clock className="w-3.5 h-3.5" />
                          {nextSession.slot?.start || "TBD"}{nextSession.slot?.end ? ` - ${nextSession.slot.end}` : ""}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    {nextSession.status === "PENDING" ? (
                      <Button
                        onClick={() => handleUpdateStatus(nextSession._id, "CONFIRMED")}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl h-10 px-5 text-xs shadow-md shadow-emerald-200 cursor-pointer"
                      >
                        Accept Visit
                      </Button>
                    ) : (
                      <Link to={`/doctor/consultation/${nextSession._id}`}>
                        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl h-10 px-5 text-xs gap-2 shadow-md shadow-emerald-200 cursor-pointer">
                          <Video className="w-4 h-4" /> Start Video
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>

                <div className="text-xs text-slate-500 bg-emerald-50/60 p-3.5 rounded-xl border border-emerald-100 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <span>
                    <strong>Patient Chief Complaint:</strong> {nextSession.reason || "General virtual health consultation."}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center py-10 space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                  <CalendarDays className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">No Pending Consultations</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                    Your queue is clear right now. Check back later or adjust your availability hours.
                  </p>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Practice & Clinical Overview */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="border-0 shadow-sm rounded-3xl bg-white p-6 sm:p-8 space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-xs font-bold text-teal-600 uppercase tracking-wider">
                  Clinical Metrics
                </span>
                <h2 className="text-2xl font-bold text-slate-900 mt-1">
                  Practice Summary
                </h2>
              </div>
              <Link to="/doctor/profile">
                <Button variant="ghost" size="sm" className="text-xs text-emerald-700 font-semibold cursor-pointer">
                  Profile
                </Button>
              </Link>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              <div className="py-3 flex justify-between items-center">
                <span className="text-slate-500 font-medium">Consultation Fee</span>
                <span className="font-bold text-slate-900">
                  {formatPrice ? formatPrice(profile?.consultationFee ?? 500) : `${currencySign || "$"}${profile?.consultationFee ?? 500}`} / session
                </span>
              </div>
              <div className="py-3 flex justify-between items-center">
                <span className="text-slate-500 font-medium">Experience</span>
                <span className="font-bold text-slate-900">
                  {profile?.experience ? `${profile.experience} Years` : "8+ Years"}
                </span>
              </div>
              <div className="py-3 flex justify-between items-center">
                <span className="text-slate-500 font-medium">Prescriptions Issued</span>
                <span className="font-bold text-purple-700">
                  {prescriptions.length} Digital Prescriptions
                </span>
              </div>
              <div className="py-3 flex justify-between items-center">
                <span className="text-slate-500 font-medium">Medical License</span>
                <span className="font-bold text-slate-900">
                  {profile?.licenseNumber || "NMC-VERIFIED"}
                </span>
              </div>
            </div>

            <div className="pt-2">
              <Link to="/doctor/availability">
                <Button variant="outline" className="w-full text-xs font-semibold rounded-xl text-emerald-800 border-emerald-200 hover:bg-emerald-50 cursor-pointer">
                  Manage Availability Slots
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>

      {/* Recent Appointments Table */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-slate-900">Recent Appointments Queue</h2>
          <Link to="/doctor/appointments" className="text-xs text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1">
            View All ({safeAppointments.length}) <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {safeAppointments.length === 0 ? (
          <Card className="border-0 shadow-sm text-center py-12 bg-white rounded-3xl">
            <CardContent>
              <CalendarDays className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">No appointments scheduled</p>
              <p className="text-xs text-slate-400 mt-0.5">When patients book consultations, they will appear here</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {safeAppointments.slice(0, 6).map((appt) => (
              <Card key={appt._id} className="border-0 shadow-sm bg-white rounded-3xl hover:shadow-md transition p-5 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">
                      {appt.patient?.firstName || "Patient"} {appt.patient?.lastName || ""}
                    </h4>
                    <p className="text-xs text-slate-400 font-medium">
                      {appt.patient?.phone || appt.patient?.email || "Patient"}
                    </p>
                  </div>
                  <Badge
                    variant="secondary"
                    className={`text-[10px] font-bold ${
                      appt.status === "CONFIRMED"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : appt.status === "PENDING"
                        ? "bg-amber-50 text-amber-700 border-amber-200"
                        : "bg-slate-100 text-slate-600 border-slate-200"
                    }`}
                  >
                    {appt.status}
                  </Badge>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-xl text-xs space-y-0.5">
                  <span className="text-slate-400 font-semibold uppercase text-[10px]">Reason</span>
                  <p className="text-slate-800 line-clamp-1 font-medium">{appt.reason || "General virtual review"}</p>
                </div>

                <div className="flex justify-between items-center text-xs text-slate-500 pt-1 border-t border-slate-100">
                  <span>{appt.appointmentDate ? new Date(appt.appointmentDate).toLocaleDateString() : "Scheduled"}</span>
                  <span>{appt.slot?.start || "TBD"}{appt.slot?.end ? ` - ${appt.slot.end}` : ""}</span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}