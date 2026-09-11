import asyncHandler from "../shared/utils/asyncHandler.js";
import {
  getUserNotificationsService,
  markNotificationAsReadService,
  markAllNotificationsAsReadService,
  deleteNotificationService,
  clearAllNotificationsService,
} from "./notification.service.js";

const resolveUserId = (req) =>
  req.user?._id || req.patient?._id || req.doctor?._id || req.admin?._id;

export const getMyNotifications = asyncHandler(async (req, res) => {
  const result = await getUserNotificationsService(resolveUserId(req));
  res.status(200).json({ success: true, data: result });
});

export const markRead = asyncHandler(async (req, res) => {
  const result = await markNotificationAsReadService(req.params.id, resolveUserId(req));
  res.status(200).json({ success: true, data: result });
});

export const markAllRead = asyncHandler(async (req, res) => {
  const result = await markAllNotificationsAsReadService(resolveUserId(req));
  res.status(200).json({ success: true, message: "All notifications marked as read.", data: result });
});

export const deleteNotification = asyncHandler(async (req, res) => {
  const result = await deleteNotificationService(req.params.id, resolveUserId(req));
  if (!result) {
    return res.status(404).json({ success: false, message: "Notification not found." });
  }
  res.status(200).json({ success: true, message: "Notification deleted." });
});

export const clearAllNotifications = asyncHandler(async (req, res) => {
  await clearAllNotificationsService(resolveUserId(req));
  res.status(200).json({ success: true, message: "All notifications cleared." });
});
