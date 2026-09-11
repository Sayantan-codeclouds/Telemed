import mongoose from "mongoose";

const medicineItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    dosage: {
      type: String,
      required: true,
      trim: true,
    },
    frequency: {
      type: String,
      required: true,
      trim: true,
    },
    duration: {
      type: String,
      required: true,
      trim: true,
    },
    instructions: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { _id: false }
);

const prescriptionSchema = new mongoose.Schema(
  {
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
      index: true,
    },
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
    diagnosis: {
      type: String,
      default: "",
      trim: true,
    },
    medicines: {
      type: [medicineItemSchema],
      default: [],
    },
    notes: {
      type: String,
      default: "",
      trim: true,
    },
    signature: {
      type: String,
      default: "",
    },
    clinicStamp: {
      type: String,
      default: "",
    },
    followUpDate: {
      type: Date,
      default: null,
    },
    validityDays: {
      type: Number,
      default: 14,
      min: 1,
      max: 365,
    },
    validUntil: {
      type: Date,
      default: null,
    },
    remindRecheckup: {
      type: Boolean,
      default: true,
    },
    recheckupDate: {
      type: Date,
      default: null,
    },
    reminderSent: {
      type: Boolean,
      default: false,
    },
    reminderSentAt: {
      type: Date,
      default: null,
    },
    reminderEmailSent: {
      type: Boolean,
      default: false,
    },
    reminderEmailSentAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Prescription = mongoose.model("Prescription", prescriptionSchema);

export default Prescription;
