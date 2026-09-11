import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Stethoscope,
  Lock,
  Mail,
  Loader2,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Calendar,
  FileText,
  Video,
} from "lucide-react";
import { toast } from "sonner";
import doctorApi from "@/api/doctorApi";

/* ── Shared input class ── */
const inputCls = "w-full pl-10 pr-10 py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.1] text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-emerald-500/60 focus:bg-white/[0.09] focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200";

const HIGHLIGHTS = [
  { icon: Calendar,  label: "Manage appointments & availability slots" },
  { icon: Video,     label: "Conduct encrypted WebRTC video consultations" },
  { icon: FileText,  label: "Write digital prescriptions with AI summaries" },
];

export default function DoctorLogin() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await doctorApi.post("/doctors/login", form);
      localStorage.setItem("doctorToken", response.data.data.token);
      localStorage.setItem("doctor", JSON.stringify(response.data.data.doctor));
      toast.success(`Welcome Dr. ${response.data.data.doctor.firstName}!`);
      navigate("/doctor/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080B14] flex flex-col" style={{ overflowX: "clip" }}>

      {/* Ambient orbs */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden>
        <div className="absolute top-[-15%] right-[5%] w-[600px] h-[600px] rounded-full bg-emerald-600/8 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-teal-600/6 blur-[110px]" />
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.7) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.7) 1px,transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/30 group-hover:scale-105 transition-transform">
            <Stethoscope className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-black text-white">TeleClinic</span>
          <span className="text-xs text-white/30 font-medium hidden sm:block">· Doctor Portal</span>
        </Link>
        <div className="flex items-center gap-2 text-xs text-white/40">
          New physician?
          <Link to="/doctor/register" className="text-emerald-400 font-semibold hover:text-emerald-300 transition-colors">
            Join as Doctor <ArrowRight className="w-3 h-3 inline" />
          </Link>
        </div>
      </nav>

      {/* Main */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-4xl grid lg:grid-cols-2 gap-10 items-center">

          {/* Left — value prop */}
          <div className="hidden lg:flex flex-col gap-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Doctor Portal
              </div>
              <h1 className="text-4xl font-black text-white leading-[1.1] tracking-tight">
                Patients are
                <br />
                <span
                  className="bg-clip-text text-transparent"
                  style={{ backgroundImage: "linear-gradient(135deg,#34d399,#06b6d4,#6366f1)" }}
                >
                  waiting for you.
                </span>
              </h1>
              <p className="text-white/40 text-base leading-relaxed">
                Sign in to manage your consultations, write digital prescriptions, and generate AI-assisted clinical notes — all from one secure dashboard.
              </p>
            </div>

            <ul className="space-y-3">
              {HIGHLIGHTS.map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-center gap-3 text-sm text-white/50">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-emerald-400" />
                  </div>
                  {label}
                </li>
              ))}
            </ul>

            <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.07]">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Credential Verified & HIPAA Secure</p>
                <p className="text-[11px] text-white/40 mt-0.5">All doctor accounts are verified. Patient data is encrypted end-to-end.</p>
              </div>
            </div>
          </div>

          {/* Right — form */}
          <div className="w-full">
            <div className="rounded-3xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl p-8 shadow-2xl shadow-black/40">

              <div className="mb-8 text-center">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-emerald-500/30">
                  <Stethoscope className="w-7 h-7 text-white" />
                </div>
                <h2 className="text-2xl font-black text-white">Doctor Sign In</h2>
                <p className="text-white/40 text-sm mt-1">Access your appointments & patient dashboard</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email */}
                <div className="space-y-1.5">
                  <label htmlFor="email" className="block text-xs font-semibold text-white/60 uppercase tracking-wider">Medical Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
                    <input
                      id="email"
                      type="email"
                      name="email"
                      placeholder="dr.smith@hospital.org"
                      value={form.email}
                      onChange={handleChange}
                      className={inputCls}
                      required
                      autoComplete="email"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <label htmlFor="password" className="block text-xs font-semibold text-white/60 uppercase tracking-wider">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="••••••••"
                      value={form.password}
                      onChange={handleChange}
                      className={inputCls}
                      required
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="text-right -mt-1">
                  <Link to="/doctor/forgot-password" className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold transition-colors">
                    Forgot password?
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-500 hover:to-teal-500 shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 disabled:opacity-60 disabled:cursor-not-allowed hover:-translate-y-0.5 transition-all duration-200 mt-1"
                >
                  {loading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Signing In…</>
                  ) : (
                    <><Stethoscope className="w-4 h-4" /> Doctor Sign In</>
                  )}
                </button>
              </form>

              <p className="mt-6 text-center text-xs text-white/30">
                Not registered yet?{" "}
                <Link to="/doctor/register" className="text-emerald-400 font-semibold hover:text-emerald-300 transition-colors">
                  Join as Doctor
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="relative z-10 py-4 text-center text-[11px] text-white/20 border-t border-white/[0.05]">
        TeleClinic · HIPAA-ready secure virtual healthcare
      </footer>
    </div>
  );
}