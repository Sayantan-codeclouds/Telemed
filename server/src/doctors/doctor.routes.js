import express from "express";
import upload from "../shared/multer.js";
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

// Public Auth Routes
router.post("/register", register);
router.post("/login", login);
router.post("/verify-email", verifyEmail);
router.post("/forgot-password", forgotPasswordController);
router.post("/reset-password", resetPasswordController);

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