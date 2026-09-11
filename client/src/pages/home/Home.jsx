import { Link } from "react-router-dom";
import {
  Video,
  Bot,
  Pill,
  FileText,
  ShieldCheck,
  Stethoscope,
  Sparkles,
  ArrowRight,
  HeartPulse,
  Users,
  Shield,
  CheckCircle,
  Star,
  Zap,
  Lock,
  Activity,
  ChevronRight,
  Send,
  MessageSquare,
  Clock,
  BadgeCheck,
  Mic,
  Calendar,
  Phone,
} from "lucide-react";
import { useEffect, useRef, useState, useCallback } from "react";

/* ═══════════════════════════════════════════════
   Smooth scroll helper
═══════════════════════════════════════════════ */
function scrollTo(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

/* ═══════════════════════════════════════════════
   Animated counter hook
═══════════════════════════════════════════════ */
function useCounter(target, duration = 1800, delay = 0) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const fired = useRef(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || fired.current) return;
        fired.current = true;
        setTimeout(() => {
          const start = performance.now();
          const tick = (now) => {
            const p = Math.min((now - start) / duration, 1);
            const e = 1 - Math.pow(1 - p, 3);
            setCount(Math.floor(e * target));
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }, delay);
      },
      { threshold: 0.2 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration, delay]);
  return [count, ref];
}

/* ═══════════════════════════════════════════════
   Fade-in on scroll hook
═══════════════════════════════════════════════ */
function useFadeIn(delay = 0) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setVisible(true), delay);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [delay]);
  return [ref, visible];
}

/* ═══════════════════════════════════════════════
   StatCard
═══════════════════════════════════════════════ */
function StatCard({ value, suffix = "", label, delay }) {
  const [count, ref] = useCounter(value, 1800, delay);
  return (
    <div ref={ref} className="text-center px-6">
      <p className="text-4xl font-black text-white tabular-nums">
        {count}
        {suffix}
      </p>
      <p className="text-sm text-white/40 font-medium mt-1">{label}</p>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   AI Receptionist Demo
   — auto-plays a scripted conversation
═══════════════════════════════════════════════ */
const CHAT_SCRIPT = [
  { from: "user", text: "Hi, I've been having chest tightness and shortness of breath for 3 days." },
  { from: "ai", text: "I understand — that sounds uncomfortable. Can you tell me if the tightness gets worse during physical activity or at rest?", delay: 1200 },
  { from: "user", text: "It gets worse when I walk fast. Also a little dizziness." },
  { from: "ai", text: "Thank you. Based on your symptoms — exertional chest tightness and dizziness — I'm assessing this as a moderate-priority cardiac concern. Let me match you with the right specialist.", delay: 1800 },
  { from: "ai", text: "I've found 3 available Cardiologists for you today:", delay: 900, isDoctorSuggestion: true },
];

const SUGGESTED_DOCTORS = [
  { name: "Dr. Arjun Mehta", spec: "Cardiologist", rating: 4.9, exp: "12 yrs", available: "Today 3:00 PM", avatar: "AM" },
  { name: "Dr. Priya Nair", spec: "Cardiologist", rating: 4.8, exp: "9 yrs", available: "Today 4:30 PM", avatar: "PN" },
  { name: "Dr. Rohan Das", spec: "Cardiologist", rating: 4.7, exp: "7 yrs", available: "Tomorrow 10 AM", avatar: "RD" },
];

function AIDemo() {
  const [messages, setMessages] = useState([]);
  const [typing, setTyping] = useState(false);
  const [step, setStep] = useState(0);
  const [started, setStarted] = useState(false);
  const chatRef = useRef(null);
  const containerRef = useRef(null);
  const runNextRef = useRef(null);

  const runNext = useCallback((currentStep) => {
    if (currentStep >= CHAT_SCRIPT.length) return;
    const msg = CHAT_SCRIPT[currentStep];
    const gap = msg.from === "ai" ? (msg.delay || 1000) : 600;

    if (msg.from === "ai") setTyping(true);

    setTimeout(() => {
      setTyping(false);
      setMessages((prev) => [...prev, msg]);
      setTimeout(() => runNextRef.current?.(currentStep + 1), msg.from === "user" ? 700 : 400);
    }, gap);
  }, []);

  useEffect(() => {
    runNextRef.current = runNext;
  }, [runNext]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true);
          setTimeout(() => runNext(0), 500);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [started, runNext]);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages, typing]);

  return (
    <div ref={containerRef} className="relative max-w-lg w-full mx-auto">
      {/* Phone frame */}
      <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-[#0d1117] shadow-2xl shadow-black/60">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/[0.07] bg-[#111827]">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-bold text-white">TeleClinic AI Receptionist</p>
            <p className="text-[10px] text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
              Online · Powered by Groq LLM
            </p>
          </div>
          <Mic className="w-4 h-4 text-white/30" />
        </div>

        {/* Messages */}
        <div ref={chatRef} className="h-[360px] overflow-y-auto px-4 py-4 space-y-3 scrollbar-none" style={{ scrollbarWidth: "none" }}>
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}>
              {msg.isDoctorSuggestion ? (
                <div className="w-full space-y-2">
                  <div className="flex justify-start">
                    <div className="max-w-[85%] bg-white/[0.06] border border-white/10 rounded-2xl rounded-tl-sm px-4 py-2.5">
                      <p className="text-xs text-white/80 leading-relaxed">{msg.text}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {SUGGESTED_DOCTORS.map((doc, j) => (
                      <div
                        key={j}
                        className="flex items-center gap-3 bg-white/[0.04] border border-white/[0.08] rounded-2xl px-3 py-2.5 hover:border-violet-500/30 transition-colors cursor-pointer group"
                        style={{ animationDelay: `${j * 150}ms` }}
                      >
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-black text-xs shrink-0">
                          {doc.avatar}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-white truncate">{doc.name}</p>
                          <p className="text-[10px] text-white/40">{doc.spec} · {doc.exp} exp</p>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="flex items-center gap-0.5 justify-end mb-0.5">
                            <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                            <span className="text-[10px] text-amber-400 font-bold">{doc.rating}</span>
                          </div>
                          <p className="text-[9px] text-emerald-400">{doc.available}</p>
                        </div>
                        <button className="shrink-0 px-2.5 py-1 rounded-lg bg-blue-600/80 hover:bg-blue-500 text-[9px] font-bold text-white transition-colors group-hover:scale-105">
                          Book
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div
                  className={`max-w-[82%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed ${
                    msg.from === "user"
                      ? "bg-gradient-to-br from-blue-600 to-cyan-600 text-white rounded-tr-sm"
                      : "bg-white/[0.06] border border-white/10 text-white/80 rounded-tl-sm"
                  }`}
                >
                  {msg.text}
                </div>
              )}
            </div>
          ))}

          {/* Typing indicator */}
          {typing && (
            <div className="flex justify-start">
              <div className="bg-white/[0.06] border border-white/10 rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1.5 items-center">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-white/40"
                    style={{ animation: `bounce 1s ease infinite`, animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Input bar */}
        <div className="px-4 py-3 border-t border-white/[0.07] bg-[#111827] flex items-center gap-2">
          <div className="flex-1 bg-white/[0.05] border border-white/10 rounded-xl px-3 py-2 text-xs text-white/30">
            Describe your symptoms…
          </div>
          <button className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
            <Send className="w-3.5 h-3.5 text-white" />
          </button>
        </div>
      </div>

      {/* Ambient glow */}
      <div className="absolute -inset-6 -z-10 bg-gradient-to-br from-violet-600/15 to-blue-600/10 blur-3xl rounded-3xl" />
    </div>
  );
}

/* ═══════════════════════════════════════════════
   Feature data
═══════════════════════════════════════════════ */
const features = [
  { icon: Video, gradient: "from-blue-500 to-cyan-500", glow: "group-hover:shadow-blue-500/25", title: "Encrypted WebRTC Video", desc: "HD P2P video with camera, mic, and screen share controls — fully browser-native.", tag: "HIPAA" },
  { icon: FileText, gradient: "from-emerald-500 to-teal-500", glow: "group-hover:shadow-emerald-500/25", title: "Digital Prescriptions", desc: "Structured multi-medicine prescriptions with validity periods and recheckup reminders.", tag: "E-Rx" },
  { icon: Pill, gradient: "from-amber-500 to-orange-500", glow: "group-hover:shadow-amber-500/25", title: "Integrated Pharmacy", desc: "Direct medicine purchasing with cart management and live Vrio CRM checkout.", tag: "Live CRM" },
  { icon: Sparkles, gradient: "from-pink-500 to-rose-500", glow: "group-hover:shadow-pink-500/25", title: "AI Clinical Summary", desc: "Automated synthesis of consultation transcripts into SOAP-ready clinical notes.", tag: "AI" },
  { icon: ShieldCheck, gradient: "from-indigo-500 to-blue-600", glow: "group-hover:shadow-indigo-500/25", title: "Role-Based Security", desc: "Strict backend authorization for Patients, Doctors, and Admins with JWT safeguards.", tag: "Zero Trust" },
  { icon: Calendar, gradient: "from-violet-500 to-purple-600", glow: "group-hover:shadow-violet-500/25", title: "Smart Scheduling", desc: "Doctors set availability slots; patients book and receive calendar confirmations instantly.", tag: "Real-time" },
];

/* ═══════════════════════════════════════════════
   Portal data
═══════════════════════════════════════════════ */
const portals = [
  {
    icon: Users,
    accent: "from-blue-500 to-cyan-500",
    border: "border-blue-500/20 hover:border-blue-500/50",
    glow: "hover:shadow-blue-500/10",
    title: "Patient Portal",
    desc: "Book appointments, join video consultations, access health records, chat with AI, and order medicines.",
    links: [
      { to: "/patient/login", label: "Login", variant: "outline" },
      { to: "/patient/register", label: "Register Free", variant: "primary", accent: "bg-blue-600 hover:bg-blue-500" },
    ],
    perks: ["Free to register", "24/7 AI support", "Instant prescriptions"],
  },
  {
    icon: Stethoscope,
    accent: "from-emerald-500 to-teal-500",
    border: "border-emerald-500/20 hover:border-emerald-500/50",
    glow: "hover:shadow-emerald-500/10",
    title: "Doctor Portal",
    desc: "Manage availability, conduct encrypted consultations, write prescriptions & generate AI summaries.",
    links: [
      { to: "/doctor/login", label: "Login", variant: "outline" },
      { to: "/doctor/register", label: "Join as Doctor", variant: "primary", accent: "bg-emerald-600 hover:bg-emerald-500" },
    ],
    perks: ["Verified credentials", "AI-assisted notes", "Digital prescriptions"],
  },
  {
    icon: Shield,
    accent: "from-violet-500 to-purple-600",
    border: "border-violet-500/20 hover:border-violet-500/50",
    glow: "hover:shadow-violet-500/10",
    title: "Admin Portal",
    desc: "System-wide oversight of patients, doctors, consultations, pharmacy orders, and CRM integrations.",
    links: [
      { to: "/admin/login", label: "Sign in to Admin", variant: "primary", accent: "bg-violet-600 hover:bg-violet-500", full: true },
    ],
    perks: ["Full audit trail", "CRM integration", "Analytics dashboard"],
  },
];

/* ═══════════════════════════════════════════════
   How it works steps
═══════════════════════════════════════════════ */
const HOW_STEPS = [
  { n: "01", icon: MessageSquare, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20", title: "Describe Symptoms", desc: "Chat with the AI receptionist — describe what you're feeling in plain language." },
  { n: "02", icon: Bot, color: "text-violet-400", bg: "bg-violet-500/10 border-violet-500/20", title: "AI Triage & Matching", desc: "Groq LLM assesses urgency and instantly matches you with the right specialist." },
  { n: "03", icon: Video, color: "text-cyan-400", bg: "bg-cyan-500/10 border-cyan-500/20", title: "Video Consultation", desc: "Join an encrypted WebRTC session with your matched doctor — from anywhere." },
  { n: "04", icon: Pill, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", title: "Prescription & Pharmacy", desc: "Receive your digital prescription and order medications directly from the platform." },
];

/* ═══════════════════════════════════════════════
   Main Component
═══════════════════════════════════════════════ */
export default function Home() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const navLinks = [
    { label: "Services", id: "services" },
    { label: "How it Works", id: "how-it-works" },
    { label: "AI Demo", id: "ai-demo" },
    { label: "Portals", id: "portals" },
  ];

  return (
    <div className="bg-[#080B14] min-h-screen text-white" style={{ overflowX: "clip" }}>

      {/* ── CSS for typing bounce & fade animations ── */}
      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-4px); opacity: 1; }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeSlideUp 0.6s ease forwards; }
        html { scroll-behavior: smooth; }
      `}</style>

      {/* ── Ambient background ── */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden>
        <div className="absolute top-[-20%] left-[5%]  w-[700px] h-[700px] rounded-full bg-blue-600/8   blur-[130px]" />
        <div className="absolute top-[35%]  right-[-8%] w-[550px] h-[550px] rounded-full bg-violet-600/7 blur-[120px]" />
        <div className="absolute bottom-[5%]  left-[30%] w-[500px] h-[500px] rounded-full bg-cyan-500/5  blur-[110px]" />
        <div
          className="absolute inset-0 opacity-[0.022]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.7) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
      </div>

      {/* ══════════════════════════════════════
          NAVBAR
      ══════════════════════════════════════ */}
      <nav
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-[#080B14]/90 backdrop-blur-xl border-b border-white/[0.07] shadow-2xl shadow-black/40"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center h-[68px] px-6">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-105 transition-transform">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black text-white">TeleClinic</span>
          </Link>

          {/* Nav links — smooth scroll */}
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-white/50">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => scrollTo(link.id)}
                className="hover:text-white transition-colors duration-200 flex items-center gap-1.5"
              >
                {link.label === "AI Demo" && <Sparkles className="w-3.5 h-3.5 text-violet-400" />}
                {link.label}
              </button>
            ))}
          </div>

          {/* Auth buttons */}
          <div className="flex items-center gap-2">
            <Link to="/doctor/login" className="hidden md:block">
              <button className="px-4 py-2 rounded-xl text-xs font-semibold text-emerald-400 hover:bg-emerald-400/10 transition-all duration-200">
                Doctor Portal
              </button>
            </Link>
            <Link to="/patient/login">
              <button className="px-4 py-2 rounded-xl text-xs font-semibold text-white/60 border border-white/10 hover:border-white/25 hover:bg-white/5 transition-all duration-200">
                Login
              </button>
            </Link>
            <Link to="/patient/register">
              <button className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-500 hover:to-cyan-500 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-200">
                Get Started
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ══════════════════════════════════════
          HERO
      ══════════════════════════════════════ */}
      <section className="relative max-w-7xl mx-auto px-6 pt-24 pb-20 lg:pt-32 lg:pb-28">
        <div className="grid lg:grid-cols-12 gap-16 items-center">

          {/* Left */}
          <div className="lg:col-span-6 space-y-7">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-white/60">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              AI-Powered Telemedicine Platform
              <ChevronRight className="w-3.5 h-3.5 text-white/30" />
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-[4.5rem] font-black tracking-tight leading-[1.08]">
              <span className="text-white">Virtual Care,</span>
              <br />
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: "linear-gradient(135deg, #60a5fa 0%, #a78bfa 50%, #34d399 100%)" }}
              >
                Reimagined.
              </span>
            </h1>

            <p className="text-white/50 text-lg max-w-lg leading-relaxed">
              Connect instantly with board-certified physicians via AI-assisted triage, encrypted P2P video consultations, and digital prescriptions — all in one platform.
            </p>

            <div className="flex flex-wrap gap-3 pt-1">
              <Link to="/patient/register">
                <button className="flex items-center gap-2.5 px-7 py-3.5 rounded-2xl font-bold text-sm bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-500 hover:to-cyan-500 shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5 transition-all duration-200">
                  Book Consultation <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
              <button
                onClick={() => scrollTo("ai-demo")}
                className="flex items-center gap-2.5 px-7 py-3.5 rounded-2xl font-bold text-sm border border-violet-400/30 text-violet-300 hover:bg-violet-400/10 hover:border-violet-400/60 hover:-translate-y-0.5 transition-all duration-200"
              >
                <Bot className="w-4 h-4" /> See AI Demo
              </button>
            </div>

            {/* Trust pills */}
            <div className="flex flex-wrap gap-2 pt-1">
              {["HIPAA Compliant", "256-bit Encryption", "Board-Certified MDs", "WebRTC P2P"].map((t) => (
                <span key={t} className="flex items-center gap-1.5 text-[11px] font-medium text-white/40 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.06]">
                  <CheckCircle className="w-3 h-3 text-emerald-400/70" />{t}
                </span>
              ))}
            </div>
          </div>

          {/* Right — Hero image */}
          <div className="lg:col-span-6 relative">
            <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl shadow-black/60">
              <img
                src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=900&auto=format"
                alt="Telemedicine Doctor"
                className="w-full h-[480px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#080B14]/90 via-transparent to-transparent" />

              {/* Live badge */}
              <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between bg-white/[0.08] backdrop-blur-xl border border-white/10 rounded-2xl px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                    <Activity className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">Live Consultation</p>
                    <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse inline-block" />
                      Doctor available now
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-full">
                  ONLINE
                </span>
              </div>
            </div>

            {/* Floating rating */}
            <div className="absolute -top-5 -right-4 bg-[#111827]/90 backdrop-blur-xl border border-white/10 rounded-2xl px-4 py-3 shadow-xl hidden lg:flex items-center gap-3">
              <div className="flex">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />)}
              </div>
              <div>
                <p className="text-xs font-bold text-white">4.9 / 5</p>
                <p className="text-[10px] text-white/40">2,400+ patients</p>
              </div>
            </div>

            {/* Floating AI */}
            <div className="absolute -bottom-4 -left-6 bg-[#111827]/90 backdrop-blur-xl border border-white/10 rounded-2xl px-4 py-3 shadow-xl hidden lg:flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">AI Triage Complete</p>
                <p className="text-[10px] text-white/40">Specialist matched in &lt;30s</p>
              </div>
            </div>

            <div className="absolute inset-0 -z-10 rounded-3xl bg-gradient-to-tr from-blue-600/20 to-cyan-500/10 blur-3xl scale-105" />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          STATS BAR
      ══════════════════════════════════════ */}
      <div className="border-t border-b border-white/[0.05] bg-white/[0.015]">
        <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-white/[0.05]">
          <StatCard value={24} suffix="/7" label="Available Consultations" delay={0} />
          <StatCard value={2400} suffix="+" label="Patients Served" delay={150} />
          <StatCard value={100} suffix="%" label="Verified Specialists" delay={300} />
          <StatCard value={99} suffix="%" label="Platform Uptime" delay={450} />
        </div>
      </div>

      {/* ══════════════════════════════════════
          HOW IT WORKS
      ══════════════════════════════════════ */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center max-w-xl mx-auto space-y-4 mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs font-semibold text-cyan-400">
            <Zap className="w-3.5 h-3.5" /> Simple 4-Step Process
          </span>
          <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
            From symptom to solution<br />
            <span className="text-white/30">in minutes.</span>
          </h2>
        </div>

        <div className="relative">
          {/* Connector line */}
          <div className="hidden lg:block absolute top-8 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {HOW_STEPS.map((step, i) => (
              <div key={i} className="relative flex flex-col items-center text-center p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] hover:-translate-y-1 transition-all duration-300 group">
                <div className={`w-14 h-14 rounded-2xl border ${step.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <step.icon className={`w-6 h-6 ${step.color}`} />
                </div>
                <span className="text-[10px] font-black text-white/20 mb-1">{step.n}</span>
                <h3 className="text-sm font-bold text-white mb-2">{step.title}</h3>
                <p className="text-xs text-white/40 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          AI RECEPTIONIST DEMO
      ══════════════════════════════════════ */}
      <section id="ai-demo" className="border-t border-white/[0.05] py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* Left — copy */}
            <div className="space-y-7 lg:order-1">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-xs font-semibold text-violet-400">
                <Sparkles className="w-3.5 h-3.5" /> AI Medical Receptionist
              </span>
              <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-[1.1]">
                Smart triage,
                <br />
                <span className="text-white/30">zero wait time.</span>
              </h2>
              <p className="text-white/50 text-lg leading-relaxed">
                Our Groq LLM-powered AI receptionist listens to your symptoms, asks the right follow-up questions, assesses urgency, and instantly matches you with the most suitable specialist — all before you even speak to a doctor.
              </p>

              <ul className="space-y-3">
                {[
                  { icon: MessageSquare, color: "text-blue-400 bg-blue-500/10", text: "Natural language symptom input — no forms" },
                  { icon: Zap, color: "text-violet-400 bg-violet-500/10", text: "Urgency triage in under 30 seconds" },
                  { icon: BadgeCheck, color: "text-emerald-400 bg-emerald-500/10", text: "Matched only to verified, board-certified specialists" },
                  { icon: Calendar, color: "text-cyan-400 bg-cyan-500/10", text: "Instant availability check and one-tap booking" },
                ].map(({ icon: Icon, color, text }, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg ${color.split(" ")[1]} border border-white/5 flex items-center justify-center shrink-0`}>
                      <Icon className={`w-4 h-4 ${color.split(" ")[0]}`} />
                    </div>
                    <span className="text-sm text-white/60">{text}</span>
                  </li>
                ))}
              </ul>

              <div className="flex gap-3 pt-1">
                <Link to="/patient/ai">
                  <button className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:from-violet-500 hover:to-purple-500 shadow-lg shadow-violet-500/25 hover:-translate-y-0.5 transition-all duration-200">
                    <Bot className="w-4 h-4" /> Try AI Receptionist
                  </button>
                </Link>
                <Link to="/patient/register">
                  <button className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm bg-white/5 border border-white/10 hover:bg-white/10 text-white hover:-translate-y-0.5 transition-all duration-200">
                    Register Free <ArrowRight className="w-4 h-4 text-white/50" />
                  </button>
                </Link>
              </div>
            </div>

            {/* Right — live demo */}
            <div className="lg:order-2">
              <AIDemo />
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          SERVICES GRID
      ══════════════════════════════════════ */}
      <section id="services" className="max-w-7xl mx-auto px-6 py-24 border-t border-white/[0.05]">
        <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-semibold text-blue-400">
            <HeartPulse className="w-3.5 h-3.5" /> Complete Healthcare Ecosystem
          </span>
          <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
            Everything for the
            <br /><span className="text-white/30">entire care journey.</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feat, i) => (
            <div
              key={i}
              className={`group relative p-6 rounded-2xl bg-white/[0.03] border border-white/[0.07] hover:border-white/[0.15] hover:shadow-2xl ${feat.glow} transition-all duration-300 hover:-translate-y-1 overflow-hidden`}
            >
              <div className={`absolute -top-10 -right-10 w-28 h-28 rounded-full bg-gradient-to-br ${feat.gradient} opacity-0 group-hover:opacity-10 blur-2xl transition-opacity duration-500`} />
              <div className="flex items-start justify-between mb-4">
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${feat.gradient} flex items-center justify-center shadow-lg`}>
                  <feat.icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-[10px] font-bold text-white/30 border border-white/10 px-2 py-0.5 rounded-full">{feat.tag}</span>
              </div>
              <h3 className="text-base font-bold text-white mb-2">{feat.title}</h3>
              <p className="text-sm text-white/40 leading-relaxed">{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════
          PORTALS
      ══════════════════════════════════════ */}
      <section id="portals" className="border-t border-white/[0.05]">
        <div className="max-w-7xl mx-auto px-6 py-24 space-y-16">
          <div className="text-center max-w-xl mx-auto space-y-4">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-xs font-semibold text-violet-400">
              <Lock className="w-3.5 h-3.5" /> Multi-Portal Architecture
            </span>
            <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
              Your role, your portal.
            </h2>
            <p className="text-white/40">Experience the platform from every perspective.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {portals.map((portal, i) => (
              <div
                key={i}
                className={`relative group flex flex-col p-7 rounded-2xl bg-white/[0.03] border ${portal.border} hover:shadow-2xl ${portal.glow} transition-all duration-300 hover:-translate-y-1`}
              >
                <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r ${portal.accent} opacity-30 group-hover:opacity-70 transition-opacity`} />
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${portal.accent} flex items-center justify-center mb-5 shadow-lg group-hover:scale-105 transition-transform`}>
                  <portal.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-black text-white mb-2">{portal.title}</h3>
                <p className="text-sm text-white/40 leading-relaxed mb-5 flex-1">{portal.desc}</p>
                <ul className="space-y-1.5 mb-6">
                  {portal.perks.map((perk) => (
                    <li key={perk} className="flex items-center gap-2 text-xs text-white/40">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400/70 shrink-0" />{perk}
                    </li>
                  ))}
                </ul>
                <div className="flex gap-2">
                  {portal.links.map((link, j) => (
                    <Link key={j} to={link.to} className="flex-1">
                      {link.variant === "outline" ? (
                        <button className="w-full py-2.5 rounded-xl text-xs font-semibold border border-white/10 text-white/60 hover:bg-white/5 hover:text-white transition-all duration-200">
                          {link.label}
                        </button>
                      ) : (
                        <button className={`w-full py-2.5 rounded-xl text-xs font-bold text-white ${link.accent} shadow-md transition-all duration-200 hover:opacity-90`}>
                          {link.label}
                        </button>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          CTA BANNER
      ══════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        <div className="relative rounded-3xl overflow-hidden border border-white/10 p-12 text-center space-y-6">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-violet-600/10 to-cyan-600/10" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#080B14]/60 to-transparent" />
          <div className="relative space-y-4">
            <p className="text-white/40 text-xs font-bold uppercase tracking-widest">Get started in minutes</p>
            <h2 className="text-4xl sm:text-5xl font-black text-white">
              Healthcare at your fingertips.
            </h2>
            <p className="text-white/50 max-w-md mx-auto text-base">
              Join thousands of patients already experiencing the future of digital healthcare.
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <Link to="/patient/register">
                <button className="flex items-center gap-2 px-8 py-3.5 rounded-2xl font-bold text-sm bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-500 hover:to-cyan-500 shadow-xl shadow-blue-500/30 hover:-translate-y-0.5 transition-all duration-200">
                  Create Free Account <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
              <Link to="/patient/ai">
                <button className="flex items-center gap-2 px-8 py-3.5 rounded-2xl font-bold text-sm bg-white/5 border border-white/10 hover:bg-white/10 text-white hover:-translate-y-0.5 transition-all duration-200">
                  <Bot className="w-4 h-4 text-violet-400" /> Ask AI
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          FOOTER
      ══════════════════════════════════════ */}
      <footer className="border-t border-white/[0.05]">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <Stethoscope className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-black text-white text-sm">TeleClinic</span>
            <span className="text-white/25 text-xs">— Production Telemedicine Platform</span>
          </div>
          <div className="flex items-center gap-6 text-xs text-white/30">
            {[
              { to: "/patient/login", label: "Patient" },
              { to: "/doctor/login", label: "Doctor" },
              { to: "/admin/login", label: "Admin" },
              { to: "/patient/ai", label: "AI Receptionist" },
            ].map((l) => (
              <Link key={l.to} to={l.to} className="hover:text-white transition-colors duration-200">{l.label}</Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}