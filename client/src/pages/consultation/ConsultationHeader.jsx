import { useEffect, useState } from "react";
import {
  ShieldCheck,
  PhoneOff,
  Wifi,
  Stethoscope,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function ConsultationHeader({
  connected = false,
  appointment,
  user,
  onEndCall,
}) {
  const [seconds, setSeconds] = useState(0);

  // Live Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60)
      .toString()
      .padStart(2, "0");
    const secs = (totalSeconds % 60).toString().padStart(2, "0");
    const hrs = Math.floor(totalSeconds / 3600);
    if (hrs > 0) {
      const h = hrs.toString().padStart(2, "0");
      return `${h}:${mins}:${secs}`;
    }
    return `${mins}:${secs}`;
  };

  const isDoctor = user?.type === "Doctor";
  const doctor = appointment?.doctor;
  const patient = appointment?.patient;

  return (
    <header className="bg-slate-950 border-b border-slate-800/80 px-4 sm:px-6 py-3 text-white flex items-center justify-between gap-4 z-20 shrink-0">
      {/* LEFT: Branding & Appointment Ref */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0">
          <Stethoscope className="w-5 h-5" />
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm sm:text-base font-black tracking-tight text-white flex items-center gap-1.5">
              TeleClinic <span className="text-cyan-400 font-semibold text-xs">Virtual Care</span>
            </h1>
            <Badge className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse mr-1" /> LIVE
            </Badge>
          </div>

          <p className="text-[11px] text-slate-400 font-medium">
            {isDoctor ? (
              <>Patient: <strong className="text-slate-200">{patient?.firstName} {patient?.lastName || "Patient"}</strong></>
            ) : (
              <>Practitioner: <strong className="text-slate-200">Dr. {doctor?.firstName} {doctor?.lastName || "Specialist"}</strong> ({doctor?.specialization || "Physician"})</>
            )}
          </p>
        </div>
      </div>

      {/* CENTER: Live Call Timer & Signal Status */}
      <div className="hidden md:flex items-center gap-3 bg-slate-900/80 border border-slate-800 px-4 py-1.5 rounded-2xl">
        <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-cyan-300">
          <Clock className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span>{formatTime(seconds)}</span>
        </div>

        <div className="w-px h-3.5 bg-slate-700" />

        <div className="flex items-center gap-1.5 text-[11px] text-slate-300 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>256-Bit Encrypted</span>
        </div>

        <div className="w-px h-3.5 bg-slate-700" />

        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
          <Wifi className={`w-3.5 h-3.5 ${connected ? "text-emerald-400" : "text-amber-400"}`} />
          <span>{connected ? "HD Stream" : "Connecting"}</span>
        </div>
      </div>

      {/* RIGHT: End Consultation CTA */}
      <div className="flex items-center gap-2">
        <Button
          type="button"
          onClick={onEndCall}
          className="bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl h-9 px-4 text-xs gap-1.5 shadow-md shadow-rose-600/30 transition cursor-pointer"
        >
          <PhoneOff className="w-3.5 h-3.5" />
          <span>End Consultation</span>
        </Button>
      </div>
    </header>
  );
}
