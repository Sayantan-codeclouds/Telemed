import Review from "./review.model.js";
import Doctor from "../doctors/doctor.model.js";
import Patient from "../patients/patient.model.js";
import Appointment from "../appointments/appointment.model.js";
import { createNotificationService } from "../notifications/notification.service.js";
import AppError from "../shared/errors/AppError.js";
import { formatProfileImage } from "../shared/utils/fileUrl.js";

/**
 * Re-calculates average rating and review count for a doctor
 */
export const updateDoctorReviewStats = async (doctorId) => {
  const reviews = await Review.find({ doctor: doctorId });
  const totalReviews = reviews.length;

  let averageRating = 5.0; // default initial display for zero reviews
  if (totalReviews > 0) {
    const totalScore = reviews.reduce((sum, r) => sum + r.rating, 0);
    averageRating = Number((totalScore / totalReviews).toFixed(1));
  }

  await Doctor.findByIdAndUpdate(doctorId, {
    averageRating,
    totalReviews,
  });

  return { averageRating, totalReviews };
};

/**
 * Create a new review by a patient for a doctor
 */
export const createReviewService = async (patientId, data) => {
  const { doctorId, appointmentId, rating, review, tags, isAnonymous } = data;

  if (!doctorId) {
    throw AppError.badRequest("Doctor ID is required.");
  }

  if (!rating || rating < 1 || rating > 5) {
    throw AppError.badRequest("Rating must be between 1 and 5 stars.");
  }

  const reviewText = review ? review.trim() : "";


  const [doctor, patient] = await Promise.all([
    Doctor.findById(doctorId),
    Patient.findById(patientId),
  ]);

  if (!doctor) {
    throw AppError.notFound("Doctor not found.");
  }

  if (!patient) {
    throw AppError.notFound("Patient not found.");
  }

  // If appointment provided, verify it belongs to patient and doctor
  if (appointmentId) {
    const appt = await Appointment.findOne({
      _id: appointmentId,
      patient: patientId,
      doctor: doctorId,
    });
    if (!appt) {
      throw AppError.badRequest("Invalid appointment reference for this review.");
    }
  }

  // Check if patient already reviewed this doctor or specific appointment
  const existing = appointmentId
    ? await Review.findOne({
        patient: patientId,
        appointment: appointmentId,
      })
    : await Review.findOne({
        patient: patientId,
        doctor: doctorId,
      });

  if (existing) {
    existing.rating = Number(rating);
    existing.review = reviewText;
    existing.tags = Array.isArray(tags) ? tags : [];
    existing.isAnonymous = Boolean(isAnonymous);
    if (appointmentId) existing.appointment = appointmentId;
    await existing.save();

    const stats = await updateDoctorReviewStats(doctorId);

    const populated = await existing.populate([
      { path: "patient", select: "firstName lastName profileImage" },
      { path: "doctor", select: "firstName lastName specialization profileImage" },
    ]);
    return { review: populated, doctorStats: stats, updated: true };
  }

  const newReview = await Review.create({
    doctor: doctorId,
    patient: patientId,
    appointment: appointmentId || null,
    rating: Number(rating),
    review: reviewText,
    tags: Array.isArray(tags) ? tags : [],
    isAnonymous: Boolean(isAnonymous),
  });

  // Recalculate doctor rating
  const stats = await updateDoctorReviewStats(doctorId);

  // Send in-app notification to Doctor
  const reviewerDisplayName = isAnonymous
    ? "A patient"
    : `${patient.firstName} ${patient.lastName}`;

  const starEmoji = "⭐".repeat(Math.round(rating));
  const commentSnippet = reviewText
    ? `: "${reviewText.slice(0, 80)}${reviewText.length > 80 ? "..." : ""}"`
    : "";

  await createNotificationService({
    recipient: doctor._id,
    recipientModel: "Doctor",
    title: `🌟 New ${rating}-Star Review Received!`,
    message: `${reviewerDisplayName} left a ${rating}-star review ${starEmoji}${commentSnippet}`,
    type: "DOCTOR_REVIEW",
    link: "/doctor/profile",
  }).catch(() => {});

  const populated = await newReview.populate([
    { path: "patient", select: "firstName lastName profileImage" },
    { path: "doctor", select: "firstName lastName specialization profileImage" },
  ]);

  return { review: populated, doctorStats: stats };
};

/**
 * Get reviews for a specific doctor with aggregated summary
 */
export const getDoctorReviewsService = async (doctorId) => {
  const reviews = await Review.find({ doctor: doctorId })
    .populate("patient", "firstName lastName profileImage")
    .sort({ createdAt: -1 });

  const totalReviews = reviews.length;
  let averageRating = 5.0;
  const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  const tagCounts = {};

  if (totalReviews > 0) {
    let sum = 0;
    reviews.forEach((r) => {
      sum += r.rating;
      const rounded = Math.round(r.rating);
      if (ratingDistribution[rounded] !== undefined) {
        ratingDistribution[rounded]++;
      }
      (r.tags || []).forEach((t) => {
        tagCounts[t] = (tagCounts[t] || 0) + 1;
      });
    });
    averageRating = Number((sum / totalReviews).toFixed(1));
  }

  // Format anonymous reviews to mask patient identity and format profile images
  const sanitizedReviews = reviews.map((r) => {
    const obj = r.toObject ? r.toObject() : r;
    if (obj.isAnonymous && obj.patient) {
      obj.patient = {
        _id: obj.patient._id,
        firstName: "Verified",
        lastName: "Patient",
        profileImage: "",
      };
    } else if (obj.patient) {
      obj.patient = formatProfileImage(obj.patient);
    }
    return obj;
  });

  return {
    doctorId,
    averageRating,
    totalReviews,
    ratingDistribution,
    topTags: Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([tag, count]) => ({ tag, count })),
    reviews: sanitizedReviews,
  };
};

/**
 * Get all reviews written by a patient
 */
export const getPatientReviewsService = async (patientId) => {
  const reviews = await Review.find({ patient: patientId })
    .populate("doctor", "firstName lastName specialization profileImage hospital")
    .populate("appointment", "appointmentDate slot")
    .sort({ createdAt: -1 });

  return reviews.map((r) => {
    const obj = r.toObject ? r.toObject() : r;
    if (obj.doctor) {
      obj.doctor = formatProfileImage(obj.doctor);
    }
    return obj;
  });
};

/**
 * Get all reviews received by a doctor (Doctor view)
 */
export const getDoctorReceivedReviewsService = async (doctorId) => {
  const reviews = await Review.find({ doctor: doctorId })
    .populate("patient", "firstName lastName profileImage")
    .populate("appointment", "appointmentDate slot reason")
    .sort({ createdAt: -1 });

  return reviews.map((r) => {
    const obj = r.toObject ? r.toObject() : r;
    if (obj.patient) {
      obj.patient = formatProfileImage(obj.patient);
    }
    return obj;
  });
};

/**
 * Doctor replies to a review
 */
export const replyToReviewService = async (doctorId, reviewId, replyText) => {
  if (!replyText || replyText.trim().length === 0) {
    throw AppError.badRequest("Reply text cannot be empty.");
  }

  const review = await Review.findOne({ _id: reviewId, doctor: doctorId });
  if (!review) {
    throw AppError.notFound("Review not found or unauthorized to reply.");
  }

  review.doctorReply = {
    comment: replyText.trim(),
    repliedAt: new Date(),
  };

  await review.save();

  // Notify patient about doctor's response
  const doctor = await Doctor.findById(doctorId);
  const docName = doctor ? `Dr. ${doctor.firstName} ${doctor.lastName}` : "Your doctor";

  await createNotificationService({
    recipient: review.patient,
    recipientModel: "Patient",
    title: `💬 ${docName} replied to your review`,
    message: `"${replyText.slice(0, 90)}${replyText.length > 90 ? "..." : ""}"`,
    type: "DOCTOR_REVIEW",
    link: `/patient/doctors/${doctorId}`,
  }).catch(() => {});

  return review.populate([
    { path: "patient", select: "firstName lastName profileImage" },
    { path: "doctor", select: "firstName lastName specialization profileImage" },
  ]);
};

/**
 * Delete a review (by author patient or admin)
 */
export const deleteReviewService = async (reviewId, userId, userRole) => {
  const query = { _id: reviewId };
  if (userRole === "PATIENT") {
    query.patient = userId;
  }

  const review = await Review.findOneAndDelete(query);
  if (!review) {
    throw AppError.notFound("Review not found or unauthorized.");
  }

  await updateDoctorReviewStats(review.doctor);

  return { success: true, message: "Review deleted successfully." };
};
