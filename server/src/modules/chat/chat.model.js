import mongoose from "mongoose";

const chatMessageSchema = new mongoose.Schema(
  {
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
      index: true,
    },

    senderType: {
      type: String,
      enum: ["Patient", "Doctor"],
      required: true,
    },

    // Model used for dynamic populate
    senderModel: {
      type: String,
      enum: ["Patient", "Doctor"],
      required: true,
    },

    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "senderModel",
      required: true,
      index: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    messageType: {
      type: String,
      enum: ["TEXT", "IMAGE", "FILE"],
      default: "TEXT",
    },

    fileUrl: {
      type: String,
      default: null,
    },

    isRead: {
      type: Boolean,
      default: false,
    },

    readAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Helpful indexes
chatMessageSchema.index({
  appointment: 1,
  createdAt: 1,
});

export default mongoose.model(
  "ChatMessage",
  chatMessageSchema
);