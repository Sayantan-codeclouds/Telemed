import mongoose from "mongoose";

const vrioOfferItemSchema = new mongoose.Schema(
  {
    offer_id: {
      type: Number,
      required: true,
    },
    order_offer_quantity: {
      type: Number,
      required: true,
      default: 1,
      min: 1,
    },
    item_id: {
      type: Number,
      required: true,
    },
    medicineId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Medicine",
      default: null,
    },
    name: {
      type: String,
      default: "",
    },
    price: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
);

const vrioOrderSchema = new mongoose.Schema(
  {
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
      index: true,
    },
    prescription: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Prescription",
      default: null,
      index: true,
    },
    vrioOrderId: {
      type: String,
      default: null,
      index: true,
    },
    status: {
      type: String,
      enum: [
        "PENDING",
        "CREATED",
        "PAYMENT_PENDING",
        "PROCESSING",
        "COMPLETED",
        "FAILED",
        "CANCELLED",
      ],
      default: "PENDING",
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      default: 0,
    },
    currency: {
      type: String,
      default: "USD",
    },
    offers: {
      type: [vrioOfferItemSchema],
      required: true,
      validate: [
        (val) => Array.isArray(val) && val.length > 0,
        "At least one offer item is required",
      ],
    },
    billingAddress: {
      fname: { type: String, default: "" },
      lname: { type: String, default: "" },
      address1: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zipcode: { type: String, required: true },
      country: { type: String, default: "US" },
    },
    shippingAddress: {
      line1: { type: String, default: "" },
      city: { type: String, default: "" },
      state: { type: String, default: "" },
      pincode: { type: String, default: "" },
      country: { type: String, default: "US" },
    },
    paymentDetails: {
      cardType: { type: String, default: "visa" },
      cardTypeId: { type: Number, default: 1 },
      cardLast4: { type: String, default: "4444" },
      cardExpMonth: { type: Number, default: null },
      cardExpYear: { type: Number, default: null },
    },
    vrioResponse: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    errorDetails: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const VrioOrder = mongoose.model("VrioOrder", vrioOrderSchema);
export default VrioOrder;
