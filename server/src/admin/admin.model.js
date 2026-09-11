import mongoose from "mongoose";
import { getProfileImageFilename } from "../shared/utils/fileUrl.js";

const adminSchema = new mongoose.Schema(
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

    password: {
      type: String,
      required: true,
      select: false,
    },

    phone: {
      type: String,
      default: "",
    },

    profileImage: {
      type: String,
      default: null,
      set: getProfileImageFilename,
    },

    role: {
      type: String,
      enum: ["SuperAdmin", "Admin", "CustomerSupport"],
      default: "CustomerSupport",
    },

    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE", "SUSPENDED"],
      default: "ACTIVE",
    },
  },
  {
    timestamps: true,
  }
);

const Admin = mongoose.model("Admin", adminSchema);

export default Admin;
