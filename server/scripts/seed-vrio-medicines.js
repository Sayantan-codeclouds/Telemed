import dotenv from "dotenv";
import mongoose from "mongoose";
import { Medicine } from "../src/pharmacy/pharmacy.model.js";

dotenv.config();

const productsToSeed = [
  {
    name: "telemed Semaglutide",
    genericName: "Semaglutide",
    category: "General",
    dosageForm: "Injection",
    strength: "90-Day Supply",
    price: 370.00,
    requiresPrescription: true,
    inStock: true,
    stockQuantity: 100,
    description: "Sema 90d Prepaid Offer - Shared GLP-1 receptor agonist for clinical weight and metabolic support.",
    manufacturer: "TeleMed",
    campaignId: 1471,
    prepaidCampaignId: 1471,
    routeId: 1,
    itemId: 2083,
    offerId: 250,
    vrioOfferId: 250,
    vrioProductId: 2083,
    vrioPrice: 370.00,
    isVrioEnabled: true,
  },
  {
    name: "telemed sermorelin",
    genericName: "Sermorelin Acetate",
    category: "General",
    dosageForm: "Injection",
    strength: "Injectable Solution",
    price: 238.50,
    requiresPrescription: true,
    inStock: true,
    stockQuantity: 100,
    description: "Telehealth-test-injectable - Shared peptide therapy for metabolic wellness and recovery.",
    manufacturer: "TeleMed",
    campaignId: 1476,
    prepaidCampaignId: 1476,
    routeId: 1,
    itemId: 2085,
    offerId: 169,
    vrioOfferId: 169,
    vrioProductId: 2085,
    vrioPrice: 238.50,
    isVrioEnabled: true,
  },
  {
    name: "Tirzepatide",
    genericName: "Tirzepatide",
    category: "General",
    dosageForm: "Injection",
    strength: "1-Month Supply",
    price: 99.99,
    requiresPrescription: true,
    inStock: true,
    stockQuantity: 100,
    description: "Tirzepatide - 1 Month Offer - Custom dual GIP and GLP-1 receptor agonist.",
    manufacturer: "TeleMed",
    campaignId: 1472,
    prepaidCampaignId: 1472,
    routeId: 1,
    itemId: 2154,
    offerId: 186,
    vrioOfferId: 186,
    vrioProductId: 2154,
    vrioPrice: 99.99,
    isVrioEnabled: true,
  },
];

async function seed() {
  console.log("Connecting to MongoDB:", process.env.MONGO_URI?.split("@")[1]);
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB successfully.");

  for (const prod of productsToSeed) {
    const existing = await Medicine.findOne({
      $or: [{ itemId: prod.itemId }, { name: prod.name }],
    });

    if (existing) {
      Object.assign(existing, prod);
      await existing.save();
      console.log(`✅ Updated Medicine: ${existing.name} (CID: ${existing.campaignId}, Item ID: ${existing.itemId}, Offer ID: ${existing.offerId}, Price: $${existing.price})`);
    } else {
      const created = await Medicine.create(prod);
      console.log(`✅ Created Medicine: ${created.name} (CID: ${created.campaignId}, Item ID: ${created.itemId}, Offer ID: ${created.offerId}, Price: $${created.price})`);
    }
  }

  const count = await Medicine.countDocuments();
  console.log(`\n🎉 Total medicines currently in database: ${count}`);
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("Error seeding medicines:", err);
  process.exit(1);
});
