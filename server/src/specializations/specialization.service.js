import Specialization from "./specialization.model.js";
import Doctor from "../doctors/doctor.model.js";

const DEFAULT_SPECIALIZATIONS = [
  {
    name: "Cardiologist",
    description: "Heart, vascular health, coronary care, and hypertension management.",
    category: "Specialist",
    icon: "HeartPulse",
    displayOrder: 1,
    isActive: true,
  },
  {
    name: "Dermatologist",
    description: "Skin conditions, acne, eczema, cosmetic dermatology, and hair health.",
    category: "Clinical",
    icon: "Sparkles",
    displayOrder: 2,
    isActive: true,
  },
  {
    name: "General Physician",
    description: "Primary care, preventative medicine, seasonal illnesses, and routine checkups.",
    category: "Clinical",
    icon: "Stethoscope",
    displayOrder: 3,
    isActive: true,
  },
  {
    name: "Pediatrician",
    description: "Infant, child, and adolescent healthcare, immunizations, and growth tracking.",
    category: "Clinical",
    icon: "Baby",
    displayOrder: 4,
    isActive: true,
  },
  {
    name: "Neurologist",
    description: "Brain, nervous system, chronic migraines, epilepsy, and neurological disorders.",
    category: "Specialist",
    icon: "Brain",
    displayOrder: 5,
    isActive: true,
  },
  {
    name: "Orthopedic Surgeon",
    description: "Bones, joints, sports injuries, arthritis, and musculoskeletal system.",
    category: "Surgical",
    icon: "Bone",
    displayOrder: 6,
    isActive: true,
  },
  {
    name: "Gynecologist",
    description: "Women's reproductive health, prenatal care, fertility, and wellness.",
    category: "Specialist",
    icon: "ShieldAlert",
    displayOrder: 7,
    isActive: true,
  },
  {
    name: "Psychiatrist",
    description: "Mental health, behavioral wellness, stress, anxiety, and depression therapy.",
    category: "Wellness",
    icon: "Smile",
    displayOrder: 8,
    isActive: true,
  },
  {
    name: "ENT Specialist",
    description: "Ear, nose, throat disorders, allergies, sinus issues, and hearing care.",
    category: "Clinical",
    icon: "Ear",
    displayOrder: 9,
    isActive: true,
  },
  {
    name: "Ophthalmologist",
    description: "Eye care, vision testing, corneal health, and ocular medicine.",
    category: "Specialist",
    icon: "Eye",
    displayOrder: 10,
    isActive: true,
  },
  {
    name: "Gastroenterologist",
    description: "Digestive system, stomach, liver, and gastrointestinal treatments.",
    category: "Specialist",
    icon: "Activity",
    displayOrder: 11,
    isActive: true,
  },
  {
    name: "Endocrinologist",
    description: "Hormonal health, diabetes management, thyroid, and metabolic care.",
    category: "Specialist",
    icon: "Zap",
    displayOrder: 12,
    isActive: true,
  },
];

/**
 * Ensure default specializations are populated in DB
 */
export const ensureDefaultSpecializations = async () => {
  const count = await Specialization.countDocuments();
  if (count === 0) {
    for (const item of DEFAULT_SPECIALIZATIONS) {
      await Specialization.create(item);
    }
  }
};

/**
 * Get active specializations for public, patient, and doctor forms
 */
export const getActiveSpecializationsService = async () => {
  await ensureDefaultSpecializations();
  return Specialization.find({ isActive: true }).sort({ displayOrder: 1, name: 1 });
};

/**
 * Get all specializations for Admin with doctor counts
 */
export const getAllSpecializationsAdminService = async () => {
  await ensureDefaultSpecializations();
  const list = await Specialization.find().sort({ displayOrder: 1, createdAt: -1 }).lean();

  // Aggregate doctor count per specialization
  const doctorCounts = await Doctor.aggregate([
    { $match: { status: "ACTIVE" } },
    { $group: { _id: "$specialization", count: { $sum: 1 } } },
  ]);

  const countMap = {};
  doctorCounts.forEach((d) => {
    if (d._id) countMap[d._id.toLowerCase()] = d.count;
  });

  return list.map((item) => ({
    ...item,
    doctorCount: countMap[item.name.toLowerCase()] || 0,
  }));
};

/**
 * Create a new specialization (Admin)
 */
export const createSpecializationService = async (data) => {
  if (!data.name || !data.name.trim()) {
    throw new Error("Specialization name is required.");
  }

  const existing = await Specialization.findOne({
    name: { $regex: new RegExp(`^${data.name.trim()}$`, "i") },
  });

  if (existing) {
    throw new Error(`Specialization "${data.name.trim()}" already exists.`);
  }

  const slug = data.name.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^\w-]+/g, "");

  const item = await Specialization.create({
    name: data.name.trim(),
    slug,
    description: data.description?.trim() || "",
    category: data.category || "Clinical",
    icon: data.icon || "Stethoscope",
    displayOrder: Number(data.displayOrder) || 0,
    isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
  });

  return item;
};

/**
 * Update an existing specialization (Admin)
 */
export const updateSpecializationService = async (id, data) => {
  const item = await Specialization.findById(id);
  if (!item) {
    throw new Error("Specialization not found.");
  }

  if (data.name && data.name.trim() !== item.name) {
    const existing = await Specialization.findOne({
      _id: { $ne: id },
      name: { $regex: new RegExp(`^${data.name.trim()}$`, "i") },
    });
    if (existing) {
      throw new Error(`Another specialization named "${data.name.trim()}" already exists.`);
    }
    item.name = data.name.trim();
    item.slug = item.name.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]+/g, "");
  }

  if (data.description !== undefined) item.description = data.description.trim();
  if (data.category !== undefined) item.category = data.category;
  if (data.icon !== undefined) item.icon = data.icon;
  if (data.displayOrder !== undefined) item.displayOrder = Number(data.displayOrder);
  if (data.isActive !== undefined) item.isActive = Boolean(data.isActive);

  await item.save();
  return item;
};

/**
 * Delete a specialization (Admin)
 */
export const deleteSpecializationService = async (id) => {
  const item = await Specialization.findById(id);
  if (!item) {
    throw new Error("Specialization not found.");
  }

  // Check if any doctors currently hold this specialization
  const doctorCount = await Doctor.countDocuments({
    specialization: { $regex: new RegExp(`^${item.name}$`, "i") },
  });

  if (doctorCount > 0) {
    throw new Error(
      `Cannot delete "${item.name}" because ${doctorCount} active physician(s) are assigned to it. Please reassign them first, or toggle it to inactive.`
    );
  }

  await Specialization.findByIdAndDelete(id);
  return { message: `Specialization "${item.name}" deleted successfully.` };
};

/**
 * Toggle Active / Inactive Status (Admin)
 */
export const toggleSpecializationStatusService = async (id) => {
  const item = await Specialization.findById(id);
  if (!item) {
    throw new Error("Specialization not found.");
  }

  item.isActive = !item.isActive;
  await item.save();

  return item;
};
