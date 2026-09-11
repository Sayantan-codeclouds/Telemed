import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    type: {
      type: String,
      enum: ["PERCENTAGE", "FIXED", "GIFT_CARD"],
      default: "PERCENTAGE",
    },
    discountAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    // Parameter sent in JSON to Vrio CRM as discount_code
    discountCode: {
      type: String,
      trim: true,
      default: function () {
        return this.code || "DISCOUNT";
      },
    },
    discountLabel: {
      type: String,
      trim: true,
      default: function () {
        return this.discountCode || this.code || "DISCOUNT";
      },
    },
    minOrderAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    maxDiscount: {
      type: Number,
      default: null,
      min: 0,
    },
    usageLimit: {
      type: Number,
      default: null, // null means unlimited
    },
    usedCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    validFrom: {
      type: Date,
      default: Date.now,
    },
    validUntil: {
      type: Date,
      default: null, // null means no expiration
    },
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE",
    },
  },
  {
    timestamps: true,
  }
);

// Helper method to check if coupon is currently valid
couponSchema.methods.isValid = function (orderTotal = 0) {
  if (this.status !== "ACTIVE") {
    return { valid: false, message: "This coupon is currently inactive." };
  }

  const now = new Date();
  if (this.validFrom && now < this.validFrom) {
    return { valid: false, message: "This coupon is not active yet." };
  }

  if (this.validUntil && now > this.validUntil) {
    return { valid: false, message: "This coupon has expired." };
  }

  if (this.usageLimit && this.usedCount >= this.usageLimit) {
    return { valid: false, message: "This coupon usage limit has been reached." };
  }

  if (this.minOrderAmount && orderTotal < this.minOrderAmount) {
    return {
      valid: false,
      message: `Minimum order amount of $${this.minOrderAmount} required to use this coupon.`,
    };
  }

  return { valid: true };
};

// Helper method to calculate discount value
couponSchema.methods.calculateDiscount = function (orderTotal) {
  let discountValue = 0;

  if (this.type === "PERCENTAGE") {
    discountValue = (orderTotal * this.discountAmount) / 100;
    if (this.maxDiscount && discountValue > this.maxDiscount) {
      discountValue = this.maxDiscount;
    }
  } else {
    // FIXED or GIFT_CARD
    discountValue = this.discountAmount;
  }

  // Discount cannot exceed order total
  discountValue = Math.min(discountValue, orderTotal);

  return Math.round(discountValue * 100) / 100;
};

const Coupon = mongoose.model("Coupon", couponSchema);
export default Coupon;
