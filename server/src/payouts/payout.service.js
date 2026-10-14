import Payout from "./payout.model.js";
import Doctor from "../doctors/doctor.model.js";
import Appointment from "../appointments/appointment.model.js";
import { createNotificationService } from "../notifications/notification.service.js";
import { formatAppointmentProfileImages } from "../shared/utils/fileUrl.js";
import { Order } from "../pharmacy/pharmacy.model.js";
import { getCrmSettingsService } from "../pharmacy/vrio.service.js";
import { sendMailWithProvider } from "../mail/mail.service.js";
import { escapeHtml } from "../mail/mail.templates.js";
import { buildEarningsSnapshot } from "../appointments/appointment.service.js";

const toCents = (value) => Math.round(Number(value || 0) * 100) / 100;

const MIN_WITHDRAWAL = 100;

const getCurrencySign = async () => {
  try {
    return (await getCrmSettingsService())?.currencySign || "$";
  } catch {
    return "$";
  }
};

/** Name of the first missing detail for a payout method, or null if complete. */
const missingPayoutDetails = (method, details = {}) => {
  if (method === "UPI") return details.upiId ? null : "UPI ID";
  if (method === "PAYPAL") return details.paypalEmail ? null : "PayPal email";
  if (!details.accountHolderName) return "account holder name";
  if (!details.bankName) return "bank name";
  if (!details.accountNumber) return "account number";
  return null;
};

const sendPayoutDetailsChangedEmail = (doctor) =>
  sendMailWithProvider({
    to: doctor.email,
    subject: "Your TeleMed payout details were changed",
    html: `
      <div style="font-family:Arial,sans-serif;padding:24px;max-width:560px;margin:auto">
        <h2 style="margin:0 0 12px">Payout details changed</h2>
        <p>Hello Dr. ${escapeHtml(doctor.lastName || doctor.firstName || "")},</p>
        <p>The bank / UPI / PayPal details used for your TeleMed payouts were just changed.</p>
        <p><b>If you didn't make this change</b>, contact support right away and change your password.</p>
      </div>`,
  });

export const getDoctorEarningsService = async (doctorId) => {
  const doctor = await Doctor.findById(doctorId).select(
    "consultationFee payoutSettings platformCommissionPercent"
  );
  if (!doctor) {
    throw new Error("Doctor not found.");
  }

  // 1. Completed consultations, minus any whose payment was (or is being) refunded.
  const completedAppointments = await Appointment.find({
    doctor: doctorId,
    status: "COMPLETED",
  })
    .populate("patient", "firstName lastName email profileImage")
    .sort({ appointmentDate: -1, createdAt: -1 });

  const refundedIds = new Set(
    (
      await Order.find({
        appointment: { $in: completedAppointments.map((a) => a._id) },
        paymentStatus: { $in: ["REFUND_PENDING", "REFUNDED"] },
      }).select("appointment")
    ).map((o) => String(o.appointment))
  );
  const earningAppointments = completedAppointments.filter((a) => !refundedIds.has(String(a._id)));

  // 2. Each consultation's earnings are frozen at completion. Older ones
  //    without a record are frozen now (at the current rate), once.
  const toFreeze = [];
  for (const appt of earningAppointments) {
    if (!appt.earnings || typeof appt.earnings.netAmount !== "number") {
      appt.earnings = buildEarningsSnapshot(appt, doctor);
      toFreeze.push({ updateOne: { filter: { _id: appt._id }, update: { $set: { earnings: appt.earnings } } } });
    }
  }
  if (toFreeze.length > 0) {
    await Appointment.bulkWrite(toFreeze);
  }

  const grossEarnings = toCents(earningAppointments.reduce((sum, a) => sum + a.earnings.grossFee, 0));
  const platformFeeTotal = toCents(earningAppointments.reduce((sum, a) => sum + a.earnings.platformFee, 0));
  const netEarnings = toCents(earningAppointments.reduce((sum, a) => sum + a.earnings.netAmount, 0));

  // The doctor's current rate (applies to consultations completed from now on).
  const commissionPercent =
    typeof doctor.platformCommissionPercent === "number" && !isNaN(doctor.platformCommissionPercent)
      ? doctor.platformCommissionPercent
      : 10;

  // 3. Payouts analysis
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

  const availableBalance = Math.max(0, toCents(netEarnings - (totalWithdrawn + pendingWithdrawn)));

  // 4. Monthly breakdown (past 6 months, by UTC calendar month)
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthlyData = [];

  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
    const monthIndex = d.getUTCMonth();
    const year = d.getUTCFullYear();

    const apptsInMonth = earningAppointments.filter((a) => {
      const apptDate = new Date(a.appointmentDate || a.createdAt);
      return apptDate.getUTCMonth() === monthIndex && apptDate.getUTCFullYear() === year;
    });

    monthlyData.push({
      label: `${monthNames[monthIndex]} ${year}`,
      month: monthNames[monthIndex],
      year,
      gross: toCents(apptsInMonth.reduce((sum, a) => sum + a.earnings.grossFee, 0)),
      net: toCents(apptsInMonth.reduce((sum, a) => sum + a.earnings.netAmount, 0)),
      consultationsCount: apptsInMonth.length,
    });
  }

  // 5. Ledger of completed visits, from the frozen figures
  const consultationLedger = earningAppointments.map((a) => ({
    _id: a._id,
    patient: a.patient,
    appointmentDate: a.appointmentDate,
    slot: a.slot,
    grossFee: a.earnings.grossFee,
    commissionPercent: a.earnings.commissionPercent,
    platformFee: a.earnings.platformFee,
    netAmount: a.earnings.netAmount,
    status: a.status,
    paymentStatus: a.paymentStatus,
  }));

  return {
    summary: {
      grossEarnings,
      platformCommissionPercent: commissionPercent,
      doctorPayoutPercent: 100 - commissionPercent,
      platformFeeTotal,
      netEarnings,
      totalWithdrawn: toCents(totalWithdrawn),
      pendingWithdrawn: toCents(pendingWithdrawn),
      availableBalance,
      completedConsultationsCount: earningAppointments.length,
      refundedConsultationsCount: completedAppointments.length - earningAppointments.length,
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

// Payout requests for the same doctor run one at a time, so two concurrent
// requests can't both pass the available-balance check. (In-process only:
// sufficient for a single API instance.)
const payoutLocks = new Map();

export const requestDoctorPayoutService = (doctorId, payload) => {
  const key = String(doctorId);
  const previous = payoutLocks.get(key) || Promise.resolve();
  const current = previous
    .catch(() => {})
    .then(() => createDoctorPayoutRequest(doctorId, payload || {}));
  payoutLocks.set(key, current);
  current
    .finally(() => {
      if (payoutLocks.get(key) === current) payoutLocks.delete(key);
    })
    .catch(() => {});
  return current;
};

const createDoctorPayoutRequest = async (doctorId, { amount, notes }) => {
  const numAmount = Number(amount);
  if (!numAmount || numAmount <= 0) {
    throw new Error("Please specify a valid withdrawal amount.");
  }

  const currencySign = await getCurrencySign();
  if (numAmount < MIN_WITHDRAWAL) {
    throw new Error(`Minimum withdrawal amount is ${currencySign}${MIN_WITHDRAWAL}.`);
  }

  const doctor = await Doctor.findById(doctorId);
  if (!doctor) {
    throw new Error("Doctor not found.");
  }

  const settings = doctor.payoutSettings || {};
  // The payout goes to the doctor's chosen method, so that method's details
  // must be complete (otherwise an admin could be asked to pay "nowhere").
  const payoutMethod = settings.preferredMethod || "BANK_TRANSFER";
  const missing = missingPayoutDetails(payoutMethod, settings);
  if (missing) {
    throw new Error(`Please add your ${missing} in Payout Settings before requesting a withdrawal.`);
  }

  // Check available balance
  const earnings = await getDoctorEarningsService(doctorId);
  if (numAmount > earnings.summary.availableBalance) {
    throw new Error(
      `Insufficient available balance. You can withdraw up to ${currencySign}${earnings.summary.availableBalance}.`
    );
  }

  const payout = await Payout.create({
    doctor: doctorId,
    amount: numAmount,
    platformFee: 0,
    netAmount: numAmount,
    status: "PENDING",
    payoutMethod,
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
    message: `Your withdrawal request for ${currencySign}${numAmount} has been received and is being processed by our finance team.`,
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

export const updateDoctorPayoutSettingsService = async (doctorId, data = {}) => {
  const doctor = await Doctor.findById(doctorId);
  if (!doctor) {
    throw new Error("Doctor not found.");
  }

  // Changing where money is sent is the classic account-takeover move:
  // require the current password and alert the doctor afterwards.
  if (typeof data.currentPassword !== "string" || !data.currentPassword) {
    throw new Error("Enter your current password to change payout details.");
  }
  if (!(await doctor.comparePassword(data.currentPassword))) {
    throw new Error("Current password is incorrect.");
  }

  const clean = (value, fallback) => (value === undefined || value === null ? fallback : String(value).trim().slice(0, 120));
  const current = doctor.payoutSettings || {};
  const next = {
    accountHolderName: clean(data.accountHolderName, current.accountHolderName || ""),
    bankName: clean(data.bankName, current.bankName || ""),
    accountNumber: clean(data.accountNumber, current.accountNumber || ""),
    routingOrIfsc: clean(data.routingOrIfsc, current.routingOrIfsc || ""),
    upiId: clean(data.upiId, current.upiId || ""),
    paypalEmail: clean(data.paypalEmail, current.paypalEmail || ""),
    preferredMethod: data.preferredMethod ?? current.preferredMethod ?? "BANK_TRANSFER",
  };

  if (!["BANK_TRANSFER", "UPI", "PAYPAL"].includes(next.preferredMethod)) {
    throw new Error("Choose bank transfer, UPI or PayPal as the payout method.");
  }
  if (next.paypalEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(next.paypalEmail)) {
    throw new Error("Enter a valid PayPal email address.");
  }
  if (next.upiId && !/^[\w.\-]{2,}@[a-zA-Z]{2,}$/.test(next.upiId)) {
    throw new Error("Enter a valid UPI ID (for example name@bank).");
  }
  if (next.accountNumber && !/^[0-9A-Za-z \-]{4,34}$/.test(next.accountNumber)) {
    throw new Error("Enter a valid bank account number.");
  }
  const missing = missingPayoutDetails(next.preferredMethod, next);
  if (missing) {
    throw new Error(`Add your ${missing} for the selected payout method.`);
  }

  doctor.payoutSettings = next;
  await doctor.save();

  await createNotificationService({
    recipient: doctor._id,
    recipientModel: "Doctor",
    title: "🔐 Payout details changed",
    message: "Your payout account details were just changed. If this wasn't you, contact support immediately and change your password.",
    type: "SYSTEM",
    link: "/doctor/earnings",
  }).catch(() => {});
  sendPayoutDetailsChangedEmail(doctor).catch((err) =>
    console.error("[Payouts] Could not send payout-details alert email:", err?.message || err)
  );

  return doctor.payoutSettings;
};

export const getAllPayoutsAdminService = async () => {
  const payouts = await Payout.find()
    .populate("doctor", "firstName lastName email phone specialization hospital profileImage")
    .sort({ createdAt: -1 });

  return payouts;
};

// Allowed payout status changes. PAID and REJECTED are final: reopening a
// paid payout would release its amount back into the doctor's balance.
const PAYOUT_TRANSITIONS = {
  PENDING: ["APPROVED", "PROCESSING", "PAID", "REJECTED"],
  APPROVED: ["PROCESSING", "PAID", "REJECTED"],
  PROCESSING: ["PAID", "REJECTED"],
  PAID: [],
  REJECTED: [],
};

export const updatePayoutStatusAdminService = async (
  payoutId,
  { status, referenceNumber, rejectionReason },
  admin = null
) => {
  const validStatuses = Payout.schema.path("status").enumValues;
  if (!validStatuses.includes(status)) {
    throw new Error(`Invalid status. Must be one of: ${validStatuses.join(", ")}`);
  }

  const payout = await Payout.findById(payoutId).populate("doctor", "firstName lastName email");
  if (!payout) {
    throw new Error("Payout record not found.");
  }

  if (!(PAYOUT_TRANSITIONS[payout.status] || []).includes(status)) {
    throw new Error(
      `A ${payout.status.toLowerCase()} payout can't be changed to ${status.toLowerCase()}.`
    );
  }

  const reference = typeof referenceNumber === "string" ? referenceNumber.trim() : "";
  const reason = typeof rejectionReason === "string" ? rejectionReason.trim() : "";
  if (status === "PAID" && !reference) {
    throw new Error("Enter the bank/UPI/PayPal transfer reference to mark this payout as paid.");
  }
  if (status === "REJECTED" && !reason) {
    throw new Error("Enter a reason so the doctor knows why the payout was rejected.");
  }

  payout.status = status;
  if (reference) payout.referenceNumber = reference.slice(0, 120);
  if (reason) payout.rejectionReason = reason.slice(0, 500);
  payout.processedBy = admin?.email || "";
  if (status === "PAID" || status === "REJECTED") {
    payout.processedAt = new Date();
  }
  await payout.save();

  const currencySign = await getCurrencySign();
  // Notify doctor
  if (status === "PAID") {
    await createNotificationService({
      recipient: payout.doctor._id,
      recipientModel: "Doctor",
      title: "✅ Payout Disbursed",
      message: `Your payout of ${currencySign}${payout.amount} has been successfully transferred to your account. Reference: ${referenceNumber || "Direct Deposit"}`,
      type: "APPOINTMENT",
      link: "/doctor/earnings",
    });
  } else if (status === "REJECTED") {
    await createNotificationService({
      recipient: payout.doctor._id,
      recipientModel: "Doctor",
      title: "❌ Payout Request Rejected",
      message: `Your payout request of ${currencySign}${payout.amount} could not be processed. Reason: ${rejectionReason || "Invalid account details."}`,
      type: "APPOINTMENT",
      link: "/doctor/earnings",
    });
  }

  return payout;
};
