import dotenv from "dotenv";
dotenv.config({ path: "d:/TeleMed/server/.env" });
import mongoose from "mongoose";

await mongoose.connect(process.env.MONGO_URI);
const settings = await mongoose.connection.db.collection("crmsettings").findOne({});
const key = settings?.groqApiKey;
console.log(
  "DB groqApiKey:",
  !key ? "EMPTY / NOT SAVED" : key.startsWith("enc:v1:") ? "FOUND (encrypted at rest)" : `FOUND (${key.length} chars): ${key.slice(0, 15)}...`
);
console.log("DB resendApiKey:", settings?.resendApiKey ? "SET" : "EMPTY");
await mongoose.disconnect();
process.exit(0);
