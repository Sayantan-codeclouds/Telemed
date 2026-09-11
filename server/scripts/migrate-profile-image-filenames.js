import dotenv from "dotenv";

dotenv.config();

const { default: mongoose } = await import("mongoose");
const { default: Patient } = await import("../src/patients/patient.model.js");
const { default: Doctor } = await import("../src/doctors/doctor.model.js");
const { getProfileImageFilename } = await import(
  "../src/shared/utils/fileUrl.js"
);

const migrate = async (Model) => {
  const records = await Model.find({
    profileImage: { $regex: /[\\/]/ },
  });

  for (const record of records) {
    record.profileImage = getProfileImageFilename(record.profileImage);
    await record.save();
  }

  return records.length;
};

try {
  await mongoose.connect(process.env.MONGO_URI);

  const [patients, doctors] = await Promise.all([
    migrate(Patient),
    migrate(Doctor),
  ]);

  console.log(
    `Migrated profile image filenames for ${patients} patient(s) and ${doctors} doctor(s).`
  );
} finally {
  await mongoose.disconnect();
}
