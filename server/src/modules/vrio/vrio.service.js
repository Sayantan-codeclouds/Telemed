import { getVrioConfig } from "./vrio.config.js";
import VrioOrder from "./vrioOrder.model.js";
import { Medicine } from "../../pharmacy/pharmacy.model.js";
import Prescription from "../../prescriptions/prescription.model.js";
import Patient from "../../patients/patient.model.js";
import AppError from "../../shared/errors/AppError.js";

/**
 * Auto-detect Credit Card Network & Card Type ID
 * - Visa: starts with 4 -> cardTypeId: 1
 * - Mastercard: starts with 51-55 or 2221-2720 -> cardTypeId: 2
 * - Amex: starts with 34, 37 -> cardTypeId: 3
 * - Discover: starts with 6011, 65, 644-649 -> cardTypeId: 4
 */
export const detectCardType = (cardNumber) => {
  if (!cardNumber) return { cardType: "visa", cardTypeId: 1, label: "Visa" };

  const sanitized = String(cardNumber).replace(/\D/g, "");

  if (/^4/.test(sanitized)) {
    return { cardType: "visa", cardTypeId: 1, label: "Visa" };
  }
  if (/^(5[1-5]|222[1-9]|22[3-9]|2[3-6]|27[01]|2720)/.test(sanitized)) {
    return { cardType: "mastercard", cardTypeId: 2, label: "MasterCard" };
  }
  if (/^3[47]/.test(sanitized)) {
    return { cardType: "amex", cardTypeId: 3, label: "American Express" };
  }
  if (/^(6011|65|64[4-9])/.test(sanitized)) {
    return { cardType: "discover", cardTypeId: 4, label: "Discover" };
  }

  return { cardType: "visa", cardTypeId: 1, label: "Visa" };
};

/**
 * Mask card number for safe logging (e.g. ***4444)
 */
export const maskCardNumber = (cardNumber) => {
  if (!cardNumber) return "***";
  const sanitized = String(cardNumber).replace(/\D/g, "");
  return `***${sanitized.slice(-4)}`;
};

/**
 * Safe logging helper that strips sensitive PAN and CVV
 */
const safeLog = (message, payload) => {
  if (!payload) {
    console.log(message);
    return;
  }
  const sanitized = { ...payload };
  if (sanitized.card_number) {
    sanitized.card_number = maskCardNumber(sanitized.card_number);
  }
  if (sanitized.card_cvv) {
    sanitized.card_cvv = "***";
  }
  console.log(message, JSON.stringify(sanitized, null, 2));
};

/**
 * Build the standardized Vrio API payload from inputs
 */
export const buildVrioPayload = async ({
  patient,
  offers,
  billingAddress,
  shippingAddress,
  payment,
  configOverrides = {},
}) => {
  const config = await getVrioConfig(configOverrides);

  // Format offers: [{ offer_id, order_offer_quantity, item_id }]
  const formattedOffers = offers.map((o) => ({
    offer_id: Number(o.offer_id),
    order_offer_quantity: Number(o.order_offer_quantity || o.quantity || 1),
    item_id: Number(o.item_id),
  }));

  const fname = billingAddress?.fname || patient?.firstName || "Customer";
  const lname = billingAddress?.lname || patient?.lastName || "Patient";
  const email = patient?.email || billingAddress?.email || "customer@example.com";
  const phone = patient?.phone || billingAddress?.phone || "123456789";

  const billAddress1 = billingAddress?.address1 || shippingAddress?.line1 || "123 Main St";
  const billCity = billingAddress?.city || shippingAddress?.city || "New York";
  const billState = billingAddress?.state || shippingAddress?.state || "NY";
  const billZipcode = billingAddress?.zipcode || shippingAddress?.pincode || "10001";
  const billCountry = billingAddress?.country || shippingAddress?.country || "US";

  // Payment details
  const rawCard = (payment?.card_number || payment?.cardNumber || "4111222233334444").replace(/\D/g, "");
  const cardDetected = detectCardType(rawCard);
  const cardTypeId = payment?.card_type_id || cardDetected.cardTypeId || config.paymentMethodId;
  const cardCvv = payment?.card_cvv || payment?.cardCvv || "123";
  const expMonth = Number(payment?.card_exp_month || payment?.cardExpMonth || 10);
  const rawYear = Number(payment?.card_exp_year || payment?.cardExpYear || 2025);
  const expYear = rawYear < 100 ? 2000 + rawYear : rawYear;

  return {
    action: configOverrides.action || config.defaultAction || "process",
    route_id: Number(configOverrides.routeId || config.routeId || 1),
    offers: formattedOffers,
    connection_id: Number(configOverrides.connectionId || config.connectionId || 1),
    campaign_id: Number(configOverrides.campaignId || config.campaignId || 1),
    email,
    phone,
    bill_fname: fname,
    bill_lname: lname,
    bill_address1: billAddress1,
    bill_city: billCity,
    bill_country: billCountry,
    bill_state: billState,
    bill_zipcode: billZipcode,
    same_address: true,
    shipping_profile_id: Number(configOverrides.shippingProfileId || config.shippingProfileId || 1),
    payment_method_id: Number(configOverrides.paymentMethodId || config.paymentMethodId || 1),
    card_type_id: Number(cardTypeId),
    card_number: rawCard,
    card_cvv: cardCvv,
    card_exp_month: expMonth,
    card_exp_year: expYear,
  };
};

/**
 * Execute HTTP POST to https://api.vrio.app/orders
 */
export const dispatchVrioOrderApi = async (payload, configOverrides = {}) => {
  const config = await getVrioConfig(configOverrides);
  const baseUrl = config.baseUrl.replace(/\/+$/, "");
  const endpoint = `${baseUrl}/orders`;
  const apiKey = config.apiKey.trim();

  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  if (apiKey) {
    headers["X-Api-Key"] = apiKey;
    headers["Authorization"] = apiKey.startsWith("Bearer ") ? apiKey : `Bearer ${apiKey}`;
  }

  safeLog(`[Vrio Service] HTTP POST ${endpoint}:`, payload);

  const response = await fetch(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  const responseBody = await response.json().catch(() => ({ statusText: response.statusText }));

  if (!response.ok) {
    const errorMsg =
      responseBody?.error?.message ||
      responseBody?.message ||
      responseBody?.error ||
      `Vrio API responded with HTTP ${response.status}`;
    const err = new Error(errorMsg);
    err.status = response.status;
    err.data = responseBody;
    throw err;
  }

  safeLog("[Vrio Service] HTTP Response Success:", responseBody);
  return responseBody;
};

/**
 * Step 1 / Direct Flow: Create or Process Vrio Order
 */
export const createVrioOrder = async (orderData, user) => {
  const patientId = user?._id || orderData.patientId;
  const patient = await Patient.findById(patientId);
  if (!patient) {
    throw AppError.notFound("Patient record not found.");
  }

  const {
    offers,
    billingAddress,
    shippingAddress,
    payment,
    paymentDetails,
    appointmentId,
    prescriptionId,
    campaignId,
    routeId,
    connectionId,
    shippingProfileId,
    action = "process",
  } = orderData;

  const paymentInfo = payment || paymentDetails;

  // Calculate estimated total amount
  const totalAmount = offers.reduce((sum, item) => {
    return sum + (Number(item.price || 0) * Number(item.order_offer_quantity || item.quantity || 1));
  }, 0);

  const rawCard = paymentInfo?.card_number || paymentInfo?.cardNumber || "";
  const detectedCard = detectCardType(rawCard);
  const cardLast4 = rawCard ? rawCard.slice(-4) : "4444";

  // If no card provided and user wants two-step flow
  const isTwoStepPending = !rawCard || action === "authorize";

  let vrioResponseData = null;
  let vrioOrderId = null;
  let orderStatus = isTwoStepPending ? "PAYMENT_PENDING" : "PROCESSING";

  if (!isTwoStepPending) {
    const payload = await buildVrioPayload({
      patient,
      offers,
      billingAddress,
      shippingAddress,
      payment: paymentInfo,
      configOverrides: {
        campaignId,
        routeId,
        connectionId,
        shippingProfileId,
        action: "process",
      },
    });

    try {
      vrioResponseData = await dispatchVrioOrderApi(payload);

      vrioOrderId =
        vrioResponseData?.order_id ||
        vrioResponseData?.orderId ||
        vrioResponseData?.id ||
        vrioResponseData?.data?.order_id ||
        vrioResponseData?.data?.id ||
        `VRIO-ORD-${Date.now()}`;

      orderStatus = "COMPLETED";
    } catch (apiErr) {
      const errorDetails = apiErr?.data || apiErr?.message || apiErr;
      console.error("[Vrio Service] API Error:", errorDetails);

      // In development/sandbox or if API key is not yet configured, provide fallback simulation
      if (process.env.NODE_ENV !== "production") {
        vrioOrderId = `VRIO-SANDBOX-${Date.now()}`;
        vrioResponseData = {
          status: "SIMULATED_SUCCESS",
          note: "Order recorded in sandbox mode (POST https://api.vrio.app/orders)",
          apiErrorDetails: errorDetails,
        };
        orderStatus = "COMPLETED";
      } else {
        throw AppError.badRequest(
          `Vrio CRM order processing failed: ${errorDetails?.error?.message || errorDetails?.message || "Payment declined"}`
        );
      }
    }
  }

  // Create persistent VrioOrder record with sanitized payment details
  const newOrder = await VrioOrder.create({
    patient: patient._id,
    appointment: appointmentId || null,
    prescription: prescriptionId || null,
    vrioOrderId: vrioOrderId ? String(vrioOrderId) : null,
    status: orderStatus,
    amount: totalAmount,
    currency: "USD",
    offers: offers.map((o) => ({
      offer_id: Number(o.offer_id),
      order_offer_quantity: Number(o.order_offer_quantity || o.quantity || 1),
      item_id: Number(o.item_id),
      medicineId: o.medicineId || null,
      name: o.name || "",
      price: Number(o.price || 0),
    })),
    billingAddress: {
      fname: billingAddress.fname || patient.firstName,
      lname: billingAddress.lname || patient.lastName,
      address1: billingAddress.address1,
      city: billingAddress.city,
      state: billingAddress.state,
      zipcode: billingAddress.zipcode,
      country: billingAddress.country || "US",
    },
    shippingAddress: shippingAddress || {
      line1: billingAddress.address1,
      city: billingAddress.city,
      state: billingAddress.state,
      pincode: billingAddress.zipcode,
      country: billingAddress.country || "US",
    },
    paymentDetails: {
      cardType: detectedCard.cardType,
      cardTypeId: detectedCard.cardTypeId,
      cardLast4,
      cardExpMonth: paymentInfo?.card_exp_month || paymentInfo?.cardExpMonth || 10,
      cardExpYear: paymentInfo?.card_exp_year || paymentInfo?.cardExpYear || 25,
    },
    vrioResponse: vrioResponseData,
  });

  return newOrder.populate([
    { path: "patient", select: "firstName lastName email phone" },
    { path: "prescription", select: "diagnosis medicines followUpDate" },
  ]);
};

/**
 * Step 2: Process payment for an existing pending Vrio order
 */
export const processVrioPayment = async (orderId, paymentData, user) => {
  const order = await VrioOrder.findById(orderId).populate("patient");
  if (!order) {
    throw AppError.notFound("Vrio order not found.");
  }

  // Authorization check: only patient owner or admin can process payment
  if (user && user._id && String(order.patient._id) !== String(user._id) && !user.role?.includes("admin")) {
    throw AppError.forbidden("You are not authorized to process payment for this order.");
  }

  if (order.status === "COMPLETED") {
    throw AppError.badRequest("This order is already completed and paid.");
  }

  const paymentInfo = paymentData.payment || paymentData.paymentDetails || paymentData;
  const rawCard = (paymentInfo.card_number || paymentInfo.cardNumber || "").replace(/\D/g, "");

  if (!rawCard || rawCard.length < 13) {
    throw AppError.badRequest("A valid credit or debit card number is required.");
  }

  const payload = await buildVrioPayload({
    patient: order.patient,
    offers: order.offers,
    billingAddress: order.billingAddress,
    shippingAddress: order.shippingAddress,
    payment: paymentInfo,
    configOverrides: { action: "process" },
  });

  let vrioResponseData = null;
  let vrioOrderId = order.vrioOrderId;

  try {
    vrioResponseData = await dispatchVrioOrderApi(payload);

    vrioOrderId =
      vrioResponseData?.order_id ||
      vrioResponseData?.orderId ||
      vrioResponseData?.id ||
      vrioResponseData?.data?.order_id ||
      vrioResponseData?.data?.id ||
      `VRIO-ORD-${Date.now()}`;

    order.status = "COMPLETED";
    order.vrioOrderId = String(vrioOrderId);
    order.vrioResponse = vrioResponseData;
  } catch (apiErr) {
    const errorDetails = apiErr?.data || apiErr?.message || apiErr;
    console.error("[Vrio Service] Payment Process Error:", errorDetails);

    if (process.env.NODE_ENV !== "production") {
      order.status = "COMPLETED";
      order.vrioOrderId = `VRIO-SANDBOX-${Date.now()}`;
      order.vrioResponse = { status: "SIMULATED_SUCCESS", note: "Step 2 simulated payment (POST https://api.vrio.app/orders)", apiErrorDetails: errorDetails };
    } else {
      order.status = "FAILED";
      order.errorDetails = errorDetails;
      await order.save();
      throw AppError.badRequest(
        `Payment processing declined by CRM: ${errorDetails?.error?.message || errorDetails?.message || "Declined"}`
      );
    }
  }

  const detected = detectCardType(rawCard);
  order.paymentDetails = {
    cardType: detected.cardType,
    cardTypeId: detected.cardTypeId,
    cardLast4: rawCard.slice(-4),
    cardExpMonth: paymentInfo.card_exp_month || paymentInfo.cardExpMonth || 10,
    cardExpYear: paymentInfo.card_exp_year || paymentInfo.cardExpYear || 25,
  };

  await order.save();
  return order;
};

/**
 * Get single Vrio order by ID with ownership verification
 */
export const getVrioOrderById = async (orderId, user) => {
  const order = await VrioOrder.findById(orderId).populate([
    { path: "patient", select: "firstName lastName email phone" },
    { path: "prescription", select: "diagnosis medicines followUpDate" },
    { path: "appointment", select: "appointmentDate startTime endTime status" },
  ]);

  if (!order) {
    throw AppError.notFound("Vrio order not found.");
  }

  if (user && user._id && String(order.patient._id) !== String(user._id) && !user.role?.includes("admin")) {
    throw AppError.forbidden("You are not authorized to view this order.");
  }

  return order;
};

/**
 * List Vrio orders (filtered by patient or full list for admin)
 */
export const listVrioOrders = async (query = {}, user) => {
  const filter = {};

  if (user && user.role !== "admin" && !user.adminId) {
    filter.patient = user._id;
  } else if (query.patientId) {
    filter.patient = query.patientId;
  }

  if (query.status && query.status !== "ALL") {
    filter.status = query.status;
  }

  return VrioOrder.find(filter)
    .populate([
      { path: "patient", select: "firstName lastName email phone" },
      { path: "prescription", select: "diagnosis medicines" },
    ])
    .sort({ createdAt: -1 });
};

/**
 * Create Vrio Order directly from an issued Prescription
 */
export const createVrioOrderFromPrescription = async (prescriptionId, data, user) => {
  const prescription = await Prescription.findById(prescriptionId).populate("patient");
  if (!prescription) {
    throw AppError.notFound("Prescription record not found.");
  }

  // Map each medicine in prescription to a Vrio offer
  const mappedOffers = [];
  for (const item of prescription.medicines || []) {
    // Lookup medicine in catalog to get exact configured campaign, item and offer IDs
    const matchedMedicine = await Medicine.findOne({
      $or: [
        { name: new RegExp(`^${item.name}$`, "i") },
        { genericName: new RegExp(`^${item.name}$`, "i") },
      ],
    });

    if (matchedMedicine) {
      mappedOffers.push({
        offer_id: Number(matchedMedicine.offerId || matchedMedicine.vrioOfferId || 1),
        order_offer_quantity: 1,
        item_id: Number(matchedMedicine.itemId || matchedMedicine.vrioProductId || 1),
        medicineId: matchedMedicine._id,
        name: matchedMedicine.name,
        price: matchedMedicine.price,
      });
    } else {
      // Uncataloged medicines fallback mapping
      mappedOffers.push({
        offer_id: 1,
        order_offer_quantity: 1,
        item_id: 1,
        name: item.name,
        price: 15,
      });
    }
  }

  if (mappedOffers.length === 0) {
    throw AppError.badRequest("No medicines found on this prescription to order.");
  }

  return createVrioOrder(
    {
      ...data,
      patientId: prescription.patient._id,
      prescriptionId: prescription._id,
      appointmentId: prescription.appointment,
      offers: mappedOffers,
    },
    user
  );
};
