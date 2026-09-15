import crypto from "crypto";

import Appointment from "./appointment.model.js";
import Doctor from "../doctors/doctor.model.js";
import Patient from "../patients/patient.model.js";
import { createNotificationService } from "../notifications/notification.service.js";
import { formatAppointmentProfileImages } from "../shared/utils/fileUrl.js";
import { getCrmSettingsService, processVrioOrderService } from "../pharmacy/vrio.service.js";
import { incrementCouponUsageService } from "../coupons/coupon.service.js";
import { Order } from "../pharmacy/pharmacy.model.js";
import { sendOrderInvoiceEmail } from "../mail/mail.service.js";

/**
 * Robust Day-of-Week extraction resilient against UTC vs local timezone offsets
 */
export function getDayOfWeek(dateInput) {
  if (!dateInput) return "";
  if (typeof dateInput === "string") {
    const match = dateInput.trim().match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      const year = Number(match[1]);
      const month = Number(match[2]);
      const day = Number(match[3]);
      return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString("en-US", {
        weekday: "long",
        timeZone: "UTC",
      });
    }
  }
  return new Date(dateInput).toLocaleDateString("en-US", {
    weekday: "long",
    timeZone: "UTC",
  });
}

export const createAppointment = async (
  patientId,
  data
) => {

  // Check patient

  const patient = await Patient.findById(patientId);

  if (!patient) {
    throw new Error("Patient not found.");
  }

  // Check doctor

  const doctor = await Doctor.findById(data.doctorId);

  if (!doctor) {
    throw new Error("Doctor not found.");
  }

  // Doctor should be active

  if (
    doctor.status !== "ACTIVE" ||
    !doctor.isEmailVerified
  ) {
    throw new Error(
      "Doctor is not available."
    );
  }

  // ==========================
  // Check Doctor Availability
  // ==========================

  const appointmentDay = getDayOfWeek(data.appointmentDate);

const availability = doctor.availability.find(
  (item) => item.day === appointmentDay
);

if (!availability) {
  throw new Error(
    "Doctor is not available on this day."
  );
}

if (!availability.enabled) {
  throw new Error(
    "Doctor is unavailable on this day."
  );
}

const slotExists = availability.slots.some(
  (slot) =>
    slot.start === data.slot.start &&
    slot.end === data.slot.end
);

if (!slotExists) {
  throw new Error(
    "Selected time slot is not available."
  );
}

// ==========================
// Prevent Double Booking
// ==========================

const existingAppointment =
  await Appointment.findOne({

    doctor: doctor._id,

    appointmentDate: new Date(
      data.appointmentDate
    ),

    "slot.start": data.slot.start,

    "slot.end": data.slot.end,

    status: {
      $in: [
        "PENDING",
        "CONFIRMED",
        "IN_PROGRESS",
      ],
    },

  });

if (existingAppointment) {

  throw new Error(
    "This time slot has already been booked."
  );

}
  // Generate unique room
  const roomId = crypto.randomUUID();

  // ==========================
  // Process Payment via Vrio CRM Gateway
  // ==========================
  const settings = await getCrmSettingsService();
  const fee = Number(doctor.consultationFee ?? 500);
  const discount = Number(data.discountAmount || 0);
  const finalFee = Math.max(0, Math.round((fee - discount) * 100) / 100);

  let paymentStatus = "PENDING";
  let vrioOrderId = null;
  let vrioResponse = null;
  let paymentDetails = {
    cardLast4: data.paymentDetails?.cardNumber
      ? String(data.paymentDetails.cardNumber).replace(/\s+/g, "").slice(-4)
      : "4444",
    cardType: data.paymentDetails?.cardType || "visa",
    paidAt: new Date(),
    transactionId: "",
  };

  const consultationItemId = Number(settings.consultationItemId || 3366);
  const consultationOfferId = Number(settings.consultationOfferId || 29);

  if (settings.isEnabled) {
    const vrioItem = {
      name: `Telemedicine Consultation - Dr. ${doctor.firstName} ${doctor.lastName}`,
      price: fee,
      quantity: 1,
      itemId: consultationItemId,
      offerId: consultationOfferId,
      vrioProductId: consultationItemId,
      vrioOfferId: consultationOfferId,
      stickyProductId: Number(settings.stickyConsultationProductId || settings.stickyOfferId || 29),
      checkoutChampProductId: Number(settings.checkoutChampConsultationProductId || settings.consultationItemId || 3366),
      isConsultation: true,
    };

    const shippingAddress = data.billingDetails
      ? {
          line1: data.billingDetails.address1 || "Consultation Digital",
          city: data.billingDetails.city || "Digital",
          state: data.billingDetails.state || "CA",
          pincode: data.billingDetails.zipcode || "90210",
          country: data.billingDetails.country || "US",
        }
      : {
          line1: patient.address?.line1 || "Consultation Digital",
          city: patient.address?.city || "Digital",
          state: patient.address?.state || "CA",
          pincode: patient.address?.pincode || "90210",
          country: patient.address?.country || "US",
        };

    const vrioResult = await processVrioOrderService({
      isConsultation: true,
      patient,
      items: [vrioItem],
      shippingAddress,
      billingDetails: data.billingDetails || {
        fname: patient.firstName || "Patient",
        lname: patient.lastName || "User",
        address1: shippingAddress.line1,
        city: shippingAddress.city,
        state: shippingAddress.state,
        zipcode: shippingAddress.pincode,
        country: shippingAddress.country,
      },
      paymentDetails: data.paymentDetails,
      couponCode: data.couponCode,
      discountCode: data.couponCode,
      discount_code: data.couponCode,
      discountLabel: data.couponCode,
      discount_label: data.couponCode,
      discountAmount: discount,
    });

    if (!vrioResult.success) {
      const errReason =
        vrioResult.error ||
        vrioResult.crmResponse?.error ||
        "Payment processing failed via CRM gateway. Please verify your card details.";
      throw new Error(errReason);
    }

    paymentStatus = "PAID";
    vrioOrderId = vrioResult.vrioOrderId;
    vrioResponse = vrioResult.vrioResponse;
    paymentDetails.transactionId = String(vrioResult.vrioOrderId || "");
    paymentDetails.paidAt = new Date();

    if (data.couponCode) {
      try {
        await incrementCouponUsageService(data.couponCode);
      } catch (couponErr) {
        console.warn("Could not increment coupon usage:", couponErr.message);
      }
    }
  } else {
    // Offline / Gateway disabled fallback
    paymentStatus = "PAID";
    vrioOrderId = `VRIO-OFFLINE-${Date.now()}`;
    paymentDetails.transactionId = vrioOrderId;
    paymentDetails.paidAt = new Date();
  }

  // Create appointment
  const appointment = await Appointment.create({
    patient: patient._id,
    doctor: doctor._id,
    appointmentDate: new Date(data.appointmentDate),
    slot: data.slot,
    reason: data.reason,
    consultationFee: finalFee,
    paymentStatus,
    vrioOrderId,
    vrioResponse,
    paymentDetails,
    billingDetails: data.billingDetails || undefined,
    roomId,
    status: "CONFIRMED",
  });

  // Create corresponding Order record so it is visible in Orders & Payment History
  try {
    const consultationOrder = await Order.create({
      patient: patient._id,
      orderType: "CONSULTATION",
      appointment: appointment._id,
      doctor: doctor._id,
      items: [
        {
          name: `Telemedicine Consultation - Dr. ${doctor.firstName} ${doctor.lastName} (${doctor.specialization})`,
          quantity: 1,
          price: fee,
          campaignId: Number(settings.campaignId || 1),
          itemId: consultationItemId,
          offerId: consultationOfferId,
          vrioProductId: consultationItemId,
          vrioOfferId: consultationOfferId,
          doctor: doctor._id,
          slot: data.slot,
          appointmentDate: new Date(data.appointmentDate),
        },
      ],
      totalAmount: finalFee,
      couponCode: data.couponCode || null,
      discountAmount: discount || 0,
      discountCode: data.couponCode || null,
      discountLabel: data.couponCode || null,
      shippingAddress: {
        line1: data.billingDetails?.address1 || patient.address?.line1 || "Digital Delivery - Video Consultation",
        city: data.billingDetails?.city || patient.address?.city || "Online",
        state: data.billingDetails?.state || patient.address?.state || "CA",
        pincode: data.billingDetails?.zipcode || patient.address?.pincode || "90210",
        country: data.billingDetails?.country || patient.address?.country || "US",
      },
      billingDetails: {
        fname: data.billingDetails?.fname || patient.firstName || "",
        lname: data.billingDetails?.lname || patient.lastName || "",
        email: patient.email || "",
        phone: patient.phone || "",
        address1: data.billingDetails?.address1 || "",
        city: data.billingDetails?.city || "",
        state: data.billingDetails?.state || "",
        zipcode: data.billingDetails?.zipcode || "",
        country: data.billingDetails?.country || "US",
        cardType: paymentDetails.cardType || "visa",
        cardTypeId: data.paymentDetails?.cardTypeId || 1,
        cardLast4: paymentDetails.cardLast4,
      },
      status: "DELIVERED",
      paymentStatus: "PAID",
      stickyCrmOrderId: vrioOrderId,
      vrioOrderId: vrioOrderId,
      vrioResponse: vrioResponse,
    });

    appointment.order = consultationOrder._id;
    await appointment.save();

    // Dispatch order invoice email asynchronously
    consultationOrder.populate("patient", "firstName lastName email phone").then((popOrd) => {
      sendOrderInvoiceEmail(popOrd).catch((err) => {
        console.error("[Consultation Order] Failed to send order invoice email:", err?.message || err);
      });
    });
  } catch (orderErr) {
    console.error("[Consultation Order] Error creating Order record:", orderErr.message);
  }

  const populated = await appointment.populate([
    { path: "doctor", select: "firstName lastName specialization profileImage consultationFee" },
    { path: "patient", select: "firstName lastName profileImage" },
  ]);

  const docName = `Dr. ${doctor.firstName} ${doctor.lastName}`;
  const patName = `${patient.firstName} ${patient.lastName}`;
  const apptDate = new Date(data.appointmentDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  // Notify patient — booking confirmed
  await createNotificationService({
    recipient: patient._id,
    recipientModel: "Patient",
    title: "📅 Appointment Booked",
    message: `Your appointment with ${docName} is confirmed for ${apptDate} at ${data.slot?.start}. Room will open 5 minutes before the slot.`,
    type: "APPOINTMENT",
    link: "/patient/appointments",
  });

  // Notify doctor — new appointment
  await createNotificationService({
    recipient: doctor._id,
    recipientModel: "Doctor",
    title: "🩺 New Appointment Request",
    message: `${patName} has booked an appointment for ${apptDate} at ${data.slot?.start}. Please review and prepare for the consultation.`,
    type: "APPOINTMENT",
    link: "/doctor/appointments",
  });

  return populated;
};

export const getAppointmentById =
  async (appointmentId) => {

    const appointment =
      await Appointment.findById(
        appointmentId
      )
        .populate(
          "doctor",
          "-password"
        )
        .populate(
          "patient",
          "-password"
        );

    if (!appointment) {
      throw new Error(
        "Appointment not found."
      );
    }

    return formatAppointmentProfileImages(appointment);

  };

export const getPatientAppointments = async (patientId) => {

  const appointments = await Appointment.find({
    patient: patientId,
  })
    .populate(
      "doctor",
      `
      firstName
      lastName
      profileImage
      specialization
      hospital
      consultationFee
      `
    )
    .sort({
      appointmentDate: -1,
    });

  return appointments.map(formatAppointmentProfileImages);

};

export const getDoctorAppointments =
  async (doctorId) => {

    const appointments = await Appointment.find({

      doctor: doctorId,

    })
      .populate(
        "patient",
        "firstName lastName profileImage"
      )
      .sort({
        appointmentDate: -1,
      });

    return appointments.map(formatAppointmentProfileImages);

  };

export const updateAppointmentStatus =
  async (
    appointmentId,
    status
  ) => {

    const appointment =
      await Appointment.findById(
        appointmentId
      );

    if (!appointment) {

      throw new Error(
        "Appointment not found."
      );

    }

  appointment.status = status;
  await appointment.save();

  // Populate to get patient and doctor details for notifications
  const populated = await appointment.populate([
    { path: "doctor", select: "firstName lastName" },
    { path: "patient", select: "firstName lastName" },
  ]);

  const docName = `Dr. ${populated.doctor?.firstName} ${populated.doctor?.lastName}`;
  const patName = `${populated.patient?.firstName} ${populated.patient?.lastName}`;
  const apptDate = new Date(populated.appointmentDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  if (status === "CONFIRMED") {
    await createNotificationService({
      recipient: populated.patient._id,
      recipientModel: "Patient",
      title: "✅ Appointment Confirmed",
      message: `${docName} has confirmed your appointment on ${apptDate} at ${populated.slot?.start}. Be ready a few minutes early!`,
      type: "APPOINTMENT",
      link: "/patient/appointments",
    });
  } else if (status === "CANCELLED") {
    // Notify the other party
    await createNotificationService({
      recipient: populated.patient._id,
      recipientModel: "Patient",
      title: "❌ Appointment Cancelled",
      message: `Your appointment with ${docName} on ${apptDate} has been cancelled. You can rebook at any time.`,
      type: "APPOINTMENT",
      link: "/patient/appointments",
    });
    await createNotificationService({
      recipient: populated.doctor._id,
      recipientModel: "Doctor",
      title: "❌ Appointment Cancelled",
      message: `Appointment with ${patName} on ${apptDate} has been cancelled.`,
      type: "APPOINTMENT",
      link: "/doctor/appointments",
    });
  }

  return appointment;
};

export const endConsultationService = async (appointmentId, userId, userType) => {
  const appointment = await Appointment.findById(appointmentId);

  if (!appointment) {
    throw new Error("Appointment not found.");
  }

  // Verify that userId is either the doctor or the patient
  const isDoctor = userType === "DOCTOR" && String(appointment.doctor) === String(userId);
  const isPatient = userType === "PATIENT" && String(appointment.patient) === String(userId);

  if (!isDoctor && !isPatient) {
    throw new Error("Unauthorized to end this consultation.");
  }

  appointment.status = "COMPLETED";
  await appointment.save();

  const populated = await appointment.populate([
    { path: "doctor", select: "firstName lastName" },
    { path: "patient", select: "firstName lastName" },
  ]);

  const docName = `Dr. ${populated.doctor?.firstName} ${populated.doctor?.lastName}`;
  const apptDate = new Date(populated.appointmentDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  // Notify patient — consultation done
  await createNotificationService({
    recipient: populated.patient._id,
    recipientModel: "Patient",
    title: "🎉 Consultation Completed",
    message: `Your video consultation with ${docName} on ${apptDate} is complete. Your prescription and notes are now available in your dashboard.`,
    type: "APPOINTMENT",
    link: "/patient/prescriptions",
  });

  // Notify doctor — session ended
  await createNotificationService({
    recipient: populated.doctor._id,
    recipientModel: "Doctor",
    title: "✅ Consultation Ended",
    message: `The session with ${populated.patient?.firstName} ${populated.patient?.lastName} on ${apptDate} has been marked complete. You can now add a prescription and AI summary.`,
    type: "APPOINTMENT",
    link: "/doctor/appointments",
  });

  return appointment;
};

export const cancelPatientAppointment = async (appointmentId, patientId) => {
  const appointment = await Appointment.findOne({
    _id: appointmentId,
    patient: patientId,
  });

  if (!appointment) {
    throw new Error("Appointment not found or unauthorized.");
  }

  if (appointment.status === "COMPLETED") {
    throw new Error("Completed appointments cannot be cancelled.");
  }

  appointment.status = "CANCELLED";
  await appointment.save();

  return appointment;
};

export const reschedulePatientAppointment = async (
  appointmentId,
  patientId,
  { newDate, newSlot, reason }
) => {
  if (!newDate || !newSlot || !newSlot.start || !newSlot.end) {
    throw new Error("Please provide a new date and time slot.");
  }

  const appointment = await Appointment.findOne({
    _id: appointmentId,
    patient: patientId,
  });

  if (!appointment) {
    throw new Error("Appointment not found or unauthorized.");
  }

  if (appointment.status === "COMPLETED") {
    throw new Error("Completed appointments cannot be rescheduled.");
  }

  if (appointment.status === "CANCELLED") {
    throw new Error("Cancelled appointments cannot be rescheduled.");
  }

  const doctor = await Doctor.findById(appointment.doctor);
  if (!doctor || doctor.status !== "ACTIVE") {
    throw new Error("Doctor is not available.");
  }

  // Check Doctor Availability on new date
  const appointmentDay = getDayOfWeek(newDate);

  const availability = doctor.availability.find(
    (item) => item.day === appointmentDay
  );

  if (!availability || !availability.enabled) {
    throw new Error("Doctor is not available on this day.");
  }

  const slotExists = availability.slots.some(
    (slot) => slot.start === newSlot.start && slot.end === newSlot.end
  );

  if (!slotExists) {
    throw new Error("Selected time slot is not available.");
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
    throw new Error("This time slot has already been booked.");
  }

  // Record history
  appointment.rescheduleHistory.push({
    previousDate: appointment.appointmentDate,
    previousSlot: {
      start: appointment.slot?.start,
      end: appointment.slot?.end,
    },
    reason: reason || "",
    rescheduledAt: new Date(),
  });

  appointment.appointmentDate = new Date(newDate);
  appointment.slot = newSlot;
  appointment.isRescheduled = true;
  appointment.status = "PENDING"; // Requires doctor to re-confirm
  await appointment.save();

  const populated = await appointment.populate([
    {
      path: "doctor",
      select:
        "firstName lastName profileImage specialization hospital consultationFee",
    },
    { path: "patient", select: "firstName lastName profileImage" },
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
    title: "📅 Appointment Rescheduled",
    message: `${patName} has rescheduled their appointment to ${formattedNewDate} at ${newSlot.start}. Please review and confirm.`,
    type: "APPOINTMENT",
    link: "/doctor/appointments",
  });

  // Notify Patient
  await createNotificationService({
    recipient: populated.patient._id,
    recipientModel: "Patient",
    title: "📅 Appointment Rescheduled",
    message: `Your appointment with ${docName} has been rescheduled to ${formattedNewDate} at ${newSlot.start}.`,
    type: "APPOINTMENT",
    link: "/patient/appointments",
  });

  return formatAppointmentProfileImages(populated);
};

export const updateDoctorNotes =
  async (
    appointmentId,
    doctorNotes
  ) => {

    const appointment =
      await Appointment.findById(
        appointmentId
      );

    if (!appointment) {

      throw new Error(
        "Appointment not found."
      );

    }

    appointment.doctorNotes =
      doctorNotes;

    await appointment.save();

    return appointment;

  };

export const updatePrescription =
  async (
    appointmentId,
    prescription
  ) => {

    const appointment =
      await Appointment.findById(
        appointmentId
      );

    if (!appointment) {

      throw new Error(
        "Appointment not found."
      );

    }

    appointment.prescription =
      prescription;

    await appointment.save();

    return appointment;

  };

export const updateAISummary =
  async (
    appointmentId,
    aiSummary
  ) => {

    const appointment =
      await Appointment.findById(
        appointmentId
      );

    if (!appointment) {

      throw new Error(
        "Appointment not found."
      );

    }

    appointment.aiSummary =
      aiSummary;

    await appointment.save();

    return appointment;

  };