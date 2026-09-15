import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

async function run() {
  const mongoUri = process.env.MONGO_URI;
  console.log("Connecting to MongoDB Atlas...");
  await mongoose.connect(mongoUri);

  const filter = {};
  const update = {
    $set: {
      frontendUrl: "https://telemed-1-oevf.onrender.com",
      appUrl: "https://telemed-zuls.onrender.com",
    },
  };

  const result = await mongoose.connection.db.collection("crmsettings").updateOne(filter, update, { upsert: true });
  console.log("Updated CrmSettings in MongoDB:", result);

  const current = await mongoose.connection.db.collection("crmsettings").findOne();
  console.log("Current Settings now in MongoDB:", {
    frontendUrl: current?.frontendUrl,
    appUrl: current?.appUrl,
  });

  await mongoose.disconnect();
}

run().catch(console.error);
