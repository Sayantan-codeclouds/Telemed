import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Compass,
  ArrowLeft,
  Home,
  LayoutDashboard,
  Stethoscope,
  Shield,
  Pill,
  Calendar,
  Bot,
  AlertTriangle,
  RefreshCw,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine user role and corresponding target dashboard
  const adminToken = typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;
  const doctorToken = typeof window !== "undefined" ? localStorage.getItem("doctorToken") : null;
  const patientToken = typeof window !== "undefined" ? localStorage.getItem("patientToken") : null;

  const pathname = location.pathname.toLowerCase();

  let targetPath = "/";
  let targetTitle = "TeleClinic Homepage";
  let roleBadge = "Public Visitor";
  let roleIcon = Home;
  let roleColor = "from-blue-600 to-indigo-600";

  if (adminToken || pathname.startsWith("/admin")) {
    targetPath = adminToken ? "/admin/dashboard" : "/admin/login";
    targetTitle = adminToken ? "Admin Dashboard" : "Admin Login";
    roleBadge = adminToken ? "Logged in as Admin" : "Admin Portal";
    roleIcon = Shield;
    roleColor = "from-indigo-600 to-purple-600";
  } else if (doctorToken || pathname.startsWith("/doctor")) {
    targetPath = doctorToken ? "/doctor/dashboard" : "/doctor/login";
    targetTitle = doctorToken ? "Doctor Dashboard" : "Doctor Login";
    roleBadge = doctorToken ? "Logged in as Doctor" : "Doctor Portal";
    roleIcon = Stethoscope;
    roleColor = "from-teal-600 to-emerald-600";
  } else if (patientToken || pathname.startsWith("/patient")) {
    targetPath = patientToken ? "/patient/dashboard" : "/patient/login";
    targetTitle = patientToken ? "Patient Dashboard" : "Patient Login";
    roleBadge = patientToken ? "Logged in as Patient" : "Patient Portal";
    roleIcon = LayoutDashboard;
    roleColor = "from-blue-600 to-indigo-600";
  }

  // 10-second automatic redirect countdown
  const [countdown, setCountdown] = useState(10);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;

    if (countdown <= 0) {
      navigate(targetPath, { replace: true });
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown, isPaused, navigate, targetPath]);

  const TargetIcon = roleIcon;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans select-none">
      {/* Dynamic Background Glow Rings */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-10 left-10 w-[300px] h-[300px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Top Brand Bar */}
      <header className="relative z-10 p-6 sm:p-8 flex items-center justify-between border-b border-white/5 backdrop-blur-md bg-slate-950/40">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-indigo-600/30 group-hover:scale-105 transition-transform">
            🏥
          </div>
          <div>
            <span className="text-lg font-black tracking-tight text-white block leading-tight">
              TeleClinic
            </span>
            <span className="text-[10px] uppercase tracking-widest text-indigo-400 font-bold">
              Telehealth & Medicine
            </span>
          </div>
        </Link>

        {/* User Role Pill */}
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3.5 py-1.5 rounded-full backdrop-blur-md">
          <TargetIcon className="w-3.5 h-3.5 text-indigo-400" />
          <span className="text-xs font-semibold text-slate-300">{roleBadge}</span>
        </div>
      </header>

      {/* Main 404 Hero Content */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="max-w-2xl w-full text-center space-y-8 animate-in fade-in zoom-in-95 duration-500">
          {/* Animated Graphic Badge */}
          <div className="relative inline-flex items-center justify-center">
            {/* Pulsing ring */}
            <div className="absolute inset-0 w-32 h-32 bg-indigo-500/20 rounded-full animate-ping opacity-40 mx-auto" />
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 flex items-center justify-center shadow-2xl shadow-indigo-950/50 relative z-10 backdrop-blur-xl">
              <Compass className="w-14 h-14 sm:w-16 sm:h-16 text-indigo-400 animate-[spin_12s_linear_infinite]" />
              <div className="absolute -bottom-2 -right-2 bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full border-2 border-slate-950 shadow-md">
                404
              </div>
            </div>
          </div>

          {/* Heading and description */}
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-bold">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              <span>Page Not Found or Relocated</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white">
              Lost in Clinical Space?
            </h1>

            <p className="text-slate-400 text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
              The link <span className="font-mono text-indigo-300 bg-white/5 px-2 py-0.5 rounded border border-white/10 break-all">{location.pathname}</span> does not exist or has been moved.
            </p>
          </div>

          {/* Auto Redirect Countdown Box */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 max-w-md mx-auto backdrop-blur-md flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-left">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 font-bold text-xs">
                {countdown}s
              </div>
              <div className="text-xs">
                <p className="font-bold text-slate-200">
                  Auto-redirecting to {targetTitle}
                </p>
                <p className="text-[11px] text-slate-400">
                  {isPaused ? "Countdown paused" : "Redirecting automatically..."}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsPaused(!isPaused)}
              className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 transition"
            >
              {isPaused ? "Resume" : "Pause"}
            </button>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Button
              onClick={() => navigate(-1)}
              variant="outline"
              className="w-full sm:w-auto h-12 px-6 rounded-2xl border-white/20 bg-white/5 hover:bg-white/10 text-white text-xs font-bold gap-2 backdrop-blur-md transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </Button>

            <Button
              onClick={() => navigate(targetPath, { replace: true })}
              className={`w-full sm:w-auto h-12 px-8 rounded-2xl bg-gradient-to-r ${roleColor} hover:opacity-95 text-white text-xs font-bold gap-2 shadow-xl shadow-indigo-600/30 transition active:scale-[0.99] cursor-pointer`}
            >
              <TargetIcon className="w-4 h-4" />
              <span>Go to {targetTitle}</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Quick Helpful Links Grid */}
          <div className="pt-6 border-t border-white/10 max-w-lg mx-auto">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-3">
              Explore Popular Sections
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <Link
                to="/patient/pharmacy"
                className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-xs text-slate-300 hover:text-white flex flex-col items-center gap-1.5 transition"
              >
                <Pill className="w-4 h-4 text-indigo-400" />
                <span className="font-semibold text-[11px]">Pharmacy</span>
              </Link>
              <Link
                to="/patient/orders"
                className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-xs text-slate-300 hover:text-white flex flex-col items-center gap-1.5 transition"
              >
                <RefreshCw className="w-4 h-4 text-blue-400" />
                <span className="font-semibold text-[11px]">My Orders</span>
              </Link>
              <Link
                to="/patient/appointments"
                className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-xs text-slate-300 hover:text-white flex flex-col items-center gap-1.5 transition"
              >
                <Calendar className="w-4 h-4 text-teal-400" />
                <span className="font-semibold text-[11px]">Book Doctor</span>
              </Link>
              <Link
                to="/patient/ai"
                className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-xs text-slate-300 hover:text-white flex flex-col items-center gap-1.5 transition"
              >
                <Bot className="w-4 h-4 text-purple-400" />
                <span className="font-semibold text-[11px]">AI Health</span>
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Simple Footer */}
      <footer className="relative z-10 p-6 text-center text-xs text-slate-500 border-t border-white/5">
        <p>© {new Date().getFullYear()} TeleClinic Platform. All health services encrypted & protected.</p>
      </footer>
    </div>
  );
}
