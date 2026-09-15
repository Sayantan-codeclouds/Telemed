import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  CalendarDays,
  Pill,
  FileText,
  Stethoscope,
  Bot,
  Activity,
  ArrowRight,
  Video,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  ShoppingBag,
  ShieldCheck,
  Zap,
  TrendingUp,
  Award,
  ChevronRight,
  Plus,
  Droplets,
  Heart,
  Scale,
  Sparkle,
  Compass,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import api from "@/api/axios";
import { getProfileImageUrl } from "@/utils/imageUrl";

export default function Dashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [waterGlasses, setWaterGlasses] = useState(5);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [profileRes, apptRes, presRes] = await Promise.allSettled([
          api.get("/patients/profile"),
          api.get("/appointments/patient"),
          api.get("/prescriptions/patient"),
        ]);

        if (profileRes.status === "fulfilled") {
          setProfile(profileRes.value.data?.data || null);
        }
        if (apptRes.status === "fulfilled") {
          setAppointments(apptRes.value.data?.data || []);
        }
        if (presRes.status === "fulfilled") {
          setPrescriptions(presRes.value.data?.data || []);
        }
      } catch (error) {
        console.error("Dashboard data load error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const storedUser = JSON.parse(localStorage.getItem("patient") || "{}");
  const patientName = profile?.firstName || storedUser?.firstName || "Patient";
  const patientFullName = `${patientName} ${profile?.lastName || storedUser?.lastName || ""}`.trim();

  // Calculate live stats
  const upcomingAppointments = appointments.filter(
    (a) => a.status === "CONFIRMED" || a.status === "PENDING"
  );
  const completedConsultations = appointments.filter(
    (a) => a.status === "COMPLETED"
  );

  // Next upcoming appointment
  const nextAppointment =
    appointments.find((a) => a.status === "CONFIRMED") ||
    upcomingAppointments[0] ||
    null;

  // Latest issued prescription
  const latestPrescription = prescriptions[0] || null;

  // Calculate BMI if height and weight available
  let bmi = null;
  let bmiCategory = "Normal";
  let bmiColor = "text-emerald-600 bg-emerald-50 border-emerald-200";

  if (profile?.height?.value && profile?.weight?.value) {
    const heightInMeters =
      profile.height.unit === "cm"
        ? profile.height.value / 100
        : profile.height.value * 0.0254;
    const weightInKg =
      profile.weight.unit === "lbs"
        ? profile.weight.value * 0.453592
        : profile.weight.value;
    if (heightInMeters > 0) {
      const computed = weightInKg / (heightInMeters * heightInMeters);
      bmi = computed.toFixed(1);
      if (computed < 18.5) {
        bmiCategory = "Underweight";
        bmiColor = "text-amber-600 bg-amber-50 border-amber-200";
      } else if (computed < 25) {
        bmiCategory = "Healthy / Normal";
        bmiColor = "text-emerald-600 bg-emerald-50 border-emerald-200";
      } else if (computed < 30) {
        bmiCategory = "Overweight";
        bmiColor = "text-orange-600 bg-orange-50 border-orange-200";
      } else {
        bmiCategory = "Obese";
        bmiColor = "text-rose-600 bg-rose-50 border-rose-200";
      }
    }
  }

  const handleAddWater = () => {
    if (waterGlasses < 12) {
      setWaterGlasses((prev) => prev + 1);
      toast.success("Logged 250ml water! Stay refreshed & hydrated 💧");
    } else {
      toast.info("Daily hydration goal exceeded! Great job 💧");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-3xl bg-blue-50 border border-blue-100 flex items-center justify-center animate-pulse">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        </div>
        <div className="text-center space-y-1">
          <p className="text-sm font-bold text-slate-800">Synchronizing Health Records...</p>
          <p className="text-xs text-slate-400">Loading consultations, prescriptions & vitals</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16 animate-in fade-in duration-300">
      {/* ── 1. Executive Hero Welcome Banner ── */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white p-6 sm:p-9 lg:p-10 border border-slate-800/90 shadow-2xl shadow-slate-950/20">
        {/* Glow ambient backgrounds */}
        <div className="absolute top-0 right-0 w-[420px] h-[420px] bg-gradient-to-br from-blue-500/15 via-indigo-500/10 to-transparent rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-4 max-w-2xl">
            {/* Live Security & Patient Status Badge */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-cyan-300 text-xs font-semibold border border-white/10 backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                TeleClinic Patient Hub • EHR Encrypted
              </div>
              <span className="text-[11px] font-medium text-slate-400 px-2.5 py-0.5 rounded-full bg-white/5 border border-white/5">
                ID: #{profile?._id ? profile._id.slice(-6).toUpperCase() : "PT-ONLINE"}
              </span>
            </div>

            {/* Greeting Header */}
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-white">
                Welcome back,{" "}
                <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-300 bg-clip-text text-transparent">
                  {patientName}
                </span>{" "}
                👋
              </h1>
              <p className="text-slate-300 text-xs sm:text-sm lg:text-base leading-relaxed mt-2">
                Your virtual telehealth command center is active. Connect with board-certified physicians, manage e-prescriptions, and review real-time clinical diagnostics.
              </p>
            </div>

            {/* Quick Action Navigation Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 pt-2">
              <Link to="/patient/doctors">
                <Button className="bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl h-11 px-6 text-xs sm:text-sm shadow-md shadow-blue-600/30 gap-2 transition-all hover:scale-101 cursor-pointer">
                  <Stethoscope className="w-4 h-4" /> Book Consultation <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>

              <Link to="/patient/ai">
                <Button className="bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl h-11 px-5 text-xs sm:text-sm border border-white/20 backdrop-blur-md gap-2 transition-all cursor-pointer">
                  <Bot className="w-4 h-4 text-cyan-300" /> AI Clinical Assistant
                </Button>
              </Link>

              <Link to="/patient/prescriptions">
                <Button className="bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl h-11 px-5 text-xs sm:text-sm border border-white/20 backdrop-blur-md gap-2 transition-all cursor-pointer">
                  <FileText className="w-4 h-4 text-emerald-300" /> My Prescriptions
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Hero Badge: Vitals Pulse Card */}
          <div className="hidden lg:flex flex-col items-center justify-center shrink-0">
            <div className="w-40 p-4 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl flex flex-col items-center justify-center gap-3 shadow-2xl text-center group hover:border-white/20 transition-all">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <Activity className="w-7 h-7" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">Health Status</span>
                <span className="text-[11px] font-semibold text-emerald-400 flex items-center justify-center gap-1 mt-0.5">
                  <CheckCircle2 className="w-3 h-3" /> Profile Active
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. Recheckup Reminder Notification Banner ── */}
      {prescriptions.length > 0 && (
        (() => {
          const duePres = prescriptions.find((p) => {
            const target = p.validUntil || p.recheckupDate || p.followUpDate;
            if (!target) return false;
            const diffDays = Math.ceil((new Date(target) - new Date()) / (1000 * 60 * 60 * 24));
            return diffDays <= 7;
          }) || (prescriptions[0].remindRecheckup ? prescriptions[0] : null);

          if (!duePres) return null;

          const docName = `${duePres.doctor?.firstName || "Doctor"} ${duePres.doctor?.lastName || ""}`.trim();
          const targetFormatted = duePres.validUntil
            ? new Date(duePres.validUntil).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
            : duePres.followUpDate
            ? new Date(duePres.followUpDate).toLocaleDateString()
            : "Soon";

          return (
            <Card className="border-0 shadow-lg shadow-purple-500/5 rounded-3xl bg-gradient-to-r from-indigo-50/90 via-purple-50/70 to-pink-50/90 p-5 sm:p-6 border border-purple-200/80 animate-in fade-in duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white shadow-xs border border-purple-100 flex items-center justify-center text-pink-500 shrink-0 text-xl">
                    🌸
                  </div>
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                        Scheduled Recheckup & Recovery Window
                      </h3>
                      <Badge className="bg-purple-600 text-white text-[10px] font-bold">
                        {duePres.validityDays || 14} Days Validity
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
                      Hello <strong>{patientName}</strong>, Dr. <strong>{docName}</strong> recommends scheduling a follow-up review for <em>{duePres.diagnosis || "your recent consultation"}</em> before your prescription window closes on <strong>{targetFormatted}</strong>.
                    </p>
                  </div>
                </div>

                <Link to="/patient/doctors" className="shrink-0">
                  <Button className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold rounded-2xl h-11 px-5 text-xs shadow-md shadow-purple-500/20 gap-2 cursor-pointer">
                    <Sparkles className="w-3.5 h-3.5" /> Book Recheckup Consultation
                  </Button>
                </Link>
              </div>
            </Card>
          );
        })()
      )}

      {/* ── 3. KPI Overview Grid (4 Columns) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Upcoming Appointments */}
        <Link to="/patient/appointments" className="block group">
          <Card className="border border-slate-200/80 shadow-xs rounded-3xl bg-white p-5 hover:shadow-lg hover:border-blue-300 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-cyan-400 opacity-80" />
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                  Upcoming Visits
                </span>
                <p className="text-3xl font-black text-slate-900 mt-1">
                  {upcomingAppointments.length}
                </p>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                  <p className="text-xs text-blue-600 font-semibold">
                    {upcomingAppointments.length > 0 ? "Scheduled & confirmed" : "No visits queued"}
                  </p>
                </div>
              </div>
              <div className="w-13 h-13 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-xs">
                <CalendarDays className="w-6 h-6" />
              </div>
            </div>
          </Card>
        </Link>

        {/* Card 2: Prescriptions */}
        <Link to="/patient/prescriptions" className="block group">
          <Card className="border border-slate-200/80 shadow-xs rounded-3xl bg-white p-5 hover:shadow-lg hover:border-purple-300 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-400 opacity-80" />
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                  Prescriptions
                </span>
                <p className="text-3xl font-black text-slate-900 mt-1">
                  {prescriptions.length}
                </p>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-500" />
                  <p className="text-xs text-purple-600 font-semibold">
                    Digital e-Rx active
                  </p>
                </div>
              </div>
              <div className="w-13 h-13 rounded-2xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center group-hover:scale-110 group-hover:bg-purple-600 group-hover:text-white transition-all duration-300 shadow-xs">
                <Pill className="w-6 h-6" />
              </div>
            </div>
          </Card>
        </Link>

        {/* Card 3: Pharmacy Store */}
        <Link to="/patient/pharmacy" className="block group">
          <Card className="border border-slate-200/80 shadow-xs rounded-3xl bg-white p-5 hover:shadow-lg hover:border-emerald-300 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-400 opacity-80" />
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                  Pharmacy Store
                </span>
                <p className="text-3xl font-black text-emerald-600 mt-1">
                  Fast
                </p>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <p className="text-xs text-emerald-600 font-semibold">
                    1-Click AI Rx to Cart
                  </p>
                </div>
              </div>
              <div className="w-13 h-13 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300 shadow-xs">
                <ShoppingBag className="w-6 h-6" />
              </div>
            </div>
          </Card>
        </Link>

        {/* Card 4: Blood Group & EHR */}
        <Link to="/patient/records" className="block group">
          <Card className="border border-slate-200/80 shadow-xs rounded-3xl bg-white p-5 hover:shadow-lg hover:border-indigo-300 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-blue-400 opacity-80" />
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                  Blood Group & EHR
                </span>
                <p className="text-2xl font-black text-slate-900 mt-1">
                  {profile?.bloodGroup || "B+"}
                </p>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-500" />
                  <p className="text-xs text-indigo-600 font-semibold">
                    Verified Health Profile ➔
                  </p>
                </div>
              </div>
              <div className="w-13 h-13 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 shadow-xs">
                <FileText className="w-6 h-6" />
              </div>
            </div>
          </Card>
        </Link>
      </div>

      {/* ── 4. Main Grid: Consultation Spotlight & AI Assistant / Wellness ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (7 cols): Consultation Spotlight & Latest Prescription */}
        <div className="lg:col-span-7 space-y-6">
          {/* Spotlight Card */}
          <Card className="border border-slate-200/90 shadow-sm rounded-3xl bg-white p-6 sm:p-7 space-y-5">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
                  <span className="text-[11px] font-extrabold text-blue-600 uppercase tracking-wider">
                    Live Telehealth Session
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                  Next Scheduled Visit
                </h2>
              </div>

              {nextAppointment && (
                <Badge
                  className={`text-xs font-bold px-3 py-1 rounded-full ${
                    nextAppointment.status === "CONFIRMED"
                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                      : "bg-amber-50 text-amber-700 border border-amber-200"
                  }`}
                >
                  {nextAppointment.status === "CONFIRMED" ? "🟢 Confirmed" : "⏳ Pending"}
                </Badge>
              )}
            </div>

            {nextAppointment ? (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-50 via-blue-50/30 to-white border border-slate-200/80">
                  <div className="flex items-center gap-4">
                    <img
                      src={getProfileImageUrl(
                        nextAppointment.doctor?.profileImage,
                        `${nextAppointment.doctor?.firstName || "Dr"} ${nextAppointment.doctor?.lastName || ""}`,
                        "0284c7"
                      )}
                      alt={`Dr. ${nextAppointment.doctor?.firstName || "Doctor"}`}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(nextAppointment.doctor?.firstName || "Dr")}+${encodeURIComponent(nextAppointment.doctor?.lastName || "")}&background=0284c7&color=fff&size=150`;
                      }}
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-md shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-slate-900">
                          Dr. {nextAppointment.doctor?.firstName} {nextAppointment.doctor?.lastName}
                        </h3>
                        <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-700 border-blue-200">
                          Verified
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        {nextAppointment.doctor?.specialization || "Clinical Specialist"} • {nextAppointment.doctor?.hospital || "TeleClinic Medical Network"}
                      </p>
                      <div className="flex flex-wrap items-center gap-2.5 text-xs font-bold mt-2">
                        <span className="inline-flex items-center gap-1.5 text-blue-700 bg-blue-50 px-2.5 py-1 rounded-xl border border-blue-100">
                          <CalendarDays className="w-3.5 h-3.5" />
                          {new Date(nextAppointment.appointmentDate).toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-xl border border-indigo-100">
                          <Clock className="w-3.5 h-3.5" />
                          {nextAppointment.slot?.start} - {nextAppointment.slot?.end}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Link to={`/patient/consultation/${nextAppointment._id}`}>
                    <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-2xl h-11 px-5 text-xs sm:text-sm gap-2 shadow-md shadow-blue-500/20 w-full sm:w-auto cursor-pointer">
                      <Video className="w-4 h-4" /> Enter Room ➔
                    </Button>
                  </Link>
                </div>

                <div className="text-xs text-slate-600 bg-blue-50/60 p-3.5 rounded-2xl border border-blue-100/90 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">
                    <strong>Chief Complaint / Reason:</strong> {nextAppointment.reason || "General virtual review and follow-up consultation."}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center py-10 space-y-3 bg-slate-50/80 rounded-2xl border border-slate-100 p-6">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                  <CalendarDays className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">No Scheduled Visits</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto mt-0.5">
                    Connect with cardiologists, pediatricians, psychiatrists, and dermatologists right away.
                  </p>
                </div>
                <Link to="/patient/doctors">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-bold px-5 h-10 cursor-pointer">
                    Book Consultation Now
                  </Button>
                </Link>
              </div>
            )}
          </Card>

          {/* Latest Prescription Callout */}
          {latestPrescription && (
            <Card className="border border-purple-100 bg-gradient-to-r from-purple-50/80 via-indigo-50/40 to-white shadow-sm rounded-3xl p-5 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-purple-500/20">
                    <Pill className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900">
                        Latest Issued Prescription
                      </h4>
                      <Badge className="bg-purple-100 text-purple-800 border-purple-200 text-[10px] font-bold">
                        Dr. {latestPrescription.doctor?.firstName || "Consultant"}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-600 font-medium mt-0.5">
                      Diagnosis: <strong>{latestPrescription.diagnosis || "Clinical Consultation"}</strong> ({latestPrescription.medicines?.length || 0} Prescribed Drugs)
                    </p>
                  </div>
                </div>

                <Link to="/patient/prescriptions">
                  <Button className="bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-2xl h-10 px-5 text-xs gap-1.5 shadow-sm shadow-purple-600/20 shrink-0 cursor-pointer">
                    <Sparkles className="w-3.5 h-3.5" /> AI Read to Cart ➔
                  </Button>
                </Link>
              </div>
            </Card>
          )}
        </div>

        {/* Right Column (5 cols): AI Clinical Assistant & Daily Vitals Tracker */}
        <div className="lg:col-span-5 space-y-6">
          {/* AI Clinical Assistant Widget */}
          <Card className="border border-slate-200/90 shadow-sm rounded-3xl bg-white p-6 space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-teal-50 border border-teal-100 text-teal-600 flex items-center justify-center">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    AI Clinical Assistant
                  </h3>
                  <p className="text-[11px] text-slate-400">24/7 Smart Health Guidance</p>
                </div>
              </div>

              <Link to="/patient/ai">
                <Button variant="ghost" size="sm" className="text-xs text-teal-700 font-bold hover:bg-teal-50 rounded-xl h-8 px-2.5 cursor-pointer">
                  Launch Chat ➔
                </Button>
              </Link>
            </div>

            {/* AI Capability Highlights */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-teal-50/70 via-cyan-50/40 to-blue-50/50 border border-teal-100 space-y-3">
              <p className="text-xs text-slate-700 font-medium leading-relaxed">
                Describe symptoms to receive instant clinical triage, recommended medical specialists, and lab report interpretations.
              </p>

              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] font-bold text-teal-800 uppercase tracking-wider block">
                  Common Patient Queries:
                </span>
                <div className="flex flex-col gap-1.5">
                  {[
                    "“Chest tightness & shortness of breath”",
                    "“Skin rash with mild itching for 3 days”",
                    "“Suggest a pediatrician for my 4yo child”",
                  ].map((q) => (
                    <Link
                      key={q}
                      to="/patient/ai"
                      className="text-[11px] font-medium text-teal-900 bg-white/90 hover:bg-white px-3 py-1.5 rounded-xl border border-teal-200/70 transition flex items-center justify-between group shadow-2xs"
                    >
                      <span className="truncate">{q}</span>
                      <ChevronRight className="w-3 h-3 text-teal-500 group-hover:translate-x-0.5 transition-transform shrink-0" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <Link to="/patient/ai" className="block">
              <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-2xl h-11 text-xs gap-2 shadow-sm shadow-teal-500/20 cursor-pointer">
                <Sparkles className="w-4 h-4 text-teal-200" /> Start AI Health Assessment ➔
              </Button>
            </Link>
          </Card>

          {/* Daily Wellness Tracker (Hydration & BMI) */}
          <Card className="border border-slate-200/90 shadow-sm rounded-3xl bg-white p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Droplets className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Daily Wellness</h3>
              </div>
              {bmi && (
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${bmiColor}`}>
                  BMI: {bmi} ({bmiCategory})
                </span>
              )}
            </div>

            {/* Hydration Tracker */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50/80 to-cyan-50/60 border border-blue-100 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700">Hydration Log</span>
                <span className="font-extrabold text-blue-700">
                  {waterGlasses} / 8 Glasses ({waterGlasses * 250} ml)
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2.5 bg-blue-200/60 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (waterGlasses / 8) * 100)}%` }}
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-slate-500">Target: 2,000 ml daily</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleAddWater}
                  className="h-7 px-2.5 text-[11px] font-bold bg-white text-blue-600 border-blue-200 hover:bg-blue-50 rounded-xl gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" /> +250ml Glass
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* ── 5. Patient Core Healthcare Services Tiles ── */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              Healthcare Services & Portals
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Comprehensive Telehealth Suite</p>
          </div>
          <span className="text-xs font-semibold text-blue-600 hidden sm:inline">All Systems Operational ●</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          <Link
            to="/patient/doctors"
            className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-lg hover:border-blue-300 hover:-translate-y-1 transition-all text-left space-y-3 group"
          >
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100/80 flex items-center justify-center group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-2xs">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Find Doctors</h3>
              <p className="text-slate-400 text-xs mt-0.5">Specialist directory</p>
            </div>
          </Link>

          <Link
            to="/patient/appointments"
            className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-lg hover:border-indigo-300 hover:-translate-y-1 transition-all text-left space-y-3 group"
          >
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100/80 flex items-center justify-center group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 shadow-2xs">
              <CalendarDays className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Consultations</h3>
              <p className="text-slate-400 text-xs mt-0.5">Video calls & visits</p>
            </div>
          </Link>

          <Link
            to="/patient/prescriptions"
            className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-lg hover:border-purple-300 hover:-translate-y-1 transition-all text-left space-y-3 group"
          >
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 border border-purple-100/80 flex items-center justify-center group-hover:scale-110 group-hover:bg-purple-600 group-hover:text-white transition-all duration-300 shadow-2xs">
              <Pill className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Prescriptions</h3>
              <p className="text-slate-400 text-xs mt-0.5">AI dosage & e-Rx</p>
            </div>
          </Link>

          <Link
            to="/patient/pharmacy"
            className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-lg hover:border-emerald-300 hover:-translate-y-1 transition-all text-left space-y-3 group"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100/80 flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300 shadow-2xs">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Pharmacy Store</h3>
              <p className="text-slate-400 text-xs mt-0.5">Order medicines</p>
            </div>
          </Link>

          <Link
            to="/patient/records"
            className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-lg hover:border-blue-300 hover:-translate-y-1 transition-all text-left space-y-3 group"
          >
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100/80 flex items-center justify-center group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-2xs">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Medical Records</h3>
              <p className="text-slate-400 text-xs mt-0.5">EHR history & files</p>
            </div>
          </Link>

          <Link
            to="/patient/ai"
            className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-lg hover:border-teal-300 hover:-translate-y-1 transition-all text-left space-y-3 group"
          >
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 border border-teal-100/80 flex items-center justify-center group-hover:scale-110 group-hover:bg-teal-600 group-hover:text-white transition-all duration-300 shadow-2xs">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">AI Assistant</h3>
              <p className="text-slate-400 text-xs mt-0.5">Symptom triage</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}