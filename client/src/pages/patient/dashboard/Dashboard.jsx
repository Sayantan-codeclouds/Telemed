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
      bmi = (weightInKg / (heightInMeters * heightInMeters)).toFixed(1);
    }
  }

  const handleAddWater = () => {
    if (waterGlasses < 12) {
      setWaterGlasses((prev) => prev + 1);
      toast.success("Logged 250ml water! Stay hydrated 💧");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        <p className="text-sm font-semibold text-slate-500">Loading your health dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Executive Hero Welcome Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white p-8 sm:p-10 border border-slate-800 shadow-xl shadow-slate-950/20">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-cyan-300 text-xs font-semibold border border-white/10 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              TeleClinic Patient Hub • EHR Active & Encrypted
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-white">
              Welcome back, {patientName} 👋
            </h1>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Your virtual telehealth center is live. Schedule video consultations with certified specialists, auto-fill prescriptions with AI, and track daily vitals.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link to="/patient/doctors">
                <Button className="bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl h-11 px-6 text-xs sm:text-sm shadow-md shadow-blue-600/30 gap-2">
                  <Stethoscope className="w-4 h-4" /> Book Consultation <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>

              <Link to="/patient/ai">
                <Button className="bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl h-11 px-5 text-xs sm:text-sm border border-white/20 backdrop-blur-md gap-2">
                  <Bot className="w-4 h-4 text-cyan-300" /> AI Health Assistant
                </Button>
              </Link>

              <Link to="/patient/prescriptions">
                <Button className="bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl h-11 px-5 text-xs sm:text-sm border border-white/20 backdrop-blur-md gap-2">
                  <FileText className="w-4 h-4 text-emerald-300" /> My Prescriptions
                </Button>
              </Link>
            </div>
          </div>

          <div className="hidden lg:flex items-center justify-center shrink-0">
            <div className="w-32 h-32 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl flex flex-col items-center justify-center gap-2 shadow-inner">
              <Activity className="w-12 h-12 text-blue-400" />
              <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                Vitals Active
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Sweet Recheckup Reminder Notification Banner */}
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
            <Card className="border-0 shadow-md rounded-3xl bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 p-5 sm:p-6 border border-indigo-100/80 animate-in fade-in duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-pink-500 shrink-0 text-xl">
                    🌸
                  </div>
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                        Time for your Follow-up & Recheckup Check-in!
                      </h3>
                      <Badge className="bg-indigo-600 text-white text-[10px] font-bold">
                        {duePres.validityDays || 14} Days Validity Window
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
                      Hello <strong>{patientName}</strong>, Dr. <strong>{docName}</strong> would love to see how your recovery is progressing for <em>{duePres.diagnosis || "your recent consultation"}</em>. Your prescription validity period concludes on <strong>{targetFormatted}</strong>.
                    </p>
                  </div>
                </div>

                <Link to="/patient/doctors" className="shrink-0">
                  <Button className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-700 hover:to-pink-700 text-white font-bold rounded-2xl h-11 px-5 text-xs shadow-md shadow-indigo-500/20 gap-2">
                    <Sparkles className="w-3.5 h-3.5" /> Book Recheckup Consultation
                  </Button>
                </Link>
              </div>
            </Card>
          );
        })()
      )}

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link to="/patient/appointments" className="block group">
          <Card className="border border-slate-200/80 shadow-xs rounded-3xl bg-white p-5 hover:shadow-md hover:border-blue-200 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Upcoming Visits
                </span>
                <p className="text-3xl font-black text-slate-900 mt-1">
                  {upcomingAppointments.length}
                </p>
                <p className="text-xs text-blue-600 font-semibold mt-1">
                  {upcomingAppointments.length > 0 ? "Scheduled & confirmed" : "No visits queued"}
                </p>
              </div>
              <div className="w-13 h-13 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <CalendarDays className="w-6 h-6" />
              </div>
            </div>
          </Card>
        </Link>

        <Link to="/patient/prescriptions" className="block group">
          <Card className="border border-slate-200/80 shadow-xs rounded-3xl bg-white p-5 hover:shadow-md hover:border-purple-200 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Prescriptions
                </span>
                <p className="text-3xl font-black text-slate-900 mt-1">
                  {prescriptions.length}
                </p>
                <p className="text-xs text-purple-600 font-semibold mt-1">
                  Digital Rx Ready
                </p>
              </div>
              <div className="w-13 h-13 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Pill className="w-6 h-6" />
              </div>
            </div>
          </Card>
        </Link>

        <Link to="/patient/pharmacy" className="block group">
          <Card className="border border-slate-200/80 shadow-xs rounded-3xl bg-white p-5 hover:shadow-md hover:border-emerald-200 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Pharmacy Store
                </span>
                <p className="text-3xl font-black text-emerald-600 mt-1">
                  Fast
                </p>
                <p className="text-xs text-emerald-600 font-semibold mt-1">
                  1-Click AI Fulfillment
                </p>
              </div>
              <div className="w-13 h-13 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <ShoppingBag className="w-6 h-6" />
              </div>
            </div>
          </Card>
        </Link>

        <Link to="/patient/records" className="block group">
          <Card className="border border-slate-200/80 shadow-xs rounded-3xl bg-white p-5 hover:shadow-md hover:border-indigo-200 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Blood Group & EHR
                </span>
                <p className="text-2xl font-black text-slate-900 mt-1">
                  {profile?.bloodGroup || "B+"}
                </p>
                <p className="text-xs text-indigo-600 font-semibold mt-1">
                  Verified Health Profile ➔
                </p>
              </div>
              <div className="w-13 h-13 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6" />
              </div>
            </div>
          </Card>
        </Link>
      </div>

      {/* Main Grid: Consultation Spotlight & Daily Vitals Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Next Appointment Spotlight (Left 7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="border border-slate-200/80 shadow-xs rounded-3xl bg-white p-6 sm:p-7 space-y-5">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                  Live Consultation Spotlight
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
                  Next Scheduled Visit
                </h2>
              </div>

              {nextAppointment && (
                <Badge
                  className={`text-xs font-bold ${
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
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-100">
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
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-sm shrink-0"
                    />
                    <div>
                      <h3 className="text-base font-bold text-slate-900">
                        Dr. {nextAppointment.doctor?.firstName} {nextAppointment.doctor?.lastName}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">
                        {nextAppointment.doctor?.specialization || "Clinical Specialist"} • {nextAppointment.doctor?.hospital || "Apollo Hospital"}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-slate-700 font-bold mt-2">
                        <span className="flex items-center gap-1 text-blue-700">
                          <CalendarDays className="w-3.5 h-3.5" />
                          {new Date(nextAppointment.appointmentDate).toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-indigo-700">
                          <Clock className="w-3.5 h-3.5" />
                          {nextAppointment.slot?.start} - {nextAppointment.slot?.end}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Link to={`/patient/consultation/${nextAppointment._id}`}>
                    <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl h-11 px-5 text-xs sm:text-sm gap-2 shadow-md shadow-blue-500/20 w-full sm:w-auto">
                      <Video className="w-4 h-4" /> Enter Room ➔
                    </Button>
                  </Link>
                </div>

                <div className="text-xs text-slate-600 bg-blue-50/50 p-3.5 rounded-xl border border-blue-100 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Clinical Note:</strong> {nextAppointment.reason || "General virtual review and follow-up consultation."}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center py-10 space-y-3 bg-slate-50 rounded-2xl border border-slate-100 p-6">
                <CalendarDays className="w-10 h-10 text-slate-300 mx-auto" />
                <div>
                  <h3 className="text-sm font-bold text-slate-800">No Scheduled Visits</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto mt-0.5">
                    Connect with cardiologists, general physicians, pediatricians, and dermatologists.
                  </p>
                </div>
                <Link to="/patient/doctors">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold px-5 h-9">
                    Book Consultation Now
                  </Button>
                </Link>
              </div>
            )}
          </Card>

          {/* Latest Prescription Fast-Track Callout */}
          {latestPrescription && (
            <Card className="border border-purple-100 bg-gradient-to-r from-purple-50/70 to-indigo-50/50 shadow-xs rounded-3xl p-5 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                    <Pill className="w-5 h-5" />
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
                  <Button className="bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl h-10 px-4 text-xs gap-1.5 shadow-sm shadow-purple-600/20 shrink-0">
                    <Sparkles className="w-3.5 h-3.5" /> AI Read to Cart ➔
                  </Button>
                </Link>
              </div>
            </Card>
          )}
        </div>

        {/* AI Health Assistant & Quick Clinical Triage (Right 5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="border border-slate-200/80 shadow-xs rounded-3xl bg-white p-6 space-y-5">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    AI Clinical Receptionist
                  </h3>
                  <p className="text-[11px] text-slate-400">Instant 24/7 Smart Health Guidance</p>
                </div>
              </div>

              <Link to="/patient/ai">
                <Button variant="ghost" size="sm" className="text-xs text-teal-700 font-bold hover:bg-teal-50 rounded-xl h-8 px-2.5">
                  Launch Chat ➔
                </Button>
              </Link>
            </div>

            {/* AI Capability Highlights */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-teal-50/70 via-cyan-50/50 to-blue-50/60 border border-teal-100/80 space-y-3">
              <p className="text-xs text-slate-700 font-medium leading-relaxed">
                Describe symptoms to get instant clinical triage, recommended medical specialists, and personalized home-care guidance.
              </p>

              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] font-bold text-teal-800 uppercase tracking-wider block">
                  Common AI Queries:
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
                      className="text-[11px] font-medium text-teal-900 bg-white/80 hover:bg-white px-3 py-1.5 rounded-xl border border-teal-200/60 transition flex items-center justify-between group"
                    >
                      <span className="truncate">{q}</span>
                      <ChevronRight className="w-3 h-3 text-teal-500 group-hover:translate-x-0.5 transition-transform shrink-0" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Direct AI Action CTA */}
            <Link to="/patient/ai" className="block">
              <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-2xl h-11 text-xs gap-2 shadow-sm shadow-teal-500/20">
                <Sparkles className="w-4 h-4 text-teal-200" /> Start AI Health Assessment ➔
              </Button>
            </Link>
          </Card>
        </div>
      </div>

      {/* Patient Core Healthcare Services Tiles */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            Healthcare Services & Fast-Tracks
          </h2>
          <span className="text-xs text-slate-400 font-semibold">Comprehensive Telehealth Suite</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          <Link
            to="/patient/doctors"
            className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md hover:-translate-y-1 transition-all text-left space-y-3 group"
          >
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Find Doctors</h3>
              <p className="text-slate-400 text-xs mt-0.5">Specialist directory</p>
            </div>
          </Link>

          <Link
            to="/patient/appointments"
            className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md hover:-translate-y-1 transition-all text-left space-y-3 group"
          >
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CalendarDays className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Consultations</h3>
              <p className="text-slate-400 text-xs mt-0.5">Video calls & schedule</p>
            </div>
          </Link>

          <Link
            to="/patient/prescriptions"
            className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md hover:-translate-y-1 transition-all text-left space-y-3 group"
          >
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Pill className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Prescriptions</h3>
              <p className="text-slate-400 text-xs mt-0.5">AI dosage & fulfillment</p>
            </div>
          </Link>

          <Link
            to="/patient/pharmacy"
            className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md hover:-translate-y-1 transition-all text-left space-y-3 group"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Pharmacy Store</h3>
              <p className="text-slate-400 text-xs mt-0.5">Order medicines</p>
            </div>
          </Link>

          <Link
            to="/patient/records"
            className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md hover:-translate-y-1 transition-all text-left space-y-3 group"
          >
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Medical Records</h3>
              <p className="text-slate-400 text-xs mt-0.5">EHR history & files</p>
            </div>
          </Link>

          <Link
            to="/patient/ai"
            className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md hover:-translate-y-1 transition-all text-left space-y-3 group"
          >
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center group-hover:scale-110 transition-transform">
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