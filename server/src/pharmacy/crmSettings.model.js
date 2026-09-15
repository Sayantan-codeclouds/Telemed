import mongoose from "mongoose";

const crmSettingsSchema = new mongoose.Schema(
  {
    apiKey: {
      type: String,
      default: "",
      trim: true,
    },
    campaignId: {
      type: Number,
      default: 1,
    },
    prepaidCampaignId: {
      type: Number,
      default: null,
    },
    connectionId: {
      type: Number,
      default: 1,
    },
    routeId: {
      type: Number,
      default: 1,
    },
    shippingProfileId: {
      type: Number,
      default: 1,
    },
    paymentMethodId: {
      type: Number,
      default: 1,
    },
    cardTypeId: {
      type: Number,
      default: 1,
    },
    action: {
      type: String,
      default: "process",
    },
    consultationItemId: {
      type: Number,
      default: 3366,
    },
    consultationOfferId: {
      type: Number,
      default: 29,
    },
    consultationCampaignId: {
      type: Number,
      default: null,
    },
    // Multi-CRM Gateway Selector
    crmProvider: {
      type: String,
      enum: ["vrio", "sticky", "checkoutchamp"],
      default: "vrio",
      trim: true,
    },
    // sticky.io Configuration
    stickyDomain: {
      type: String,
      default: "",
      trim: true,
    },
    stickyUsername: {
      type: String,
      default: "",
      trim: true,
    },
    stickyPassword: {
      type: String,
      default: "",
      trim: true,
    },
    stickyCampaignId: {
      type: Number,
      default: 1,
    },
    stickyPrepaidCampaignId: {
      type: Number,
      default: null,
    },
    stickyShippingId: {
      type: Number,
      default: 1,
    },
    stickyOfferId: {
      type: Number,
      default: 29,
    },
    stickyBillingModelId: {
      type: Number,
      default: 2,
    },
    stickyConsultationCampaignId: {
      type: Number,
      default: 1,
    },
    stickyConsultationProductId: {
      type: Number,
      default: 29,
    },
    stickyConsultationShippingId: {
      type: Number,
      default: 1,
    },
    stickyConsultationBillingModelId: {
      type: Number,
      default: 2,
    },
    // CheckoutChamp (Konnektive) Configuration
    checkoutChampLoginId: {
      type: String,
      default: "",
      trim: true,
    },
    checkoutChampPassword: {
      type: String,
      default: "",
      trim: true,
    },
    checkoutChampCampaignId: {
      type: Number,
      default: 1,
    },
    checkoutChampPrepaidCampaignId: {
      type: Number,
      default: null,
    },
    checkoutChampProductId: {
      type: Number,
      default: 1,
    },
    checkoutChampShippingId: {
      type: Number,
      default: 1,
    },
    checkoutChampCustomBaseUrl: {
      type: String,
      default: "https://api.checkoutchamp.com",
      trim: true,
    },
    checkoutChampConsultationCampaignId: {
      type: Number,
      default: 1,
    },
    checkoutChampConsultationProductId: {
      type: Number,
      default: 3366,
    },
    checkoutChampConsultationShippingId: {
      type: Number,
      default: 1,
    },
    currencySign: {
      type: String,
      default: "$",
      trim: true,
    },
    supportEmail: {
      type: String,
      default: "sayantan.das@codeclouds.com",
      trim: true,
    },
    doctorSupportEmail: {
      type: String,
      default: "sayantan.das@codeclouds.com",
      trim: true,
    },
    isEnabled: {
      type: Boolean,
      default: true,
    },
    isTestMode: {
      type: Boolean,
      default: false,
    },
    resendApiKey: {
      type: String,
      default: "",
      trim: true,
    },
    resendFromEmail: {
      type: String,
      default: "TeleClinic Support <noreply@sayantandas.in>",
      trim: true,
    },
    // Multi-provider email configuration
    mailProvider: {
      type: String,
      enum: ["resend", "sendgrid", "postmark", "smtp"],
      default: "resend",
      trim: true,
    },
    mailApiKey: {
      type: String,
      default: "",
      trim: true,
    },
    mailFromEmail: {
      type: String,
      default: "TeleClinic Support <noreply@sayantandas.in>",
      trim: true,
    },
    smtpHost: {
      type: String,
      default: "",
      trim: true,
    },
    smtpPort: {
      type: Number,
      default: 587,
    },
    smtpUser: {
      type: String,
      default: "",
      trim: true,
    },
    smtpPass: {
      type: String,
      default: "",
      trim: true,
    },
    smtpSecure: {
      type: Boolean,
      default: false,
    },
    // Multi-provider AI configuration
    aiProvider: {
      type: String,
      enum: ["groq", "openai", "gemini", "custom"],
      default: "groq",
      trim: true,
    },
    aiApiKey: {
      type: String,
      default: "",
      trim: true,
    },
    aiModel: {
      type: String,
      default: "",
      trim: true,
    },
    aiCustomBaseUrl: {
      type: String,
      default: "",
      trim: true,
    },
    groqApiKey: {
      type: String,
      default: "",
      trim: true,
    },
    // Public Deployment URLs for Outgoing Emails & Assets
    frontendUrl: {
      type: String,
      default: "",
      trim: true,
    },
    appUrl: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const CrmSettings = mongoose.model("CrmSettings", crmSettingsSchema);
