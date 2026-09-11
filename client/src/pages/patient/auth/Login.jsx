import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  User,
  Lock,
  Mail,
  Loader2,
  ArrowRight,
  Eye,
  EyeOff,
  Stethoscope,
  ShieldCheck,
  HeartPulse,
  Video,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/api/axios";

/* ── Reusable styled input field ── */
function Field({ label, id, icon: Icon, error, children, right }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-xs font-semibold text-white/60 uppercase tracking-wider">
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
        )}
        {children}
        {right && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">{right}</div>
        )}
      </div>
      {error && (
        <p className="text-red-400 text-xs font-medium flex items-center gap-1">
          <span className="w-1 h-1 rounded-full bg-red-400 inline-block" />
          {error}
        </p>
      )}
    </div>
  );
}

const inputCls = "w-full pl-10 pr-10 py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.1] text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-blue-500/60 focus:bg-white/[0.09] focus:ring-2 focus:ring-blue-500/20 transition-all duration-200";

const HIGHLIGHTS = [
  { icon: HeartPulse, label: "24/7 Online Consultations" },
  { icon: Video, label: "Encrypted WebRTC Video Calls" },
  { icon: FileText, label: "Digital Prescriptions & Records" },
];

export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await api.post("/patients/login", form);
      localStorage.setItem("patientToken", response.data.data.token);
      localStorage.setItem("patient", JSON.stringify(response.data.data.patient));
      toast.success("Welcome back to TeleClinic!");
      navigate("/patient/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080B14] flex flex-col" style={{ overflowX: "clip" }}>

      {/* Ambient orbs */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden>
        <div className="absolute top-[-15%] right-[5%] w-[600px] h-[600px] rounded-full bg-blue-600/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-cyan-600/7 blur-[110px]" />
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.7) 1px, transparent 1px),linear-gradient(90deg,rgba(255,255,255,.7) 1px,transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-105 transition-transform">
            <Stethoscope className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-black text-white">TeleClinic</span>
        </Link>
        <div className="flex items-center gap-2 text-xs text-white/40">
          New patient?
          <Link to="/patient/register" className="text-blue-400 font-semibold hover:text-blue-300 transition-colors">
            Create Account <ArrowRight className="w-3 h-3 inline" />
          </Link>
        </div>
      </nav>

      {/* Main */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-4xl grid lg:grid-cols-2 gap-10 items-center">

          {/* ── Left panel – value prop ── */}
          <div className="hidden lg:flex flex-col gap-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Doctors Available Now
              </div>
              <h1 className="text-4xl font-black text-white leading-[1.1] tracking-tight">
                Welcome back
                <br />
                <span
                  className="bg-clip-text text-transparent"
                  style={{ backgroundImage: "linear-gradient(135deg,#60a5fa,#a78bfa,#34d399)" }}
                >
                  to your health.
                </span>
              </h1>
              <p className="text-white/40 text-base leading-relaxed">
                Sign in to access your consultations, medical records, prescriptions, and pharmacy orders — all in one secure place.
              </p>
            </div>

            <ul className="space-y-3">
              {HIGHLIGHTS.map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-center gap-3 text-sm text-white/50">
                  <div className="w-8 h-8 rounded-lg bg-white/[0.05] border border-white/[0.08] flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-blue-400" />
                  </div>
                  {label}
                </li>
              ))}
            </ul>

            <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.07]">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">256-bit Encrypted Session</p>
                <p className="text-[11px] text-white/40 mt-0.5">Your login is secured with JWT authentication and HIPAA-compliant data handling.</p>
              </div>
            </div>
          </div>

          {/* ── Right panel – form ── */}
          <div className="w-full">
            <div className="rounded-3xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl p-8 shadow-2xl shadow-black/40">

              {/* Header */}
              <div className="mb-8 text-center">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-blue-500/30">
                  <User className="w-7 h-7 text-white" />
                </div>
                <h2 className="text-2xl font-black text-white">Patient Login</h2>
                <p className="text-white/40 text-sm mt-1">Access your consultations & health records</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">

                {/* Email */}
                <Field label="Email Address" id="email" icon={Mail}>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={handleChange}
                    className={inputCls}
                    required
                    autoComplete="email"
                  />
                </Field>

                {/* Password */}
                <Field
                  label="Password"
                  id="password"
                  icon={Lock}
                  right={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-white/30 hover:text-white/60 transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  }
                >
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
                </Field>

                {/* Forgot */}
                <div className="text-right -mt-1">
                  <Link
                    to="/patient/forgot-password"
                    className="text-xs text-blue-400 hover:text-blue-300 font-semibold transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-500 hover:to-cyan-500 shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 disabled:opacity-60 disabled:cursor-not-allowed hover:-translate-y-0.5 transition-all duration-200 mt-1"
                >
                  {loading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Signing In…</>
                  ) : (
                    <>Sign In <ArrowRight className="w-4 h-4" /></>
                  )}
                </button>
              </form>

              <p className="mt-6 text-center text-xs text-white/30">
                Don't have an account?{" "}
                <Link to="/patient/register" className="text-blue-400 font-semibold hover:text-blue-300 transition-colors">
                  Create Account
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