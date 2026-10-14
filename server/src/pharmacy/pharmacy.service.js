import { Medicine, Order } from "./pharmacy.model.js";
import Patient from "../patients/patient.model.js";
import Prescription from "../prescriptions/prescription.model.js";
import AppError from "../shared/errors/AppError.js";
import { processVrioOrderService, detectCardType } from "./vrio.service.js";
import { createNotificationService } from "../notifications/notification.service.js";
import { sendOrderInvoiceEmail } from "../mail/mail.service.js";
import { validateAndApplyCouponService } from "../coupons/coupon.service.js";
import { validateAndApplyGiftCardService } from "../giftcards/giftcard.service.js";
import GiftCard from "../giftcards/giftcard.model.js";
import { refundOrderViaCrmService } from "./crmRefund.service.js";
import escapeRegex from "../shared/utils/escapeRegex.js";


const DEFAULT_MEDICINES = [
  {
    name: "telemed Semaglutide",
    genericName: "Semaglutide",
    category: "General",
    dosageForm: "Injection",
    strength: "90-Day Supply",
    price: 370.0,
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
    vrioPrice: 370.0,
    isVrioEnabled: true,
  },
  {
    name: "telemed sermorelin",
    genericName: "Sermorelin Acetate",
    category: "General",
    dosageForm: "Injection",
    strength: "Injectable Solution",
    price: 238.5,
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
    vrioPrice: 238.5,
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
  {
    name: "Paracetamol 650",
    genericName: "Acetaminophen",
    category: "Pain Relief",
    dosageForm: "Tablet",
    strength: "650mg",
    price: 35,
    requiresPrescription: false,
    inStock: true,
    description: "Fast relief from fever, headache, body ache, and mild arthritis pain.",
    campaignId: 1,
    prepaidCampaignId: 2,
    itemId: 101,
    offerId: 1,
    vrioOfferId: 1,
    vrioProductId: 101,
    vrioPrice: 35,
    isVrioEnabled: true,
  },
  {
    name: "Amoxicillin Clavulanate",
    genericName: "Amoxicillin + Potassium Clavulanate",
    category: "Antibiotics",
    dosageForm: "Tablet",
    strength: "625mg",
    price: 180,
    requiresPrescription: true,
    inStock: true,
    description: "Broad-spectrum antibacterial for respiratory, ENT, and skin infections.",
    campaignId: 1,
    prepaidCampaignId: 2,
    itemId: 102,
    offerId: 2,
    vrioOfferId: 2,
    vrioProductId: 102,
    vrioPrice: 180,
    isVrioEnabled: true,
  },
  {
    name: "Azithromycin 500",
    genericName: "Azithromycin",
    category: "Antibiotics",
    dosageForm: "Tablet",
    strength: "500mg",
    price: 120,
    requiresPrescription: true,
    inStock: true,
    description: "Effective for throat, tonsil, sinus, and bronchial infections.",
    campaignId: 1,
    prepaidCampaignId: 2,
    itemId: 103,
    offerId: 3,
    vrioOfferId: 3,
    vrioProductId: 103,
    vrioPrice: 120,
    isVrioEnabled: true,
  },
  {
    name: "Pantoprazole DSR",
    genericName: "Pantoprazole + Domperidone",
    category: "Gastrointestinal",
    dosageForm: "Capsule",
    strength: "40mg/30mg",
    price: 145,
    requiresPrescription: false,
    inStock: true,
    description: "Sustained relief from acid reflux, GERD, heartburn, and nausea.",
    campaignId: 1,
    prepaidCampaignId: 2,
    itemId: 104,
    offerId: 4,
    vrioOfferId: 4,
    vrioProductId: 104,
    vrioPrice: 145,
    isVrioEnabled: true,
  },
  {
    name: "Cetirizine 10",
    genericName: "Cetirizine Hydrochloride",
    category: "Respiratory",
    dosageForm: "Tablet",
    strength: "10mg",
    price: 25,
    requiresPrescription: false,
    inStock: true,
    description: "Non-drowsy antihistamine for allergies, runny nose, sneezing, and hives.",
    campaignId: 1,
    prepaidCampaignId: 2,
    itemId: 105,
    offerId: 5,
    vrioOfferId: 5,
    vrioProductId: 105,
    vrioPrice: 25,
    isVrioEnabled: true,
  },
  {
    name: "Vitamin D3 60K",
    genericName: "Cholecalciferol",
    category: "Vitamins & Supplements",
    dosageForm: "Capsule",
    strength: "60,000 IU",
    price: 110,
    requiresPrescription: false,
    inStock: true,
    description: "Weekly high-potency supplement for bone density, immunity, and calcium absorption.",
    campaignId: 1,
    prepaidCampaignId: 2,
    itemId: 106,
    offerId: 6,
    vrioOfferId: 6,
    vrioProductId: 106,
    vrioPrice: 110,
    isVrioEnabled: true,
  },
  {
    name: "Montelukast + Levocetirizine",
    genericName: "Montelukast 10mg + Levocetirizine 5mg",
    category: "Respiratory",
    dosageForm: "Tablet",
    strength: "15mg",
    price: 160,
    requiresPrescription: true,
    inStock: true,
    description: "Combats allergic rhinitis, seasonal asthma symptoms, and chest congestion.",
    campaignId: 1,
    prepaidCampaignId: 2,
    itemId: 107,
    offerId: 7,
    vrioOfferId: 7,
    vrioProductId: 107,
    vrioPrice: 160,
    isVrioEnabled: true,
  },
  {
    name: "Atorvastatin 20",
    genericName: "Atorvastatin Calcium",
    category: "Cardiovascular",
    dosageForm: "Tablet",
    strength: "20mg",
    price: 210,
    requiresPrescription: true,
    inStock: true,
    description: "Lowers LDL cholesterol and triglycerides to protect cardiovascular health.",
    campaignId: 1,
    prepaidCampaignId: 2,
    itemId: 108,
    offerId: 8,
    vrioOfferId: 8,
    vrioProductId: 108,
    vrioPrice: 210,
    isVrioEnabled: true,
  },
];

export const getMedicinesService = async (query = {}) => {
  // Auto-seed default catalogue if empty
  const count = await Medicine.countDocuments();
  if (count === 0) {
    await Medicine.insertMany(DEFAULT_MEDICINES);
  }

  const filter = {};
  if (query.category && query.category !== "All") {
    filter.category = query.category;
  }
  if (query.search) {
    filter.$or = [
      { name: { $regex: escapeRegex(query.search), $options: "i" } },
      { genericName: { $regex: escapeRegex(query.search), $options: "i" } },
    ];
  }

  return Medicine.find(filter).sort({ name: 1 });
};

export const getMedicineByIdService = async (id) => {
  const medicine = await Medicine.findById(id);
  if (!medicine) throw AppError.notFound("Medicine not found.");
  return medicine;
};

const normalizeMedicineName = (value) => String(value || "").trim().toLowerCase();

/**
 * True when one of the patient's still-valid prescriptions names this
 * medicine (by brand or generic name; prescriptions are free text, so a
 * containment match is used, e.g. "Semaglutide 0.5mg" matches "Semaglutide").
 */
const isMedicinePrescribed = (medicine, prescriptions) => {
  const names = [medicine.name, medicine.genericName].map(normalizeMedicineName).filter(Boolean);
  return prescriptions.some((prescription) =>
    (prescription.medicines || []).some((item) => {
      const prescribed = normalizeMedicineName(item.name);
      return prescribed && names.some((name) => prescribed.includes(name) || name.includes(prescribed));
    })
  );
};

/**
 * Atomically takes `quantity` units of each item from stock. Returns a
 * release() function that puts them back (used when payment fails).
 * Throws if any item no longer has enough stock.
 */
const reserveStock = async (items) => {
  const reserved = [];
  const release = async () => {
    for (const { medicine, quantity } of reserved) {
      await Medicine.updateOne({ _id: medicine }, { $inc: { stockQuantity: quantity }, $set: { inStock: true } }).catch(
        (err) => console.error("[Pharmacy] Failed to release reserved stock:", err?.message || err)
      );
    }
  };

  for (const item of items) {
    const updated = await Medicine.findOneAndUpdate(
      { _id: item.medicine, inStock: true, stockQuantity: { $gte: item.quantity } },
      { $inc: { stockQuantity: -item.quantity } },
      { returnDocument: "after" }
    );
    if (!updated) {
      await release();
      throw AppError.badRequest(`${item.name} does not have enough stock for this order.`);
    }
    reserved.push({ medicine: item.medicine, quantity: item.quantity });
    if (updated.stockQuantity <= 0) {
      await Medicine.updateOne({ _id: item.medicine }, { $set: { inStock: false } });
    }
  }

  return release;
};

/**
 * Atomically takes `amount` from a gift card's local balance. Returns a
 * release() that refunds it (used when payment fails). Vrio remains the
 * source of truth; its balance overwrites this one on the next sync.
 */
const reserveGiftCardBalance = async (code, amount) => {
  const updated = await GiftCard.findOneAndUpdate(
    { giftCardCode: code, balanceAmount: { $gte: amount } },
    { $inc: { balanceAmount: -amount } },
    { returnDocument: "after" }
  );
  if (!updated) {
    throw AppError.badRequest(`Gift Card "${code}" no longer has enough balance. Please re-apply it.`);
  }
  return async () => {
    await GiftCard.updateOne({ _id: updated._id }, { $inc: { balanceAmount: amount } }).catch((err) =>
      console.error("[Pharmacy] Failed to release reserved gift card balance:", err?.message || err)
    );
  };
};

export const createOrderService = async (patientId, data) => {
  if (!data.items || data.items.length === 0) {
    throw AppError.badRequest("Order must contain at least one item.");
  }

  const patient = await Patient.findById(patientId);
  if (!patient) throw AppError.notFound("Patient not found.");

  // Calculate total server-side and resolve campaign/item/offer mapping
  let total = 0;
  const verifiedItems = [];
  const prescriptionOnlyMedicines = [];

  for (const item of data.items) {
    const med = await Medicine.findById(item.medicineId);
    if (!med) throw AppError.notFound(`Medicine ${item.name || item.medicineId} not found.`);
    const quantity = item.quantity === undefined || item.quantity === null ? 1 : Number(item.quantity);
    if (!Number.isInteger(quantity) || quantity < 1) {
      throw AppError.badRequest(`Invalid quantity for ${med.name}.`);
    }
    if (!med.inStock) {
      throw AppError.badRequest(`${med.name} is currently out of stock.`);
    }
    if (typeof med.stockQuantity === "number" && quantity > med.stockQuantity) {
      throw AppError.badRequest(`Only ${med.stockQuantity} unit(s) of ${med.name} are available.`);
    }
    if (med.requiresPrescription) {
      prescriptionOnlyMedicines.push(med);
    }
    const itemTotal = med.price * quantity;
    total += itemTotal;

    const campaignId = med.campaignId !== undefined ? Number(med.campaignId) : 1;
    const prepaidCampaignId = med.prepaidCampaignId ? Number(med.prepaidCampaignId) : null;
    const itemId = med.itemId !== undefined ? Number(med.itemId) : (med.vrioProductId || 1);
    const offerId = med.offerId !== undefined ? Number(med.offerId) : (med.vrioOfferId || 1);

    verifiedItems.push({
      medicine: med._id,
      name: med.name,
      quantity,
      price: med.price,
      campaignId,
      prepaidCampaignId,
      itemId,
      offerId,
      vrioOfferId: offerId,
      vrioProductId: itemId,
    });
  }

  // Prescription-only medicines need a current prescription for this patient.
  if (prescriptionOnlyMedicines.length > 0) {
    const now = new Date();
    const validPrescriptions = await Prescription.find({
      patient: patientId,
      $or: [{ validUntil: null }, { validUntil: { $gte: now } }],
    }).select("medicines.name");

    const missing = prescriptionOnlyMedicines.filter((med) => !isMedicinePrescribed(med, validPrescriptions));
    if (missing.length > 0) {
      throw AppError.badRequest(
        `${missing.map((med) => med.name).join(", ")} require${missing.length === 1 ? "s" : ""} a valid prescription from a TeleClinic doctor.`
      );
    }
  }

  // Discounts are always recomputed here from the codes; amounts sent by the
  // client are ignored so the price cannot be lowered by editing the request.
  let discountAmount = 0;
  let discountCode = null;
  let coupon = null;
  if (data.couponCode) {
    coupon = await validateAndApplyCouponService({ code: String(data.couponCode), orderTotal: total, patientId });
    discountAmount = coupon.discountValue;
    discountCode = coupon.discountCode;
  }

  let giftCards;
  let giftCardReservation = null;
  if (coupon?.type === "GIFT_CARD") {
    // A gift-card-type coupon is also forwarded to the CRM as a gift card.
    giftCards = [{ gift_card_code: coupon.code, gift_card_apply: discountAmount }];
  } else {
    const giftCardCode =
      data.gift_cards?.[0]?.gift_card_code ||
      data.gift_cards?.[0]?.code ||
      data.paymentDetails?.gift_cards?.[0]?.gift_card_code ||
      null;
    if (giftCardCode) {
      const giftCard = await validateAndApplyGiftCardService({
        code: String(giftCardCode),
        orderTotal: Math.max(0, total - discountAmount),
      });
      giftCards = [{ gift_card_code: giftCard.code, gift_card_apply: giftCard.applyAmount }];
      if (giftCard.applyAmount > 0) {
        giftCardReservation = { code: giftCard.code, amount: giftCard.applyAmount };
      }
    }
  }

  const finalAmount = Math.max(0, Math.round((total - discountAmount) * 100) / 100);

  // Detect card type from payment details
  const cardNum = data.paymentDetails?.cardNumber
    ? String(data.paymentDetails.cardNumber).replace(/\s+/g, "")
    : "4111222233334444";

  const detectedCard = detectCardType(cardNum);
  const cardLast4 = cardNum.slice(-4) || "4444";
  const cardTypeId = data.paymentDetails?.cardTypeId || detectedCard.cardTypeId;
  const cardType = data.paymentDetails?.cardType || detectedCard.cardType;

  // Reserve stock (and the gift card amount) before charging so two buyers
  // can't take the last units or spend the same balance twice; both are
  // released again if the payment does not go through.
  const releaseStock = await reserveStock(verifiedItems);
  let releaseGiftCard = async () => {};
  if (giftCardReservation) {
    try {
      releaseGiftCard = await reserveGiftCardBalance(giftCardReservation.code, giftCardReservation.amount);
    } catch (err) {
      await releaseStock();
      throw err;
    }
  }
  const releaseReservations = async () => {
    await releaseStock();
    await releaseGiftCard();
  };

  // Process order with Vrio CRM
  let vrioResult;
  try {
    vrioResult = await processVrioOrderService({
      patient,
      items: verifiedItems,
      couponCode: data.couponCode,
      discountCode: discountCode,
      discount_code: discountCode,
      discountLabel: discountCode,
      discount_label: discountCode,
      discountAmount,
      gift_cards: giftCards,
      session_id: data.session_id || data.sessionId,
      ip_address: data.ip_address || data.ipAddress,
      user_agent: data.user_agent || data.userAgent,
      order_notes: data.order_notes || data.orderNotes,
      shippingAddress: data.shippingAddress,
      billingDetails: data.billingDetails || {
        fname: patient?.firstName,
        lname: patient?.lastName,
        email: patient?.email,
        phone: patient?.phone,
        address1: data.shippingAddress?.line1,
        city: data.shippingAddress?.city,
        state: data.shippingAddress?.state,
        zipcode: data.shippingAddress?.pincode,
        country: data.shippingAddress?.country || "US",
      },
      paymentDetails: {
        ...data.paymentDetails,
        cardNumber: cardNum,
        cardTypeId,
        cardType,
        discountCode,
        discount_code: discountCode,
        gift_cards: giftCards,
        session_id: data.session_id,
        ip_address: data.ip_address,
        user_agent: data.user_agent,
        order_notes: data.order_notes,
      },
    });
  } catch (err) {
    await releaseReservations();
    // A live decline/gateway error is the customer's to fix (card details),
    // not a server fault: answer 400 with the gateway's reason.
    if (err instanceof AppError) throw err;
    throw AppError.badRequest(
      typeof err?.message === "string" && err.message
        ? `Payment failed: ${err.message}`
        : "Payment processing failed via CRM gateway. Please verify your card details."
    );
  }

  // In test mode a declined charge comes back as { success: false } instead of
  // throwing; never record that as a paid order (same rule as consultations).
  if (!vrioResult?.success) {
    await releaseReservations();
    const reason = [vrioResult?.error, vrioResult?.crmResponse?.error].find(
      (value) => typeof value === "string" && value
    );
    throw AppError.badRequest(
      reason || "Payment processing failed via CRM gateway. Please verify your card details."
    );
  }

  const order = await Order.create({
    patient: patientId,
    prescription: data.prescriptionId || null,
    items: verifiedItems,
    totalAmount: finalAmount,
    couponCode: data.couponCode || null,
    discountAmount: discountAmount || 0,
    discountCode: discountCode || null,
    discountLabel: discountCode || null,
    // Plain gift cards only: a GIFT_CARD-type coupon is already in discountAmount.
    giftCardCode: giftCardReservation?.code || null,
    giftCardAmount: giftCardReservation?.amount || 0,
    shippingAddress: {
      line1: data.shippingAddress?.line1 || "123 Main Street",
      city: data.shippingAddress?.city || "New York",
      state: data.shippingAddress?.state || "NY",
      pincode: data.shippingAddress?.pincode || "10001",
      country: data.shippingAddress?.country || "US",
    },
    billingDetails: {
      fname: data.billingDetails?.fname || patient?.firstName || "",
      lname: data.billingDetails?.lname || patient?.lastName || "",
      email: data.billingDetails?.email || patient?.email || "",
      phone: data.billingDetails?.phone || patient?.phone || "",
      address1: data.billingDetails?.address1 || data.shippingAddress?.line1 || "",
      city: data.billingDetails?.city || data.shippingAddress?.city || "",
      state: data.billingDetails?.state || data.shippingAddress?.state || "",
      zipcode: data.billingDetails?.zipcode || data.shippingAddress?.pincode || "",
      country: data.billingDetails?.country || data.shippingAddress?.country || "US",
      cardType,
      cardTypeId,
      cardLast4,
    },
    status: "PROCESSING",
    paymentStatus: "PAID",
    stickyCrmOrderId: vrioResult.vrioOrderId,
    vrioOrderId: vrioResult.vrioOrderId,
    vrioResponse: vrioResult.vrioResponse,
  });

  const populated = await order.populate("patient", "firstName lastName email phone");

  // Notify patient — order placed successfully
  const itemNames = verifiedItems.map((i) => i.name).join(", ");
  await createNotificationService({
    recipient: patientId,
    recipientModel: "Patient",
    title: "💊 Order Placed Successfully",
    message: `Your pharmacy order for ${itemNames} has been placed and is being processed. Vrio Order ID: ${vrioResult.vrioOrderId || "N/A"}.`,
    type: "PHARMACY",
    link: "/patient/orders",
  }).catch(() => {}); // non-blocking

  // Automatically dispatch official order invoice & receipt email to patient
  sendOrderInvoiceEmail(populated).catch((err) => {
    console.error("[Pharmacy Order] Failed to dispatch order invoice email on checkout:", err?.message || err);
  });

  return populated;
};

/**
 * Synchronize any paid consultation appointments to Order records if missing
 */
export const syncPaidAppointmentsToOrders = async (patientId = null) => {
  try {
    const Appointment = (await import("../appointments/appointment.model.js")).default;
    const { getCrmSettingsService } = await import("./vrio.service.js");
    const settings = await getCrmSettingsService();

    // Scoped to one patient when called for "my orders"; unscoped for admin.
    // Only appointments not yet linked to an order need work, so after the
    // first sync this touches (almost) nothing on each page load.
    const paidAppointments = await Appointment.find({
      vrioOrderId: { $exists: true, $ne: null },
      order: null,
      ...(patientId ? { patient: patientId } : {}),
    })
      .populate("doctor", "firstName lastName specialization consultationFee")
      .populate("patient", "firstName lastName email phone address");

    for (const appt of paidAppointments) {
      const existingOrder = await Order.findOne({
        $or: [{ appointment: appt._id }, { vrioOrderId: appt.vrioOrderId }],
      });

      if (!existingOrder && appt.patient) {
        const docName = appt.doctor ? `Dr. ${appt.doctor.firstName} ${appt.doctor.lastName}` : "Specialist";
        const spec = appt.doctor?.specialization ? ` (${appt.doctor.specialization})` : "";
        const cItemId = Number(settings.consultationItemId || 3366);
        const cOfferId = Number(settings.consultationOfferId || 29);

        const newOrder = await Order.create({
          patient: appt.patient._id || appt.patient,
          orderType: "CONSULTATION",
          appointment: appt._id,
          doctor: appt.doctor?._id || appt.doctor,
          items: [
            {
              name: `Telemedicine Consultation - ${docName}${spec}`,
              quantity: 1,
              price: appt.consultationFee || 500,
              campaignId: Number(settings.campaignId || 1),
              itemId: cItemId,
              offerId: cOfferId,
              vrioProductId: cItemId,
              vrioOfferId: cOfferId,
              doctor: appt.doctor?._id || appt.doctor,
              slot: appt.slot,
              appointmentDate: appt.appointmentDate,
            },
          ],
          totalAmount: appt.consultationFee || 500,
          shippingAddress: {
            line1: appt.billingDetails?.address1 || appt.patient.address?.line1 || "Digital Delivery - Video Consultation",
            city: appt.billingDetails?.city || appt.patient.address?.city || "Online",
            state: appt.billingDetails?.state || appt.patient.address?.state || "CA",
            pincode: appt.billingDetails?.zipcode || appt.patient.address?.pincode || "90210",
            country: appt.billingDetails?.country || appt.patient.address?.country || "US",
          },
          billingDetails: {
            fname: appt.billingDetails?.fname || appt.patient.firstName || "",
            lname: appt.billingDetails?.lname || appt.patient.lastName || "",
            email: appt.patient.email || "",
            phone: appt.patient.phone || "",
            address1: appt.billingDetails?.address1 || "",
            city: appt.billingDetails?.city || "",
            state: appt.billingDetails?.state || "",
            zipcode: appt.billingDetails?.zipcode || "",
            country: appt.billingDetails?.country || "US",
            cardType: appt.paymentDetails?.cardType || "visa",
            cardTypeId: 1,
            cardLast4: appt.paymentDetails?.cardLast4 || "4444",
          },
          status: "DELIVERED",
          paymentStatus: "PAID",
          stickyCrmOrderId: appt.vrioOrderId,
          vrioOrderId: appt.vrioOrderId,
          vrioResponse: appt.vrioResponse,
          createdAt: appt.createdAt || new Date(),
        });

        appt.order = newOrder._id;
        await appt.save();
      }
    }
  } catch (err) {
    console.warn("[syncPaidAppointmentsToOrders] error:", err.message);
  }
};

export const getPatientOrdersService = async (patientId) => {
  await syncPaidAppointmentsToOrders(patientId);
  return Order.find({ patient: patientId })
    .populate("prescription", "diagnosis")
    .populate("doctor", "firstName lastName specialization profileImage hospital")
    .populate("appointment", "appointmentDate slot reason roomId status")
    .sort({ createdAt: -1 });
};

export const getAllOrdersAdminService = async () => {
  await syncPaidAppointmentsToOrders();
  return Order.find()
    .populate("patient", "firstName lastName email phone")
    .populate("doctor", "firstName lastName specialization profileImage hospital")
    .populate("appointment", "appointmentDate slot reason roomId status")
    .populate("prescription", "diagnosis medicines doctor")
    .sort({ createdAt: -1 });
};

export const createMedicineService = async (data) => {
  const campaignId = data.campaignId !== undefined ? Number(data.campaignId) : 1;
  const prepaidCampaignId = data.prepaidCampaignId ? Number(data.prepaidCampaignId) : null;
  const itemId = data.itemId !== undefined ? Number(data.itemId) : (data.vrioProductId ? Number(data.vrioProductId) : 1);
  const offerId = data.offerId !== undefined ? Number(data.offerId) : (data.vrioOfferId ? Number(data.vrioOfferId) : 1);

  const medicine = await Medicine.create({
    name: data.name,
    genericName: data.genericName || "",
    category: data.category || "General",
    dosageForm: data.dosageForm || "Tablet",
    strength: data.strength || "",
    price: Number(data.price),
    requiresPrescription: Boolean(data.requiresPrescription),
    inStock: data.inStock !== undefined ? Boolean(data.inStock) : true,
    stockQuantity: data.stockQuantity ? Number(data.stockQuantity) : 100,
    description: data.description || "",
    manufacturer: data.manufacturer || "TeleClinic Pharma",
    campaignId,
    prepaidCampaignId,
    itemId,
    offerId,
    vrioOfferId: offerId,
    vrioProductId: itemId,
    vrioPrice: data.vrioPrice ? Number(data.vrioPrice) : null,
    isVrioEnabled: data.isVrioEnabled !== undefined ? Boolean(data.isVrioEnabled) : true,
  });
  return medicine;
};

export const updateMedicineService = async (id, data) => {
  const medicine = await Medicine.findById(id);
  if (!medicine) throw AppError.notFound("Medicine not found.");

  if (data.name !== undefined) medicine.name = data.name;
  if (data.genericName !== undefined) medicine.genericName = data.genericName;
  if (data.category !== undefined) medicine.category = data.category;
  if (data.dosageForm !== undefined) medicine.dosageForm = data.dosageForm;
  if (data.strength !== undefined) medicine.strength = data.strength;
  if (data.price !== undefined) medicine.price = Number(data.price);
  if (data.requiresPrescription !== undefined) medicine.requiresPrescription = Boolean(data.requiresPrescription);
  if (data.inStock !== undefined) medicine.inStock = Boolean(data.inStock);
  if (data.stockQuantity !== undefined) medicine.stockQuantity = Number(data.stockQuantity);
  if (data.description !== undefined) medicine.description = data.description;
  if (data.manufacturer !== undefined) medicine.manufacturer = data.manufacturer;

  if (data.campaignId !== undefined) medicine.campaignId = Number(data.campaignId);
  if (data.prepaidCampaignId !== undefined) {
    medicine.prepaidCampaignId = data.prepaidCampaignId ? Number(data.prepaidCampaignId) : null;
  }
  if (data.itemId !== undefined) {
    medicine.itemId = Number(data.itemId);
    medicine.vrioProductId = Number(data.itemId);
  }
  if (data.offerId !== undefined) {
    medicine.offerId = Number(data.offerId);
    medicine.vrioOfferId = Number(data.offerId);
  }
  if (data.vrioOfferId !== undefined && data.offerId === undefined) {
    medicine.vrioOfferId = Number(data.vrioOfferId);
    medicine.offerId = Number(data.vrioOfferId);
  }
  if (data.vrioProductId !== undefined && data.itemId === undefined) {
    medicine.vrioProductId = Number(data.vrioProductId);
    medicine.itemId = Number(data.vrioProductId);
  }
  if (data.vrioPrice !== undefined) medicine.vrioPrice = data.vrioPrice ? Number(data.vrioPrice) : null;
  if (data.isVrioEnabled !== undefined) medicine.isVrioEnabled = Boolean(data.isVrioEnabled);

  await medicine.save();
  return medicine;
};

export const toggleMedicineStockService = async (id, inStock, stockQuantity) => {
  const medicine = await Medicine.findById(id);
  if (!medicine) throw AppError.notFound("Medicine not found.");

  if (inStock !== undefined) {
    medicine.inStock = Boolean(inStock);
  } else {
    medicine.inStock = !medicine.inStock;
  }

  if (stockQuantity !== undefined) {
    medicine.stockQuantity = Number(stockQuantity);
  }

  await medicine.save();
  return medicine;
};

export const deleteMedicineService = async (id) => {
  const medicine = await Medicine.findById(id);
  if (!medicine) throw AppError.notFound("Medicine not found.");

  await Medicine.findByIdAndDelete(id);
  return { success: true, message: "Medicine removed from catalog." };
};

/**
 * Issues the refund for a cancelled paid order through the CRM (Vrio), then
 * marks it REFUNDED and notifies the patient. A partial refund (less than
 * the order total could be matched to charges) is recorded but left pending.
 */
export const refundOrderAdminService = async (orderId, admin) => {
  const order = await Order.findById(orderId);
  if (!order) throw AppError.notFound("Order not found.");
  if (order.paymentStatus !== "REFUND_PENDING") {
    throw AppError.badRequest("Only cancelled orders awaiting a refund can be refunded.");
  }

  const result = await refundOrderViaCrmService(order);

  order.refundDetails = {
    provider: result.provider,
    amount: result.amount,
    transactionIds: result.transactionIds,
    refundedAt: new Date(),
    refundedBy: admin?.email || "",
  };
  await order.save();

  const fullyRefunded = result.amount >= Math.round(Number(order.totalAmount || 0) * 100) / 100;
  const updated = fullyRefunded
    ? await updateOrderStatusAdminService(orderId, undefined, "REFUNDED")
    : await order.populate("patient", "firstName lastName email phone");

  return { order: updated, refundedAmount: result.amount, fullyRefunded };
};

const ORDER_STATUS_LABELS = {
  PENDING: "pending",
  PROCESSING: "being processed",
  CONFIRMED: "confirmed",
  SHIPPED: "shipped",
  DELIVERED: "delivered",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
};

/**
 * Admin order update. `status` changes the fulfilment status; `paymentStatus`
 * may only be used to mark a pending refund as done ("REFUNDED").
 * Cancelling a paid order flags it REFUND_PENDING: refunds are issued in the
 * CRM by staff, then recorded here.
 */
export const updateOrderStatusAdminService = async (orderId, status, paymentStatus) => {
  const order = await Order.findById(orderId);
  if (!order) throw AppError.notFound("Order not found.");

  if (paymentStatus !== undefined) {
    if (paymentStatus !== "REFUNDED" || order.paymentStatus !== "REFUND_PENDING") {
      throw AppError.badRequest("Only an order awaiting refund can be marked as refunded.");
    }
    order.paymentStatus = "REFUNDED";
  }

  const previousStatus = order.status;
  if (status !== undefined) {
    const validStatuses = Order.schema.path("status").enumValues;
    if (!validStatuses.includes(status)) {
      throw AppError.badRequest(`Invalid order status. Must be one of: ${validStatuses.join(", ")}`);
    }
    order.status = status;
    if (status === "CANCELLED" && order.paymentStatus === "PAID") {
      order.paymentStatus = "REFUND_PENDING";
    }
  }

  await order.save();

  const ref = String(order._id).slice(-8).toUpperCase();
  if (status !== undefined && status !== previousStatus) {
    await createNotificationService({
      recipient: order.patient,
      recipientModel: "Patient",
      title: status === "CANCELLED" ? "❌ Order Cancelled" : "📦 Order Update",
      message:
        status === "CANCELLED" && order.paymentStatus === "REFUND_PENDING"
          ? `Your order #${ref} has been cancelled. Your refund is being processed.`
          : `Your order #${ref} is now ${ORDER_STATUS_LABELS[status] || status.toLowerCase()}.`,
      type: "PHARMACY",
      link: "/patient/orders",
    }).catch(() => {});
  } else if (paymentStatus === "REFUNDED") {
    await createNotificationService({
      recipient: order.patient,
      recipientModel: "Patient",
      title: "💸 Refund Issued",
      message: `The refund for your order #${ref} has been issued to your original payment method.`,
      type: "PHARMACY",
      link: "/patient/orders",
    }).catch(() => {});
  }

  return order.populate("patient", "firstName lastName email phone");
};

export const resendOrderInvoiceAdminService = async (orderId) => {
  const order = await Order.findById(orderId)
    .populate("patient", "firstName lastName email phone")
    .populate("prescription", "diagnosis medicines doctor");

  if (!order) {
    throw AppError.notFound("Order not found.");
  }

  const recipient = order.patient?.email || order.billingDetails?.email;
  if (!recipient) {
    throw AppError.badRequest("This order does not have a registered patient email address.");
  }

  const result = await sendOrderInvoiceEmail(order);
  if (!result) {
    throw AppError.badRequest("Resend email service is not configured or failed to dispatch invoice.");
  }

  return {
    success: true,
    message: `Order invoice successfully resent to ${recipient}.`,
    data: {
      orderId: order._id,
      recipient,
      sentAt: new Date(),
      messageId: result.messageId,
    },
  };
};

