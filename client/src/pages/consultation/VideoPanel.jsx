import { useEffect, useRef, useState } from "react";
import {
  Camera,
  CameraOff,
  Mic,
  MicOff,
  ShieldCheck,
  Maximize2,
  Minimize2,
  RefreshCw,
  AlertTriangle,
  Lock,
} from "lucide-react";

function CameraErrorBadge({ cameraError, onRetryCamera }) {
  if (!cameraError) return null;
  if (cameraError === "denied") {
    return (
      <div className="pointer-events-auto flex items-center gap-1.5 bg-rose-900/90 border border-rose-700 text-rose-200 text-[9px] font-bold px-2 py-1 rounded-lg backdrop-blur shadow-md">
        <Lock className="w-2.5 h-2.5" />
        <span>Camera Blocked</span>
        <button
          type="button"
          onClick={onRetryCamera}
          className="ml-1 bg-rose-600 hover:bg-rose-500 text-white px-1.5 py-0.5 rounded text-[8px] font-bold transition cursor-pointer"
          title="Click to request camera permission"
        >
          Allow
        </button>
      </div>
    );
  }
  if (cameraError === "busy") {
    return (
      <button
        type="button"
        onClick={onRetryCamera}
        className="pointer-events-auto flex items-center gap-1 bg-amber-800/90 border border-amber-600 text-amber-200 text-[9px] font-bold px-2 py-1 rounded-lg backdrop-blur shadow-md hover:bg-amber-700 transition cursor-pointer"
        title="Camera is in use by another browser. Click to retry."
      >
        <RefreshCw className="w-2.5 h-2.5" />
        <span>🔄 Grab Webcam</span>
      </button>
    );
  }
  return (
    <div className="pointer-events-auto flex items-center gap-1 bg-slate-800/90 border border-slate-600 text-slate-300 text-[9px] font-bold px-2 py-1 rounded-lg backdrop-blur shadow-md">
      <AlertTriangle className="w-2.5 h-2.5 text-amber-400" />
      <span>No Camera</span>
    </div>
  );
}

export default function VideoPanel({
  localStream,
  remoteStream,
  isAudioMuted,
  isVideoOff,
  remoteAudioEnabled = true,
  remoteVideoEnabled = true,
  connectionStatus = "disconnected",
  user,
  appointment,
  isVirtualStream = false,
  cameraError = null,
  onRetryCamera,
}) {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [pipMinimized, setPipMinimized] = useState(false);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
      localVideoRef.current.play().catch(() => {});
    }
  }, [localStream, isVideoOff]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
      remoteVideoRef.current.play().catch(() => {});
    }
  }, [remoteStream, remoteVideoEnabled]);

  const isDoctor = user.type === "Doctor";
  const remoteRole = isDoctor ? "Patient" : "Doctor";
  const remoteName = isDoctor
    ? `${appointment?.patient?.firstName || "Patient"} ${appointment?.patient?.lastName || ""}`
    : `Dr. ${appointment?.doctor?.firstName || "Doctor"} ${appointment?.doctor?.lastName || ""}`;

  return (
    <div className="relative w-full h-full bg-slate-950 flex items-center justify-center overflow-hidden select-none">
      {/* 1. PRIMARY STAGE (Remote Participant) */}
      <div className="w-full h-full flex items-center justify-center relative">
        {remoteStream && remoteVideoEnabled ? (
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover sm:object-contain bg-slate-950"
          />
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-center space-y-4 max-w-md">
            {/* Animated Avatar Radar */}
            <div className="relative">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-3xl font-black text-white shadow-2xl">
                {isDoctor ? "PT" : "DR"}
              </div>
              <span className="absolute inset-0 rounded-full border-2 border-blue-400/40 animate-ping pointer-events-none" />
              <span className="absolute -inset-3 rounded-full border border-cyan-400/20 animate-pulse pointer-events-none" />
            </div>

            <div className="space-y-1">
              <h3 className="text-white font-bold text-xl sm:text-2xl">
                {remoteName}
              </h3>
              <p className="text-cyan-300 font-semibold text-xs uppercase tracking-wider">
                {remoteRole} Video Feed
              </p>
              <p className="text-slate-400 text-xs pt-2 leading-relaxed">
                {connectionStatus === "connected"
                  ? "Participant camera is temporarily paused or turned off."
                  : connectionStatus === "connecting"
                  ? "Negotiating secure P2P WebRTC video stream..."
                  : "Waiting for the other participant to enter the consultation room..."}
              </p>
            </div>
          </div>
        )}

        {/* Primary Stage Top Badges Overlay */}
        <div className="absolute top-4 left-4 flex items-center gap-2 z-10">
          <div className="flex items-center gap-1.5 rounded-2xl bg-black/60 backdrop-blur-md px-3 py-1.5 border border-white/10 text-white text-xs font-semibold shadow-lg">
            <span
              className={`w-2 h-2 rounded-full ${
                connectionStatus === "connected"
                  ? "bg-emerald-400 animate-pulse"
                  : connectionStatus === "connecting"
                  ? "bg-amber-400 animate-ping"
                  : "bg-slate-400"
              }`}
            />
            <span>
              {connectionStatus === "connected"
                ? "Live 1080p WebRTC"
                : connectionStatus === "connecting"
                ? "Establishing Connection..."
                : "Standby Room"}
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 rounded-2xl bg-black/60 backdrop-blur-md px-3 py-1.5 border border-white/10 text-slate-300 text-xs font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            <span>P2P Encrypted</span>
          </div>
        </div>

        {/* Camera permission banner — shown on main stage if permission denied */}
        {cameraError === "denied" && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 bg-rose-950/95 border border-rose-700 text-white rounded-2xl px-4 py-3 shadow-2xl backdrop-blur max-w-sm">
            <div className="w-9 h-9 rounded-xl bg-rose-800 flex items-center justify-center shrink-0">
              <Lock className="w-4 h-4 text-rose-300" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-rose-100">Camera Permission Blocked</p>
              <p className="text-[10px] text-rose-300 mt-0.5">
                Click the 🔒 icon in your browser address bar → allow Camera & Microphone
              </p>
            </div>
            <button
              type="button"
              onClick={onRetryCamera}
              className="shrink-0 bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-xl transition cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* Primary Stage Bottom Participant Label */}
        <div className="absolute bottom-4 left-4 z-10 flex items-center gap-2">
          <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/10 text-white text-xs shadow-lg">
            <span className="font-bold">{remoteName}</span>
            <span className="text-[10px] text-cyan-300 font-semibold uppercase bg-cyan-950/80 px-2 py-0.5 rounded-lg border border-cyan-800/60">
              {remoteRole}
            </span>

            <div className="flex items-center gap-1 pl-1 border-l border-white/20">
              {remoteAudioEnabled ? (
                <Mic className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <MicOff className="w-3.5 h-3.5 text-rose-400" />
              )}
              {remoteVideoEnabled ? (
                <Camera className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <CameraOff className="w-3.5 h-3.5 text-rose-400" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. FLOATING PICTURE-IN-PICTURE (Local Self Video) */}
      <div
        className={`absolute bottom-4 right-4 z-20 transition-all duration-300 rounded-2xl border shadow-2xl overflow-hidden ${
          pipMinimized
            ? "w-32 h-24 sm:w-36 sm:h-28"
            : "w-52 h-36 sm:w-64 sm:h-44"
        } ${cameraError === "denied" ? "border-rose-700 bg-rose-950" : "border-slate-700 bg-slate-900"}`}
      >
        {localStream && !isVideoOff ? (
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover ${
              !isVirtualStream ? "transform scale-x-[-1]" : ""
            }`}
          />
        ) : cameraError === "denied" ? (
          <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center bg-rose-950">
            <Lock className="w-5 h-5 text-rose-400 mb-1" />
            <span className="text-[9px] text-rose-300 font-bold">Camera Blocked</span>
            <span className="text-[8px] text-rose-400 mt-0.5">Allow in browser</span>
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center bg-slate-900 text-white">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold text-sm">
              {user.name?.[0] || "U"}
            </div>
            <span className="text-[10px] text-slate-400 mt-1 font-semibold">Camera Off</span>
          </div>
        )}

        {/* PIP Top Controls */}
        <div className="absolute top-1.5 left-1.5 right-1.5 flex items-center justify-between pointer-events-none">
          {/* Camera error / virtual stream badge */}
          <CameraErrorBadge cameraError={cameraError} onRetryCamera={onRetryCamera} />

          <button
            type="button"
            onClick={() => setPipMinimized(!pipMinimized)}
            className="pointer-events-auto w-6 h-6 rounded-lg bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur border border-white/10 transition cursor-pointer"
            title={pipMinimized ? "Expand preview" : "Minimize preview"}
          >
            {pipMinimized ? <Maximize2 className="w-3 h-3" /> : <Minimize2 className="w-3 h-3" />}
          </button>
        </div>

        {/* PIP Bottom Banner */}
        <div className="absolute bottom-1.5 left-1.5 right-1.5 flex items-center justify-between bg-black/70 backdrop-blur px-2 py-1 rounded-xl border border-white/10 text-[10px] text-white">
          <span className="font-bold truncate max-w-[100px]">You ({user.type})</span>
          <div className="flex items-center gap-1 shrink-0">
            {!isAudioMuted ? (
              <Mic className="w-3 h-3 text-emerald-400" />
            ) : (
              <MicOff className="w-3 h-3 text-rose-400" />
            )}
            {!isVideoOff && !cameraError ? (
              <Camera className="w-3 h-3 text-emerald-400" />
            ) : (
              <CameraOff className="w-3 h-3 text-rose-400" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
