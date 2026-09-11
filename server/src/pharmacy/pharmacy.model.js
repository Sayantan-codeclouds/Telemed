import mongoose from "mongoose";

const medicineSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    genericName: {
      type: String,
      default: "",
      trim: true,
    },
    category: {
      type: String,
      enum: [
        "Pain Relief",
        "Antibiotics",
        "Cardiovascular",
        "Vitamins & Supplements",
        "Dermatological",
        "Respiratory",
        "Gastrointestinal",
        "General",
      ],
      default: "General",
    },
    dosageForm: {
      type: String,
      enum: ["Tablet", "Capsule", "Syrup", "Injection", "Ointment", "Drops"],
      default: "Tablet",
    },
    strength: {
      type: String,
      default: "",
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    requiresPrescription: {
      type: Boolean,
      default: false,
    },
    inStock: {
      type: Boolean,
      default: true,
    },
    stockQuantity: {
      type: Number,
      default: 100,
    },
    description: {
      type: String,
      default: "",
    },
    manufacturer: {
      type: String,
      default: "TeleClinic Pharma",
    },
    campaignId: {
      type: Number,
      default: 1,
    },
    prepaidCampaignId: {
      type: Number,
      default: null,
    },
    routeId: {
      type: Number,
      default: 1,
    },
    itemId: {
      type: Number,
      default: 1,
    },
    offerId: {
      type: Number,
      default: 1,
    },
    vrioOfferId: {
      type: Number,
      default: 1,
    },
    vrioProductId: {
      type: Number,
      default: null,
    },
    vrioPrice: {
      type: Number,
      default: null,
    },
    isVrioEnabled: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const orderItemSchema = new mongoose.Schema(
  {
    medicine: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Medicine",
      default: null,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      default: null,
    },
    slot: {
      start: { type: String, default: null },
      end: { type: String, default: null },
    },
    appointmentDate: {
      type: Date,
      default: null,
    },
    name: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    price: {
      type: Number,
      required: true,
    },
    campaignId: {
      type: Number,
      default: 1,
    },
    prepaidCampaignId: {
      type: Number,
      default: null,
    },
    routeId: {
      type: Number,
      default: 1,
    },
    itemId: {
      type: Number,
      default: 1,
    },
    offerId: {
      type: Number,
      default: 1,
    },
    vrioOfferId: {
      type: Number,
      default: 1,
    },
    vrioProductId: {
      type: Number,
      default: null,
    },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
      index: true,
    },
    orderType: {
      type: String,
      enum: ["PHARMACY", "CONSULTATION"],
      default: "PHARMACY",
      index: true,
    },
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      default: null,
      index: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      default: null,
    },
    prescription: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Prescription",
      default: null,
    },
    items: [orderItemSchema],
    totalAmount: {
      type: Number,
      required: true,
    },
    couponCode: {
      type: String,
      default: null,
    },
    discountAmount: {
      type: Number,
      default: 0,
    },
    discountLabel: {
      type: String,
      default: null,
    },
    shippingAddress: {
      line1: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
      country: { type: String, default: "US" },
    },
    billingDetails: {
      fname: { type: String, default: "" },
      lname: { type: String, default: "" },
      email: { type: String, default: "" },
      phone: { type: String, default: "" },
      address1: { type: String, default: "" },
      city: { type: String, default: "" },
      state: { type: String, default: "" },
      zipcode: { type: String, default: "" },
      country: { type: String, default: "US" },
      cardType: { type: String, default: "visa" },
      cardTypeId: { type: Number, default: 1 },
      cardLast4: { type: String, default: "" },
    },
    status: {
      type: String,
      enum: ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CONFIRMED", "COMPLETED", "CANCELLED"],
      default: "PROCESSING",
    },
    paymentStatus: {
      type: String,
      enum: ["PENDING", "PAID", "FAILED"],
      default: "PAID",
    },
    stickyCrmOrderId: {
      type: String,
      default: null,
    },
    vrioOrderId: {
      type: String,
      default: null,
    },
    vrioResponse: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const Medicine = mongoose.model("Medicine", medicineSchema);
export const Order = mongoose.model("Order", orderSchema);
