export default function consultationSocket(io, socket) {
  // Join Room
  socket.on("join-room", ({ roomId, user }) => {
    socket.join(roomId);
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
  });

  // Leave Room
  socket.on("leave-room", ({ roomId, user }) => {
    socket.leave(roomId);
    console.log(`${user} left room ${roomId}`);

    socket.to(roomId).emit("user-left", {
      socketId: socket.id,
      user,
    });
  });

  // Re-negotiate / check users in room
  socket.on("user-joined-check", ({ roomId }) => {
    socket.to(roomId).emit("user-joined", {
      socketId: socket.id,
      user: "Participant",
    });
  });

  // WebRTC Signaling: Offer
  socket.on("video-offer", ({ roomId, offer, senderName }) => {
    socket.to(roomId).emit("video-offer", {
      offer,
      senderSocketId: socket.id,
      senderName,
    });
  });

  // WebRTC Signaling: Answer
  socket.on("video-answer", ({ roomId, answer }) => {
    socket.to(roomId).emit("video-answer", {
      answer,
      senderSocketId: socket.id,
    });
  });

  // WebRTC Signaling: ICE Candidate
  socket.on("ice-candidate", ({ roomId, candidate }) => {
    socket.to(roomId).emit("ice-candidate", {
      candidate,
    });
  });

  // Media Track State (mute/unmute, video on/off)
  socket.on("media-state-changed", ({ roomId, audioEnabled, videoEnabled, senderName }) => {
    socket.to(roomId).emit("media-state-changed", {
      audioEnabled,
      videoEnabled,
      senderName,
    });
  });

  // End Consultation (Emitted by Doctor or Patient)
  socket.on("end-consultation", ({ roomId, endedBy }) => {
    console.log(`Consultation ${roomId} ended by ${endedBy}`);
    // Broadcast to everyone in the room (including sender)
    io.to(roomId).emit("consultation-ended", {
      roomId,
      endedBy,
    });
  });
}