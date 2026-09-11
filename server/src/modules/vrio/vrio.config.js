import mongoose from "mongoose";
import { CrmSettings } from "../../pharmacy/crmSettings.model.js";

/**
 * Vrio CRM Integration Configuration
 * 
 * Dynamically resolves configuration parameters with priority:
 * 1. Explicit per-request overrides
 * 2. Admin CRM Settings from Database (CrmSettings)
 * 3. Environment variables (process.env)
 * 4. Safe defaults
 */
export const getVrioConfig = async (overrides = {}) => {
  let adminSettings = null;
  if (mongoose.connection && mongoose.connection.readyState === 1) {
    try {
      adminSettings = await CrmSettings.findOne().lean();
    } catch (err) {
      console.warn("Could not load CrmSettings from DB, using fallback:", err.message);
    }
  }

  const apiKey =
    overrides.apiKey ||
    (adminSettings?.apiKey && adminSettings.apiKey.trim()) ||
    process.env.VRIO_API_KEY ||
    "";

  const baseUrl =
    overrides.baseUrl ||
    process.env.VRIO_BASE_URL ||
    "https://api.vrio.app";

  const connectionId = Number(
    overrides.connectionId ??
    adminSettings?.connectionId ??
    process.env.VRIO_CONNECTION_ID ??
    1
  );

  const campaignId = Number(
    overrides.campaignId ??
    adminSettings?.campaignId ??
    process.env.VRIO_CAMPAIGN_ID ??
    1
  );

  const routeId = Number(
    overrides.routeId ??
    adminSettings?.routeId ??
    process.env.VRIO_ROUTE_ID ??
    1
  );

  const shippingProfileId = Number(
    overrides.shippingProfileId ??
    adminSettings?.shippingProfileId ??
    process.env.VRIO_SHIPPING_PROFILE_ID ??
    1
  );

  const paymentMethodId = Number(
    overrides.paymentMethodId ??
    adminSettings?.paymentMethodId ??
    process.env.VRIO_PAYMENT_METHOD_ID ??
    1
  );

  const defaultAction =
    overrides.action ||
    adminSettings?.action ||
    process.env.VRIO_DEFAULT_ACTION ||
    "process";

  return {
    apiKey,
    baseUrl,
    connectionId,
    campaignId,
    routeId,
    shippingProfileId,
    paymentMethodId,
    defaultAction,
  };
};

export default getVrioConfig;
