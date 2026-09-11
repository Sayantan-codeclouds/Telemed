import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
      index: true,
    },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
      index: true,
    },
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      default: null,
    },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"],
    },
    review: {
      type: String,
      default: "",
      trim: true,
      maxlength: [1000, "Review cannot exceed 1000 characters"],
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    isAnonymous: {
      type: Boolean,
      default: false,
    },
    doctorReply: {
      comment: {
        type: String,
        trim: true,
        default: "",
      },
      repliedAt: {
        type: Date,
        default: null,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for quick querying of reviews by doctor and created time
reviewSchema.index({ doctor: 1, createdAt: -1 });

const Review = mongoose.model("Review", reviewSchema);

export default Review;
