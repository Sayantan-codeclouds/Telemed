import Payout from "./payout.model.js";
import Doctor from "../doctors/doctor.model.js";
import Appointment from "../appointments/appointment.model.js";
import { createNotificationService } from "../notifications/notification.service.js";
import { formatAppointmentProfileImages } from "../shared/utils/fileUrl.js";

const DEFAULT_PLATFORM_COMMISSION_PERCENT = 10; // Default 10% platform share

export const getDoctorEarningsService = async (doctorId) => {
  const doctor = await Doctor.findById(doctorId).select(
    "consultationFee payoutSettings platformCommissionPercent"
  );
  if (!doctor) {
    throw new Error("Doctor not found.");
  }

  const commissionPercent =
    typeof doctor.platformCommissionPercent === "number" && !isNaN(doctor.platformCommissionPercent)
      ? doctor.platformCommissionPercent
      : DEFAULT_PLATFORM_COMMISSION_PERCENT;

  // 1. All completed appointments
  const completedAppointments = await Appointment.find({
    doctor: doctorId,
    status: "COMPLETED",
  })
    .populate("patient", "firstName lastName email profileImage")
    .sort({ appointmentDate: -1, createdAt: -1 });

  let grossEarnings = 0;
  completedAppointments.forEach((appt) => {
    const fee = Number(appt.consultationFee ?? doctor.consultationFee ?? 500);
    grossEarnings += fee;
  });

  const platformFeeTotal = Math.round((grossEarnings * commissionPercent) / 100);
  const netEarnings = grossEarnings - platformFeeTotal;

  // 2. Payouts analysis
  const allPayouts = await Payout.find({ doctor: doctorId });
  let totalWithdrawn = 0;
  let pendingWithdrawn = 0;

  allPayouts.forEach((p) => {
    if (p.status === "PAID") {
      totalWithdrawn += p.amount;
    } else if (p.status === "PENDING" || p.status === "APPROVED" || p.status === "PROCESSING") {
      pendingWithdrawn += p.amount;
    }
  });

  const availableBalance = Math.max(0, netEarnings - (totalWithdrawn + pendingWithdrawn));

  // 3. Monthly Breakdown (Past 6 months)
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthlyData = [];

  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthIndex = d.getMonth();
    const year = d.getFullYear();
    const label = `${monthNames[monthIndex]} ${year}`;

    const apptsInMonth = completedAppointments.filter((a) => {
      const apptDate = new Date(a.appointmentDate || a.createdAt);
      return apptDate.getMonth() === monthIndex && apptDate.getFullYear() === year;
    });

    let monthGross = 0;
    apptsInMonth.forEach((a) => {
      monthGross += Number(a.consultationFee ?? doctor.consultationFee ?? 500);
    });

    const monthNet = Math.round(monthGross * (1 - commissionPercent / 100));

    monthlyData.push({
      label,
      month: monthNames[monthIndex],
      year,
      gross: monthGross,
      net: monthNet,
      consultationsCount: apptsInMonth.length,
    });
  }

  // 4. Ledger of completed visits with calculations
  const consultationLedger = completedAppointments.map((a) => {
    const fee = Number(a.consultationFee ?? doctor.consultationFee ?? 500);
    const commission = Math.round((fee * commissionPercent) / 100);
    const net = fee - commission;

    return {
      _id: a._id,
      patient: a.patient,
      appointmentDate: a.appointmentDate,
      slot: a.slot,
      grossFee: fee,
      platformFee: commission,
      netAmount: net,
      status: a.status,
      paymentStatus: a.paymentStatus,
    };
  });

  return {
    summary: {
      grossEarnings,
      platformCommissionPercent: commissionPercent,
      doctorPayoutPercent: 100 - commissionPercent,
      platformFeeTotal,
      netEarnings,
      totalWithdrawn,
      pendingWithdrawn,
      availableBalance,
      completedConsultationsCount: completedAppointments.length,
    },
    payoutSettings: doctor.payoutSettings || {},
    monthlyData,
    consultationLedger,
  };
};

export const getDoctorPayoutsService = async (doctorId) => {
  const payouts = await Payout.find({ doctor: doctorId }).sort({ createdAt: -1 });
  return payouts;
};

export const requestDoctorPayoutService = async (doctorId, { amount, notes }) => {
  const numAmount = Number(amount);
  if (!numAmount || numAmount <= 0) {
    throw new Error("Please specify a valid withdrawal amount.");
  }

  if (numAmount < 100) {
    throw new Error("Minimum withdrawal amount is ₹100 / $10.");
  }

  const doctor = await Doctor.findById(doctorId);
  if (!doctor) {
    throw new Error("Doctor not found.");
  }

  const settings = doctor.payoutSettings || {};
  const hasBankDetails = Boolean(settings.accountNumber && settings.bankName);
  const hasUpiDetails = Boolean(settings.upiId);

  if (!hasBankDetails && !hasUpiDetails && !settings.paypalEmail) {
    throw new Error(
      "Please configure your Bank Account or UPI ID in Payout Settings before requesting a withdrawal."
    );
  }

  // Check available balance
  const earnings = await getDoctorEarningsService(doctorId);
  if (numAmount > earnings.summary.availableBalance) {
    throw new Error(
      `Insufficient available balance. You can withdraw up to ₹${earnings.summary.availableBalance}.`
    );
  }

  const payout = await Payout.create({
    doctor: doctorId,
    amount: numAmount,
    platformFee: 0,
    netAmount: numAmount,
    status: "PENDING",
    payoutMethod: settings.preferredMethod || (hasUpiDetails ? "UPI" : "BANK_TRANSFER"),
    accountDetails: {
      accountHolderName: settings.accountHolderName || `${doctor.firstName} ${doctor.lastName}`,
      bankName: settings.bankName || "",
      accountNumber: settings.accountNumber || "",
      routingOrIfsc: settings.routingOrIfsc || "",
      upiId: settings.upiId || "",
      paypalEmail: settings.paypalEmail || "",
    },
    notes: notes || "",
  });

  // Notify Doctor
  await createNotificationService({
    recipient: doctorId,
    recipientModel: "Doctor",
    title: "💰 Payout Request Submitted",
    message: `Your withdrawal request for ₹${numAmount} has been received and is being processed by our finance team.`,
    type: "APPOINTMENT",
    link: "/doctor/earnings",
  });

  return payout;
};

export const getDoctorPayoutSettingsService = async (doctorId) => {
  const doctor = await Doctor.findById(doctorId).select("payoutSettings firstName lastName");
  if (!doctor) {
    throw new Error("Doctor not found.");
  }
  return doctor.payoutSettings || {};
};

export const updateDoctorPayoutSettingsService = async (doctorId, data) => {
  const doctor = await Doctor.findById(doctorId);
  if (!doctor) {
    throw new Error("Doctor not found.");
  }

  doctor.payoutSettings = {
    accountHolderName: data.accountHolderName ?? doctor.payoutSettings?.accountHolderName,
    bankName: data.bankName ?? doctor.payoutSettings?.bankName,
    accountNumber: data.accountNumber ?? doctor.payoutSettings?.accountNumber,
    routingOrIfsc: data.routingOrIfsc ?? doctor.payoutSettings?.routingOrIfsc,
    upiId: data.upiId ?? doctor.payoutSettings?.upiId,
    paypalEmail: data.paypalEmail ?? doctor.payoutSettings?.paypalEmail,
    preferredMethod: data.preferredMethod ?? doctor.payoutSettings?.preferredMethod ?? "BANK_TRANSFER",
  };

  await doctor.save();
  return doctor.payoutSettings;
};

export const getAllPayoutsAdminService = async () => {
  const payouts = await Payout.find()
    .populate("doctor", "firstName lastName email phone specialization hospital profileImage")
    .sort({ createdAt: -1 });

  return payouts;
};

export const updatePayoutStatusAdminService = async (
  payoutId,
  { status, referenceNumber, rejectionReason }
) => {
  const payout = await Payout.findById(payoutId).populate("doctor", "firstName lastName email");
  if (!payout) {
    throw new Error("Payout record not found.");
  }

  payout.status = status;
  if (referenceNumber) payout.referenceNumber = referenceNumber;
  if (rejectionReason) payout.rejectionReason = rejectionReason;
  if (status === "PAID") {
    payout.processedAt = new Date();
  }
  await payout.save();

  // Notify doctor
  if (status === "PAID") {
    await createNotificationService({
      recipient: payout.doctor._id,
      recipientModel: "Doctor",
      title: "✅ Payout Disbursed",
      message: `Your payout of ₹${payout.amount} has been successfully transferred to your account. Reference: ${referenceNumber || "Direct Deposit"}`,
      type: "APPOINTMENT",
      link: "/doctor/earnings",
    });
  } else if (status === "REJECTED") {
    await createNotificationService({
      recipient: payout.doctor._id,
      recipientModel: "Doctor",
      title: "❌ Payout Request Rejected",
      message: `Your payout request of ₹${payout.amount} could not be processed. Reason: ${rejectionReason || "Invalid account details."}`,
      type: "APPOINTMENT",
      link: "/doctor/earnings",
    });
  }

  return payout;
};
