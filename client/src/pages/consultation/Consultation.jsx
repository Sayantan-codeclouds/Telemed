import { useEffect, useMemo, useState, useCallback } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import {
  PhoneOff,
  CheckCircle2,
  FileText,
  Calendar,
  Loader2,
  MessageSquare,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

import ConsultationHeader from "./ConsultationHeader";
import VideoPanel from "./VideoPanel";
import ChatPanel from "./ChatPanel";
import ConsultationFooter from "./ConsultationFooter";

import ConsultationDrawer from "../../components/consultation/ConsultationDrawer";
import PrescriptionPanel from "./PrescriptionPanel";
import AISummaryPanel from "./AISummaryPanel";

import socket from "../../socket/socket";
import useWebRTC from "../../hooks/useWebRTC";
import api from "@/api/axios";
import doctorApi from "@/api/doctorApi";

export default function Consultation() {
  const { appointmentId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const isDoctor = location.pathname.startsWith("/doctor");

  const storedUser = useMemo(() => {
    return JSON.parse(
      localStorage.getItem(isDoctor ? "doctor" : "patient") || "{}"
    );
  }, [isDoctor]);

  const user = useMemo(
    () => ({
      type: isDoctor ? "Doctor" : "Patient",
      id: storedUser._id || storedUser.id,
      name: isDoctor
        ? `Dr. ${storedUser.firstName || "Doctor"} ${storedUser.lastName || ""}`
        : `${storedUser.firstName || "Patient"} ${storedUser.lastName || ""}`,
      email: storedUser.email,
      profileImage: storedUser.profileImage,
    }),
    [storedUser, isDoctor]
  );

  const [connected, setConnected] = useState(false);
  const [appointment, setAppointment] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(() => typeof window !== "undefined" && window.innerWidth >= 1024);

  // Drawer states
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerTitle, setDrawerTitle] = useState("");
  const [drawerType, setDrawerType] = useState("");

  // End Consultation States
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [endingCall, setEndingCall] = useState(false);
  const [consultationEndedInfo, setConsultationEndedInfo] = useState(null);

  // WebRTC Hook
  const {
    localStream,
    remoteStream,
    isAudioMuted,
    isVideoOff,
    isScreenSharing,
    connectionStatus,
    cameraError,
    remoteAudioEnabled,
    remoteVideoEnabled,
    toggleAudio,
    toggleVideo,
    toggleScreenShare,
    isVirtualStream,
    retryPhysicalCamera,
  } = useWebRTC(appointmentId, user);

  // Stop all media tracks helper
  const stopMediaTracks = useCallback(() => {
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
    }
  }, [localStream]);

  // Fetch Appointment Details
  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        const client = isDoctor ? doctorApi : api;
        const { data } = await client.get(`/appointments/${appointmentId}`);
        if (data?.data) {
          setAppointment(data.data);
        }
      } catch (err) {
        console.error("Failed to load appointment details:", err);
      }
    };

    if (appointmentId) {
      fetchAppointment();
    }
  }, [appointmentId, isDoctor]);

  // Socket Room Management & Consultation Ended Event Listener
  useEffect(() => {
    const emitJoin = () => {
      setConnected(true);
      socket.emit("join-room", {
        roomId: appointmentId,
        user: user.type,
      });
    };

    if (socket.connected) {
      emitJoin();
    } else {
      socket.connect();
    }

    const handleConnect = () => {
      emitJoin();
    };

    const handleDisconnect = () => {
      setConnected(false);
    };

    const handleConsultationEnded = ({ endedBy }) => {
      stopMediaTracks();
      setConsultationEndedInfo({
        endedBy: endedBy || "the other participant",
      });
      toast.info(`Consultation concluded by ${endedBy || "participant"}.`);
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("consultation-ended", handleConsultationEnded);

    return () => {
      socket.emit("leave-room", {
        roomId: appointmentId,
        user: user.type,
      });

      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("consultation-ended", handleConsultationEnded);
    };
  }, [appointmentId, user.type, stopMediaTracks]);

  const openDrawer = (type) => {
    setDrawerType(type);
    switch (type) {
      case "patient":
        setDrawerTitle("Patient Medical Record");
        break;
      case "prescription":
        setDrawerTitle("Prescription & Dosage");
        break;
      case "summary":
        setDrawerTitle("AI Consultation Co-Pilot");
        break;
      default:
        setDrawerTitle("");
    }
    setDrawerOpen(true);
  };

  // Trigger End Consultation Flow
  const handleConfirmEndConsultation = async () => {
    setEndingCall(true);
    try {
      const client = isDoctor ? doctorApi : api;
      await client.patch(`/appointments/${appointmentId}/end`);

      // Broadcast via socket to everyone in the room
      socket.emit("end-consultation", {
        roomId: appointmentId,
        endedBy: user.type,
      });

      stopMediaTracks();
      setShowEndConfirm(false);
      setConsultationEndedInfo({
        endedBy: `You (${user.type})`,
      });

      toast.success("Consultation successfully marked as Completed!");
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to end consultation."
      );
    } finally {
      setEndingCall(false);
    }
  };

  const patientDetails = isDoctor ? appointment?.patient : storedUser;

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-slate-950 text-slate-100 font-sans select-none">
      {/* Header Bar */}
      <ConsultationHeader
        connected={connected}
        appointment={appointment}
        user={user}
        onEndCall={() => setShowEndConfirm(true)}
      />

      {/* Main Stage & Right Panel (Zero Scrollbar Container) */}
      <div className="flex-1 flex overflow-hidden p-2 sm:p-3 gap-2 sm:gap-3 bg-slate-950 min-h-0 relative">
        {/* LEFT / CENTER: Full HD Video Panel Stage */}
        <div className="flex-1 h-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-800/80 shadow-inner relative min-h-0">
          <VideoPanel
            localStream={localStream}
            remoteStream={remoteStream}
            isAudioMuted={isAudioMuted}
            isVideoOff={isVideoOff}
            remoteAudioEnabled={remoteAudioEnabled}
            remoteVideoEnabled={remoteVideoEnabled}
            connectionStatus={connectionStatus}
            user={user}
            appointment={appointment}
            isVirtualStream={isVirtualStream}
            cameraError={cameraError}
            onRetryCamera={retryPhysicalCamera}
          />
        </div>

        {/* RIGHT: Live Clinical Chat & Sidebar */}
        {isChatOpen && (
          <div className="md:relative absolute inset-y-2 sm:inset-y-3 right-2 sm:right-3 z-30 w-80 sm:w-88 md:w-96 h-[calc(100%-16px)] sm:h-[calc(100%-24px)] md:h-full flex flex-col rounded-2xl overflow-hidden bg-slate-900/95 md:bg-slate-900 border border-slate-800 shadow-2xl shrink-0 animate-in slide-in-from-right-5 duration-200 min-h-0 backdrop-blur-md">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-800 bg-slate-900/90 backdrop-blur shrink-0">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Session Chat
                </span>
              </div>

              <button
                type="button"
                onClick={() => setIsChatOpen(false)}
                className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-xs transition cursor-pointer"
                title="Hide Chat"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex-1 min-h-0 bg-slate-900 overflow-hidden flex flex-col">
              <ChatPanel
                user={user}
                doctor={appointment?.doctor}
              />
            </div>
          </div>
        )}
      </div>

      {/* Docked Floating Footer Controls */}
      <ConsultationFooter
        isAudioMuted={isAudioMuted}
        isVideoOff={isVideoOff}
        isScreenSharing={isScreenSharing}
        onToggleAudio={toggleAudio}
        onToggleVideo={toggleVideo}
        onToggleScreenShare={toggleScreenShare}
        onEndCall={() => setShowEndConfirm(true)}
        onPatientInfo={() => openDrawer("patient")}
        onPrescription={() => openDrawer("prescription")}
        onSummary={() => openDrawer("summary")}
        onToggleChat={() => setIsChatOpen(!isChatOpen)}
        isChatOpen={isChatOpen}
        isDoctor={isDoctor}
      />

      {/* Confirmation Modal: End Consultation */}
      {showEndConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-white rounded-3xl shadow-2xl border-0 overflow-hidden text-center p-7 space-y-5 animate-in fade-in zoom-in-95 duration-200 text-slate-900">
            <div className="w-16 h-16 rounded-3xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
              <PhoneOff className="w-8 h-8" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-xl font-black text-slate-900">
                End Clinical Consultation?
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
                This will finalize this medical visit, mark the appointment status as{" "}
                <strong className="text-emerald-600 font-bold">COMPLETED</strong>, disconnect the video stream, and notify both parties.
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 text-xs space-y-1 text-left">
              <div className="flex justify-between">
                <span className="text-slate-400 font-bold">Session Mode:</span>
                <span className="font-bold text-slate-800">Encrypted Telehealth</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-bold">Initiated By:</span>
                <span className="font-bold text-indigo-600">{user.name} ({user.type})</span>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <Button
                type="button"
                disabled={endingCall}
                onClick={handleConfirmEndConsultation}
                className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl h-11 text-xs gap-2 shadow-md shadow-rose-500/20"
              >
                {endingCall ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Concluding Session...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" /> Yes, End Consultation
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                disabled={endingCall}
                onClick={() => setShowEndConfirm(false)}
                className="w-full rounded-xl h-11 text-xs font-bold text-slate-700 hover:bg-slate-100"
              >
                Cancel & Resume Call
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Consultation Concluded Modal */}
      {consultationEndedInfo && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 text-slate-900">
          <Card className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border-0 overflow-hidden text-center p-8 space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1.5">
              <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
                Status: COMPLETED
              </Badge>
              <h3 className="text-2xl font-black text-slate-900 mt-1">
                Consultation Concluded
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto">
                This telehealth session was concluded by {consultationEndedInfo.endedBy}. All video and audio streams have been safely terminated.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs space-y-2 text-left">
              <div className="flex items-center justify-between font-medium">
                <span className="text-slate-500">Appointment Ref:</span>
                <span className="font-bold text-slate-800">#{appointmentId?.slice(-6).toUpperCase()}</span>
              </div>
              <div className="flex items-center justify-between font-medium">
                <span className="text-slate-500">Clinical Visit:</span>
                <span className="font-bold text-slate-800">Virtual Medical Review</span>
              </div>
              <div className="flex items-center justify-between font-medium">
                <span className="text-slate-500">Prescription Status:</span>
                <span className="font-bold text-emerald-600">Saved to Health Record</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
              {isDoctor ? (
                <>
                  <Button
                    onClick={() => navigate("/doctor/appointments")}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl h-11 text-xs gap-1.5"
                  >
                    <Calendar className="w-4 h-4" /> Doctor Appointments
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate("/doctor/dashboard")}
                    className="w-full rounded-xl h-11 text-xs font-bold"
                  >
                    Doctor Dashboard ➔
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={() => navigate("/patient/prescriptions")}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl h-11 text-xs gap-1.5 shadow-md shadow-purple-500/20"
                  >
                    <FileText className="w-4 h-4" /> View Prescription & Meds
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate("/patient/appointments")}
                    className="w-full rounded-xl h-11 text-xs font-bold"
                  >
                    My Appointments ➔
                  </Button>
                </>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Drawer */}
      <ConsultationDrawer
        open={drawerOpen}
        title={drawerTitle}
        onClose={() => setDrawerOpen(false)}
      >
        {drawerType === "patient" && (
          <div className="space-y-6 text-slate-900">
            <div className="text-center">
              <div className="w-20 h-20 rounded-3xl bg-blue-100 mx-auto flex items-center justify-center text-2xl font-bold text-blue-700 shadow-sm">
                {patientDetails?.firstName?.[0] || "P"}
                {patientDetails?.lastName?.[0] || "T"}
              </div>
              <h2 className="text-xl font-black mt-3 text-slate-900">
                {patientDetails?.firstName} {patientDetails?.lastName}
              </h2>
              <p className="text-slate-500 text-xs font-medium">
                {patientDetails?.gender || "Gender unspecified"} •{" "}
                {patientDetails?.bloodGroup || "Blood group not set"}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 space-y-1">
              <h3 className="font-bold text-[10px] text-slate-400 uppercase tracking-wider">
                Chief Complaint
              </h3>
              <p className="text-slate-900 text-xs font-medium leading-relaxed">
                {appointment?.reason || "General Medical Review"}
              </p>
            </div>

            {patientDetails?.medicalConditions?.length > 0 && (
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 space-y-1">
                <h3 className="font-bold text-[10px] text-slate-400 uppercase tracking-wider">
                  Medical Conditions
                </h3>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {patientDetails.medicalConditions.map((cond, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold rounded-xl"
                    >
                      {cond}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {patientDetails?.allergies?.length > 0 && (
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 space-y-1">
                <h3 className="font-bold text-[10px] text-slate-400 uppercase tracking-wider">
                  Allergies
                </h3>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {patientDetails.allergies.map((al, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold rounded-xl"
                    >
                      ⚠️ {al}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {drawerType === "prescription" && (
          <PrescriptionPanel appointmentId={appointmentId} isDoctor={isDoctor} />
        )}

        {drawerType === "summary" && (
          <AISummaryPanel appointmentId={appointmentId} isDoctor={isDoctor} />
        )}
      </ConsultationDrawer>
    </div>
  );
}