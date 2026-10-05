import Appointment from "../appointments/appointment.model.js";

/**
 * True when this socket was admitted to the given consultation room via
 * "join-room". Every room-scoped event checks this so a socket can't read
 * or inject into a consultation it isn't part of.
 */
export const isInConsultationRoom = (socket, roomId) =>
  typeof roomId === "string" && Boolean(socket.data.consultationRooms?.has(roomId));

export default function consultationSocket(io, socket) {
  socket.data.consultationRooms = new Set();

  // Join Room — the room id is the appointment id; only its doctor or patient may join.
  socket.on("join-room", async ({ roomId, user } = {}) => {
    try {
      if (typeof roomId !== "string" || !roomId) return;

      const appointment = await Appointment.findById(roomId).select("doctor patient");
      const { id, type } = socket.data.user;
      const isParticipant =
        appointment &&
        ((type === "Doctor" && String(appointment.doctor) === id) ||
          (type === "Patient" && String(appointment.patient) === id));

      if (!isParticipant) {
        socket.emit("room-error", { roomId, message: "You are not a participant of this consultation." });
        return;
      }

      socket.join(roomId);
      socket.data.consultationRooms.add(roomId);
      console.log(`${user} joined room ${roomId}`);

      // Count how many others are ALREADY in the room (before this socket joined)
      const room = io.sockets.adapter.rooms.get(roomId);
      const othersPresent = room ? room.size - 1 : 0; // subtract self

      // Tell the joining socket whether others are already present
      socket.emit("room-joined", {
        roomId,
        othersPresent,
      });

      // Tell the existing room members that someone new joined
      socket.to(roomId).emit("user-joined", {
        socketId: socket.id,
        user,
      });
    } catch (error) {
      // Invalid ids (CastError) and lookup failures simply don't join.
      socket.emit("room-error", { roomId, message: "Unable to join this consultation." });
    }
  });

  // Leave Room
  socket.on("leave-room", ({ roomId, user } = {}) => {
    if (!isInConsultationRoom(socket, roomId)) return;

    socket.leave(roomId);
    socket.data.consultationRooms.delete(roomId);
    console.log(`${user} left room ${roomId}`);

    socket.to(roomId).emit("user-left", {
      socketId: socket.id,
      user,
    });
  });

  // Re-negotiate / check users in room
  socket.on("user-joined-check", ({ roomId } = {}) => {
    if (!isInConsultationRoom(socket, roomId)) return;

    socket.to(roomId).emit("user-joined", {
      socketId: socket.id,
      user: "Participant",
    });
  });

  // WebRTC Signaling: Offer
  socket.on("video-offer", ({ roomId, offer, senderName } = {}) => {
    if (!isInConsultationRoom(socket, roomId)) return;

    socket.to(roomId).emit("video-offer", {
      offer,
      senderSocketId: socket.id,
      senderName,
    });
  });

  // WebRTC Signaling: Answer
  socket.on("video-answer", ({ roomId, answer } = {}) => {
    if (!isInConsultationRoom(socket, roomId)) return;

    socket.to(roomId).emit("video-answer", {
      answer,
      senderSocketId: socket.id,
    });
  });

  // WebRTC Signaling: ICE Candidate
  socket.on("ice-candidate", ({ roomId, candidate } = {}) => {
    if (!isInConsultationRoom(socket, roomId)) return;

    socket.to(roomId).emit("ice-candidate", {
      candidate,
    });
  });

  // Media Track State (mute/unmute, video on/off)
  socket.on("media-state-changed", ({ roomId, audioEnabled, videoEnabled, senderName } = {}) => {
    if (!isInConsultationRoom(socket, roomId)) return;

    socket.to(roomId).emit("media-state-changed", {
      audioEnabled,
      videoEnabled,
      senderName,
    });
  });

  // End Consultation (Emitted by Doctor or Patient)
  socket.on("end-consultation", ({ roomId, endedBy } = {}) => {
    if (!isInConsultationRoom(socket, roomId)) return;

    console.log(`Consultation ${roomId} ended by ${endedBy}`);

    // Broadcast to everyone in the room (including sender)
    io.to(roomId).emit("consultation-ended", {
      roomId,
      endedBy,
    });
  });
}
