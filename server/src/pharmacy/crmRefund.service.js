import AppError from "../shared/errors/AppError.js";
import { getCrmSettingsService } from "./vrio.service.js";

/**
 * Refunds a paid order through the CRM that charged it.
 *
 * Only Vrio is automated (contract: POST /transactions/{id}/refund in the
 * bundled Vrio OpenAPI spec). Sticky.io and CheckoutChamp refunds must be
 * issued in their dashboards and then marked refunded in the admin.
 */

const SALE_TYPE_IDS = new Set([1, 7]); // 1 = Sale, 7 = Capture

const vrioRequest = async (settings, method, pathAndQuery, body) => {
  const apiKey = (settings.apiKey && settings.apiKey.trim()) || process.env.VRIO_API_KEY?.trim() || "";
  if (!apiKey) throw AppError.badRequest("Vrio API key is not configured.");

  const baseUrl = (process.env.VRIO_BASE_URL || "https://api.vrio.app").replace(/\/+$/, "");
  const res = await fetch(`${baseUrl}${pathAndQuery}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "X-Api-Key": apiKey,
      Authorization: apiKey.startsWith("Bearer ") ? apiKey : `Bearer ${apiKey}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = data?.error?.message || data?.message || data?.error || `Vrio API error (HTTP ${res.status})`;
    throw new AppError(`Vrio refund failed: ${typeof message === "string" ? message : JSON.stringify(message)}`, 502);
  }
  return data;
};

const toMoney = (value) => Math.round(Number(value || 0) * 100) / 100;

/**
 * @returns {Promise<{ provider: string, amount: number, transactionIds: string[], responses: object[] }>}
 */
export const refundOrderViaCrmService = async (order) => {
  const settings = await getCrmSettingsService();
  const provider = (settings.crmProvider || "vrio").toLowerCase();

  if (provider !== "vrio") {
    throw AppError.badRequest(
      `Automatic refunds are only available for Vrio. Refund this order in ${provider === "sticky" ? "sticky.io" : "CheckoutChamp"}, then use "Mark refunded".`
    );
  }

  const vrioOrderId = String(order.vrioOrderId || "");
  if (!/^\d+$/.test(vrioOrderId)) {
    throw AppError.badRequest(
      "This order was not charged through a live Vrio order (offline / test mode), so there is nothing to refund automatically."
    );
  }

  const amountToRefund = toMoney(order.totalAmount);
  if (amountToRefund <= 0) {
    throw AppError.badRequest("This order has no charged amount to refund.");
  }

  const search = await vrioRequest(
    settings,
    "GET",
    `/transactions?order_id=${encodeURIComponent(vrioOrderId)}&transaction_success=true&limit=50`
  );
  const transactions = (search?.transactions || search?.data || [])
    .filter((t) => SALE_TYPE_IDS.has(Number(t.transaction_type_id)))
    .sort((a, b) => Number(b.transaction_total || 0) - Number(a.transaction_total || 0));

  if (transactions.length === 0) {
    throw AppError.badRequest(`No successful charge was found in Vrio for order #${vrioOrderId}.`);
  }

  let remaining = amountToRefund;
  const transactionIds = [];
  const responses = [];
  for (const transaction of transactions) {
    if (remaining <= 0) break;
    const refundAmount = toMoney(Math.min(remaining, Number(transaction.transaction_total || 0)));
    if (refundAmount <= 0) continue;

    const response = await vrioRequest(settings, "POST", `/transactions/${transaction.transaction_id}/refund`, {
      refund_amount: refundAmount.toFixed(2),
      cancel_active_shipment: true,
      transaction_notes: `Refund for TeleClinic order ${order._id} (cancelled by admin).`,
    });
    remaining = toMoney(remaining - refundAmount);
    transactionIds.push(String(transaction.transaction_id));
    responses.push(response);
  }

  return { provider: "vrio", amount: toMoney(amountToRefund - remaining), transactionIds, responses };
};
