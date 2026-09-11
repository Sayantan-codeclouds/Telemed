import { Medicine, Order } from "./pharmacy.model.js";
import Patient from "../patients/patient.model.js";
import Prescription from "../prescriptions/prescription.model.js";
import AppError from "../shared/errors/AppError.js";
import { processVrioOrderService, detectCardType } from "./vrio.service.js";
import { createNotificationService } from "../notifications/notification.service.js";
import { sendOrderInvoiceEmail } from "../mail/mail.service.js";


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
      { name: { $regex: query.search, $options: "i" } },
      { genericName: { $regex: query.search, $options: "i" } },
    ];
  }

  return Medicine.find(filter).sort({ name: 1 });
};

export const getMedicineByIdService = async (id) => {
  const medicine = await Medicine.findById(id);
  if (!medicine) throw AppError.notFound("Medicine not found.");
  return medicine;
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

  for (const item of data.items) {
    const med = await Medicine.findById(item.medicineId);
    if (!med) throw AppError.notFound(`Medicine ${item.name || item.medicineId} not found.`);
    const itemTotal = med.price * (item.quantity || 1);
    total += itemTotal;

    const campaignId = med.campaignId !== undefined ? Number(med.campaignId) : 1;
    const prepaidCampaignId = med.prepaidCampaignId ? Number(med.prepaidCampaignId) : null;
    const itemId = med.itemId !== undefined ? Number(med.itemId) : (med.vrioProductId || 1);
    const offerId = med.offerId !== undefined ? Number(med.offerId) : (med.vrioOfferId || 1);

    verifiedItems.push({
      medicine: med._id,
      name: med.name,
      quantity: item.quantity || 1,
      price: med.price,
      campaignId,
      prepaidCampaignId,
      itemId,
      offerId,
      vrioOfferId: offerId,
      vrioProductId: itemId,
    });
  }

  // Calculate server-side discount if coupon applied
  let discountAmount = Number(data.discountAmount || 0);
  let discountCode = data.discountCode || data.discount_code || data.discountLabel || data.discount_label || data.couponCode || null;
  const finalAmount = Math.max(0, Math.round((total - discountAmount) * 100) / 100);

  // Detect card type from payment details
  const cardNum = data.paymentDetails?.cardNumber
    ? String(data.paymentDetails.cardNumber).replace(/\s+/g, "")
    : "4111222233334444";

  const detectedCard = detectCardType(cardNum);
  const cardLast4 = cardNum.slice(-4) || "4444";
  const cardTypeId = data.paymentDetails?.cardTypeId || detectedCard.cardTypeId;
  const cardType = data.paymentDetails?.cardType || detectedCard.cardType;

  // Process order with Vrio CRM
  const vrioResult = await processVrioOrderService({
    patient,
    items: verifiedItems,
    couponCode: data.couponCode,
    discountCode: discountCode,
    discount_code: discountCode,
    discountLabel: discountCode,
    discount_label: discountCode,
    discountAmount,
    gift_cards: data.gift_cards || data.paymentDetails?.gift_cards || (data.couponType === "GIFT_CARD" && data.couponCode ? [{ gift_card_code: data.couponCode, gift_card_apply: discountAmount }] : undefined),
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
      gift_cards: data.gift_cards || data.paymentDetails?.gift_cards,
      session_id: data.session_id,
      ip_address: data.ip_address,
      user_agent: data.user_agent,
      order_notes: data.order_notes,
    },
  });

  const order = await Order.create({
    patient: patientId,
    prescription: data.prescriptionId || null,
    items: verifiedItems,
    totalAmount: finalAmount,
    couponCode: data.couponCode || null,
    discountAmount: discountAmount || 0,
    discountCode: discountCode || null,
    discountLabel: discountCode || null,
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
export const syncPaidAppointmentsToOrders = async () => {
  try {
    const Appointment = (await import("../appointments/appointment.model.js")).default;
    const { getCrmSettingsService } = await import("./vrio.service.js");
    const settings = await getCrmSettingsService();

    const paidAppointments = await Appointment.find({
      vrioOrderId: { $exists: true, $ne: null },
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
  await syncPaidAppointmentsToOrders();
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

export const updateOrderStatusAdminService = async (orderId, status) => {
  const order = await Order.findById(orderId);
  if (!order) throw AppError.notFound("Order not found.");

  const validStatuses = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];
  if (!validStatuses.includes(status)) {
    throw AppError.badRequest(`Invalid order status. Must be one of: ${validStatuses.join(", ")}`);
  }

  order.status = status;
  await order.save();

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

