import { useState, useEffect, useRef, useCallback } from "react";
import socket from "@/socket/socket";

const ICE_SERVERS = {
  iceServers: [
    // Google STUN servers
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
    { urls: "stun:stun3.l.google.com:19302" },
    { urls: "stun:stun4.l.google.com:19302" },
    // Cloudflare STUN
    { urls: "stun:stun.cloudflare.com:3478" },
    // OpenRelay TURN (free public - for NAT traversal)
    {
      urls: [
        "turn:openrelay.metered.ca:80",
        "turn:openrelay.metered.ca:443",
        "turn:openrelay.metered.ca:443?transport=tcp",
      ],
      username: "openrelayproject",
      credential: "openrelayproject",
    },
    // Metered.ca TURN (backup) — configurable via env so the credential can
    // be rotated without a code change; falls back to the original account
    // if not set.
    {
      urls: "turn:relay.metered.ca:80",
      username: import.meta.env.VITE_TURN_USERNAME || "e8dd65f0f7c7f814e18e7c25",
      credential: import.meta.env.VITE_TURN_CREDENTIAL || "uPmUCJkzqFNz0f9Q",
    },
  ],
  iceCandidatePoolSize: 10,
  bundlePolicy: "max-bundle",
  rtcpMuxPolicy: "require",
};

/**
 * Creates an animated synthetic Canvas MediaStream when the hardware webcam is unavailable.
 */
function createVirtualMediaStream(userTitle = "Doctor", userName = "") {
  const canvas = document.createElement("canvas");
  canvas.width = 640;
  canvas.height = 480;
  const ctx = canvas.getContext("2d");

  let frame = 0;
  const isDoc = (userTitle || "").toLowerCase().includes("doc");
  const baseColor1 = isDoc ? "#2563eb" : "#0d9488";
  const baseColor2 = isDoc ? "#4f46e5" : "#0284c7";

  // Kick off initial draw so stream has content immediately
  const drawFrame = () => {
    frame++;
    const grad = ctx.createLinearGradient(0, 0, 640, 480);
    grad.addColorStop(0, "#0b1329");
    grad.addColorStop(1, "#1e293b");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 640, 480);

    const pulse = Math.sin(frame * 0.05) * 8;
    ctx.beginPath();
    ctx.arc(320, 205, 75 + pulse, 0, Math.PI * 2);
    ctx.strokeStyle = isDoc ? "rgba(96,165,250,0.4)" : "rgba(45,212,191,0.4)";
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(320, 205, 65, 0, Math.PI * 2);
    const cg = ctx.createLinearGradient(255, 140, 385, 270);
    cg.addColorStop(0, baseColor1);
    cg.addColorStop(1, baseColor2);
    ctx.fillStyle = cg;
    ctx.fill();

    ctx.fillStyle = "#fff";
    ctx.font = "bold 40px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const rawName = (userName || userTitle).replace(/^Dr\.\s*/i, "");
    const initials = rawName.split(" ").filter(Boolean).map((w) => w[0]).join("").slice(0, 2).toUpperCase() || (isDoc ? "DR" : "PT");
    ctx.fillText(initials, 320, 205);

    ctx.font = "bold 17px sans-serif";
    ctx.fillStyle = "#f8fafc";
    ctx.fillText(userName || userTitle, 320, 315);

    ctx.font = "13px sans-serif";
    ctx.fillStyle = isDoc ? "#93c5fd" : "#5eead4";
    ctx.fillText(isDoc ? "TeleClinic Specialist" : "TeleClinic Patient", 320, 342);

    ctx.font = "11px sans-serif";
    ctx.fillStyle = "#64748b";
    ctx.fillText("● Live WebRTC Channel", 320, 370);
  };

  drawFrame(); // Draw immediately before capture

  const stream = canvas.captureStream(30);

  let animId;
  const loop = () => { drawFrame(); animId = requestAnimationFrame(loop); };
  animId = requestAnimationFrame(loop);

  // Silent audio track for full WebRTC negotiation
  try {
    const ACtx = window.AudioContext || window.webkitAudioContext;
    if (ACtx) {
      const ac = new ACtx();
      const dest = ac.createMediaStreamDestination();
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      gain.gain.value = 0;
      osc.connect(gain);
      gain.connect(dest);
      osc.start();
      const silentAudio = dest.stream.getAudioTracks()[0];
      if (silentAudio) stream.addTrack(silentAudio);
    }
  } catch {}

  stream.__stopAnimation = () => { if (animId) cancelAnimationFrame(animId); };
  return stream;
}

export default function useWebRTC(roomId, user) {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isVirtualStream, setIsVirtualStream] = useState(false);
  const [cameraError, setCameraError] = useState(null); // null | 'denied' | 'busy' | 'unavailable'
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const [remoteAudioEnabled, setRemoteAudioEnabled] = useState(true);
  const [remoteVideoEnabled, setRemoteVideoEnabled] = useState(true);

  const pcRef = useRef(null);
  const localStreamRef = useRef(null);
  const screenTrackRef = useRef(null);
  const pendingCandidates = useRef([]);
  const makingOffer = useRef(false);
  const ignoreOffer = useRef(false);

  // Doctor = impolite (initiates offers), Patient = polite (responds)
  const isPolite = user?.type !== "Doctor";

  // ─── HELPER: drain queued ICE candidates ─────────────────────────────────
  const drainCandidates = async (pc) => {
    const queued = [...pendingCandidates.current];
    pendingCandidates.current = [];
    for (const c of queued) {
      try { await pc.addIceCandidate(new RTCIceCandidate(c)); } catch {}
    }
  };

  // ─── HELPER: initiate offer with ICE restart option ──────────────────────
  const initiateOffer = useCallback(async (isRestart = false) => {
    const pc = pcRef.current;
    if (!pc) return;
    if (makingOffer.current) return;
    if (pc.signalingState !== "stable") return;

    try {
      makingOffer.current = true;
      setConnectionStatus("connecting");
      const offer = await pc.createOffer({
        iceRestart: isRestart,
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      });
      if (pc.signalingState !== "stable") return;
      await pc.setLocalDescription(offer);
      socket.emit("video-offer", {
        roomId,
        offer: pc.localDescription,
        senderName: user?.name || (isPolite ? "Patient" : "Doctor"),
      });
    } catch (err) {
      console.warn("initiateOffer error:", err.message);
    } finally {
      makingOffer.current = false;
    }
  }, [roomId, user?.name, isPolite]);

  // ─── 1. LOCAL MEDIA ───────────────────────────────────────────────────────
  useEffect(() => {
    let mounted = true;

    async function initMedia() {
      let stream = null;
      let virtual = false;
      let errorType = null;

      // Check permission state first (Chrome/Edge support this)
      if (navigator.permissions) {
        try {
          const camPerm = await navigator.permissions.query({ name: "camera" });
          if (camPerm.state === "denied") {
            errorType = "denied";
          }
        } catch {}
      }

      if (errorType !== "denied" && navigator.mediaDevices?.getUserMedia) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
          setCameraError(null);
        } catch (e1) {
          // Classify the error
          if (e1.name === "NotAllowedError" || e1.name === "PermissionDeniedError") {
            errorType = "denied";
          } else if (e1.name === "NotReadableError" || e1.name === "TrackStartError" || e1.message?.toLowerCase().includes("in use")) {
            errorType = "busy";
          } else {
            errorType = "unavailable";
          }
          console.warn(`Camera/mic error [${errorType}]:`, e1.message);

          // For busy/unavailable: try audio only + virtual video
          if (errorType !== "denied") {
            try {
              const audioOnly = await navigator.mediaDevices.getUserMedia({ audio: true });
              const vStream = createVirtualMediaStream(user?.type, user?.name);
              const audioTrack = audioOnly.getAudioTracks()[0];
              if (audioTrack) {
                const silentTracks = vStream.getAudioTracks();
                silentTracks.forEach((t) => { vStream.removeTrack(t); t.stop(); });
                vStream.addTrack(audioTrack);
              }
              stream = vStream;
              virtual = true;
            } catch (e2) {
              console.warn("Audio fallback also failed:", e2.message);
              stream = createVirtualMediaStream(user?.type, user?.name);
              virtual = true;
            }
          }
        }
      } else if (errorType !== "denied") {
        stream = createVirtualMediaStream(user?.type, user?.name);
        virtual = true;
      }

      setCameraError(errorType);

      if (!mounted) return;

      if (stream) {
        localStreamRef.current = stream;
        setLocalStream(stream);
        setIsVirtualStream(virtual);
      } else if (errorType === "denied") {
        // Permission denied — create a virtual stream so peer connection works
        stream = createVirtualMediaStream(user?.type, user?.name);
        localStreamRef.current = stream;
        setLocalStream(stream);
        setIsVirtualStream(true);
      }

      // Attach to peer connection if it was created before media resolved
      const pc = pcRef.current;
      if (pc && pc.connectionState !== "closed" && stream) {
        let added = false;
        stream.getTracks().forEach((track) => {
          const senders = pc.getSenders();
          const sender = senders.find((s) => s.track?.kind === track.kind);
          if (sender) {
            sender.replaceTrack(track);
          } else {
            try {
              pc.addTrack(track, stream);
              added = true;
            } catch {}
          }
        });
        // Trigger negotiation if new tracks were added. Only the impolite
        // peer (doctor) may create offers — a polite peer initiating its own
        // offer collides with perfect negotiation and can leave connectionStatus
        // stuck at "connecting" since it never gets answered.
        if (added && !isPolite) {
          setTimeout(() => initiateOffer(), 300);
        }
      }
    }

    initMedia();

    return () => {
      mounted = false;
      if (localStreamRef.current) {
        if (typeof localStreamRef.current.__stopAnimation === "function") {
          localStreamRef.current.__stopAnimation();
        }
        localStreamRef.current.getTracks().forEach((t) => t.stop());
        localStreamRef.current = null;
      }
      if (screenTrackRef.current) { screenTrackRef.current.stop(); screenTrackRef.current = null; }
    };
  }, [user?.type, user?.name, initiateOffer, isPolite]);

  // ─── 2. RETRY PHYSICAL CAMERA ─────────────────────────────────────────────
  const retryPhysicalCamera = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) return;
    try {
      if (localStreamRef.current) {
        if (typeof localStreamRef.current.__stopAnimation === "function") {
          localStreamRef.current.__stopAnimation();
        }
        localStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current = stream;
      setLocalStream(stream);
      setIsVirtualStream(false);

      const pc = pcRef.current;
      if (pc) {
        const senders = pc.getSenders();
        let added = false;
        stream.getTracks().forEach((track) => {
          const sender = senders.find((s) => s.track?.kind === track.kind);
          if (sender) {
            sender.replaceTrack(track);
          } else {
            pc.addTrack(track, stream);
            added = true;
          }
        });
        if (added && !isPolite) {
          setTimeout(() => initiateOffer(), 300);
        }
      }
    } catch (err) {
      console.warn("Retry camera failed:", err.message);
    }
  }, [initiateOffer, isPolite]);

  // ─── 3. PEER CONNECTION + SIGNALING ───────────────────────────────────────
  useEffect(() => {
    if (!roomId) return;

    const pc = new RTCPeerConnection(ICE_SERVERS);
    pcRef.current = pc;
    pendingCandidates.current = [];
    makingOffer.current = false;
    ignoreOffer.current = false;

    // Attach local tracks if media is already ready
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        try { pc.addTrack(track, localStreamRef.current); } catch {}
      });
    }

    // Remote stream
    pc.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        setRemoteStream(event.streams[0]);
      } else if (event.track) {
        setRemoteStream((prev) => {
          const stream = prev || new MediaStream();
          if (!stream.getTracks().some((t) => t.id === event.track.id)) {
            stream.addTrack(event.track);
          }
          return new MediaStream(stream.getTracks());
        });
      }
      setConnectionStatus("connected");
    };

    // ICE generation
    pc.onicecandidate = ({ candidate }) => {
      if (candidate) {
        const payload = candidate.toJSON ? candidate.toJSON() : candidate;
        socket.emit("ice-candidate", { roomId, candidate: payload });
      }
    };

    pc.onconnectionstatechange = () => {
      const s = pc.connectionState;
      // "connecting" is intentionally not handled here: it is already signaled
      // at negotiation start by initiateOffer()/handleVideoOffer(), and the
      // aggregate connectionState can transiently report "connecting" again
      // even after real media is already flowing, which would otherwise
      // permanently downgrade an already-live "connected" status.
      if (s === "connected") setConnectionStatus("connected");
      else if (s === "disconnected") {
        setConnectionStatus("disconnected");
        // Try ICE restart after brief disconnection
        if (!isPolite) {
          setTimeout(() => {
            if (pcRef.current?.connectionState === "disconnected") {
              initiateOffer(true);
            }
          }, 2000);
        }
      } else if (s === "closed") {
        setConnectionStatus("disconnected");
      } else if (s === "failed") {
        console.warn("Peer connection failed, triggering ICE restart");
        if (!isPolite) initiateOffer(true);
      }
    };

    pc.oniceconnectionstatechange = () => {
      const state = pc.iceConnectionState;
      if (state === "connected" || state === "completed") {
        setConnectionStatus("connected");
      } else if (state === "failed") {
        console.warn("ICE connection failed, triggering ICE restart");
        if (!isPolite) initiateOffer(true);
      }
    };

    // ── room-joined: sent by server when WE join, tells us if others are present ──
    const handleRoomJoined = ({ othersPresent }) => {
      if (!isPolite && othersPresent > 0) {
        // Doctor arrived AFTER Patient — initiate offer after a short delay
        // to allow media tracks to be attached first. Skip if the local-media
        // effect's own catch-up offer already connected us in the meantime —
        // otherwise this redundant renegotiation leaves the remote peer's
        // connectionStatus stuck at "connecting" with nothing to correct it.
        setTimeout(() => {
          if (pcRef.current?.connectionState !== "connected") {
            initiateOffer();
          }
        }, 500);
      }
    };

    // ── user-joined: someone ELSE joined the room ──────────────────────────
    const handleUserJoined = () => {
      if (!isPolite) {
        // Doctor always creates offer when anyone new joins
        // Use longer delay to avoid double-offer with room-joined
        setTimeout(() => {
          if (pcRef.current?.connectionState !== "connected") {
            initiateOffer();
          }
        }, 600);
      }
    };

    // ── Incoming offer (for Patient/polite peer or doctor renegotiation) ───
    const handleVideoOffer = async ({ offer }) => {
      try {
        const collision = makingOffer.current || pc.signalingState !== "stable";
        ignoreOffer.current = !isPolite && collision;

        if (ignoreOffer.current) {
          console.log("Impolite peer ignoring colliding offer");
          return;
        }

        setConnectionStatus("connecting");

        if (collision) {
          // Polite peer: rollback then accept
          await pc.setLocalDescription({ type: "rollback" });
        }

        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        await drainCandidates(pc);

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit("video-answer", { roomId, answer: pc.localDescription });
      } catch (err) {
        console.error("handleVideoOffer error:", err.message);
      }
    };

    // ── Incoming answer (for Doctor/impolite peer) ─────────────────────────
    const handleVideoAnswer = async ({ answer }) => {
      try {
        if (pc.signalingState !== "have-local-offer") return;
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
        setConnectionStatus("connected");
        await drainCandidates(pc);
      } catch (err) {
        console.error("handleVideoAnswer error:", err.message);
      }
    };

    // ── ICE candidates with buffering ─────────────────────────────────────
    const handleIceCandidate = async ({ candidate }) => {
      if (!candidate) return;
      try {
        if (pc.remoteDescription?.type) {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } else {
          pendingCandidates.current.push(candidate);
        }
      } catch (err) {
        if (!ignoreOffer.current) console.warn("ICE add:", err.message);
      }
    };

    const handleMediaState = ({ audioEnabled, videoEnabled }) => {
      if (typeof audioEnabled === "boolean") setRemoteAudioEnabled(audioEnabled);
      if (typeof videoEnabled === "boolean") setRemoteVideoEnabled(videoEnabled);
    };

    socket.on("room-joined", handleRoomJoined);
    socket.on("user-joined", handleUserJoined);
    socket.on("video-offer", handleVideoOffer);
    socket.on("video-answer", handleVideoAnswer);
    socket.on("ice-candidate", handleIceCandidate);
    socket.on("media-state-changed", handleMediaState);

    return () => {
      socket.off("room-joined", handleRoomJoined);
      socket.off("user-joined", handleUserJoined);
      socket.off("video-offer", handleVideoOffer);
      socket.off("video-answer", handleVideoAnswer);
      socket.off("ice-candidate", handleIceCandidate);
      socket.off("media-state-changed", handleMediaState);
      pc.close();
    };
  }, [roomId, user?.name, isPolite, initiateOffer]);

  // ─── 4. TOGGLE AUDIO ──────────────────────────────────────────────────────
  const toggleAudio = useCallback(() => {
    const willBeMuted = !isAudioMuted;
    localStreamRef.current?.getAudioTracks().forEach((t) => { t.enabled = !willBeMuted; });
    setIsAudioMuted(willBeMuted);
    socket.emit("media-state-changed", {
      roomId, audioEnabled: !willBeMuted, videoEnabled: !isVideoOff, senderName: user?.name,
    });
  }, [roomId, user?.name, isAudioMuted, isVideoOff]);

  // ─── 5. TOGGLE VIDEO ──────────────────────────────────────────────────────
  const toggleVideo = useCallback(() => {
    const willBeOff = !isVideoOff;
    localStreamRef.current?.getVideoTracks().forEach((t) => { t.enabled = !willBeOff; });
    setIsVideoOff(willBeOff);
    socket.emit("media-state-changed", {
      roomId, audioEnabled: !isAudioMuted, videoEnabled: !willBeOff, senderName: user?.name,
    });
  }, [roomId, user?.name, isAudioMuted, isVideoOff]);

  // ─── 6. TOGGLE SCREEN SHARE ───────────────────────────────────────────────
  const toggleScreenShare = useCallback(async () => {
    const pc = pcRef.current;
    if (!pc) return;

    if (!isScreenSharing) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const screenTrack = screenStream.getVideoTracks()[0];
        screenTrackRef.current = screenTrack;
        const videoSender = pc.getSenders().find((s) => s.track?.kind === "video");
        if (videoSender) await videoSender.replaceTrack(screenTrack);

        screenTrack.onended = async () => {
          const orig = localStreamRef.current?.getVideoTracks()[0];
          if (videoSender && orig) await videoSender.replaceTrack(orig);
          setIsScreenSharing(false);
        };
        setIsScreenSharing(true);
      } catch (err) {
        console.warn("Screen share cancelled:", err.message);
      }
    } else {
      if (screenTrackRef.current) screenTrackRef.current.stop();
      const orig = localStreamRef.current?.getVideoTracks()[0];
      const videoSender = pc.getSenders().find((s) => s.track?.kind === "video");
      if (videoSender && orig) await videoSender.replaceTrack(orig);
      setIsScreenSharing(false);
    }
  }, [isScreenSharing]);

  return {
    localStream,
    remoteStream,
    isAudioMuted,
    isVideoOff,
    isScreenSharing,
    isVirtualStream,
    cameraError,
    connectionStatus,
    remoteAudioEnabled,
    remoteVideoEnabled,
    toggleAudio,
    toggleVideo,
    toggleScreenShare,
    retryPhysicalCamera,
  };
}
