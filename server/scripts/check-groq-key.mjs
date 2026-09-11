import dotenv from "dotenv";
dotenv.config({ path: "d:/TeleMed/server/.env" });
import mongoose from "mongoose";

await mongoose.connect(process.env.MONGO_URI);
const settings = await mongoose.connection.db.collection("crmsettings").findOne({});
const key = settings?.groqApiKey;
console.log("DB groqApiKey:", key ? `FOUND (${key.length} chars): ${key.slice(0, 15)}...` : "EMPTY / NOT SAVED");
console.log("DB resendApiKey:", settings?.resendApiKey ? "SET" : "EMPTY");
await mongoose.disconnect();
process.exit(0);
