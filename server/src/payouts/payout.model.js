import mongoose from "mongoose";

const payoutSchema = new mongoose.Schema(
  {
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: [true, "Payout amount is required."],
      min: [1, "Amount must be at least 1."],
    },
    platformFee: {
      type: Number,
      default: 0,
    },
    netAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "PROCESSING", "PAID", "REJECTED"],
      default: "PENDING",
      index: true,
    },
    payoutMethod: {
      type: String,
      enum: ["BANK_TRANSFER", "UPI", "PAYPAL"],
      default: "BANK_TRANSFER",
    },
    accountDetails: {
      accountHolderName: { type: String, default: "" },
      bankName: { type: String, default: "" },
      accountNumber: { type: String, default: "" },
      routingOrIfsc: { type: String, default: "" },
      upiId: { type: String, default: "" },
      paypalEmail: { type: String, default: "" },
    },
    referenceNumber: {
      type: String,
      default: "",
      trim: true,
    },
    notes: {
      type: String,
      default: "",
      trim: true,
    },
    rejectionReason: {
      type: String,
      default: "",
      trim: true,
    },
    processedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Payout = mongoose.model("Payout", payoutSchema);

export default Payout;
