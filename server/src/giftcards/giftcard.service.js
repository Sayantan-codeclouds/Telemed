import GiftCard from "./giftcard.model.js";
import AppError from "../shared/errors/AppError.js";
import { getCrmSettingsService } from "../pharmacy/vrio.service.js";

const getVrioHeaders = async (customKey) => {
  let apiKey = customKey && customKey.trim();
  if (!apiKey) {
    try {
      const settings = await getCrmSettingsService();
      apiKey = (settings?.apiKey && settings.apiKey.trim()) || "";
    } catch {
      apiKey = (process.env.VRIO_API_KEY && process.env.VRIO_API_KEY.trim()) || "";
    }
  }

  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  if (apiKey) {
    headers["X-Api-Key"] = apiKey;
    headers["Authorization"] = apiKey.startsWith("Bearer ") ? apiKey : `Bearer ${apiKey}`;
  }

  return { headers, apiKey };
};

const getBaseUrl = () => {
  return (process.env.VRIO_BASE_URL || "https://api.vrio.app").replace(/\/+$/, "");
};

/**
 * List / Search gift cards from Vrio & Local DB
 */
export const getGiftCardsService = async (query = {}) => {
  const { headers } = await getVrioHeaders();
  const baseUrl = getBaseUrl();
  const endpoint = `${baseUrl}/gift_cards`;

  try {
    const res = await fetch(endpoint, {
      method: "GET",
      headers,
    });

    if (res.ok) {
      const data = await res.json();
      const vrioCards = data?.data || data?.gift_cards || (Array.isArray(data) ? data : []);

      // Sync into MongoDB
      for (const card of vrioCards) {
        const giftCardId = card?.gift_card_id || card?.id;
        const code = card?.gift_card_code || card?.code;
        if (code) {
          await GiftCard.findOneAndUpdate(
            { $or: [{ vrioGiftCardId: giftCardId }, { giftCardCode: code.toUpperCase() }] },
            {
              vrioGiftCardId: giftCardId,
              giftCardCode: code.toUpperCase(),
              totalAmount: Number(card?.gift_card_total || card?.total || 0),
              balanceAmount: Number(card?.gift_card_balance || card?.balance || card?.gift_card_total || 0),
              dateExpire: card?.date_expire ? new Date(card.date_expire) : null,
              isActive: card?.gift_card_active !== undefined ? Boolean(card.gift_card_active) : true,
              notes: card?.gift_card_notes || "",
              vrioRawResponse: card,
            },
            { upsert: true, new: true }
          ).catch(() => {});
        }
      }
    }
  } catch (err) {
    console.warn("[GiftCard Service] Vrio sync warning:", err.message);
  }

  // Return list from DB
  const filter = {};
  if (query.status === "ACTIVE") filter.isActive = true;
  if (query.status === "INACTIVE") filter.isActive = false;

  const cards = await GiftCard.find(filter).sort({ createdAt: -1 });
  return cards;
};

/**
 * Get a single gift card by ID (Local DB or Vrio ID)
 */
export const getGiftCardByIdService = async (id) => {
  let card = await GiftCard.findById(id).catch(() => null);
  if (!card && !isNaN(Number(id))) {
    card = await GiftCard.findOne({ vrioGiftCardId: Number(id) });
  }

  if (!card) throw AppError.notFound("Gift card not found.");

  // Fetch live from Vrio if vrioGiftCardId exists
  if (card.vrioGiftCardId) {
    try {
      const { headers } = await getVrioHeaders();
      const res = await fetch(`${getBaseUrl()}/gift_cards/${card.vrioGiftCardId}`, {
        method: "GET",
        headers,
      });
      if (res.ok) {
        const liveData = await res.json();
        const data = liveData?.data || liveData;
        card.balanceAmount = Number(data?.gift_card_balance ?? card.balanceAmount);
        card.isActive = data?.gift_card_active !== undefined ? Boolean(data.gift_card_active) : card.isActive;
        await card.save();
      }
    } catch (e) {
      console.warn("Live gift card refresh error:", e.message);
    }
  }

  return card;
};

/**
 * Add gift card (POST https://api.vrio.app/gift_cards)
 */
export const createGiftCardService = async (data) => {
  const { gift_card_total, date_expire, gift_card_notes, apiKey: customKey } = data;

  if (!gift_card_total || Number(gift_card_total) <= 0) {
    throw AppError.badRequest("Please provide a valid total amount for the gift card.");
  }

  const { headers } = await getVrioHeaders(customKey);
  const baseUrl = getBaseUrl();
  const endpoint = `${baseUrl}/gift_cards`;

  const totalStr = Number(gift_card_total).toFixed(2);
  const vrioPayload = {
    gift_card_total: totalStr,
    ...(date_expire ? { date_expire: new Date(date_expire).toISOString().slice(0, 19).replace("T", " ") } : {}),
    ...(gift_card_notes ? { gift_card_notes: String(gift_card_notes).trim() } : {}),
  };

  console.log(`[Vrio GiftCard API] POST ${endpoint}:`, vrioPayload);

  let vrioResponse = null;
  let vrioGiftCardId = null;
  let giftCardCode = `GC-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${Date.now().toString().slice(-4)}`;

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify(vrioPayload),
    });

    const resData = await res.json().catch(() => ({ statusText: res.statusText }));
    console.log(`[Vrio GiftCard API] Status ${res.status}:`, resData);

    if (!res.ok) {
      const errMsg = resData?.error?.message || resData?.message || `Vrio API error (${res.status})`;
      throw new Error(errMsg);
    }

    vrioResponse = resData?.data || resData;
    vrioGiftCardId = vrioResponse?.gift_card_id || vrioResponse?.id || null;
    if (vrioResponse?.gift_card_code || vrioResponse?.code) {
      giftCardCode = (vrioResponse.gift_card_code || vrioResponse.code).toUpperCase();
    }
  } catch (err) {
    console.warn("[GiftCard Service] Vrio create call failed:", err.message);
    // If not able to reach Vrio or in test environment, still register local record
  }

  const giftCard = await GiftCard.create({
    vrioGiftCardId,
    giftCardCode,
    totalAmount: Number(gift_card_total),
    balanceAmount: Number(gift_card_total),
    dateExpire: date_expire ? new Date(date_expire) : null,
    isActive: true,
    notes: gift_card_notes ? String(gift_card_notes).trim() : "",
    vrioRawResponse: vrioResponse,
  });

  return giftCard;
};

/**
 * Edit gift card (PATCH https://api.vrio.app/gift_cards/{gift_card_id})
 */
export const updateGiftCardService = async (id, data) => {
  const card = await getGiftCardByIdService(id);

  const { gift_card_total, date_expire, gift_card_active, gift_card_notes, apiKey: customKey } = data;

  const patchPayload = {};
  if (gift_card_total !== undefined && Number(gift_card_total) >= 0) {
    patchPayload.gift_card_total = Number(gift_card_total).toFixed(2);
    card.totalAmount = Number(gift_card_total);
  }
  if (date_expire !== undefined) {
    patchPayload.date_expire = date_expire
      ? new Date(date_expire).toISOString().slice(0, 19).replace("T", " ")
      : null;
    card.dateExpire = date_expire ? new Date(date_expire) : null;
  }
  if (gift_card_active !== undefined) {
    patchPayload.gift_card_active = Boolean(gift_card_active);
    card.isActive = Boolean(gift_card_active);
  }
  if (gift_card_notes !== undefined) {
    patchPayload.gift_card_notes = String(gift_card_notes).trim();
    card.notes = String(gift_card_notes).trim();
  }

  if (card.vrioGiftCardId) {
    try {
      const { headers } = await getVrioHeaders(customKey);
      const endpoint = `${getBaseUrl()}/gift_cards/${card.vrioGiftCardId}`;
      console.log(`[Vrio GiftCard API] PATCH ${endpoint}:`, patchPayload);

      const res = await fetch(endpoint, {
        method: "PATCH",
        headers,
        body: JSON.stringify(patchPayload),
      });
      const resData = await res.json().catch(() => ({ statusText: res.statusText }));
      console.log(`[Vrio GiftCard API] PATCH Status ${res.status}:`, resData);
      card.vrioRawResponse = resData?.data || resData;
    } catch (err) {
      console.warn("[GiftCard Service] Vrio PATCH error:", err.message);
    }
  }

  await card.save();
  return card;
};

/**
 * Delete gift card (DELETE https://api.vrio.app/gift_cards/{gift_card_id})
 */
export const deleteGiftCardService = async (id) => {
  const card = await getGiftCardByIdService(id);

  if (card.vrioGiftCardId) {
    try {
      const { headers } = await getVrioHeaders();
      const endpoint = `${getBaseUrl()}/gift_cards/${card.vrioGiftCardId}`;
      console.log(`[Vrio GiftCard API] DELETE ${endpoint}`);

      const res = await fetch(endpoint, {
        method: "DELETE",
        headers,
      });
      const resData = await res.json().catch(() => ({ statusText: res.statusText }));
      console.log(`[Vrio GiftCard API] DELETE Status ${res.status}:`, resData);
    } catch (err) {
      console.warn("[GiftCard Service] Vrio DELETE error:", err.message);
    }
  }

  await GiftCard.findByIdAndDelete(card._id);
  return { success: true, message: `Gift Card "${card.giftCardCode}" deleted successfully.` };
};

/**
 * Validate and apply gift card in patient checkout
 */
export const validateAndApplyGiftCardService = async ({ code, orderTotal }) => {
  if (!code || !code.trim()) {
    throw AppError.badRequest("Please enter a valid gift card code.");
  }

  const cleanCode = code.trim().toUpperCase();
  let card = await GiftCard.findOne({ giftCardCode: cleanCode });

  // If not found in local DB, attempt fetch from Vrio CRM
  if (!card) {
    try {
      const { headers } = await getVrioHeaders();
      const res = await fetch(`${getBaseUrl()}/gift_cards`, { method: "GET", headers });
      if (res.ok) {
        const data = await res.json();
        const vrioCards = data?.data || data?.gift_cards || (Array.isArray(data) ? data : []);
        const match = vrioCards.find((c) => (c?.gift_card_code || c?.code)?.toUpperCase() === cleanCode);
        if (match) {
          card = await GiftCard.create({
            vrioGiftCardId: match.gift_card_id || match.id,
            giftCardCode: cleanCode,
            totalAmount: Number(match.gift_card_total || match.total || 0),
            balanceAmount: Number(match.gift_card_balance || match.balance || match.gift_card_total || 0),
            dateExpire: match.date_expire ? new Date(match.date_expire) : null,
            isActive: match.gift_card_active !== undefined ? Boolean(match.gift_card_active) : true,
            notes: match.gift_card_notes || "",
            vrioRawResponse: match,
          });
        }
      }
    } catch (e) {
      console.warn("Live Vrio search error:", e.message);
    }
  }

  if (!card) {
    throw AppError.notFound(`Gift Card "${cleanCode}" was not found.`);
  }

  if (!card.isActive) {
    throw AppError.badRequest(`Gift Card "${cleanCode}" is inactive or disabled.`);
  }

  if (card.dateExpire && new Date(card.dateExpire) < new Date()) {
    throw AppError.badRequest(`Gift Card "${cleanCode}" expired on ${new Date(card.dateExpire).toLocaleDateString()}.`);
  }

  const availableBalance = Number(card.balanceAmount !== undefined ? card.balanceAmount : card.totalAmount);
  if (availableBalance <= 0) {
    throw AppError.badRequest(`Gift Card "${cleanCode}" has $0.00 remaining balance.`);
  }

  // Calculate amount to apply (up to the order total or available balance)
  const applyAmount = Math.min(availableBalance, Number(orderTotal) || 0);

  return {
    valid: true,
    code: card.giftCardCode,
    totalAmount: card.totalAmount,
    availableBalance,
    applyAmount: Math.round(applyAmount * 100) / 100,
    message: `🎁 Gift Card applied! Covered $${applyAmount.toFixed(2)} with gift card balance.`,
  };
};
