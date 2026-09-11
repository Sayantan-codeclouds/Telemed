import fs from "fs";
import path from "path";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Admin from "./admin.model.js";
import Patient from "../patients/patient.model.js";
import Doctor from "../doctors/doctor.model.js";
import Appointment from "../appointments/appointment.model.js";
import Prescription from "../prescriptions/prescription.model.js";
import { Order, Medicine } from "../pharmacy/pharmacy.model.js";
import Notification from "../notifications/notification.model.js";
import { createNotificationService } from "../notifications/notification.service.js";
import AppError from "../shared/errors/AppError.js";
import {
  formatAppointmentProfileImages,
  formatProfileImage,
  getProfileImage,
  getProfileImageFilename,
} from "../shared/utils/fileUrl.js";


/* =================== Auth =================== */

export const loginAdmin = async ({ email, password }) => {
  const admin = await Admin.findOne({
    email: email.toLowerCase(),
  }).select("+password");

  if (!admin) {
    throw AppError.unauthorized("Invalid email or password.");
  }

  if (admin.status !== "ACTIVE") {
    throw AppError.forbidden("Account is not active.");
  }

  const isValid = await bcrypt.compare(password, admin.password);

  if (!isValid) {
    throw AppError.unauthorized("Invalid email or password.");
  }

  const token = jwt.sign(
    { adminId: admin._id, role: admin.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );

  return {
    token,
    admin: {
      id: admin._id,
      firstName: admin.firstName,
      lastName: admin.lastName,
      email: admin.email,
      phone: admin.phone || "",
      profileImage: getProfileImage(admin.profileImage),
      role: admin.role,
    },
  };
};

/* =================== Dashboard Stats =================== */

export const getDashboardStats = async () => {
  const [
    totalPatients,
    totalDoctors,
    totalAppointments,
    pendingAppointments,
    completedAppointments,
    cancelledAppointments,
  ] = await Promise.all([
    Patient.countDocuments(),
    Doctor.countDocuments({ isEmailVerified: true }),
    Appointment.countDocuments(),
    Appointment.countDocuments({ status: "PENDING" }),
    Appointment.countDocuments({ status: "COMPLETED" }),
    Appointment.countDocuments({ status: "CANCELLED" }),
  ]);

  return {
    totalPatients,
    totalDoctors,
    totalAppointments,
    pendingAppointments,
    completedAppointments,
    cancelledAppointments,
  };
};

/* =================== Patient Management =================== */

export const getAllPatients = async () => {
  return Patient.find()
    .select("-password -verificationToken -verificationTokenExpires -resetPasswordToken -resetPasswordTokenExpires")
    .sort({ createdAt: -1 });
};

export const createPatientService = async (data) => {
  const { firstName, lastName, email, phone, password, gender, bloodGroup, dateOfBirth, status } = data;

  if (!firstName || !lastName || !email || !phone) {
    throw AppError.badRequest("First name, last name, email, and phone number are required.");
  }

  const existingEmail = await Patient.findOne({ email: email.toLowerCase().trim() });
  if (existingEmail) {
    throw AppError.badRequest("A patient with this email already exists.");
  }

  const existingPhone = await Patient.findOne({ phone: phone.trim() });
  if (existingPhone) {
    throw AppError.badRequest("A patient with this phone number already exists.");
  }

  const rawPassword = password && password.trim() ? password.trim() : "Password@123";
  const hashedPassword = await bcrypt.hash(rawPassword, 10);

  const patient = await Patient.create({
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    email: email.toLowerCase().trim(),
    phone: phone.trim(),
    password: hashedPassword,
    gender: gender || "Male",
    bloodGroup: bloodGroup || "O+",
    dateOfBirth: dateOfBirth || null,
    isEmailVerified: true,
    status: status || "ACTIVE",
  });

  const created = await Patient.findById(patient._id).select("-password");
  return created;
};

export const updatePatientStatus = async (patientId, status) => {
  const patient = await Patient.findById(patientId);
  if (!patient) throw AppError.notFound("Patient not found.");

  patient.status = status;
  await patient.save();

  // Notify patient of account status change
  const isActive = status === "ACTIVE";
  await createNotificationService({
    recipient: patient._id,
    recipientModel: "Patient",
    title: isActive ? "✅ Account Activated" : "⚠️ Account Suspended",
    message: isActive
      ? "Your TeleClinic patient account has been activated. You can now book appointments and use all services."
      : "Your account has been suspended by an administrator. Please contact support for assistance.",
    type: "SYSTEM",
    link: "/patient/dashboard",
  }).catch(() => {});

  return patient;
};

export const deletePatientService = async (patientId) => {
  const patient = await Patient.findById(patientId);
  if (!patient) throw AppError.notFound("Patient not found.");

  await Promise.all([
    Patient.findByIdAndDelete(patientId),
    Appointment.deleteMany({ patient: patientId }),
    Prescription.deleteMany({ patient: patientId }),
    Order.deleteMany({ patient: patientId }),
    Notification.deleteMany({ recipient: patientId }),
  ]);

  return { success: true, message: "Patient and associated data deleted successfully." };
};

/* =================== Doctor Management =================== */

export const getAllDoctorsAdmin = async () => {
  return Doctor.find()
    .select("-password -verificationToken -verificationTokenExpires -resetPasswordToken -resetPasswordTokenExpires")
    .sort({ createdAt: -1 });
};

export const createDoctorService = async (data) => {
  const {
    firstName,
    lastName,
    email,
    phone,
    password,
    specialization,
    hospital,
    experience,
    qualification,
    licenseNumber,
    consultationFee,
    status,
  } = data;

  if (!firstName || !lastName || !email || !phone) {
    throw AppError.badRequest("First name, last name, email, and phone number are required.");
  }

  const existingDoctor = await Doctor.findOne({ email: email.toLowerCase().trim() });
  if (existingDoctor) {
    throw AppError.badRequest("A doctor with this email already exists.");
  }

  const existingPhone = await Doctor.findOne({ phone: phone.trim() });
  if (existingPhone) {
    throw AppError.badRequest("A doctor with this phone number already exists.");
  }

  const rawPassword = password && password.trim() ? password.trim() : "Password@123";

  // Standard initial availability: Monday to Friday
  const defaultAvailability = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
  ].map((day) => ({
    day,
    enabled: true,
    slots: [
      { start: "09:00", end: "13:00" },
      { start: "17:00", end: "20:00" },
    ],
  }));

  const doctor = new Doctor({
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    email: email.toLowerCase().trim(),
    phone: phone.trim(),
    password: rawPassword, // Doctor schema pre('save') will hash this with bcrypt
    specialization: specialization || "General Physician",
    hospital: hospital || "TeleClinic Medical Center",
    experience: Number(experience) || 0,
    qualification: qualification || "MBBS",
    licenseNumber: licenseNumber || "",
    consultationFee: Number(consultationFee) || 500,
    platformCommissionPercent:
      typeof data.platformCommissionPercent === "number"
        ? data.platformCommissionPercent
        : 10,
    availability: defaultAvailability,
    isEmailVerified: true,
    status: status || "ACTIVE",
  });

  await doctor.save();

  const created = await Doctor.findById(doctor._id).select("-password");
  return created;
};

export const updateDoctorStatus = async (doctorId, status) => {
  const doctor = await Doctor.findById(doctorId);
  if (!doctor) throw AppError.notFound("Doctor not found.");

  doctor.status = status;
  await doctor.save();

  if (status === "ACTIVE") {
    await createNotificationService({
      recipient: doctor._id,
      recipientModel: "Doctor",
      title: "✅ Account Approved & Activated",
      message: `Congratulations Dr. ${doctor.firstName}! Your TeleClinic physician account has been approved. You can now set your availability and start accepting consultations.`,
      type: "DOCTOR_APPROVAL",
      link: "/doctor/dashboard",
    }).catch(() => {});
  } else if (status === "SUSPENDED") {
    await createNotificationService({
      recipient: doctor._id,
      recipientModel: "Doctor",
      title: "⚠️ Account Suspended",
      message: "Your TeleClinic doctor account has been suspended by an administrator. Please contact support to resolve this.",
      type: "SYSTEM",
      link: "/doctor/dashboard",
    }).catch(() => {});
  } else if (status === "INACTIVE") {
    await createNotificationService({
      recipient: doctor._id,
      recipientModel: "Doctor",
      title: "🔴 Account Deactivated",
      message: "Your TeleClinic doctor account has been deactivated. Please contact the admin team for further information.",
      type: "SYSTEM",
      link: "/doctor/dashboard",
    }).catch(() => {});
  }

  return doctor;
};

export const updateDoctorCommissionService = async (doctorId, commissionPercent) => {
  const doctor = await Doctor.findById(doctorId);
  if (!doctor) throw AppError.notFound("Doctor not found.");

  const rate = Number(commissionPercent);
  if (isNaN(rate) || rate < 0 || rate > 100) {
    throw AppError.badRequest("Platform commission rate must be a valid number between 0% and 100%.");
  }

  doctor.platformCommissionPercent = rate;
  await doctor.save();

  // Notify doctor
  await createNotificationService({
    recipient: doctor._id,
    recipientModel: "Doctor",
    title: "💼 Commission & Payout Rate Updated",
    message: `Your platform commission rate has been updated to ${rate}% (You receive ${100 - rate}% payout).`,
    type: "SYSTEM",
    link: "/doctor/earnings",
  }).catch(() => {});

  return {
    _id: doctor._id,
    firstName: doctor.firstName,
    lastName: doctor.lastName,
    platformCommissionPercent: doctor.platformCommissionPercent,
    doctorPayoutPercent: 100 - doctor.platformCommissionPercent,
  };
};

export const deleteDoctorService = async (doctorId) => {
  const doctor = await Doctor.findById(doctorId);
  if (!doctor) throw AppError.notFound("Doctor not found.");

  await Promise.all([
    Doctor.findByIdAndDelete(doctorId),
    Appointment.deleteMany({ doctor: doctorId }),
    Prescription.deleteMany({ doctor: doctorId }),
    Notification.deleteMany({ recipient: doctorId }),
  ]);

  return { success: true, message: "Doctor and associated appointments deleted successfully." };
};

/* =================== Appointment Oversight =================== */

export const getAllAppointments = async () => {
  const appointments = await Appointment.find()
    .populate("patient", "firstName lastName email profileImage phone")
    .populate("doctor", "firstName lastName email specialization profileImage hospital")
    .sort({ createdAt: -1 });

  return appointments.map(formatAppointmentProfileImages);
};

export const deleteAppointmentService = async (appointmentId) => {
  const appointment = await Appointment.findById(appointmentId);
  if (!appointment) throw AppError.notFound("Appointment not found.");

  await Promise.all([
    Appointment.findByIdAndDelete(appointmentId),
    Prescription.deleteMany({ appointment: appointmentId }),
  ]);

  return { success: true, message: "Appointment deleted successfully." };
};

export const rescheduleAppointmentByAdminService = async (
  appointmentId,
  { newDate, newSlot, reason, newStatus, adminUser }
) => {
  if (!newDate || !newSlot || !newSlot.start || !newSlot.end) {
    throw AppError.badRequest("Please provide a new date and time slot.");
  }

  const appointment = await Appointment.findById(appointmentId);
  if (!appointment) {
    throw AppError.notFound("Appointment not found.");
  }

  if (appointment.status === "COMPLETED") {
    throw AppError.badRequest("Completed appointments cannot be rescheduled.");
  }

  const doctor = await Doctor.findById(appointment.doctor);
  if (!doctor || doctor.status !== "ACTIVE") {
    throw AppError.badRequest("Doctor is not available or inactive.");
  }

  // Check Doctor Availability on new date
  const appointmentDay = new Date(newDate).toLocaleDateString("en-US", {
    weekday: "long",
    timeZone: "UTC",
  });

  const availability = doctor.availability?.find(
    (item) => item.day === appointmentDay
  );

  if (!availability || !availability.enabled) {
    throw AppError.badRequest(`Doctor is not scheduled to work on ${appointmentDay}s.`);
  }

  const slotExists = availability.slots?.some(
    (slot) => slot.start === newSlot.start && slot.end === newSlot.end
  );

  if (!slotExists) {
    throw AppError.badRequest("Selected time slot is not in the doctor's weekly schedule.");
  }

  // Prevent Double Booking (exclude current appointment)
  const existingAppointment = await Appointment.findOne({
    _id: { $ne: appointment._id },
    doctor: doctor._id,
    appointmentDate: new Date(newDate),
    "slot.start": newSlot.start,
    "slot.end": newSlot.end,
    status: {
      $in: ["PENDING", "CONFIRMED", "IN_PROGRESS"],
    },
  });

  if (existingAppointment) {
    throw AppError.badRequest("This time slot is already booked by another patient.");
  }

  const adminLabel = adminUser
    ? `${adminUser.role || "Admin"}: ${adminUser.firstName || "Staff"}`
    : "Admin Support";

  // Record history
  appointment.rescheduleHistory.push({
    previousDate: appointment.appointmentDate,
    previousSlot: {
      start: appointment.slot?.start,
      end: appointment.slot?.end,
    },
    reason: reason
      ? `[${adminLabel}] ${reason}`
      : `Rescheduled by ${adminLabel}`,
    rescheduledAt: new Date(),
  });

  appointment.appointmentDate = new Date(newDate);
  appointment.slot = newSlot;
  appointment.isRescheduled = true;
  if (newStatus) {
    appointment.status = newStatus;
  } else if (appointment.status === "PENDING") {
    appointment.status = "CONFIRMED"; // Admin rescheduled and confirmed by default
  }
  await appointment.save();

  const populated = await appointment.populate([
    {
      path: "doctor",
      select:
        "firstName lastName email profileImage specialization hospital consultationFee",
    },
    {
      path: "patient",
      select: "firstName lastName email profileImage phone",
    },
  ]);

  const docName = `Dr. ${populated.doctor?.firstName} ${populated.doctor?.lastName}`;
  const patName = `${populated.patient?.firstName} ${populated.patient?.lastName}`;
  const formattedNewDate = new Date(newDate).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  // Notify Doctor
  await createNotificationService({
    recipient: populated.doctor._id,
    recipientModel: "Doctor",
    title: "📅 Appointment Rescheduled by Support",
    message: `Consultation with ${patName} has been rescheduled to ${formattedNewDate} at ${newSlot.start} by TeleClinic Support.`,
    type: "APPOINTMENT",
    link: "/doctor/appointments",
  });

  // Notify Patient
  await createNotificationService({
    recipient: populated.patient._id,
    recipientModel: "Patient",
    title: "📅 Appointment Rescheduled by Support",
    message: `Your consultation with ${docName} has been rescheduled to ${formattedNewDate} at ${newSlot.start} by TeleClinic Support.`,
    type: "APPOINTMENT",
    link: "/patient/appointments",
  });

  return formatAppointmentProfileImages(populated);
};

/* =================== Demo Data Seeding & Cleanup =================== */

export const seedDemoDataService = async () => {
  const hashedPassword = await bcrypt.hash("Password@123", 10);

  // 1. Seed Demo Doctors
  const demoDoctorsData = [
    {
      firstName: "Arun",
      lastName: "Mukherjee",
      email: "dr.arun@teleclinic.com",
      password: "Password@123",
      phone: "+91 98301 11223",
      isEmailVerified: true,
      specialization: "Cardiologist",
      qualification: "MD, DM (Cardiology), AIIMS",
      experience: 14,
      consultationFee: 800,
      hospital: "Apollo Gleneagles Hospital",
      biography: "Senior Consultant Cardiologist specializing in preventive cardiology, coronary interventions, and hypertension management.",
      status: "ACTIVE",
      availability: [
        { day: "Monday", enabled: true, slots: [{ start: "09:00", end: "13:00" }, { start: "17:00", end: "20:00" }] },
        { day: "Tuesday", enabled: true, slots: [{ start: "09:00", end: "13:00" }] },
        { day: "Wednesday", enabled: true, slots: [{ start: "09:00", end: "13:00" }, { start: "17:00", end: "20:00" }] },
        { day: "Thursday", enabled: true, slots: [{ start: "09:00", end: "13:00" }] },
        { day: "Friday", enabled: true, slots: [{ start: "09:00", end: "13:00" }, { start: "17:00", end: "20:00" }] },
        { day: "Saturday", enabled: true, slots: [{ start: "10:00", end: "14:00" }] },
      ],
    },
    {
      firstName: "Sneha",
      lastName: "Roy",
      email: "dr.sneha@teleclinic.com",
      password: "Password@123",
      phone: "+91 98312 22334",
      isEmailVerified: true,
      specialization: "Dermatologist",
      qualification: "MBBS, MD (Dermatology), CMC",
      experience: 9,
      consultationFee: 650,
      hospital: "Fortis Healthcare",
      biography: "Expert clinical dermatologist and cosmetologist with extensive practice in acne therapy, eczema, and laser treatments.",
      status: "ACTIVE",
      availability: [
        { day: "Monday", enabled: true, slots: [{ start: "10:00", end: "14:00" }] },
        { day: "Wednesday", enabled: true, slots: [{ start: "10:00", end: "14:00" }] },
        { day: "Friday", enabled: true, slots: [{ start: "14:00", end: "18:00" }] },
        { day: "Saturday", enabled: true, slots: [{ start: "10:00", end: "15:00" }] },
      ],
    },
    {
      firstName: "Vikram",
      lastName: "Deshmukh",
      email: "dr.vikram@teleclinic.com",
      password: "Password@123",
      phone: "+91 98323 33445",
      isEmailVerified: true,
      specialization: "General Physician",
      qualification: "MBBS, MD (Internal Medicine)",
      experience: 12,
      consultationFee: 500,
      hospital: "Medica Superspecialty",
      biography: "Primary care physician managing chronic diseases, seasonal viral illnesses, diabetes, and comprehensive lifestyle health.",
      status: "ACTIVE",
      availability: [
        { day: "Monday", enabled: true, slots: [{ start: "08:00", end: "12:00" }, { start: "16:00", end: "20:00" }] },
        { day: "Tuesday", enabled: true, slots: [{ start: "08:00", end: "12:00" }, { start: "16:00", end: "20:00" }] },
        { day: "Wednesday", enabled: true, slots: [{ start: "08:00", end: "12:00" }, { start: "16:00", end: "20:00" }] },
        { day: "Thursday", enabled: true, slots: [{ start: "08:00", end: "12:00" }, { start: "16:00", end: "20:00" }] },
        { day: "Friday", enabled: true, slots: [{ start: "08:00", end: "12:00" }, { start: "16:00", end: "20:00" }] },
      ],
    },
    {
      firstName: "Meera",
      lastName: "Nair",
      email: "dr.meera@teleclinic.com",
      password: "Password@123",
      phone: "+91 98334 44556",
      isEmailVerified: true,
      specialization: "Pediatrician",
      qualification: "MBBS, DCH, DNB (Pediatrics)",
      experience: 11,
      consultationFee: 600,
      hospital: "Manipal Children's Hospital",
      biography: "Caring pediatrician focused on infant nutrition, child developmental milestones, and pediatric respiratory conditions.",
      status: "ACTIVE",
      availability: [
        { day: "Monday", enabled: true, slots: [{ start: "11:00", end: "15:00" }] },
        { day: "Tuesday", enabled: true, slots: [{ start: "11:00", end: "15:00" }] },
        { day: "Thursday", enabled: true, slots: [{ start: "11:00", end: "15:00" }] },
        { day: "Saturday", enabled: true, slots: [{ start: "09:00", end: "13:00" }] },
      ],
    },
  ];

  const doctors = [];
  for (const docData of demoDoctorsData) {
    let doc = await Doctor.findOne({ email: docData.email });
    if (!doc) {
      doc = await Doctor.create(docData);
    }
    doctors.push(doc);
  }

  // 2. Seed Demo Patients
  const demoPatientsData = [
    {
      firstName: "Rahul",
      lastName: "Sharma",
      email: "patient.rahul@teleclinic.com",
      password: hashedPassword,
      phone: "+91 97481 23456",
      isEmailVerified: true,
      gender: "Male",
      bloodGroup: "B+",
      dateOfBirth: new Date("1994-06-15"),
      height: { value: 178, unit: "cm" },
      weight: { value: 74, unit: "kg" },
      allergies: ["Penicillin", "Dust Mites"],
      medicalConditions: ["Mild Hypertension"],
      address: { line1: "Salt Lake Sector V", city: "Kolkata", state: "West Bengal", country: "India", pincode: "700091" },
    },
    {
      firstName: "Priya",
      lastName: "Banerjee",
      email: "patient.priya@teleclinic.com",
      password: hashedPassword,
      phone: "+91 97482 34567",
      isEmailVerified: true,
      gender: "Female",
      bloodGroup: "O+",
      dateOfBirth: new Date("1998-03-22"),
      height: { value: 162, unit: "cm" },
      weight: { value: 56, unit: "kg" },
      allergies: ["Peanuts"],
      medicalConditions: ["Allergic Rhinitis"],
      address: { line1: "Park Street", city: "Kolkata", state: "West Bengal", country: "India", pincode: "700016" },
    },
    {
      firstName: "Amit",
      lastName: "Gupta",
      email: "patient.amit@teleclinic.com",
      password: hashedPassword,
      phone: "+91 97483 45678",
      isEmailVerified: true,
      gender: "Male",
      bloodGroup: "A+",
      dateOfBirth: new Date("1988-11-04"),
      height: { value: 172, unit: "cm" },
      weight: { value: 80, unit: "kg" },
      allergies: [],
      medicalConditions: ["Type 2 Diabetes"],
      address: { line1: "Ballygunge Circular Rd", city: "Kolkata", state: "West Bengal", country: "India", pincode: "700019" },
    },
  ];

  const patients = [];
  for (const patData of demoPatientsData) {
    let pat = await Patient.findOne({ email: patData.email });
    if (!pat) {
      pat = await Patient.create(patData);
    }
    patients.push(pat);
  }

  // 3. Seed Demo Appointments
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const existingAppts = await Appointment.countDocuments();
  if (existingAppts === 0) {
    // Appointment 1: Confirmed (Tomorrow)
    const appt1 = await Appointment.create({
      patient: patients[0]._id,
      doctor: doctors[0]._id,
      appointmentDate: tomorrow,
      slot: { start: "09:00", end: "09:30" },
      reason: "Routine cardiovascular review and mild chest tightness after exercise.",
      status: "CONFIRMED",
      roomId: crypto.randomUUID(),
      consultationFee: doctors[0].consultationFee,
    });

    // Appointment 2: Pending (Tomorrow)
    await Appointment.create({
      patient: patients[1]._id,
      doctor: doctors[1]._id,
      appointmentDate: tomorrow,
      slot: { start: "10:00", end: "10:30" },
      reason: "Skin flare-up, redness on forehead and dryness.",
      status: "PENDING",
      roomId: crypto.randomUUID(),
      consultationFee: doctors[1].consultationFee,
    });

    // Appointment 3: Completed (Yesterday) with Prescription
    const appt3 = await Appointment.create({
      patient: patients[0]._id,
      doctor: doctors[2]._id,
      appointmentDate: yesterday,
      slot: { start: "16:00", end: "16:30" },
      reason: "High fever and persistent body ache for 3 days.",
      status: "COMPLETED",
      roomId: crypto.randomUUID(),
      doctorNotes: "Patient has viral flu. Advised adequate hydration, rest, and paracetamol.",
      consultationFee: doctors[2].consultationFee,
    });

    // Seed Prescription for Appt 3
    await Prescription.create({
      appointment: appt3._id,
      doctor: doctors[2]._id,
      patient: patients[0]._id,
      diagnosis: "Acute Viral Pyrexia with upper respiratory discomfort",
      medicines: [
        { name: "Paracetamol 650", dosage: "650mg", frequency: "1-0-1", duration: "5 days", instructions: "After meals" },
        { name: "Cetirizine 10", dosage: "10mg", frequency: "0-0-1", duration: "3 days", instructions: "Before sleep" },
        { name: "Pantoprazole DSR", dosage: "40mg/30mg", frequency: "1-0-0", duration: "5 days", instructions: "Empty stomach in the morning" },
      ],
      notes: "Drink plenty of warm water. Avoid cold beverages and excessive exertion.",
      followUpDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
  }

  // 4. Seed Pharmacy Medicines if empty
  const medCount = await Medicine.countDocuments();
  if (medCount === 0) {
    const defaultMeds = [
      { name: "Paracetamol 650", genericName: "Acetaminophen", category: "Pain Relief", dosageForm: "Tablet", strength: "650mg", price: 35, inStock: true, description: "Fast relief from fever, headache, body ache." },
      { name: "Amoxicillin Clavulanate", genericName: "Amoxicillin + Potassium Clavulanate", category: "Antibiotics", dosageForm: "Tablet", strength: "625mg", price: 180, inStock: true, description: "Broad-spectrum antibacterial." },
      { name: "Azithromycin 500", genericName: "Azithromycin", category: "Antibiotics", dosageForm: "Tablet", strength: "500mg", price: 120, inStock: true, description: "Effective for throat and sinus infections." },
      { name: "Pantoprazole DSR", genericName: "Pantoprazole + Domperidone", category: "Gastrointestinal", dosageForm: "Capsule", strength: "40mg/30mg", price: 145, inStock: true, description: "Sustained relief from acid reflux and GERD." },
      { name: "Cetirizine 10", genericName: "Cetirizine Hydrochloride", category: "Respiratory", dosageForm: "Tablet", strength: "10mg", price: 25, inStock: true, description: "Non-drowsy antihistamine for allergies and cold." },
      { name: "Atorvastatin 20", genericName: "Atorvastatin", category: "Cardiovascular", dosageForm: "Tablet", strength: "20mg", price: 110, inStock: true, description: "Lipid-lowering medication for cholesterol." },
      { name: "Vitamin C + Zinc 500", genericName: "Ascorbic Acid + Zinc", category: "Vitamins & Supplements", dosageForm: "Tablet", strength: "500mg/50mg", price: 65, inStock: true, description: "Immunity booster." },
    ];
    await Medicine.insertMany(defaultMeds);
  }

  // 5. Seed SuperAdmin if empty
  let admin = await Admin.findOne({ email: "admin@teleclinic.com" });
  if (!admin) {
    const adminPassword = await bcrypt.hash("Admin@2026", 10);
    await Admin.create({
      firstName: "Admin",
      lastName: "TeleClinic",
      email: "admin@teleclinic.com",
      password: adminPassword,
      role: "SuperAdmin",
      status: "ACTIVE",
    });
  }

  return {
    success: true,
    message: "Showcase demo data seeded successfully!",
    data: {
      doctorsCount: doctors.length,
      patientsCount: patients.length,
    },
  };
};

export const clearDemoDataService = async () => {
  await Promise.all([
    Patient.deleteMany({ email: { $regex: "@teleclinic.com$" } }),
    Doctor.deleteMany({ email: { $regex: "@teleclinic.com$" } }),
    Appointment.deleteMany(),
    Prescription.deleteMany(),
    Order.deleteMany(),
  ]);

  return {
    success: true,
    message: "Demo showcase records cleared successfully.",
  };
};

/* =================== Admin Users (Team Management) =================== */

export const getAllAdminUsersService = async () => {
  const admins = await Admin.find()
    .select("-password")
    .sort({ createdAt: -1 });
  return admins.map((admin) => formatProfileImage(admin));
};

export const createAdminUserService = async ({
  firstName,
  lastName,
  email,
  password,
  phone,
  role = "CustomerSupport",
}) => {
  if (!firstName || !lastName || !email || !password) {
    throw AppError.badRequest("First name, last name, email, and password are required.");
  }

  const normalizedEmail = email.toLowerCase().trim();
  const existing = await Admin.findOne({ email: normalizedEmail });
  if (existing) {
    throw AppError.conflict("An administrator with this email address already exists.");
  }

  const validRoles = ["SuperAdmin", "Admin", "CustomerSupport"];
  if (!validRoles.includes(role)) {
    throw AppError.badRequest(`Invalid role. Must be one of: ${validRoles.join(", ")}`);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const admin = await Admin.create({
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    email: normalizedEmail,
    password: hashedPassword,
    phone: phone ? phone.trim() : "",
    role,
    status: "ACTIVE",
  });

  return Admin.findById(admin._id).select("-password");
};

export const updateAdminRoleService = async (id, role, currentAdminId) => {
  const validRoles = ["SuperAdmin", "Admin", "CustomerSupport"];
  if (!validRoles.includes(role)) {
    throw AppError.badRequest(`Invalid role. Must be one of: ${validRoles.join(", ")}`);
  }

  if (String(id) === String(currentAdminId) && role !== "SuperAdmin") {
    throw AppError.badRequest("You cannot demote your own SuperAdmin account.");
  }

  const admin = await Admin.findById(id);
  if (!admin) {
    throw AppError.notFound("Admin user not found.");
  }

  admin.role = role;
  await admin.save();

  return Admin.findById(id).select("-password");
};

export const updateAdminStatusService = async (id, status, currentAdminId) => {
  const validStatuses = ["ACTIVE", "INACTIVE", "SUSPENDED"];
  if (!validStatuses.includes(status)) {
    throw AppError.badRequest(`Invalid status. Must be one of: ${validStatuses.join(", ")}`);
  }

  if (String(id) === String(currentAdminId) && status !== "ACTIVE") {
    throw AppError.badRequest("You cannot deactivate or suspend your own account.");
  }

  const admin = await Admin.findById(id);
  if (!admin) {
    throw AppError.notFound("Admin user not found.");
  }

  admin.status = status;
  await admin.save();

  return Admin.findById(id).select("-password");
};

export const deleteAdminUserService = async (id, currentAdminId) => {
  if (String(id) === String(currentAdminId)) {
    throw AppError.badRequest("You cannot delete your own admin account.");
  }

  const admin = await Admin.findById(id);
  if (!admin) {
    throw AppError.notFound("Admin user not found.");
  }

  await Admin.findByIdAndDelete(id);

  return {
    success: true,
    message: `Admin user ${admin.firstName} ${admin.lastName} (${admin.email}) was deleted successfully.`,
  };
};

/* =================== Admin Self-Profile Management =================== */

export const getAdminProfileService = async (adminId) => {
  const admin = await Admin.findById(adminId);
  if (!admin) {
    throw AppError.notFound("Admin not found.");
  }
  return formatProfileImage(admin);
};

export const updateAdminProfileService = async (adminId, data) => {
  const admin = await Admin.findById(adminId);
  if (!admin) {
    throw AppError.notFound("Admin not found.");
  }

  if (data.firstName) admin.firstName = data.firstName.trim();
  if (data.lastName) admin.lastName = data.lastName.trim();
  if (data.phone !== undefined) admin.phone = data.phone.trim();

  await admin.save();
  return formatProfileImage(admin);
};

export const uploadAdminProfilePhotoService = async (adminId, file) => {
  if (!file) {
    throw AppError.badRequest("Please select an image to upload.");
  }

  const admin = await Admin.findById(adminId);
  if (!admin) {
    throw AppError.notFound("Admin not found.");
  }

  // Delete previous image from filesystem if exists locally
  if (admin.profileImage) {
    const oldFilename = getProfileImageFilename(admin.profileImage);
    if (oldFilename && !/^https?:\/\//i.test(oldFilename)) {
      const oldPath = path.join(
        process.cwd(),
        "src",
        "uploads",
        "profile-images",
        oldFilename
      );
      if (fs.existsSync(oldPath)) {
        try {
          fs.unlinkSync(oldPath);
        } catch (e) {
          console.error("Could not delete old admin avatar:", e);
        }
      }
    }
  }

  admin.profileImage = file.filename;
  await admin.save();

  return {
    profileImage: getProfileImage(admin.profileImage),
    admin: formatProfileImage(admin),
  };
};

export const changeAdminPasswordService = async (
  adminId,
  { currentPassword, newPassword }
) => {
  if (!currentPassword || !newPassword) {
    throw AppError.badRequest("Current password and new password are required.");
  }

  if (newPassword.length < 8) {
    throw AppError.badRequest("New password must be at least 8 characters long.");
  }

  const admin = await Admin.findById(adminId).select("+password");
  if (!admin) {
    throw AppError.notFound("Admin not found.");
  }

  const isMatch = await bcrypt.compare(currentPassword, admin.password);
  if (!isMatch) {
    throw AppError.badRequest("Current password is incorrect.");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  admin.password = hashedPassword;
  await admin.save();

  return {
    message: "Password updated successfully.",
  };
};

