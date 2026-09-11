/**
 * Customer Support Seed Script
 *
 * Creates the initial Customer Support team member for TeleClinic.
 *
 * Usage:
 *   node scripts/seed-support-user.js
 */
import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import bcrypt from "bcrypt";
import Admin from "../src/admin/admin.model.js";

const SUPPORT_USER_DATA = {
  firstName: "Support",
  lastName: "Specialist",
  email: "support@teleclinic.com",
  password: "Support@2026",
  phone: "+1 (555) 234-5678",
  role: "CustomerSupport",
  status: "ACTIVE",
};

const seedSupportUser = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    const existing = await Admin.findOne({ email: SUPPORT_USER_DATA.email });

    if (existing) {
      existing.role = "CustomerSupport";
      existing.status = "ACTIVE";
      const hashedPassword = await bcrypt.hash(SUPPORT_USER_DATA.password, 10);
      existing.password = hashedPassword;
      await existing.save();
      console.log(`✅ Customer Support user updated: ${SUPPORT_USER_DATA.email} (${existing.role})`);
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(SUPPORT_USER_DATA.password, 10);

    await Admin.create({
      ...SUPPORT_USER_DATA,
      password: hashedPassword,
    });

    console.log(`✅ Customer Support user created successfully!`);
    console.log(`   Email:    ${SUPPORT_USER_DATA.email}`);
    console.log(`   Password: ${SUPPORT_USER_DATA.password}`);
    console.log(`   Role:     ${SUPPORT_USER_DATA.role}`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Seed failed:", error.message);
    process.exit(1);
  }
};

seedSupportUser();
