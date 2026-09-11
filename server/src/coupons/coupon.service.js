import Coupon from "./coupon.model.js";
import AppError from "../shared/errors/AppError.js";
import { getCrmSettingsService } from "../pharmacy/vrio.service.js";

// Auto-seed standard starter coupons if database is empty
export const seedDefaultCouponsIfEmpty = async () => {
  const count = await Coupon.countDocuments();
  if (count > 0) return;

  const defaultCoupons = [
    {
      code: "WELCOME20",
      title: "New Patient Welcome Offer",
      description: "Get 20% off your first pharmacy order",
      type: "PERCENTAGE",
      discountAmount: 20,
      discountLabel: "WELCOME20",
      minOrderAmount: 30,
      maxDiscount: 50,
      usageLimit: 500,
      status: "ACTIVE",
    },
    {
      code: "HEALTH50",
      title: "Wellness Special Discount",
      description: "Flat $50 off on orders over $150",
      type: "FIXED",
      discountAmount: 50,
      discountLabel: "HEALTH50",
      minOrderAmount: 150,
      usageLimit: 200,
      status: "ACTIVE",
    },
    {
      code: "GIFT100",
      title: "TeleClinic Patient Gift Card",
      description: "$100 Digital Gift Card for Medications",
      type: "GIFT_CARD",
      discountAmount: 100,
      discountLabel: "GIFT100",
      minOrderAmount: 0,
      usageLimit: 100,
      status: "ACTIVE",
    },
    {
      code: "RXCARE10",
      title: "Prescription Care 10% Off",
      description: "10% discount on all prescription medicines",
      type: "PERCENTAGE",
      discountAmount: 10,
      discountLabel: "RXCARE10",
      minOrderAmount: 20,
      status: "ACTIVE",
    },
  ];

  await Coupon.insertMany(defaultCoupons);
  console.log("Seeded default discount coupons and gift cards into database.");
};

export const getAllCouponsService = async () => {
  await seedDefaultCouponsIfEmpty();
  return Coupon.find().sort({ createdAt: -1 });
};

export const getCouponByIdService = async (id) => {
  const coupon = await Coupon.findById(id);
  if (!coupon) throw AppError.notFound("Coupon not found.");
  return coupon;
};

export const createCouponService = async (data) => {
  const {
    code,
    title,
    description,
    type,
    discountAmount,
    discountLabel,
    minOrderAmount,
    maxDiscount,
    usageLimit,
    validFrom,
    validUntil,
    status,
  } = data;

  if (!code || !code.trim()) {
    throw AppError.badRequest("Coupon code is required.");
  }
  if (!title || !title.trim()) {
    throw AppError.badRequest("Coupon title is required.");
  }
  if (discountAmount === undefined || discountAmount === null || Number(discountAmount) < 0) {
    throw AppError.badRequest("Valid discount amount is required.");
  }

  const cleanCode = code.trim().toUpperCase();
  const existing = await Coupon.findOne({ code: cleanCode });
  if (existing) {
    throw AppError.badRequest(`Coupon with code "${cleanCode}" already exists.`);
  }

  const coupon = new Coupon({
    code: cleanCode,
    title: title.trim(),
    description: description ? description.trim() : "",
    type: type || "PERCENTAGE",
    discountAmount: Number(discountAmount),
    discountCode: data.discountCode?.trim() || discountLabel?.trim() || cleanCode,
    discountLabel: discountLabel && discountLabel.trim() ? discountLabel.trim() : (data.discountCode?.trim() || cleanCode),
    minOrderAmount: Number(minOrderAmount) || 0,
    maxDiscount: maxDiscount ? Number(maxDiscount) : null,
    usageLimit: usageLimit ? Number(usageLimit) : null,
    validFrom: validFrom ? new Date(validFrom) : new Date(),
    validUntil: validUntil ? new Date(validUntil) : null,
    status: status || "ACTIVE",
  });

  await coupon.save();
  return coupon;
};

export const updateCouponService = async (id, data) => {
  const coupon = await Coupon.findById(id);
  if (!coupon) throw AppError.notFound("Coupon not found.");

  if (data.code && data.code.trim().toUpperCase() !== coupon.code) {
    const existing = await Coupon.findOne({ code: data.code.trim().toUpperCase() });
    if (existing && String(existing._id) !== String(id)) {
      throw AppError.badRequest(`Coupon code "${data.code.trim().toUpperCase()}" is already in use.`);
    }
    coupon.code = data.code.trim().toUpperCase();
  }

  if (data.title !== undefined) coupon.title = data.title.trim();
  if (data.description !== undefined) coupon.description = data.description.trim();
  if (data.type !== undefined) coupon.type = data.type;
  if (data.discountAmount !== undefined) coupon.discountAmount = Number(data.discountAmount);
  if (data.discountCode !== undefined || data.discountLabel !== undefined) {
    const val = (data.discountCode || data.discountLabel || "").trim() || coupon.code;
    coupon.discountCode = val;
    coupon.discountLabel = val;
  }
  if (data.minOrderAmount !== undefined) coupon.minOrderAmount = Number(data.minOrderAmount) || 0;
  if (data.maxDiscount !== undefined) coupon.maxDiscount = data.maxDiscount ? Number(data.maxDiscount) : null;
  if (data.usageLimit !== undefined) coupon.usageLimit = data.usageLimit ? Number(data.usageLimit) : null;
  if (data.validFrom !== undefined) coupon.validFrom = data.validFrom ? new Date(data.validFrom) : coupon.validFrom;
  if (data.validUntil !== undefined) coupon.validUntil = data.validUntil ? new Date(data.validUntil) : null;
  if (data.status !== undefined) coupon.status = data.status;

  await coupon.save();
  return coupon;
};

export const deleteCouponService = async (id) => {
  const coupon = await Coupon.findById(id);
  if (!coupon) throw AppError.notFound("Coupon not found.");

  await Coupon.findByIdAndDelete(id);
  return { success: true, message: `Coupon "${coupon.code}" deleted successfully.` };
};

/**
 * Validate and apply coupon in patient cart
 */
export const validateAndApplyCouponService = async ({ code, orderTotal }) => {
  if (!code || !code.trim()) {
    throw AppError.badRequest("Please enter a valid coupon code or gift card.");
  }

  const cleanCode = code.trim().toUpperCase();
  const coupon = await Coupon.findOne({ code: cleanCode });

  if (!coupon) {
    throw AppError.notFound(`Coupon or Gift Card "${cleanCode}" was not found.`);
  }

  const validity = coupon.isValid(Number(orderTotal) || 0);
  if (!validity.valid) {
    throw AppError.badRequest(validity.message);
  }

  const discountValue = coupon.calculateDiscount(Number(orderTotal) || 0);
  const finalTotal = Math.max(0, Math.round(((Number(orderTotal) || 0) - discountValue) * 100) / 100);

  return {
    valid: true,
    code: coupon.code,
    title: coupon.title,
    type: coupon.type,
    discountAmount: coupon.discountAmount,
    discountCode: coupon.discountCode || coupon.discountLabel || coupon.code,
    discountLabel: coupon.discountCode || coupon.discountLabel || coupon.code,
    discountValue,
    originalTotal: Number(orderTotal) || 0,
    finalTotal,
    message: `🎉 Coupon ${coupon.code} applied! Saved $${discountValue.toFixed(2)}`,
  };
};

/**
 * Increment usage count after order completion
 */
export const incrementCouponUsageService = async (code) => {
  if (!code) return;
  const cleanCode = code.trim().toUpperCase();
  await Coupon.findOneAndUpdate(
    { code: cleanCode },
    { $inc: { usedCount: 1 } }
  ).catch((err) => console.error("Error incrementing coupon usage:", err));
};

/**
 * Direct Live Call to Vrio POST https://api.vrio.app/discounts/validate
 */
export const validateVrioDiscountApiService = async ({
  campaign_id,
  offer_id,
  item_id,
  discount_code,
  gift_cards,
  session_id,
  ip_address,
  user_agent,
  order_notes,
  apiKey: overrideKey,
}) => {
  let apiKey = overrideKey && overrideKey.trim();
  if (!apiKey) {
    try {
      const settings = await getCrmSettingsService();
      apiKey = (settings?.apiKey && settings.apiKey.trim()) || "";
    } catch {
      apiKey = (process.env.VRIO_API_KEY && process.env.VRIO_API_KEY.trim()) || "";
    }
  }

  const baseUrl = (process.env.VRIO_BASE_URL || "https://api.vrio.app").replace(/\/+$/, "");
  const endpoint = `${baseUrl}/discounts/validate`;

  const payload = {
    campaign_id: Number(campaign_id !== undefined ? campaign_id : 190),
    offer_id: Number(offer_id !== undefined ? offer_id : 169),
    item_id: Number(item_id !== undefined ? item_id : 2085),
    discount_code: String(discount_code !== undefined ? discount_code : "NEW15").trim(),
  };

  // Attach gift_cards array if provided: [{ gift_card_code, gift_card_apply }]
  if (Array.isArray(gift_cards) && gift_cards.length > 0) {
    const sanitizedGiftCards = gift_cards
      .map((gc) => ({
        gift_card_code: String(gc?.gift_card_code || gc?.code || "").trim(),
        gift_card_apply: Number(gc?.gift_card_apply || gc?.apply || gc?.amount || 0),
      }))
      .filter((gc) => gc.gift_card_code);
    if (sanitizedGiftCards.length > 0) {
      payload.gift_cards = sanitizedGiftCards;
    }
  }

  // Session ID
  if (session_id && String(session_id).trim()) {
    payload.session_id = String(session_id).trim();
  }

  // IP Address
  if (ip_address && String(ip_address).trim()) {
    payload.ip_address = String(ip_address).trim();
  }

  // User Agent
  if (user_agent && String(user_agent).trim()) {
    payload.user_agent = String(user_agent).trim();
  }

  // Order Notes
  if (order_notes && String(order_notes).trim()) {
    payload.order_notes = String(order_notes).trim();
  }

  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  if (apiKey) {
    headers["X-Api-Key"] = apiKey;
    headers["Authorization"] = apiKey.startsWith("Bearer ") ? apiKey : `Bearer ${apiKey}`;
  }

  const startTime = Date.now();
  console.log(`[Vrio Discounts Validate] POST ${endpoint}`);
  console.log("[Vrio Discounts Validate] Headers:", { ...headers, "X-Api-Key": apiKey ? `${apiKey.slice(0, 10)}...` : "none" });
  console.log("[Vrio Discounts Validate] Body Payload:", JSON.stringify(payload, null, 2));

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    const latencyMs = Date.now() - startTime;
    const responseData = await res.json().catch(() => ({ statusText: res.statusText }));
    console.log(`[Vrio Discounts Validate] HTTP Status ${res.status} (${latencyMs}ms):`, JSON.stringify(responseData, null, 2));

    return {
      success: res.ok,
      status: res.status,
      statusText: res.statusText,
      latencyMs,
      endpoint,
      payloadSent: payload,
      headersUsed: {
        "Content-Type": headers["Content-Type"],
        "X-Api-Key": apiKey ? `${apiKey.slice(0, 15)}...${apiKey.slice(-6)}` : "(none)",
        "Authorization": apiKey ? `Bearer ${apiKey.slice(0, 15)}...` : "(none)",
      },
      vrioResponse: responseData,
    };
  } catch (err) {
    const latencyMs = Date.now() - startTime;
    return {
      success: false,
      status: err.status || 500,
      statusText: err.message || "Network Error",
      latencyMs,
      endpoint,
      payloadSent: payload,
      error: err.message,
      vrioResponse: err.data || { message: err.message },
    };
  }
};
