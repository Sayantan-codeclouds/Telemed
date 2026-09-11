import express from "express";
import { authenticatePatient } from "../patients/patient.middleware.js";
import { authenticateDoctor } from "../doctors/doctor.middleware.js";
import { authenticateAny } from "../shared/middleware/authenticateAny.js";
import {
  createReview,
  getDoctorReviews,
  getMyPatientReviews,
  getDoctorReceivedReviews,
  replyToReview,
  deleteReview,
} from "./review.controller.js";

const router = express.Router();

// Public / open routes
router.get("/doctor/:doctorId", getDoctorReviews);

// Patient protected routes
router.post("/", authenticatePatient, createReview);
router.get("/my-reviews", authenticatePatient, getMyPatientReviews);

// Doctor protected routes
router.get("/doctor-received", authenticateDoctor, getDoctorReceivedReviews);
router.post("/:reviewId/reply", authenticateDoctor, replyToReview);

// Delete review (Patient owner or Admin)
router.delete("/:reviewId", authenticateAny, deleteReview);

export default router;
