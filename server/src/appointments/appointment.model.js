import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    // ==========================
    // Relations
    // ==========================

    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },

    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },

    // ==========================
    // Appointment Date & Time
    // ==========================

    appointmentDate: {
      type: Date,
      required: true,
    },

    slot: {
      start: {
        type: String,
        required: true,
      },

      end: {
        type: String,
        required: true,
      },
    },

    // ==========================
    // Booking Information
    // ==========================

    reason: {
      type: String,
      trim: true,
      default: "",
    },

    status: {
      type: String,
      enum: [
        "PENDING",
        "CONFIRMED",
        "IN_PROGRESS",
        "COMPLETED",
        "REJECTED",
        "CANCELLED",
        "NO_SHOW",
      ],
      default: "PENDING",
    },

    // ==========================
    // WebRTC Meeting
    // ==========================

    roomId: {
      type: String,
      unique: true,
      required: true,
    },

    patientJoined: {
      type: Boolean,
      default: false,
    },

    doctorJoined: {
      type: Boolean,
      default: false,
    },

    startedAt: {
      type: Date,
      default: null,
    },

    endedAt: {
      type: Date,
      default: null,
    },

    // ==========================
    // Consultation
    // ==========================

    doctorNotes: {
      type: String,
      default: "",
    },

    aiSummary: {
      type: String,
      default: "",
    },

    prescription: {
      type: String,
      default: "",
    },

    followUpDate: {
      type: Date,
      default: null,
    },

    // ==========================
    // Payment & Vrio CRM Gateway
    // ==========================

    consultationFee: {
      type: Number,
      default: 0,
    },

    paymentStatus: {
      type: String,
      enum: [
        "PENDING",
        "PAID",
        "REFUNDED",
      ],
      default: "PENDING",
    },

    vrioOrderId: {
      type: String,
      default: null,
      index: true,
    },

    vrioResponse: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    paymentDetails: {
      cardLast4: { type: String, default: "" },
      cardType: { type: String, default: "" },
      paidAt: { type: Date, default: null },
      transactionId: { type: String, default: "" },
    },

    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: null,
      index: true,
    },

    billingDetails: {
      fname: { type: String, default: "" },
      lname: { type: String, default: "" },
      address1: { type: String, default: "" },
      city: { type: String, default: "" },
      state: { type: String, default: "" },
      zipcode: { type: String, default: "" },
      country: { type: String, default: "US" },
    },

    // ==========================
    // Rescheduling
    // ==========================

    isRescheduled: {
      type: Boolean,
      default: false,
    },

    rescheduleHistory: [
      {
        previousDate: { type: Date },
        previousSlot: {
          start: { type: String },
          end: { type: String },
        },
        reason: { type: String, default: "" },
        rescheduledAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Appointment = mongoose.model(
  "Appointment",
  appointmentSchema
);

export default Appointment;