/**
 * Admin Seed Script
 *
 * Creates the initial admin user for TeleClinic.
 *
 * Usage:
 *   node scripts/seed-admin.js
 *
 * Environment: Requires MONGO_URI in server/.env
 */
import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import bcrypt from "bcrypt";
import Admin from "../src/admin/admin.model.js";

const ADMIN_DATA = {
  firstName: "Admin",
  lastName: "TeleClinic",
  email: "admin@teleclinic.com",
  password: "Admin@2026",
  role: "SuperAdmin",
};

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    const existing = await Admin.findOne({ email: ADMIN_DATA.email });

    if (existing) {
      console.log(`⚠️  Admin already exists: ${ADMIN_DATA.email}`);
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(ADMIN_DATA.password, 10);

    await Admin.create({
      ...ADMIN_DATA,
      password: hashedPassword,
    });

    console.log(`✅ Admin created successfully!`);
    console.log(`   Email:    ${ADMIN_DATA.email}`);
    console.log(`   Password: ${ADMIN_DATA.password}`);
    console.log(`   Role:     ${ADMIN_DATA.role}`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Seed failed:", error.message);
    process.exit(1);
  }
};

seedAdmin();
