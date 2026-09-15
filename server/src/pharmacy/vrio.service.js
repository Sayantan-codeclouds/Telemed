import vrioApi from "@api/vrio-api";
import { CrmSettings } from "./crmSettings.model.js";
import { incrementCouponUsageService } from "../coupons/coupon.service.js";

const DEFAULT_SETTINGS = {
  apiKey: "",
  campaignId: 1,
  prepaidCampaignId: null,
  routeId: 1,
  connectionId: 1,
  shippingProfileId: 1,
  paymentMethodId: 1,
  cardTypeId: 1,
  action: "process",
  consultationItemId: 3366,
  consultationOfferId: 29,
  currencySign: "$",
  supportEmail: "sayantan.das@codeclouds.com",
  doctorSupportEmail: "sayantan.das@codeclouds.com",
  isEnabled: true,
  isTestMode: false,
  resendApiKey: "",
  resendFromEmail: "TeleClinic Support <noreply@sayantandas.in>",
  mailProvider: "resend",
  mailApiKey: "",
  mailFromEmail: "TeleClinic Support <noreply@sayantandas.in>",
  smtpHost: "",
  smtpPort: 587,
  smtpUser: "",
  smtpPass: "",
  smtpSecure: false,
  // Multi-provider AI
  aiProvider: "groq",
  aiApiKey: "",
  aiModel: "",
  aiCustomBaseUrl: "",
  groqApiKey: "",
  // Multi-CRM Gateway Selector
  crmProvider: "vrio",
  // Vrio Consultation Specific Campaign (optional fallback to campaignId)
  consultationCampaignId: null,
  // sticky.io Configuration
  stickyDomain: "",
  stickyUsername: "",
  stickyPassword: "",
  stickyCampaignId: 1,
  stickyPrepaidCampaignId: null,
  stickyShippingId: 1,
  stickyOfferId: 29,
  stickyBillingModelId: 2,
  stickyConsultationCampaignId: 1,
  stickyConsultationProductId: 29,
  stickyConsultationShippingId: 1,
  stickyConsultationBillingModelId: 2,
  // CheckoutChamp Configuration
  checkoutChampLoginId: "",
  checkoutChampPassword: "",
  checkoutChampCampaignId: 1,
  checkoutChampPrepaidCampaignId: null,
  checkoutChampProductId: 1,
  checkoutChampShippingId: 1,
  checkoutChampCustomBaseUrl: "https://api.checkoutchamp.com",
  checkoutChampConsultationCampaignId: 1,
  checkoutChampConsultationProductId: 3366,
  checkoutChampConsultationShippingId: 1,
  // Public Deployment URLs
  frontendUrl: "",
  appUrl: "",
};

/**
 * Get or initialize CRM Settings
 */
export const getCrmSettingsService = async () => {
  let settings = await CrmSettings.findOne();
  if (!settings) {
    settings = await CrmSettings.create(DEFAULT_SETTINGS);
  }
  // Ensure defaults if unset in older records
  if (!settings.consultationItemId) settings.consultationItemId = 3366;
  if (!settings.consultationOfferId) settings.consultationOfferId = 29;
  if (!settings.supportEmail) settings.supportEmail = "sayantan.das@codeclouds.com";
  if (!settings.doctorSupportEmail) settings.doctorSupportEmail = "sayantan.das@codeclouds.com";
  if (!settings.resendFromEmail) settings.resendFromEmail = "TeleClinic Support <noreply@sayantandas.in>";
  if (!settings.mailProvider) settings.mailProvider = "resend";
  if (!settings.mailFromEmail) settings.mailFromEmail = settings.resendFromEmail || "TeleClinic Support <noreply@sayantandas.in>";
  if (settings.resendApiKey && !settings.mailApiKey) settings.mailApiKey = settings.resendApiKey;
  if (settings.mailApiKey && !settings.resendApiKey && settings.mailProvider === "resend") settings.resendApiKey = settings.mailApiKey;
  if (settings.smtpPort === undefined || settings.smtpPort === null) settings.smtpPort = 587;

  // AI defaults
  if (!settings.aiProvider) settings.aiProvider = "groq";
  if (settings.groqApiKey && !settings.aiApiKey) settings.aiApiKey = settings.groqApiKey;
  if (settings.aiApiKey && !settings.groqApiKey && settings.aiProvider === "groq") settings.groqApiKey = settings.aiApiKey;

  // CRM defaults
  if (!settings.crmProvider) settings.crmProvider = "vrio";
  if (!settings.checkoutChampCustomBaseUrl) settings.checkoutChampCustomBaseUrl = "https://api.checkoutchamp.com";
  if (!settings.stickyConsultationCampaignId) settings.stickyConsultationCampaignId = settings.stickyCampaignId || 1;
  if (!settings.stickyConsultationProductId) settings.stickyConsultationProductId = settings.stickyOfferId || 29;
  if (!settings.stickyConsultationShippingId) settings.stickyConsultationShippingId = 1;
  if (!settings.stickyConsultationBillingModelId) settings.stickyConsultationBillingModelId = 2;
  if (!settings.checkoutChampConsultationCampaignId) settings.checkoutChampConsultationCampaignId = settings.checkoutChampCampaignId || 1;
  if (!settings.checkoutChampConsultationProductId) settings.checkoutChampConsultationProductId = settings.consultationItemId || 3366;
  if (!settings.checkoutChampConsultationShippingId) settings.checkoutChampConsultationShippingId = 1;

  return settings;
};

/**
 * Update CRM Settings
 */
export const updateCrmSettingsService = async (data) => {
  let settings = await CrmSettings.findOne();
  if (!settings) {
    settings = new CrmSettings(DEFAULT_SETTINGS);
  }

  if (data.apiKey !== undefined) settings.apiKey = data.apiKey.trim();
  if (data.campaignId !== undefined) settings.campaignId = Number(data.campaignId);
  if (data.prepaidCampaignId !== undefined) {
    settings.prepaidCampaignId = data.prepaidCampaignId ? Number(data.prepaidCampaignId) : null;
  }
  if (data.routeId !== undefined) settings.routeId = Number(data.routeId);
  if (data.connectionId !== undefined) settings.connectionId = Number(data.connectionId);
  if (data.shippingProfileId !== undefined) settings.shippingProfileId = Number(data.shippingProfileId);
  if (data.paymentMethodId !== undefined) settings.paymentMethodId = Number(data.paymentMethodId);
  if (data.cardTypeId !== undefined) settings.cardTypeId = Number(data.cardTypeId);
  if (data.action !== undefined) settings.action = data.action;
  if (data.consultationItemId !== undefined) settings.consultationItemId = Number(data.consultationItemId);
  if (data.consultationOfferId !== undefined) settings.consultationOfferId = Number(data.consultationOfferId);
  if (data.consultationCampaignId !== undefined) {
    settings.consultationCampaignId = data.consultationCampaignId ? Number(data.consultationCampaignId) : null;
  }
  if (data.currencySign !== undefined) settings.currencySign = data.currencySign.trim() || "$";
  if (data.supportEmail !== undefined) settings.supportEmail = data.supportEmail.trim() || "sayantan.das@codeclouds.com";
  if (data.doctorSupportEmail !== undefined) settings.doctorSupportEmail = data.doctorSupportEmail.trim() || "sayantan.das@codeclouds.com";
  if (data.isEnabled !== undefined) settings.isEnabled = Boolean(data.isEnabled);
  if (data.isTestMode !== undefined) settings.isTestMode = Boolean(data.isTestMode);
  if (data.resendApiKey !== undefined) settings.resendApiKey = data.resendApiKey.trim();
  if (data.resendFromEmail !== undefined) settings.resendFromEmail = data.resendFromEmail.trim();
  if (data.frontendUrl !== undefined) settings.frontendUrl = data.frontendUrl.trim();
  if (data.appUrl !== undefined) settings.appUrl = data.appUrl.trim();

  // Multi-provider mail settings
  if (data.mailProvider !== undefined) settings.mailProvider = data.mailProvider.trim().toLowerCase();
  if (data.mailApiKey !== undefined) settings.mailApiKey = data.mailApiKey.trim();
  if (data.mailFromEmail !== undefined) settings.mailFromEmail = data.mailFromEmail.trim();
  if (data.smtpHost !== undefined) settings.smtpHost = data.smtpHost.trim();
  if (data.smtpPort !== undefined) settings.smtpPort = Number(data.smtpPort) || 587;
  if (data.smtpUser !== undefined) settings.smtpUser = data.smtpUser.trim();
  if (data.smtpPass !== undefined) settings.smtpPass = data.smtpPass.trim();
  if (data.smtpSecure !== undefined) settings.smtpSecure = Boolean(data.smtpSecure);

  // Cross-sync resend credentials if resend is selected
  if (settings.mailProvider === "resend") {
    if (data.mailApiKey !== undefined) settings.resendApiKey = data.mailApiKey.trim();
    if (data.mailFromEmail !== undefined) settings.resendFromEmail = data.mailFromEmail.trim();
  }

  // Multi-provider AI settings
  if (data.aiProvider !== undefined) settings.aiProvider = data.aiProvider.trim().toLowerCase();
  if (data.aiApiKey !== undefined) settings.aiApiKey = data.aiApiKey.trim();
  if (data.aiModel !== undefined) settings.aiModel = data.aiModel.trim();
  if (data.aiCustomBaseUrl !== undefined) settings.aiCustomBaseUrl = data.aiCustomBaseUrl.trim();

  if (data.groqApiKey !== undefined) settings.groqApiKey = data.groqApiKey.trim();

  // Cross-sync groq credentials if groq is selected
  if (settings.aiProvider === "groq") {
    if (data.aiApiKey !== undefined) settings.groqApiKey = data.aiApiKey.trim();
  }

  // Multi-CRM Gateway settings
  if (data.crmProvider !== undefined) settings.crmProvider = data.crmProvider.trim().toLowerCase();
  if (data.stickyDomain !== undefined) settings.stickyDomain = data.stickyDomain.trim();
  if (data.stickyUsername !== undefined) settings.stickyUsername = data.stickyUsername.trim();
  if (data.stickyPassword !== undefined) settings.stickyPassword = data.stickyPassword.trim();
  if (data.stickyCampaignId !== undefined) settings.stickyCampaignId = Number(data.stickyCampaignId) || 1;
  if (data.stickyPrepaidCampaignId !== undefined) {
    settings.stickyPrepaidCampaignId = data.stickyPrepaidCampaignId ? Number(data.stickyPrepaidCampaignId) : null;
  }
  if (data.stickyShippingId !== undefined) settings.stickyShippingId = Number(data.stickyShippingId) || 1;
  if (data.stickyOfferId !== undefined) settings.stickyOfferId = Number(data.stickyOfferId) || 29;
  if (data.stickyBillingModelId !== undefined) settings.stickyBillingModelId = Number(data.stickyBillingModelId) || 2;
  if (data.stickyConsultationCampaignId !== undefined) settings.stickyConsultationCampaignId = Number(data.stickyConsultationCampaignId) || 1;
  if (data.stickyConsultationProductId !== undefined) settings.stickyConsultationProductId = Number(data.stickyConsultationProductId) || 29;
  if (data.stickyConsultationShippingId !== undefined) settings.stickyConsultationShippingId = Number(data.stickyConsultationShippingId) || 1;
  if (data.stickyConsultationBillingModelId !== undefined) settings.stickyConsultationBillingModelId = Number(data.stickyConsultationBillingModelId) || 2;

  if (data.checkoutChampLoginId !== undefined) settings.checkoutChampLoginId = data.checkoutChampLoginId.trim();
  if (data.checkoutChampPassword !== undefined) settings.checkoutChampPassword = data.checkoutChampPassword.trim();
  if (data.checkoutChampCampaignId !== undefined) settings.checkoutChampCampaignId = Number(data.checkoutChampCampaignId) || 1;
  if (data.checkoutChampPrepaidCampaignId !== undefined) {
    settings.checkoutChampPrepaidCampaignId = data.checkoutChampPrepaidCampaignId ? Number(data.checkoutChampPrepaidCampaignId) : null;
  }
  if (data.checkoutChampProductId !== undefined) settings.checkoutChampProductId = Number(data.checkoutChampProductId) || 1;
  if (data.checkoutChampShippingId !== undefined) settings.checkoutChampShippingId = Number(data.checkoutChampShippingId) || 1;
  if (data.checkoutChampCustomBaseUrl !== undefined) settings.checkoutChampCustomBaseUrl = data.checkoutChampCustomBaseUrl.trim();
  if (data.checkoutChampConsultationCampaignId !== undefined) settings.checkoutChampConsultationCampaignId = Number(data.checkoutChampConsultationCampaignId) || 1;
  if (data.checkoutChampConsultationProductId !== undefined) settings.checkoutChampConsultationProductId = Number(data.checkoutChampConsultationProductId) || 3366;
  if (data.checkoutChampConsultationShippingId !== undefined) settings.checkoutChampConsultationShippingId = Number(data.checkoutChampConsultationShippingId) || 1;

  await settings.save();
  return settings;
};

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
 * Check if the error or decline reason from CRM indicates a prepaid card restriction
 */
export const isPrepaidCardError = (err) => {
  if (!err) return false;
  const str = typeof err === "string" ? err : JSON.stringify(err);
  const lower = str.toLowerCase();
  return (
    lower.includes("prepaid cards not allowed") ||
    lower.includes("prepaid card") ||
    lower.includes("prepaid") ||
    lower.includes("card is prepaid") ||
    lower.includes("prepaid_cards_not_allowed") ||
    lower.includes("prepaid_not_allowed")
  );
};

/**
 * Process order via Vrio CRM API with automatic Prepaid Campaign fallback retry
 */
export const processVrioOrderInternalService = async (orderData = {}, existingSettings = null) => {
  const {
    patient,
    items,
    shippingAddress,
    billingDetails,
    paymentDetails,
    couponCode,
    discountLabel,
    discount_label,
    discountAmount,
  } = orderData;
  const settings = existingSettings || (await getCrmSettingsService());

  if (!settings.isEnabled) {
    return {
      success: true,
      vrioOrderId: `VRIO-OFFLINE-${Date.now()}`,
      vrioResponse: { status: "SKIPPED", message: "Vrio CRM sync is disabled in settings." },
    };
  }

  // Set API Key from CRM settings in DB or environment variable
  const apiKey =
    (settings.apiKey && settings.apiKey.trim()) ||
    (process.env.VRIO_API_KEY && process.env.VRIO_API_KEY.trim()) ||
    "";

  if (apiKey) {
    try {
      vrioApi.auth(apiKey);
    } catch (authErr) {
      console.warn("Vrio auth warning:", authErr?.message);
    }
  }

  // Detect card type from payment details or raw card number
  const cardNum = paymentDetails?.cardNumber
    ? String(paymentDetails.cardNumber).replace(/\s+/g, "")
    : "4111222233334444";

  const detectedCard = detectCardType(cardNum);
  const cardTypeId = paymentDetails?.cardTypeId || detectedCard.cardTypeId;

  // Detect whether this order is for a telemedicine video consultation
  const isConsultation = Boolean(
    orderData.isConsultation ||
    items?.some((i) => i.isConsultation || i.consultationOfferId)
  );

  // Determine standard campaign ID strictly from Admin Settings (or .env fallback)
  const primaryCampaignId = Number(
    (isConsultation && settings.consultationCampaignId) ||
    settings.campaignId ||
    process.env.VRIO_CAMPAIGN_ID ||
    1
  );

  // Determine fallback prepaid campaign ID from Admin Settings (or item)
  const prepaidCampaignId = settings.prepaidCampaignId || items?.find((i) => i.prepaidCampaignId)?.prepaidCampaignId || null;

  // Determine route ID from Admin Settings
  const routeId = Number(settings.routeId || process.env.VRIO_ROUTE_ID || 1);

  // Calculate cart total (pre-discount) for proportional promo/coupon discount distribution
  const cartTotal = items.reduce((sum, item) => {
    return sum + (Number(item.price || 0) * Number(item.quantity || 1));
  }, 0);

  // Only coupon/promo discount affects order_offer_price.
  // Gift card discounts are sent separately as the top-level gift_cards array.
  const promoDiscountAmount = Number(orderData?.discountAmount || 0);

  // Format offers for Vrio CRM: [{ offer_id, order_offer_quantity, item_id, order_offer_price }]
  const offers = items.map((item) => {
    const offerId = Number(item.offerId || item.vrioOfferId || 1);
    const itemId = Number(item.itemId || item.vrioProductId || 1);
    const unitPrice = Number(item.price || 0);
    const qty = Number(item.quantity || 1);
    const itemTotal = unitPrice * qty;

    // Distribute coupon/promo discount proportionally by this item's weight in the cart total
    let orderOfferPrice = unitPrice;
    if (promoDiscountAmount > 0 && cartTotal > 0 && itemTotal > 0) {
      const itemDiscountShare = (itemTotal / cartTotal) * promoDiscountAmount;
      const discountedTotal = Math.max(0, itemTotal - itemDiscountShare);
      // order_offer_price is per-unit after promo discount
      orderOfferPrice = Math.round((discountedTotal / qty) * 100) / 100;
    }

    return {
      offer_id: offerId,
      order_offer_quantity: qty,
      item_id: itemId,
      order_offer_price: orderOfferPrice,
    };
  });

  const fname = billingDetails?.fname || patient?.firstName || "test";
  const lname = billingDetails?.lname || patient?.lastName || "test";
  const email = billingDetails?.email || patient?.email || "test@test.com";
  const phone = billingDetails?.phone || patient?.phone || "123456789";

  const billAddress1 = billingDetails?.address1 || shippingAddress?.line1 || "test street";
  const billCity = billingDetails?.city || shippingAddress?.city || "test";
  const billState = billingDetails?.state || shippingAddress?.state || "CA";
  const billZipcode = billingDetails?.zipcode || shippingAddress?.pincode || "12345";
  let rawCountry = billingDetails?.country || shippingAddress?.country || "US";
  if (
    rawCountry.toUpperCase() === "USA" ||
    rawCountry.toLowerCase() === "united states" ||
    rawCountry.toLowerCase() === "united states of america"
  ) {
    rawCountry = "US";
  }
  const billCountry = rawCountry;

  // Build exact payload matching Vrio CRM specifications from Admin Settings
  const buildPayload = (targetCampaignId) => {
    const rawYear = Number(paymentDetails?.cardExpYear || 2028);
    const expYear = rawYear < 100 ? 2000 + rawYear : rawYear;

    const payload = {
      action: settings.action || "process",
      route_id: routeId,
      offers,
      connection_id: Number(settings.connectionId || process.env.VRIO_CONNECTION_ID || 1),
      campaign_id: Number(targetCampaignId || settings.campaignId || 1),
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
      shipping_profile_id: Number(settings.shippingProfileId || process.env.VRIO_SHIPPING_PROFILE_ID || 1),
      payment_method_id: Number(settings.paymentMethodId || process.env.VRIO_PAYMENT_METHOD_ID || 1),
      card_type_id: Number(cardTypeId || settings.cardTypeId || 1),
      card_number: cardNum,
      card_cvv: paymentDetails?.cardCvv || "123",
      card_exp_month: Number(paymentDetails?.cardExpMonth || 10),
      card_exp_year: expYear,
    };

    // Attach discount_code parameter to Vrio JSON payload
    const discountCode =
      orderData?.discountCode ||
      orderData?.discount_code ||
      orderData?.couponCode ||
      orderData?.discountLabel ||
      orderData?.discount_label ||
      paymentDetails?.discountCode ||
      paymentDetails?.discount_code ||
      paymentDetails?.discountLabel;

    if (discountCode && String(discountCode).trim()) {
      payload.discount_code = String(discountCode).trim();
    }

    // Attach gift_cards array: [{ gift_card_code, gift_card_apply }]
    const rawGiftCards = orderData?.gift_cards || paymentDetails?.gift_cards;
    if (Array.isArray(rawGiftCards) && rawGiftCards.length > 0) {
      const sanitized = rawGiftCards
        .map((gc) => ({
          gift_card_code: String(gc?.gift_card_code || gc?.code || "").trim(),
          gift_card_apply: Number(gc?.gift_card_apply || gc?.apply || gc?.amount || 0),
        }))
        .filter((gc) => gc.gift_card_code);
      if (sanitized.length > 0) {
        payload.gift_cards = sanitized;
      }
    } else if (orderData?.couponType === "GIFT_CARD" && orderData?.couponCode) {
      payload.gift_cards = [
        {
          gift_card_code: String(orderData.couponCode).trim().toUpperCase(),
          gift_card_apply: Number(orderData.discountAmount || 0),
        },
      ];
    }

    // Session ID
    const sessionId = orderData?.session_id || orderData?.sessionId || paymentDetails?.session_id;
    if (sessionId && String(sessionId).trim()) {
      payload.session_id = String(sessionId).trim();
    }

    // IP Address
    const ipAddress = orderData?.ip_address || orderData?.ipAddress || paymentDetails?.ip_address;
    if (ipAddress && String(ipAddress).trim()) {
      payload.ip_address = String(ipAddress).trim();
    }

    // User Agent
    const userAgent = orderData?.user_agent || orderData?.userAgent || paymentDetails?.user_agent;
    if (userAgent && String(userAgent).trim()) {
      payload.user_agent = String(userAgent).trim();
    }

    // Order Notes
    const orderNotes = orderData?.order_notes || orderData?.orderNotes || paymentDetails?.order_notes;
    if (orderNotes && String(orderNotes).trim()) {
      payload.order_notes = String(orderNotes).trim();
    }

    return payload;
  };

  const initialPayload = buildPayload(primaryCampaignId);

  const sendVrioRequest = async (payload) => {
    const baseUrl = (process.env.VRIO_BASE_URL || "https://api.vrio.app").replace(/\/+$/, "");
    const endpoint = `${baseUrl}/orders`;
    const headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    if (apiKey) {
      headers["X-Api-Key"] = apiKey;
      headers["Authorization"] = apiKey.startsWith("Bearer ") ? apiKey : `Bearer ${apiKey}`;
    }

    console.log(`[Vrio CRM API] POST ${endpoint}`);
    console.log("[Vrio CRM API] Payload:", JSON.stringify(payload, null, 2));

    const res = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({ statusText: res.statusText }));
    console.log(`[Vrio CRM API] Status: ${res.status}`, JSON.stringify(data, null, 2));

    if (!res.ok) {
      const errMessage =
        data?.error?.message ||
        data?.message ||
        data?.error ||
        data?.errors?.[0]?.message ||
        `Vrio API error (HTTP ${res.status})`;
      const err = new Error(errMessage);
      err.status = res.status;
      err.data = data;
      throw err;
    }
    return data;
  };

  try {
    const data = await sendVrioRequest(initialPayload);
    console.log("Vrio CRM Live Order Success Response:", data);

    const vrioOrderId =
      data?.order_id ||
      data?.orderId ||
      data?.id ||
      data?.data?.order_id ||
      data?.data?.id ||
      `VRIO-ORD-${Date.now()}`;

    if (orderData?.couponCode) {
      incrementCouponUsageService(orderData.couponCode).catch(() => {});
    }

    return {
      success: true,
      vrioOrderId: String(vrioOrderId),
      vrioResponse: data,
      campaignIdUsed: Number(primaryCampaignId),
      retriedWithPrepaidCampaign: false,
    };
  } catch (err) {
    const errorDetails = err?.data || err?.response?.data || err?.message || err;
    console.error("Vrio CRM API Initial Error:", errorDetails);

    // Check if error is due to prepaid card restriction and retry with prepaidCampaignId
    if (
      isPrepaidCardError(errorDetails) &&
      prepaidCampaignId &&
      Number(prepaidCampaignId) !== Number(primaryCampaignId)
    ) {
      console.warn(
        `[Vrio CRM] Prepaid card decline on Campaign #${primaryCampaignId}. Automatically retrying with Prepaid Campaign #${prepaidCampaignId}...`
      );

      const retryPayload = buildPayload(prepaidCampaignId);
      try {
        const retryData = await sendVrioRequest(retryPayload);
        console.log("Vrio CRM Live Prepaid Campaign Retry Success:", retryData);

        const vrioOrderId =
          retryData?.order_id ||
          retryData?.orderId ||
          retryData?.id ||
          retryData?.data?.order_id ||
          retryData?.data?.id ||
          `VRIO-PREPAID-${Date.now()}`;

        if (orderData?.couponCode) {
          incrementCouponUsageService(orderData.couponCode).catch(() => {});
        }

        return {
          success: true,
          vrioOrderId: String(vrioOrderId),
          vrioResponse: retryData,
          campaignIdUsed: Number(prepaidCampaignId),
          retriedWithPrepaidCampaign: true,
        };
      } catch (retryErr) {
        const retryErrorDetails =
          retryErr?.data || retryErr?.response?.data || retryErr?.message || retryErr;
        console.error("Vrio CRM Prepaid Retry Error:", retryErrorDetails);

        if (settings.isTestMode) {
          const fallbackOrderId = `VRIO-PREPAID-SANDBOX-${Date.now()}`;
          return {
            success: false,
            vrioOrderId: fallbackOrderId,
            vrioResponse: {
              error: retryErrorDetails,
              initialError: errorDetails,
              prepaidRetryAttempted: true,
              fallbackOrderId,
            },
            campaignIdUsed: Number(prepaidCampaignId),
            retriedWithPrepaidCampaign: true,
          };
        }

        throw retryErr;
      }
    }

    // Only fallback to sandbox if explicitly configured in Test Mode
    if (settings.isTestMode) {
      const fallbackOrderId = `VRIO-SANDBOX-${Date.now()}`;
      return {
        success: false,
        vrioOrderId: fallbackOrderId,
        vrioResponse: {
          error: errorDetails,
          payloadSent: { ...initialPayload, card_number: `***${cardNum.slice(-4)}` },
          fallbackOrderId,
        },
        campaignIdUsed: Number(primaryCampaignId),
        retriedWithPrepaidCampaign: false,
      };
    }

    // Re-throw live Vrio API error so live failures are surfaced directly
    throw err;
  }
};

/**
 * Process order via sticky.io CRM API
 */
export const processStickyOrderService = async (orderData = {}, existingSettings = null) => {
  const settings = existingSettings || (await getCrmSettingsService());

  if (!settings.isEnabled) {
    return {
      success: true,
      vrioOrderId: `STICKY-OFFLINE-${Date.now()}`,
      crmOrderId: `STICKY-OFFLINE-${Date.now()}`,
      crmProvider: "sticky",
      crmResponse: { status: "SKIPPED", message: "sticky.io CRM sync is disabled in settings." },
    };
  }

  const {
    patient,
    items,
    shippingAddress,
    billingDetails,
    paymentDetails,
    discountCode,
    couponCode,
  } = orderData;

  const stickyDomain = (settings.stickyDomain || "").replace(/^https?:\/\//, "").replace(/\/+$/, "").trim();
  const username = (settings.stickyUsername || "").trim();
  const password = (settings.stickyPassword || "").trim();

  if (!stickyDomain || !username || !password) {
    if (settings.isTestMode) {
      const fallbackOrderId = `STICKY-SANDBOX-${Date.now()}`;
      return {
        success: true,
        vrioOrderId: fallbackOrderId,
        crmOrderId: fallbackOrderId,
        crmProvider: "sticky",
        crmResponse: { status: "SANDBOX", message: "sticky.io credentials not fully configured; simulated in test mode." },
      };
    }
    throw new Error("sticky.io CRM credentials (domain, username, password) are not configured in Admin Settings.");
  }

  const cardNum = paymentDetails?.cardNumber
    ? String(paymentDetails.cardNumber).replace(/\s+/g, "")
    : "4111222233334444";
  const detectedCard = detectCardType(cardNum);

  // Expiration date in MMYY
  const expMonth = String(paymentDetails?.cardExpMonth || "10").padStart(2, "0");
  const rawYear = String(paymentDetails?.cardExpYear || "28");
  const expYear2 = rawYear.length === 4 ? rawYear.slice(2) : rawYear.padStart(2, "0");
  const expirationDate = `${expMonth}${expYear2}`;

  const fname = billingDetails?.fname || patient?.firstName || "Customer";
  const lname = billingDetails?.lname || patient?.lastName || "Patient";
  const email = billingDetails?.email || patient?.email || "customer@example.com";
  const phone = billingDetails?.phone || patient?.phone || "1234567890";

  const billAddress1 = billingDetails?.address1 || shippingAddress?.line1 || "123 Main St";
  const billCity = billingDetails?.city || shippingAddress?.city || "Los Angeles";
  const billState = billingDetails?.state || shippingAddress?.state || "CA";
  const billZipcode = billingDetails?.zipcode || shippingAddress?.pincode || "90001";
  let billCountry = billingDetails?.country || shippingAddress?.country || "US";
  if (["USA", "UNITED STATES", "UNITED STATES OF AMERICA"].includes(billCountry.toUpperCase())) {
    billCountry = "US";
  }

  // Detect consultation
  const isConsultation = Boolean(
    orderData.isConsultation ||
    items?.some((i) => i.isConsultation || i.consultationOfferId)
  );

  const primaryCampaignId = Number(
    (isConsultation && settings.stickyConsultationCampaignId) ||
    settings.stickyCampaignId ||
    1
  );
  const prepaidCampaignId = isConsultation ? null : (settings.stickyPrepaidCampaignId || null);
  const shippingId = Number(
    (isConsultation && settings.stickyConsultationShippingId) ||
    settings.stickyShippingId ||
    1
  );
  const billingModelId = Number(
    (isConsultation && settings.stickyConsultationBillingModelId) ||
    settings.stickyBillingModelId ||
    2
  );

  // Build products array
  const products = isConsultation
    ? [
        {
          product_id: Number(settings.stickyConsultationProductId || items?.[0]?.itemId || settings.stickyOfferId || 29),
          price: Number(items?.[0]?.price || 0),
          quantity: 1,
        },
      ]
    : (items || []).map((item) => ({
        product_id: Number(item.stickyProductId || item.itemId || item.productId || settings.stickyOfferId || 1),
        price: Number(item.price || 0),
        quantity: Number(item.quantity || 1),
      }));

  const buildStickyPayload = (targetCampaignId) => {
    const p = {
      campaign_id: Number(targetCampaignId || primaryCampaignId),
      shipping_id: shippingId,
      billing_model_id: billingModelId,
      payment_method: "creditcard",
      credit_card_type: detectedCard.cardType,
      credit_card_number: cardNum,
      expiration_date: expirationDate,
      cvv: paymentDetails?.cardCvv || "123",
      first_name: fname,
      last_name: lname,
      email,
      phone,
      billing_first_name: fname,
      billing_last_name: lname,
      billing_address1: billAddress1,
      billing_city: billCity,
      billing_state: billState,
      billing_zip: billZipcode,
      billing_country: billCountry,
      billing_same_as_shipping: "yes",
      shipping_first_name: fname,
      shipping_last_name: lname,
      shipping_address1: billAddress1,
      shipping_city: billCity,
      shipping_state: billState,
      shipping_zip: billZipcode,
      shipping_country: billCountry,
      products,
    };

    const promoCode =
      discountCode ||
      couponCode ||
      orderData?.discountLabel ||
      orderData?.discount_label;
    if (promoCode && String(promoCode).trim()) {
      p.promo_code = String(promoCode).trim();
    }
    return p;
  };

  const initialPayload = buildStickyPayload(primaryCampaignId);
  const endpoint = `https://${stickyDomain}/api/v1/new_order`;
  const basicAuth = Buffer.from(`${username}:${password}`).toString("base64");

  const sendStickyRequest = async (payload) => {
    console.log(`[sticky.io CRM API] POST ${endpoint}`);
    console.log("[sticky.io CRM API] Payload:", JSON.stringify({ ...payload, credit_card_number: `***${cardNum.slice(-4)}` }, null, 2));

    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Basic ${basicAuth}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({ statusText: res.statusText }));
    console.log(`[sticky.io CRM API] Status: ${res.status}`, JSON.stringify(data, null, 2));

    const isSuccess =
      res.ok &&
      (String(data?.response_code) === "100" ||
        data?.status === "SUCCESS" ||
        (data?.order_id && !data?.error_message && !data?.decline_reason));

    if (!isSuccess) {
      const errMsg =
        data?.error_message ||
        data?.decline_reason ||
        data?.message ||
        data?.response_text ||
        `sticky.io transaction declined or error (Code: ${data?.response_code || res.status})`;
      const err = new Error(errMsg);
      err.data = data;
      err.status = res.status;
      throw err;
    }
    return data;
  };

  try {
    const data = await sendStickyRequest(initialPayload);
    const orderId = data?.order_id || `STICKY-ORD-${Date.now()}`;
    if (orderData?.couponCode) {
      incrementCouponUsageService(orderData.couponCode).catch(() => {});
    }

    return {
      success: true,
      vrioOrderId: String(orderId),
      crmOrderId: String(orderId),
      crmProvider: "sticky",
      crmResponse: data,
      campaignIdUsed: Number(primaryCampaignId),
      retriedWithPrepaidCampaign: false,
    };
  } catch (err) {
    const errorDetails = err?.data || err?.message || err;
    console.error("[sticky.io CRM API] Error:", errorDetails);

    if (
      isPrepaidCardError(errorDetails) &&
      prepaidCampaignId &&
      Number(prepaidCampaignId) !== Number(primaryCampaignId)
    ) {
      console.warn(
        `[sticky.io CRM] Prepaid card decline on Campaign #${primaryCampaignId}. Retrying with Prepaid Campaign #${prepaidCampaignId}...`
      );
      try {
        const retryPayload = buildStickyPayload(prepaidCampaignId);
        const retryData = await sendStickyRequest(retryPayload);
        const orderId = retryData?.order_id || `STICKY-PREPAID-${Date.now()}`;
        if (orderData?.couponCode) {
          incrementCouponUsageService(orderData.couponCode).catch(() => {});
        }
        return {
          success: true,
          vrioOrderId: String(orderId),
          crmOrderId: String(orderId),
          crmProvider: "sticky",
          crmResponse: retryData,
          campaignIdUsed: Number(prepaidCampaignId),
          retriedWithPrepaidCampaign: true,
        };
      } catch (retryErr) {
        if (settings.isTestMode) {
          const fallbackOrderId = `STICKY-PREPAID-SANDBOX-${Date.now()}`;
          return {
            success: false,
            vrioOrderId: fallbackOrderId,
            crmOrderId: fallbackOrderId,
            crmProvider: "sticky",
            crmResponse: { error: retryErr?.data || retryErr?.message || retryErr, fallbackOrderId },
          };
        }
        throw retryErr;
      }
    }

    if (settings.isTestMode) {
      const fallbackOrderId = `STICKY-SANDBOX-${Date.now()}`;
      return {
        success: false,
        vrioOrderId: fallbackOrderId,
        crmOrderId: fallbackOrderId,
        crmProvider: "sticky",
        crmResponse: {
          error: errorDetails,
          fallbackOrderId,
        },
      };
    }
    throw err;
  }
};

/**
 * Process order via CheckoutChamp (formerly Konnektive) CRM API
 */
export const processCheckoutChampOrderService = async (orderData = {}, existingSettings = null) => {
  const settings = existingSettings || (await getCrmSettingsService());

  if (!settings.isEnabled) {
    return {
      success: true,
      vrioOrderId: `CC-OFFLINE-${Date.now()}`,
      crmOrderId: `CC-OFFLINE-${Date.now()}`,
      crmProvider: "checkoutchamp",
      crmResponse: { status: "SKIPPED", message: "CheckoutChamp CRM sync is disabled in settings." },
    };
  }

  const {
    patient,
    items,
    shippingAddress,
    billingDetails,
    paymentDetails,
    discountCode,
    couponCode,
  } = orderData;

  const loginId = (settings.checkoutChampLoginId || "").trim();
  const password = (settings.checkoutChampPassword || "").trim();
  const baseUrl = (settings.checkoutChampCustomBaseUrl || "https://api.checkoutchamp.com").replace(/\/+$/, "").trim();

  if (!loginId || !password) {
    if (settings.isTestMode) {
      const fallbackOrderId = `CC-SANDBOX-${Date.now()}`;
      return {
        success: true,
        vrioOrderId: fallbackOrderId,
        crmOrderId: fallbackOrderId,
        crmProvider: "checkoutchamp",
        crmResponse: { status: "SANDBOX", message: "CheckoutChamp credentials not fully configured; simulated in test mode." },
      };
    }
    throw new Error("CheckoutChamp CRM credentials (loginId, password) are not configured in Admin Settings.");
  }

  const cardNum = paymentDetails?.cardNumber
    ? String(paymentDetails.cardNumber).replace(/\s+/g, "")
    : "4111222233334444";

  const expMonth = String(paymentDetails?.cardExpMonth || "10").padStart(2, "0");
  const rawYear = Number(paymentDetails?.cardExpYear || 2028);
  const expYear = rawYear < 100 ? 2000 + rawYear : rawYear;

  const fname = billingDetails?.fname || patient?.firstName || "Customer";
  const lname = billingDetails?.lname || patient?.lastName || "Patient";
  const email = billingDetails?.email || patient?.email || "customer@example.com";
  const phone = billingDetails?.phone || patient?.phone || "1234567890";

  const billAddress1 = billingDetails?.address1 || shippingAddress?.line1 || "123 Main St";
  const billCity = billingDetails?.city || shippingAddress?.city || "Los Angeles";
  const billState = billingDetails?.state || shippingAddress?.state || "CA";
  const billZipcode = billingDetails?.zipcode || shippingAddress?.pincode || "90001";
  let billCountry = billingDetails?.country || shippingAddress?.country || "US";
  if (["USA", "UNITED STATES", "UNITED STATES OF AMERICA"].includes(billCountry.toUpperCase())) {
    billCountry = "US";
  }

  // Detect consultation
  const isConsultation = Boolean(
    orderData.isConsultation ||
    items?.some((i) => i.isConsultation || i.consultationOfferId)
  );

  const primaryCampaignId = Number(
    (isConsultation && settings.checkoutChampConsultationCampaignId) ||
    settings.checkoutChampCampaignId ||
    1
  );
  const prepaidCampaignId = isConsultation ? null : (settings.checkoutChampPrepaidCampaignId || null);

  const buildCCPayload = (targetCampaignId) => {
    const payload = {
      loginId,
      password,
      campaignId: Number(targetCampaignId || primaryCampaignId),
      paySource: "CREDITCARD",
      cardNumber: cardNum,
      cardMonth: expMonth,
      cardYear: expYear,
      cardSecurityCode: paymentDetails?.cardCvv || "123",
      firstName: fname,
      lastName: lname,
      address1: billAddress1,
      city: billCity,
      state: billState,
      postalCode: billZipcode,
      country: billCountry,
      phoneNumber: phone,
      emailAddress: email,
      shipFirstName: fname,
      shipLastName: lname,
      shipAddress1: billAddress1,
      shipCity: billCity,
      shipState: billState,
      shipPostalCode: billZipcode,
      shipCountry: billCountry,
    };

    if (isConsultation) {
      payload["product1_id"] = Number(settings.checkoutChampConsultationProductId || settings.consultationItemId || 3366);
      payload["product1_qty"] = 1;
      payload["product1_price"] = Number(items?.[0]?.price || 0);
    } else {
      (items || []).forEach((item, index) => {
        const idx = index + 1;
        payload[`product${idx}_id`] = item.checkoutChampProductId || item.itemId || item.productId || settings.checkoutChampProductId || 1;
        payload[`product${idx}_qty`] = item.quantity || 1;
        payload[`product${idx}_price`] = item.price || 0;
      });
    }

    const promoCode =
      discountCode ||
      couponCode ||
      orderData?.discountLabel ||
      orderData?.discount_label;
    if (promoCode && String(promoCode).trim()) {
      payload.couponCode = String(promoCode).trim();
    }

    return payload;
  };

  const initialPayload = buildCCPayload(primaryCampaignId);
  const endpoint = `${baseUrl}/order/import/`;

  const sendCCRequest = async (payload) => {
    console.log(`[CheckoutChamp CRM API] POST ${endpoint}`);
    console.log("[CheckoutChamp CRM API] Payload:", JSON.stringify({ ...payload, cardNumber: `***${cardNum.slice(-4)}` }, null, 2));

    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({ statusText: res.statusText }));
    console.log(`[CheckoutChamp CRM API] Status: ${res.status}`, JSON.stringify(data, null, 2));

    const isSuccess =
      res.ok &&
      (data?.result === "SUCCESS" ||
        data?.result === "APPROVED" ||
        String(data?.result).toUpperCase() === "SUCCESS");

    if (!isSuccess) {
      const errMsg =
        typeof data?.message === "string"
          ? data.message
          : data?.message?.errorMessage ||
            data?.error ||
            data?.result ||
            `CheckoutChamp error (HTTP ${res.status})`;
      const err = new Error(errMsg);
      err.data = data;
      err.status = res.status;
      throw err;
    }
    return data;
  };

  try {
    const data = await sendCCRequest(initialPayload);
    const orderId =
      data?.message?.orderId ||
      data?.orderId ||
      data?.message?.order_id ||
      `CC-ORD-${Date.now()}`;

    if (orderData?.couponCode) {
      incrementCouponUsageService(orderData.couponCode).catch(() => {});
    }

    return {
      success: true,
      vrioOrderId: String(orderId),
      crmOrderId: String(orderId),
      crmProvider: "checkoutchamp",
      crmResponse: data,
      campaignIdUsed: Number(primaryCampaignId),
      retriedWithPrepaidCampaign: false,
    };
  } catch (err) {
    const errorDetails = err?.data || err?.message || err;
    console.error("[CheckoutChamp CRM API] Error:", errorDetails);

    if (
      isPrepaidCardError(errorDetails) &&
      prepaidCampaignId &&
      Number(prepaidCampaignId) !== Number(primaryCampaignId)
    ) {
      console.warn(
        `[CheckoutChamp CRM] Prepaid card decline on Campaign #${primaryCampaignId}. Retrying with Prepaid Campaign #${prepaidCampaignId}...`
      );
      try {
        const retryPayload = buildCCPayload(prepaidCampaignId);
        const retryData = await sendCCRequest(retryPayload);
        const orderId =
          retryData?.message?.orderId ||
          retryData?.orderId ||
          retryData?.message?.order_id ||
          `CC-PREPAID-${Date.now()}`;
        if (orderData?.couponCode) {
          incrementCouponUsageService(orderData.couponCode).catch(() => {});
        }
        return {
          success: true,
          vrioOrderId: String(orderId),
          crmOrderId: String(orderId),
          crmProvider: "checkoutchamp",
          crmResponse: retryData,
          campaignIdUsed: Number(prepaidCampaignId),
          retriedWithPrepaidCampaign: true,
        };
      } catch (retryErr) {
        if (settings.isTestMode) {
          const fallbackOrderId = `CC-PREPAID-SANDBOX-${Date.now()}`;
          return {
            success: false,
            vrioOrderId: fallbackOrderId,
            crmOrderId: fallbackOrderId,
            crmProvider: "checkoutchamp",
            crmResponse: { error: retryErr?.data || retryErr?.message || retryErr, fallbackOrderId },
          };
        }
        throw retryErr;
      }
    }

    if (settings.isTestMode) {
      const fallbackOrderId = `CC-SANDBOX-${Date.now()}`;
      return {
        success: false,
        vrioOrderId: fallbackOrderId,
        crmOrderId: fallbackOrderId,
        crmProvider: "checkoutchamp",
        crmResponse: {
          error: errorDetails,
          fallbackOrderId,
        },
      };
    }
    throw err;
  }
};

/**
 * Universal CRM Order Router
 * Dispatches to the active CRM provider chosen in Admin Settings
 */
export const processCrmOrderService = async (orderData = {}) => {
  const settings = await getCrmSettingsService();
  const provider = (settings.crmProvider || "vrio").toLowerCase();

  console.log(`[CRM Order Router] Active CRM Provider: ${provider}`);

  if (provider === "sticky") {
    return processStickyOrderService(orderData, settings);
  }
  if (provider === "checkoutchamp") {
    return processCheckoutChampOrderService(orderData, settings);
  }
  return processVrioOrderInternalService(orderData, settings);
};

// Backward-compatible alias for existing imports
export const processVrioOrderService = processCrmOrderService;

