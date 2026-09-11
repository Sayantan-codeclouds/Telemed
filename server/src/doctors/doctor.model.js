import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { getProfileImageFilename } from "../shared/utils/fileUrl.js";

const availabilitySchema = new mongoose.Schema(
  {
    day: {
      type: String,
      required: true,
      enum: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
    },

    enabled: {
      type: Boolean,
      default: true,
    },

    slots: [
      {
        start: {
          type: String,
          required: true,
        },

        end: {
          type: String,
          required: true,
        },
      },
    ],
  },
  {
    _id: false,
  }
);

const doctorSchema = new mongoose.Schema(
  {
    // ==========================
    // Basic Information
    // ==========================

    firstName: {
      type: String,
      required: true,
      trim: true,
    },

    lastName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    phone: {
      type: String,
      required: true,
    },

    profileImage: {
      type: String,
      default: "",
      set: getProfileImageFilename,
    },

    // ==========================
    // Professional Information
    // ==========================

    specialization: {
      type: String,
      default: "",
    },

    qualification: {
      type: String,
      default: "",
    },

    experience: {
      type: Number,
      default: 0,
    },

    licenseNumber: {
      type: String,
      default: "",
    },

    consultationFee: {
      type: Number,
      default: 0,
    },

    platformCommissionPercent: {
      type: Number,
      default: 10,
      min: 0,
      max: 100,
    },

    averageRating: {
      type: Number,
      default: 5.0,
      min: 0,
      max: 5,
    },

    totalReviews: {
      type: Number,
      default: 0,
    },

    languages: [
      {
        type: String,
      },
    ],

    biography: {
      type: String,
      default: "",
    },

    hospital: {
      type: String,
      default: "",
    },

    address: {
      line1: {
        type: String,
        default: "",
      },

      line2: {
        type: String,
        default: "",
      },

      city: {
        type: String,
        default: "",
      },

      state: {
        type: String,
        default: "",
      },

      country: {
        type: String,
        default: "",
      },

      pincode: {
        type: String,
        default: "",
      },
    },

    // ==========================
    // Availability
    // ==========================

    availability: [availabilitySchema],

    // ==========================
    // Authentication
    // ==========================

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    verificationToken: {
      type: String,
      default: null,
    },

    verificationTokenExpires: {
      type: Date,
      default: null,
    },

    resetPasswordToken: {
      type: String,
      default: null,
    },

    resetPasswordTokenExpires: {
      type: Date,
      default: null,
    },

    // ==========================
    // Payout Settings
    // ==========================

    payoutSettings: {
      accountHolderName: { type: String, default: "" },
      bankName: { type: String, default: "" },
      accountNumber: { type: String, default: "" },
      routingOrIfsc: { type: String, default: "" },
      upiId: { type: String, default: "" },
      paypalEmail: { type: String, default: "" },
      preferredMethod: {
        type: String,
        enum: ["BANK_TRANSFER", "UPI", "PAYPAL"],
        default: "BANK_TRANSFER",
      },
    },

    // ==========================
    // Platform Commission & Payout Rate
    // ==========================

    platformCommissionPercent: {
      type: Number,
      default: 10,
      min: 0,
      max: 100,
    },

    // ==========================
    // Clinical Credentials & Seal
    // ==========================

    signature: {
      type: String,
      default: "",
    },

    clinicStamp: {
      type: String,
      default: "",
    },

    // ==========================
    // Status
    // ==========================

    status: {
      type: String,
      enum: [
        "ACTIVE",
        "INACTIVE",
        "SUSPENDED",
      ],
      default: "ACTIVE",
    },
  },
  {
    timestamps: true,
  }
);

doctorSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }

  this.password = await bcrypt.hash(this.password, 10);
});

doctorSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

export default mongoose.model("Doctor", doctorSchema);
