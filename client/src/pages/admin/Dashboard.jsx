import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Stethoscope,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  ArrowRight,
  Database,
  Sparkles,
  Trash2,
  Server,
  Pill,
  ShoppingBag,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import adminApi from "@/api/adminApi";

function StatCard({ label, value, icon: Icon, color, loading, subtitle }) {
  const colorMap = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
    rose: "bg-rose-50 text-rose-600 border-rose-100",
  };

  return (
    <Card className="border border-slate-200/80 shadow-xs rounded-3xl bg-white hover:shadow-md transition-all duration-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {label}
            </span>
            <div className="text-3xl font-black text-slate-900 tracking-tight">
              {loading ? (
                <Loader2 className="w-7 h-7 animate-spin text-slate-300 my-1" />
              ) : (
                value
              )}
            </div>
            {subtitle && (
              <p className="text-xs text-slate-500 font-medium">{subtitle}</p>
            )}
          </div>
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${
              colorMap[color] || colorMap.blue
            } shrink-0`}
          >
            <Icon className="w-7 h-7" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [clearing, setClearing] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, apptRes] = await Promise.allSettled([
        adminApi.get("/admin/dashboard"),
        adminApi.get("/admin/appointments"),
      ]);

      if (statsRes.status === "fulfilled") {
        setStats(statsRes.value.data?.data || null);
      }
      if (apptRes.status === "fulfilled") {
        setRecentAppointments(apptRes.value.data?.data?.slice(0, 6) || []);
      }
    } catch (error) {
      console.error("Failed to load admin dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleSeedDemoData = async () => {
    setSeeding(true);
    try {
      const res = await adminApi.post("/admin/seed-demo");
      toast.success(res.data.message || "Showcase demo data seeded successfully!");
      await fetchDashboardData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to seed demo data.");
    } finally {
      setSeeding(false);
    }
  };

  const handleClearDemoData = async () => {
    if (
      !window.confirm(
        "Are you sure you want to clear all demo patients, doctors, appointments, and prescriptions?"
      )
    ) {
      return;
    }

    setClearing(true);
    try {
      const res = await adminApi.post("/admin/clear-demo");
      toast.success(res.data.message || "Demo data cleared successfully.");
      await fetchDashboardData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to clear demo data.");
    } finally {
      setClearing(false);
    }
  };

  const admin = JSON.parse(localStorage.getItem("admin") || "{}");

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Executive Welcome Hero */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white p-8 sm:p-10 border border-slate-800 shadow-xl shadow-slate-950/20">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-cyan-300 text-xs font-semibold border border-white/10 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              TeleClinic System Administration • HIPAA Compliant
            </div>

            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              Welcome, {admin.firstName || "Administrator"}
            </h1>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Real-time platform oversight. Manage doctor availability, verify practitioner credentials, review patient records, and monitor telemedicine sessions.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link to="/admin/doctors">
                <Button className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl h-11 px-6 text-xs sm:text-sm shadow-md shadow-indigo-600/30 gap-2">
                  <Stethoscope className="w-4 h-4" /> Manage Doctors <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>

              <Link to="/admin/patients">
                <Button className="bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl h-11 px-5 text-xs sm:text-sm border border-white/20 backdrop-blur-md gap-2">
                  <Users className="w-4 h-4 text-cyan-300" /> Patient Directory
                </Button>
              </Link>

              <Link to="/admin/pharmacy">
                <Button className="bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl h-11 px-5 text-xs sm:text-sm border border-white/20 backdrop-blur-md gap-2">
                  <Pill className="w-4 h-4 text-emerald-300" /> Pharmacy Stock
                </Button>
              </Link>

              <Link to="/admin/orders">
                <Button className="bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl h-11 px-5 text-xs sm:text-sm border border-white/20 backdrop-blur-md gap-2">
                  <ShoppingBag className="w-4 h-4 text-amber-300" /> Pharmacy Orders
                </Button>
              </Link>
            </div>
          </div>

          <div className="hidden lg:flex items-center justify-center shrink-0">
            <div className="w-32 h-32 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl flex flex-col items-center justify-center gap-2 shadow-inner">
              <Server className="w-10 h-10 text-indigo-400" />
              <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                System Active
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Showcase Database Control Center */}
      <Card className="border border-slate-200/80 shadow-xs rounded-3xl bg-white p-6 sm:p-7">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
              <Database className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  Showcase Demo Data Controls
                </h3>
                <Badge className="bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                  1-Click Seed
                </Badge>
              </div>
              <p className="text-xs text-slate-500 max-w-xl">
                Quickly populate realistic certified doctors, patients, upcoming consultations, and digital prescriptions for interactive demonstrations.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Button
              onClick={handleSeedDemoData}
              disabled={seeding || clearing}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl h-11 px-5 text-xs gap-2 shadow-sm shadow-emerald-500/20"
            >
              {seeding ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Seeding Database...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-emerald-200" /> Seed Demo Data
                </>
              )}
            </Button>

            <Button
              onClick={handleClearDemoData}
              disabled={seeding || clearing}
              className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold rounded-2xl h-11 px-5 text-xs gap-2"
            >
              {clearing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Clearing Records...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 text-rose-600" /> Clear Demo Records
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>

      {/* Executive Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <StatCard
          label="Registered Patients"
          value={stats?.totalPatients ?? 0}
          icon={Users}
          color="blue"
          loading={loading}
          subtitle="Patient profiles in system"
        />
        <StatCard
          label="Verified Doctors"
          value={stats?.totalDoctors ?? 0}
          icon={Stethoscope}
          color="emerald"
          loading={loading}
          subtitle="Certified medical specialists"
        />
        <StatCard
          label="Total Consultations"
          value={stats?.totalAppointments ?? 0}
          icon={Calendar}
          color="purple"
          loading={loading}
          subtitle="All scheduled virtual visits"
        />
        <StatCard
          label="Pending Consultations"
          value={stats?.pendingAppointments ?? 0}
          icon={Clock}
          color="amber"
          loading={loading}
          subtitle="Awaiting doctor confirmation"
        />
        <StatCard
          label="Completed Consultations"
          value={stats?.completedAppointments ?? 0}
          icon={CheckCircle2}
          color="emerald"
          loading={loading}
          subtitle="Successfully delivered visits"
        />
        <StatCard
          label="Cancelled Consultations"
          value={stats?.cancelledAppointments ?? 0}
          icon={XCircle}
          color="rose"
          loading={loading}
          subtitle="Declined or cancelled visits"
        />
      </div>

      {/* Recent Appointments Registry Feed */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Recent Network Consultations</h2>
            <p className="text-slate-500 text-xs">Live consultation activity across all departments</p>
          </div>
          <Link
            to="/admin/appointments"
            className="text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1"
          >
            View All Consultations ({stats?.totalAppointments ?? 0}) <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentAppointments.length === 0 && !loading ? (
          <Card className="border border-slate-200/80 shadow-xs text-center py-16 bg-white rounded-3xl">
            <CardContent className="space-y-2">
              <Calendar className="w-12 h-12 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-700">No consultations registered yet</p>
              <p className="text-xs text-slate-400">
                Click "Seed Demo Data" above to generate realistic appointments and records.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentAppointments.map((appt) => (
              <Card
                key={appt._id}
                className="border border-slate-200/80 shadow-xs bg-white rounded-3xl hover:shadow-md transition p-5 space-y-3"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">
                      {appt.patient?.firstName} {appt.patient?.lastName}
                    </h4>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      With Dr. {appt.doctor?.firstName} {appt.doctor?.lastName}
                    </p>
                  </div>
                  <Badge
                    variant="secondary"
                    className={`text-[10px] font-bold ${
                      appt.status === "COMPLETED"
                        ? "bg-emerald-50 text-emerald-700"
                        : appt.status === "CONFIRMED"
                        ? "bg-blue-50 text-blue-700"
                        : appt.status === "PENDING"
                        ? "bg-amber-50 text-amber-700"
                        : "bg-rose-50 text-rose-700"
                    }`}
                  >
                    {appt.status}
                  </Badge>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl text-xs space-y-0.5 border border-slate-100">
                  <span className="text-slate-400 font-bold uppercase text-[10px]">Reason</span>
                  <p className="text-slate-800 line-clamp-1 font-medium">
                    {appt.reason || "Routine clinical review"}
                  </p>
                </div>

                <div className="flex justify-between items-center text-xs text-slate-500 pt-1 border-t border-slate-100 font-medium">
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
  );
}
