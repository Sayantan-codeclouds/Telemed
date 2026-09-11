import ChatMessage from "./chat.model.js";
import { formatChatMessageProfileImage } from "../../shared/utils/fileUrl.js";

export const saveMessage = async ({
  appointment,
  senderType,
  senderId,
  message,
  messageType = "TEXT",
}) => {

  const chatMessage = await ChatMessage.create({

    appointment,

    senderType,

    senderModel: senderType,

    senderId,

    message,

    messageType,

  });

  return formatChatMessageProfileImage(await chatMessage.populate({
    path: "senderId",
    select: "firstName lastName profileImage",
  }));

};

export const getMessages = async (appointmentId) => {

  const messages = await ChatMessage.find({

    appointment: appointmentId,

  })

    .populate({

      path: "senderId",

      select: "firstName lastName profileImage",

    })

    .sort({

      createdAt: 1,

    });

  return messages.map(formatChatMessageProfileImage);

};
