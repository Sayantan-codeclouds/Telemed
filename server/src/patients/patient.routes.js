import express from "express";
import {
  register,
  login,
  getProfile,
  updateProfile,
  uploadProfilePhoto,
  verifyEmail,
  forgotPasswordController,
  resetPasswordController,
  changePassword,
} from "./patient.controller.js";
import { authenticatePatient } from "./patient.middleware.js";
import upload from "../shared/multer.js";
import rateLimit from "../shared/middleware/rateLimit.js";

const router = express.Router();

// Brute-force / enumeration protection for the unauthenticated auth endpoints.
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 30 });

router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.post("/verify-email", authLimiter, verifyEmail);
router.post("/forgot-password", authLimiter, forgotPasswordController);
router.post("/reset-password", authLimiter, resetPasswordController);

router.get("/profile", authenticatePatient, getProfile);
router.put("/profile", authenticatePatient, updateProfile);
router.put("/profile/photo", authenticatePatient, upload.single("photo"), uploadProfilePhoto);
router.patch("/change-password", authenticatePatient, changePassword);

export default router;