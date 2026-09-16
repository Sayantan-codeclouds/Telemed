import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  MonitorUp,
  User,
  Pill,
  Sparkles,
  MessageSquare,
} from "lucide-react";

export default function ConsultationFooter({
  isAudioMuted = false,
  isVideoOff = false,
  isScreenSharing = false,
  onToggleAudio,
  onToggleVideo,
  onToggleScreenShare,
  onEndCall,
  onPatientInfo,
  onPrescription,
  onSummary,
  onToggleChat,
  isChatOpen = false,
  isDoctor = false,
}) {
  return (
    <footer className="bg-slate-950/95 border-t border-slate-800/80 px-4 sm:px-6 py-3 z-20 shrink-0 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* LEFT — Media Controls (Audio, Video, Screen Share) */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleAudio}
            className={`w-11 h-11 rounded-2xl transition flex items-center justify-center shadow-md cursor-pointer ${
              !isAudioMuted
                ? "bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700"
                : "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/30"
            }`}
            title={!isAudioMuted ? "Mute Microphone" : "Unmute Microphone"}
          >
            {!isAudioMuted ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </button>

          <button
            type="button"
            onClick={onToggleVideo}
            className={`w-11 h-11 rounded-2xl transition flex items-center justify-center shadow-md cursor-pointer ${
              !isVideoOff
                ? "bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700"
                : "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/30"
            }`}
            title={!isVideoOff ? "Turn Off Camera" : "Turn On Camera"}
          >
            {!isVideoOff ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </button>

          <button
            type="button"
            onClick={onToggleScreenShare}
            className={`w-11 h-11 rounded-2xl transition flex items-center justify-center shadow-md cursor-pointer ${
              isScreenSharing
                ? "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/30"
                : "bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
            }`}
            title={!isScreenSharing ? "Share Screen" : "Stop Screen Sharing"}
          >
            <MonitorUp className="w-5 h-5" />
          </button>
        </div>

        {/* CENTER — Clinical Tools & Drawers */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {isDoctor && (
            <button
              type="button"
              onClick={onPatientInfo}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-blue-400 border border-slate-800 text-xs font-bold transition cursor-pointer"
            >
              <User className="w-4 h-4 text-blue-400" />
              <span className="hidden sm:inline">Patient EHR</span>
            </button>
          )}

          <button
            type="button"
            onClick={onPrescription}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-slate-800 text-xs font-bold transition cursor-pointer"
          >
            <Pill className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Prescription (Rx)</span>
          </button>

          <button
            type="button"
            onClick={onSummary}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-purple-400 border border-slate-800 text-xs font-bold transition cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="hidden sm:inline">AI Co-Pilot</span>
          </button>

          <button
            type="button"
            onClick={onToggleChat}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-bold transition cursor-pointer ${
              isChatOpen
                ? "bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/20"
                : "bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800"
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span className="hidden sm:inline">Live Chat</span>
          </button>
        </div>

        {/* RIGHT — End Consultation Button */}
        <div>
          <button
            type="button"
            onClick={onEndCall}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm shadow-lg shadow-rose-600/30 transition cursor-pointer"
          >
            <PhoneOff className="w-4 h-4" />
            <span>End Consultation</span>
          </button>
        </div>
      </div>
    </footer>
  );
}