import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import {
  UserPlus,
  Loader2,
  Eye,
  EyeOff,
  User,
  Mail,
  Phone,
  Lock,
  Stethoscope,
  CheckCircle,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { registerPatient } from "@/services/patient.service";

const schema = z
  .object({
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    lastName: z.string().min(2, "Last name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    phone: z.string().min(10, "Phone number must be at least 10 digits"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

/* ── Reusable styled input ── */
function Field({ label, id, icon: Icon, error, children }) {
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

const inputCls = (withIcon = true) =>
  `w-full ${withIcon ? "pl-10" : "pl-4"} pr-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.1] text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-blue-500/60 focus:bg-white/[0.09] focus:ring-2 focus:ring-blue-500/20 transition-all duration-200`;

const PERKS = [
  "Free to create — no credit card needed",
  "AI symptom triage & specialist matching",
  "Encrypted HD video consultations",
  "Digital prescriptions delivered instantly",
];

export default function Register() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (data) => {
    try {
      const response = await registerPatient(data);
      toast.success(response.message || "Account created! Please verify your email.");
      reset();
      setTimeout(() => navigate("/patient/login"), 2000);
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed. Please check your details.");
    }
  };

  return (
    <div className="min-h-screen bg-[#080B14] flex flex-col" style={{ overflowX: "clip" }}>

      {/* Ambient orbs */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden>
        <div className="absolute top-[-15%] left-[5%] w-[600px] h-[600px] rounded-full bg-blue-600/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-violet-600/8 blur-[110px]" />
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
          Already have an account?
          <Link to="/patient/login" className="text-blue-400 font-semibold hover:text-blue-300 transition-colors">
            Sign In <ArrowRight className="w-3 h-3 inline" />
          </Link>
        </div>
      </nav>

      {/* Main content */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-10 items-center">

          {/* ── Left panel – value prop ── */}
          <div className="hidden lg:flex flex-col gap-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-semibold text-blue-400">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                Join 2,400+ Patients
              </div>
              <h1 className="text-4xl font-black text-white leading-[1.1] tracking-tight">
                Your health,
                <br />
                <span
                  className="bg-clip-text text-transparent"
                  style={{ backgroundImage: "linear-gradient(135deg,#60a5fa,#a78bfa,#34d399)" }}
                >
                  simplified.
                </span>
              </h1>
              <p className="text-white/40 text-base leading-relaxed">
                Create a free account and get instant access to board-certified doctors, AI-assisted triage, and your full medical record — from any device.
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
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4.5 h-4.5 text-white" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">HIPAA Compliant & Secure</p>
                <p className="text-[11px] text-white/40 mt-0.5">Your data is encrypted end-to-end and never shared without consent.</p>
              </div>
            </div>
          </div>

          {/* ── Right panel – form ── */}
          <div className="w-full">
            <div className="rounded-3xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl p-8 shadow-2xl shadow-black/40">

              {/* Header */}
              <div className="mb-8 text-center">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-blue-500/30">
                  <UserPlus className="w-7 h-7 text-white" />
                </div>
                <h2 className="text-2xl font-black text-white">Create Account</h2>
                <p className="text-white/40 text-sm mt-1">It's free — takes less than a minute</p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

                {/* Name row */}
                <div className="grid grid-cols-2 gap-3">
                  <Field label="First Name" id="firstName" icon={User} error={errors.firstName?.message}>
                    <input
                      id="firstName"
                      placeholder="John"
                      className={inputCls()}
                      {...register("firstName")}
                    />
                  </Field>
                  <Field label="Last Name" id="lastName" icon={User} error={errors.lastName?.message}>
                    <input
                      id="lastName"
                      placeholder="Doe"
                      className={inputCls()}
                      {...register("lastName")}
                    />
                  </Field>
                </div>

                {/* Email */}
                <Field label="Email Address" id="email" icon={Mail} error={errors.email?.message}>
                  <input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    className={inputCls()}
                    {...register("email")}
                  />
                </Field>

                {/* Phone */}
                <Field label="Phone Number" id="phone" icon={Phone} error={errors.phone?.message}>
                  <input
                    id="phone"
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    className={inputCls()}
                    {...register("phone")}
                  />
                </Field>

                {/* Password row */}
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Password" id="password" icon={Lock} error={errors.password?.message}>
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Min. 8 characters"
                      className={`${inputCls()} pr-10`}
                      {...register("password")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </Field>

                  <Field label="Confirm Password" id="confirmPassword" icon={Lock} error={errors.confirmPassword?.message}>
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Repeat password"
                      className={`${inputCls()} pr-10`}
                      {...register("confirmPassword")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </Field>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-500 hover:to-cyan-500 shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 disabled:opacity-60 disabled:cursor-not-allowed hover:-translate-y-0.5 transition-all duration-200 mt-2"
                >
                  {isSubmitting ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Creating Account…</>
                  ) : (
                    <><UserPlus className="w-4 h-4" /> Create Free Account</>
                  )}
                </button>
              </form>

              {/* Footer */}
              <p className="mt-6 text-center text-xs text-white/30">
                Already have an account?{" "}
                <Link to="/patient/login" className="text-blue-400 font-semibold hover:text-blue-300 transition-colors">
                  Sign In
                </Link>
              </p>

              <p className="mt-4 text-center text-[10px] text-white/20 leading-relaxed">
                By registering you agree to our Terms of Service and Privacy Policy.
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