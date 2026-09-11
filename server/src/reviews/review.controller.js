import asyncHandler from "../shared/utils/asyncHandler.js";
import {
  createReviewService,
  getDoctorReviewsService,
  getPatientReviewsService,
  getDoctorReceivedReviewsService,
  replyToReviewService,
  deleteReviewService,
} from "./review.service.js";

export const createReview = asyncHandler(async (req, res) => {
  const patientId = req.patient?._id || req.user?._id;
  const result = await createReviewService(patientId, req.body);
  res.status(201).json({
    success: true,
    message: "Thank you for your feedback! Review submitted successfully.",
    data: result,
  });
});

export const getDoctorReviews = asyncHandler(async (req, res) => {
  const result = await getDoctorReviewsService(req.params.doctorId);
  res.status(200).json({
    success: true,
    data: result,
  });
});

export const getMyPatientReviews = asyncHandler(async (req, res) => {
  const patientId = req.patient?._id || req.user?._id;
  const result = await getPatientReviewsService(patientId);
  res.status(200).json({
    success: true,
    data: result,
  });
});

export const getDoctorReceivedReviews = asyncHandler(async (req, res) => {
  const doctorId = req.doctor?._id;
  const result = await getDoctorReceivedReviewsService(doctorId);
  res.status(200).json({
    success: true,
    data: result,
  });
});

export const replyToReview = asyncHandler(async (req, res) => {
  const doctorId = req.doctor?._id;
  const result = await replyToReviewService(
    doctorId,
    req.params.reviewId,
    req.body.replyText
  );
  res.status(200).json({
    success: true,
    message: "Reply posted successfully.",
    data: result,
  });
});

export const deleteReview = asyncHandler(async (req, res) => {
  const userId = req.patient?._id || req.admin?._id || req.user?._id;
  const userRole = req.patient ? "PATIENT" : req.admin ? "ADMIN" : "USER";
  const result = await deleteReviewService(req.params.reviewId, userId, userRole);
  res.status(200).json({
    success: true,
    message: result.message,
  });
});
