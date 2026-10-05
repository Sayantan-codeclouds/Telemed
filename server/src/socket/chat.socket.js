import { saveMessage } from "../modules/chat/chat.service.js";
import { isInConsultationRoom } from "./consultation.socket.js";

export default function chatSocket(io, socket) {

  socket.on("send-message", async (data = {}) => {

    try {

      // The room id is the appointment id. Only sockets admitted to the room
      // (the appointment's doctor or patient) may post, and the sender is
      // always the authenticated user — never the ids sent by the client.
      const appointmentId = data.appointmentId || data.roomId;
      const roomId = data.roomId || data.appointmentId;

      if (appointmentId !== roomId || !isInConsultationRoom(socket, roomId)) {
        socket.emit("chat-error", {
          message: "You are not a participant of this consultation.",
        });
        return;
      }

      if (typeof data.message !== "string" || !data.message.trim()) {
        return;
      }

      const { id: senderId, type: senderType } = socket.data.user;

      let savedMessage = null;

      try {
        savedMessage = await saveMessage({
          appointment: appointmentId,
          senderType,
          senderId,
          message: data.message,
          messageType: data.messageType || "TEXT",
        });
      } catch (dbErr) {
        console.warn("Could not persist chat message to DB, broadcasting live anyway:", dbErr.message);
      }

      const payload = savedMessage
        ? {
            _id: savedMessage._id,
            appointment: savedMessage.appointment,
            senderType: savedMessage.senderType,
            senderId: savedMessage.senderId,
            message: savedMessage.message,
            messageType: savedMessage.messageType,
            isRead: savedMessage.isRead,
            createdAt: savedMessage.createdAt,
            updatedAt: savedMessage.updatedAt,
          }
        : {
            _id: "live-" + Date.now(),
            appointment: appointmentId,
            senderType,
            senderId: {
              _id: senderId,
              firstName: data.senderName?.split(" ")?.[0] || senderType,
              lastName: data.senderName?.split(" ")?.slice(1)?.join(" ") || "",
            },
            message: data.message,
            messageType: data.messageType || "TEXT",
            createdAt: new Date().toISOString(),
          };

      io.to(roomId).emit("receive-message", payload);

    } catch (error) {

      console.error("Chat Socket Error:", error);

      socket.emit("chat-error", {
        message: "Unable to send message.",
      });

    }

  });

  socket.on("typing", ({ roomId, senderName } = {}) => {
    if (!isInConsultationRoom(socket, roomId)) return;

    socket.to(roomId).emit("typing", {
      senderName,
    });
  });

  socket.on("stop-typing", ({ roomId } = {}) => {
    if (!isInConsultationRoom(socket, roomId)) return;

    socket.to(roomId).emit("stop-typing");
  });

}
