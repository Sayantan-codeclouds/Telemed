import express from "express";
import upload from "../shared/multer.js";
import rateLimit from "../shared/middleware/rateLimit.js";
import { authenticateDoctor } from "./doctor.middleware.js";
import {
  register,
  login,
  verifyEmail,
  forgotPasswordController,
  resetPasswordController,
  getProfile,
  updateProfile,
  uploadProfilePhoto,
  uploadSignatureAndStamp,
  getAvailability,
  updateAvailability,
  getDoctors,
  getDoctor,
  getAvailableSlots,
  changePassword,
} from "./doctor.controller.js";

const router = express.Router();

// Brute-force / enumeration protection for the unauthenticated auth endpoints.
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 30 });

// Public Auth Routes
router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.post("/verify-email", authLimiter, verifyEmail);
router.post("/forgot-password", authLimiter, forgotPasswordController);
router.post("/reset-password", authLimiter, resetPasswordController);

// Protected Routes — must be before /:id to prevent conflict
router.get("/profile", authenticateDoctor, getProfile);
router.put("/profile", authenticateDoctor, updateProfile);
router.put("/profile/photo", authenticateDoctor, upload.single("photo"), uploadProfilePhoto);
router.put(
  "/profile/signature-stamp",
  authenticateDoctor,
  upload.fields([
    { name: "signature", maxCount: 1 },
    { name: "clinicStamp", maxCount: 1 },
  ]),
  uploadSignatureAndStamp
);
router.patch("/change-password", authenticateDoctor, changePassword);
router.get("/availability", authenticateDoctor, getAvailability);
router.put("/availability", authenticateDoctor, updateAvailability);

// Public - Browse (dynamic routes last)
router.get("/", getDoctors);
router.get("/:id/available-slots", getAvailableSlots);
router.get("/:id", getDoctor);

export default router;