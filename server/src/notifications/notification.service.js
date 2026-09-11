import Notification from "./notification.model.js";
import { getIO } from "../socket/socket.js";

/**
 * Creates a notification record and pushes real-time event if socket is active
 */
export const createNotificationService = async ({
  recipient,
  recipientModel,
  title,
  message,
  type = "SYSTEM",
  link = "",
}) => {
  const notification = await Notification.create({
    recipient,
    recipientModel,
    title,
    message,
    type,
    link,
  });

  try {
    const io = getIO();
    if (io) {
      io.emit(`notification:${recipient.toString()}`, notification);
    }
  } catch (error) {
    // Non-critical socket notification failure
  }

  return notification;
};

export const getUserNotificationsService = async (userId) => {
  const notifications = await Notification.find({ recipient: userId })
    .sort({ createdAt: -1 })
    .limit(30);

  const unreadCount = await Notification.countDocuments({
    recipient: userId,
    isRead: false,
  });

  return {
    notifications,
    unreadCount,
  };
};

export const markNotificationAsReadService = async (notificationId, userId) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, recipient: userId },
    { isRead: true, readAt: new Date() },
    { new: true }
  );

  return notification;
};

export const markAllNotificationsAsReadService = async (userId) => {
  await Notification.updateMany(
    { recipient: userId, isRead: false },
    { isRead: true, readAt: new Date() }
  );

  return { success: true };
};

export const deleteNotificationService = async (notificationId, userId) => {
  const notification = await Notification.findOneAndDelete({
    _id: notificationId,
    recipient: userId,
  });
  return notification;
};

export const clearAllNotificationsService = async (userId) => {
  await Notification.deleteMany({ recipient: userId });
  return { success: true };
};
