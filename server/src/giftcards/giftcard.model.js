import mongoose from "mongoose";

const giftCardSchema = new mongoose.Schema(
  {
    vrioGiftCardId: {
      type: Number,
      index: true,
    },
    giftCardCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    balanceAmount: {
      type: Number,
      min: 0,
      default: function () {
        return this.totalAmount;
      },
    },
    dateExpire: {
      type: Date,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    notes: {
      type: String,
      trim: true,
      default: "",
    },
    vrioRawResponse: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const GiftCard = mongoose.models.GiftCard || mongoose.model("GiftCard", giftCardSchema);

export default GiftCard;
