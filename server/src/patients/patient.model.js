import mongoose from "mongoose";
import { getProfileImageFilename } from "../shared/utils/fileUrl.js";

const patientSchema = new mongoose.Schema(
  {
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

    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      select: false,
    },

    profileImage: {
      type: String,
      default: "",
      set: getProfileImageFilename,
    },

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

dateOfBirth: {
  type: Date,
  default: null,
},

gender: {
  type: String,
  enum: ["Male", "Female", "Other"],
  default: null,
},

bloodGroup: {
  type: String,
  enum: [
    "A+",
    "A-",
    "B+",
    "B-",
    "AB+",
    "AB-",
    "O+",
    "O-"
  ],
  default: null,
},

height: {
  value: {
    type: Number,
    default: null,
  },
  unit: {
    type: String,
    enum: ["cm", "ft"],
    default: "cm",
  },
},

weight: {
  value: {
    type: Number,
    default: null,
  },
  unit: {
    type: String,
    enum: ["kg", "lb"],
    default: "kg",
  },
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

emergencyContact: {
  name: {
    type: String,
    default: "",
  },

  relationship: {
    type: String,
    default: "",
  },

  phone: {
    type: String,
    default: "",
  },
},

allergies: [
  {
    type: String,
  },
],

medicalConditions: [
  {
    type: String,
  },
],

currentMedications: [
  {
    type: String,
  },
],

pastSurgeries: [
  {
    type: String,
  },
],


    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE", "BLOCKED"],
      default: "ACTIVE",
    },
  },
  {
    timestamps: true,
  }
);

const Patient = mongoose.model("Patient", patientSchema);

export default Patient;
