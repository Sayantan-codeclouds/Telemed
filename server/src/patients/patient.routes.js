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

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/verify-email", verifyEmail);
router.post("/forgot-password", forgotPasswordController);
router.post("/reset-password", resetPasswordController);

router.get("/profile", authenticatePatient, getProfile);
router.put("/profile", authenticatePatient, updateProfile);
router.put("/profile/photo", authenticatePatient, upload.single("photo"), uploadProfilePhoto);
router.patch("/change-password", authenticatePatient, changePassword);

export default router;