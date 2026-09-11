import express from "express";
import { authenticateAny } from "../shared/middleware/authenticateAny.js";
import {
  getMyNotifications,
  markRead,
  markAllRead,
  deleteNotification,
  clearAllNotifications,
} from "./notification.controller.js";

const router = express.Router();

router.use(authenticateAny);

router.get("/", getMyNotifications);
router.patch("/read-all", markAllRead);
router.delete("/clear-all", clearAllNotifications);
router.patch("/:id/read", markRead);
router.delete("/:id", deleteNotification);

export default router;
