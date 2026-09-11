import mongoose from "mongoose";

const specializationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Specialization name is required"],
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    category: {
      type: String,
      default: "Clinical",
      enum: ["Clinical", "Surgical", "Wellness", "Specialist", "Diagnostic", "Other"],
    },
    icon: {
      type: String,
      default: "Stethoscope",
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

specializationSchema.pre("save", function () {
  if (this.isModified("name") && !this.slug) {
    this.slug = this.name.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]+/g, "");
  }
});

const Specialization = mongoose.model("Specialization", specializationSchema);

export default Specialization;
