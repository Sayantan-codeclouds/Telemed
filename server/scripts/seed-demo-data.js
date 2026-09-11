import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { seedDemoDataService } from "../src/admin/admin.service.js";

const run = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    console.log("Seeding showcase Doctors, Patients, Appointments, and Prescriptions...");
    const result = await seedDemoDataService();

    console.log("✅", result.message);
    console.log("Doctors present:", result.data.doctorsCount);
    console.log("Patients present:", result.data.patientsCount);

    console.log("\n--- Demo Credentials ---");
    console.log("Doctors:");
    console.log("  dr.arun@teleclinic.com (Password: Password@123) - Cardiologist");
    console.log("  dr.sneha@teleclinic.com (Password: Password@123) - Dermatologist");
    console.log("  dr.vikram@teleclinic.com (Password: Password@123) - General Physician");
    console.log("  dr.meera@teleclinic.com (Password: Password@123) - Pediatrician");
    console.log("\nPatients:");
    console.log("  patient.rahul@teleclinic.com (Password: Password@123)");
    console.log("  patient.priya@teleclinic.com (Password: Password@123)");
    console.log("  patient.amit@teleclinic.com (Password: Password@123)");
    console.log("------------------------\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error.message);
    process.exit(1);
  }
};

run();
