import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Stethoscope,
  Loader2,
  Eye,
  EyeOff,
  User,
  Mail,
  Phone,
  Lock,
  ArrowRight,
  CheckCircle,
  BadgeCheck,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import doctorApi from "@/api/doctorApi";

const inputCls = "w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.1] text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-emerald-500/60 focus:bg-white/[0.09] focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200";

const PERKS = [
  "No platform fee — keep 100% of consultation earnings",
  "AI-generated SOAP notes & clinical summaries",
  "Flexible scheduling with custom availability slots",
  "Verified badge displayed to patients",
];

function Field({ label, id, icon: Icon, error, children }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-xs font-semibold text-white/60 uppercase tracking-wider">
        {label}
      </label>
      <div className="relative">
        {Icon && <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />}
        {children}
      </div>
      {error && (
        <p className="text-red-400 text-xs font-medium flex items-center gap-1">
          <span className="w-1 h-1 rounded-full bg-red-400 inline-block" />{error}
        </p>
      )}
    </div>
  );
}

export default function DoctorRegister() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "", password: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) return toast.error("Passwords do not match.");
    if (form.password.length < 8) return toast.error("Password must be at least 8 characters.");

    try {
      setLoading(true);
      const res = await doctorApi.post("/doctors/register", {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone,
        password: form.password,
      });
      toast.success(res.data.message || "Registration successful! Please verify your email.");
      setTimeout(() => navigate("/doctor/login"), 2000);
    } catch (err) {
      toast.error(err.response?.data?.message || "Doctor registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080B14] flex flex-col" style={{ overflowX: "clip" }}>

      {/* Ambient orbs */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden>
        <div className="absolute top-[-15%] left-[5%] w-[600px] h-[600px] rounded-full bg-emerald-600/8 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-teal-600/6 blur-[110px]" />
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
          Already registered?
          <Link to="/doctor/login" className="text-emerald-400 font-semibold hover:text-emerald-300 transition-colors">
            Sign In <ArrowRight className="w-3 h-3 inline" />
          </Link>
        </div>
      </nav>

      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-10 items-center">

          {/* Left panel */}
          <div className="hidden lg:flex flex-col gap-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-400">
                <BadgeCheck className="w-3.5 h-3.5" /> Join Our Verified Physicians
              </div>
              <h1 className="text-4xl font-black text-white leading-[1.1] tracking-tight">
                Expand your practice,
                <br />
                <span
                  className="bg-clip-text text-transparent"
                  style={{ backgroundImage: "linear-gradient(135deg,#34d399,#06b6d4,#6366f1)" }}
                >
                  digitally.
                </span>
              </h1>
              <p className="text-white/40 text-base leading-relaxed">
                Join TeleClinic's network of board-certified physicians and reach patients who need you — from anywhere, at any time.
              </p>
            </div>

            <ul className="space-y-3">
              {PERKS.map((perk) => (
                <li key={perk} className="flex items-center gap-3 text-sm text-white/50">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  {perk}
                </li>
              ))}
            </ul>

            <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.07]">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">AI-Assisted Clinical Tools</p>
                <p className="text-[11px] text-white/40 mt-0.5">Auto-generate SOAP notes, prescription summaries, and recheckup reminders in one click.</p>
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
                <h2 className="text-2xl font-black text-white">Join as Doctor</h2>
                <p className="text-white/40 text-sm mt-1">Create your physician account — verification takes 24hrs</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">

                <div className="grid grid-cols-2 gap-3">
                  <Field label="First Name" id="firstName" icon={User}>
                    <input id="firstName" name="firstName" placeholder="James" value={form.firstName} onChange={handleChange} className={inputCls} required />
                  </Field>
                  <Field label="Last Name" id="lastName" icon={User}>
                    <input id="lastName" name="lastName" placeholder="Wilson" value={form.lastName} onChange={handleChange} className={inputCls} required />
                  </Field>
                </div>

                <Field label="Medical Email" id="email" icon={Mail}>
                  <input id="email" type="email" name="email" placeholder="dr.wilson@hospital.org" value={form.email} onChange={handleChange} className={inputCls} required />
                </Field>

                <Field label="Phone Number" id="phone" icon={Phone}>
                  <input id="phone" name="phone" type="tel" placeholder="+1 (555) 000-0000" value={form.phone} onChange={handleChange} className={inputCls} required />
                </Field>

                <div className="grid grid-cols-2 gap-3">
                  <Field label="Password" id="password" icon={Lock}>
                    <input
                      id="password" name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Min. 8 characters"
                      value={form.password} onChange={handleChange}
                      className={`${inputCls} pr-10`} required
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors" tabIndex={-1}>
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </Field>

                  <Field label="Confirm Password" id="confirmPassword" icon={Lock}>
                    <input
                      id="confirmPassword" name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Repeat password"
                      value={form.confirmPassword} onChange={handleChange}
                      className={`${inputCls} pr-10`} required
                    />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors" tabIndex={-1}>
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </Field>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-500 hover:to-teal-500 shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 disabled:opacity-60 disabled:cursor-not-allowed hover:-translate-y-0.5 transition-all duration-200 mt-2"
                >
                  {loading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Submitting Application…</>
                  ) : (
                    <><Stethoscope className="w-4 h-4" /> Create Doctor Account</>
                  )}
                </button>
              </form>

              <p className="mt-6 text-center text-xs text-white/30">
                Already registered?{" "}
                <Link to="/doctor/login" className="text-emerald-400 font-semibold hover:text-emerald-300 transition-colors">
                  Doctor Sign In
                </Link>
              </p>

              <p className="mt-3 text-center text-[10px] text-white/20 leading-relaxed">
                By registering you agree to our Physician Terms & HIPAA obligations.
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