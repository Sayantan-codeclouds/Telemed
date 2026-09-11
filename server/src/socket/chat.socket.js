import { saveMessage } from "../modules/chat/chat.service.js";

export default function chatSocket(io, socket) {
  socket.on("send-message", async (data) => {
    try {
      let savedMessage = null;
      const appointmentId = data.appointmentId || data.roomId;
      const roomId = data.roomId || data.appointmentId;

      if (appointmentId && data.senderId) {
        try {
          savedMessage = await saveMessage({
            appointment: appointmentId,
            senderType: data.senderType,
            senderId: data.senderId,
            message: data.message,
            messageType: data.messageType || "TEXT",
          });
        } catch (dbErr) {
          console.warn("Could not persist chat message to DB, broadcasting live anyway:", dbErr.message);
        }
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
            senderType: data.senderType,
            senderId: {
              _id: data.senderId,
              firstName: data.senderName?.split(" ")?.[0] || data.senderType,
              lastName: data.senderName?.split(" ")?.slice(1)?.join(" ") || "",
            },
            message: data.message,
            messageType: data.messageType || "TEXT",
            createdAt: new Date().toISOString(),
          };

      io.to(roomId).emit("receive-message", payload);
      if (appointmentId && appointmentId !== roomId) {
        io.to(appointmentId).emit("receive-message", payload);
      }
    } catch (error) {
      console.error("Chat Socket Error:", error);
      socket.emit("chat-error", {
        message: "Unable to send message.",
      });
    }
  });

  socket.on("typing", ({ roomId, senderName }) => {

    socket.to(roomId).emit("typing", {

      senderName,

    });

  });

  socket.on("stop-typing", ({ roomId }) => {

    socket.to(roomId).emit("stop-typing");

  });

}