import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Key, Layers, CheckCircle2, Loader2, Save, RefreshCw, Zap,
  ShieldCheck, ToggleLeft, ToggleRight, Info, Mail, LifeBuoy,
  Sparkles, Video, Bot, Settings, Send, Server, Check, ExternalLink,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import adminApi from "@/api/adminApi";

const TABS = [
  { id: "general", label: "General",     icon: Settings,  colorClass: "text-indigo-600" },
  { id: "mail",    label: "Mail",        icon: Mail,      colorClass: "text-violet-600" },
  { id: "ai",      label: "AI Settings", icon: Bot,       colorClass: "text-orange-600" },
  { id: "crm",     label: "CRM Gateway", icon: Zap,       colorClass: "text-blue-600"   },
];

const CRM_PROVIDERS = [
  {
    id: "vrio",
    name: "Vrio CRM",
    tagline: "High-Volume Direct Processing",
    desc: "Direct multi-campaign gateway with intelligent prepaid card fallback and automated routing.",
    badge: "Integrated",
    badgeClass: "bg-blue-100 text-blue-700 border-blue-200",
    activeRing: "border-blue-500 bg-blue-50/50 ring-2 ring-blue-500/20",
    iconBg: "bg-blue-600",
    docsUrl: "https://api.vrio.app",
    docsLabel: "api.vrio.app",
  },
  {
    id: "sticky",
    name: "sticky.io",
    tagline: "Subscription & E-Commerce CRM",
    desc: "Enterprise billing platform with flexible offers, recurring billing models, and campaign management.",
    badge: "Enterprise CRM",
    badgeClass: "bg-emerald-100 text-emerald-700 border-emerald-200",
    activeRing: "border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/20",
    iconBg: "bg-emerald-600",
    docsUrl: "https://sticky.io",
    docsLabel: "sticky.io API Docs",
  },
  {
    id: "checkoutchamp",
    name: "CheckoutChamp",
    tagline: "Konnektive Engine",
    desc: "Optimized conversion funnel engine with high-performance order import and multi-pay source support.",
    badge: "Konnektive",
    badgeClass: "bg-violet-100 text-violet-700 border-violet-200",
    activeRing: "border-violet-500 bg-violet-50/50 ring-2 ring-violet-500/20",
    iconBg: "bg-violet-600",
    docsUrl: "https://checkoutchamp.com",
    docsLabel: "checkoutchamp.com",
  },
];

const CURRENCY_PRESETS = [
  { l: "$ USD", s: "$" }, { l: "€ EUR", s: "€" }, { l: "£ GBP", s: "£" },
  { l: "₹ INR", s: "₹" }, { l: "C$",    s: "C$" }, { l: "A$",   s: "A$" },
];

const MAIL_PROVIDERS = [
  {
    id: "resend",
    name: "Resend",
    tagline: "Modern Email for Developers",
    desc: "Ultra-fast developer-first REST API with high deliverability and easy domain verification.",
    badge: "Recommended",
    badgeClass: "bg-violet-100 text-violet-700 border-violet-200",
    activeRing: "border-violet-500 bg-violet-50/50 ring-2 ring-violet-500/20",
    iconBg: "bg-violet-600",
    keyLabel: "Resend API Key",
    keyPlaceholder: "re_xxxxxxxxxxxxxxxxxxxxxxxx",
    docsUrl: "https://resend.com/api-keys",
    docsLabel: "resend.com/api-keys",
  },
  {
    id: "sendgrid",
    name: "SendGrid",
    tagline: "Twilio SendGrid v3 API",
    desc: "Enterprise transactional email infrastructure powered by Twilio's proven mail network.",
    badge: "Enterprise",
    badgeClass: "bg-blue-100 text-blue-700 border-blue-200",
    activeRing: "border-blue-500 bg-blue-50/50 ring-2 ring-blue-500/20",
    iconBg: "bg-blue-600",
    keyLabel: "SendGrid API Key",
    keyPlaceholder: "SG.xxxxxxxxxxxxxxxxxxxxxx",
    docsUrl: "https://app.sendgrid.com/settings/api_keys",
    docsLabel: "sendgrid.com/settings/api_keys",
  },
  {
    id: "postmark",
    name: "Postmark",
    tagline: "ActiveCampaign Postmark",
    desc: "Top-tier lightning inbox delivery dedicated exclusively to mission-critical transactional emails.",
    badge: "Fast Delivery",
    badgeClass: "bg-amber-100 text-amber-800 border-amber-200",
    activeRing: "border-amber-500 bg-amber-50/50 ring-2 ring-amber-500/20",
    iconBg: "bg-amber-600",
    keyLabel: "Postmark Server API Token",
    keyPlaceholder: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
    docsUrl: "https://account.postmarkapp.com/servers",
    docsLabel: "postmarkapp.com/servers",
  },
  {
    id: "smtp",
    name: "Custom SMTP",
    tagline: "Universal SMTP Gateway",
    desc: "Connect any standard mail server: Amazon SES, Brevo, Mailgun, Google Workspace, etc.",
    badge: "Universal",
    badgeClass: "bg-emerald-100 text-emerald-800 border-emerald-200",
    activeRing: "border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/20",
    iconBg: "bg-emerald-600",
    keyLabel: null,
    docsUrl: null,
  },
];

const AI_PROVIDERS = [
  {
    id: "groq",
    name: "Groq LPU",
    tagline: "Ultra-Fast Inference",
    desc: "Blazing-fast sub-second token generation on Groq LPU hardware. Lowest latency for health chat.",
    badge: "Ultra Fast",
    badgeClass: "bg-orange-100 text-orange-800 border-orange-200",
    activeRing: "border-orange-500 bg-orange-50/50 ring-2 ring-orange-500/20",
    iconBg: "bg-orange-600",
    keyLabel: "Groq Cloud API Key",
    keyPlaceholder: "gsk_xxxxxxxxxxxxxxxxxxxxxxxx",
    docsUrl: "https://console.groq.com/keys",
    docsLabel: "console.groq.com/keys",
    defaultModel: "openai/gpt-oss-120b",
    modelPresets: [
      { name: "GPT-OSS 120B (Reasoning)", id: "openai/gpt-oss-120b" },
      { name: "GPT-OSS 20B (Fast)", id: "openai/gpt-oss-20b" },
      { name: "Qwen 3.8 27B", id: "qwen/qwen3.8-27b" },
      { name: "Groq Compound", id: "groq/compound" },
    ],
  },
  {
    id: "openai",
    name: "OpenAI / ChatGPT",
    tagline: "Industry-Standard Intelligence",
    desc: "Highest clinical accuracy, reliable structured JSON, and empathetic conversation.",
    badge: "Most Accurate",
    badgeClass: "bg-emerald-100 text-emerald-800 border-emerald-200",
    activeRing: "border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/20",
    iconBg: "bg-emerald-600",
    keyLabel: "OpenAI API Key",
    keyPlaceholder: "sk-proj-xxxxxxxxxxxxxxxxxxxxxxxx",
    docsUrl: "https://platform.openai.com/api-keys",
    docsLabel: "platform.openai.com/api-keys",
    defaultModel: "gpt-4o-mini",
    modelPresets: [
      { name: "GPT-4o Mini (Fast & Cheap)", id: "gpt-4o-mini" },
      { name: "GPT-4o (Clinical Flagship)", id: "gpt-4o" },
      { name: "o3-mini (Deep Reasoning)", id: "o3-mini" },
      { name: "GPT-4 Turbo", id: "gpt-4-turbo" },
    ],
  },
  {
    id: "gemini",
    name: "Google Gemini",
    tagline: "Massive Context & Multimodal",
    desc: "Up to 2M token context window, exceptionally strong for complex multi-page lab reports.",
    badge: "Huge Context",
    badgeClass: "bg-blue-100 text-blue-800 border-blue-200",
    activeRing: "border-blue-500 bg-blue-50/50 ring-2 ring-blue-500/20",
    iconBg: "bg-blue-600",
    keyLabel: "Google Gemini API Key",
    keyPlaceholder: "AIzaSyxxxxxxxxxxxxxxxxxxxxxxxx",
    docsUrl: "https://aistudio.google.com/app/apikey",
    docsLabel: "aistudio.google.com/app/apikey",
    defaultModel: "gemini-2.0-flash",
    modelPresets: [
      { name: "Gemini 2.0 Flash (Next-Gen)", id: "gemini-2.0-flash" },
      { name: "Gemini 1.5 Flash (Fast)", id: "gemini-1.5-flash" },
      { name: "Gemini 1.5 Pro (Deep Analysis)", id: "gemini-1.5-pro" },
    ],
  },
  {
    id: "custom",
    name: "Custom / OpenRouter",
    tagline: "OpenAI-Compatible Endpoint",
    desc: "Connect DeepSeek, OpenRouter, Together AI, Perplexity, or private local LLM servers.",
    badge: "Universal",
    badgeClass: "bg-purple-100 text-purple-800 border-purple-200",
    activeRing: "border-purple-500 bg-purple-50/50 ring-2 ring-purple-500/20",
    iconBg: "bg-purple-600",
    keyLabel: "API Key / Bearer Token",
    keyPlaceholder: "sk-xxxxxxxxxxxxxxxxxxxxxxxx",
    docsUrl: null,
    docsLabel: null,
    defaultModel: "deepseek-chat",
    modelPresets: [
      { name: "DeepSeek Chat", id: "deepseek-chat" },
      { name: "DeepSeek Reasoner (R1)", id: "deepseek-reasoner" },
      { name: "Claude 3.5 Sonnet (via OpenRouter)", id: "anthropic/claude-3.5-sonnet" },
    ],
  },
];

const DEFAULT_FORM = {
  apiKey: "", campaignId: 1, prepaidCampaignId: 2, routeId: 1,
  connectionId: 1, shippingProfileId: 1, paymentMethodId: 1, cardTypeId: 1,
  action: "process", currencySign: "$",
  supportEmail: "support@teleclinic.com",
  doctorSupportEmail: "support@teleclinic.com",
  isEnabled: true, isTestMode: false,
  // Multi-provider mail
  mailProvider: "resend",
  mailApiKey: "",
  mailFromEmail: "TeleClinic Support <noreply@teleclinic.com>",
  smtpHost: "",
  smtpPort: 587,
  smtpUser: "",
  smtpPass: "",
  smtpSecure: false,
  resendApiKey: "",
  resendFromEmail: "TeleClinic Support <noreply@teleclinic.com>",
  // Multi-provider AI
  aiProvider: "groq",
  aiApiKey: "",
  aiModel: "",
  aiCustomBaseUrl: "",
  groqApiKey: "",
  consultationItemId: 3366,
  consultationOfferId: 29,
  consultationCampaignId: "",
  // Multi-CRM Gateway Selector
  crmProvider: "vrio",
  // sticky.io Configuration
  stickyDomain: "",
  stickyUsername: "",
  stickyPassword: "",
  stickyCampaignId: 1,
  stickyPrepaidCampaignId: "",
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
  checkoutChampPrepaidCampaignId: "",
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

export default function AdminCrmSettings() {
  const [activeTab, setActiveTab] = useState("general");
  const [saving,    setSaving]    = useState(false);
  const [showApiKey,            setShowApiKey]            = useState(false);
  const [showMailApiKey,        setShowMailApiKey]        = useState(false);
  const [showSmtpPass,          setShowSmtpPass]          = useState(false);
  const [showAiApiKey,          setShowAiApiKey]          = useState(false);
  const [showStickyPass,        setShowStickyPass]        = useState(false);
  const [showCheckoutChampPass, setShowCheckoutChampPass] = useState(false);
  const [testEmail,        setTestEmail]        = useState("");
  const [sendingTestEmail, setSendingTestEmail] = useState(false);
  const [testingAi,        setTestingAi]        = useState(false);
  const [aiTestResult,     setAiTestResult]     = useState(null);
  const [formData, setFormData] = useState(DEFAULT_FORM);

  const transformSettings = (d) => {
    return {
          apiKey:              d.apiKey              || "",
          campaignId:          d.campaignId           ?? 1,
          prepaidCampaignId:   d.prepaidCampaignId    ?? 2,
          routeId:             d.routeId              ?? 1,
          connectionId:        d.connectionId         ?? 1,
          shippingProfileId:   d.shippingProfileId    ?? 1,
          paymentMethodId:     d.paymentMethodId      ?? 1,
          cardTypeId:          d.cardTypeId           ?? 1,
          action:              d.action              || "process",
          currencySign:        d.currencySign         || "$",
          supportEmail:        d.supportEmail         || "support@teleclinic.com",
          doctorSupportEmail:  d.doctorSupportEmail   || "support@teleclinic.com",
          isEnabled:           d.isEnabled            ?? true,
          isTestMode:          d.isTestMode           ?? false,
          mailProvider:        d.mailProvider         || "resend",
          mailApiKey:          d.mailApiKey           || d.resendApiKey || "",
          mailFromEmail:       d.mailFromEmail        || d.resendFromEmail || "TeleClinic Support <noreply@teleclinic.com>",
          smtpHost:            d.smtpHost             || "",
          smtpPort:            d.smtpPort             ?? 587,
          smtpUser:            d.smtpUser             || "",
          smtpPass:            d.smtpPass             || "",
          smtpSecure:          d.smtpSecure           ?? false,
          resendApiKey:        d.resendApiKey         || "",
          resendFromEmail:     d.resendFromEmail      || "TeleClinic Support <noreply@teleclinic.com>",
          aiProvider:          d.aiProvider           || "groq",
          aiApiKey:            d.aiApiKey             || d.groqApiKey || "",
          aiModel:             d.aiModel              || "",
          aiCustomBaseUrl:     d.aiCustomBaseUrl      || "",
          groqApiKey:          d.groqApiKey           || "",
          consultationItemId:  d.consultationItemId   ?? 3366,
          consultationOfferId: d.consultationOfferId  ?? 29,
          consultationCampaignId: d.consultationCampaignId || "",
          crmProvider:         d.crmProvider          || "vrio",
          stickyDomain:        d.stickyDomain         || "",
          stickyUsername:      d.stickyUsername       || "",
          stickyPassword:      d.stickyPassword       || "",
          stickyCampaignId:    d.stickyCampaignId     ?? 1,
          stickyPrepaidCampaignId: d.stickyPrepaidCampaignId || "",
          stickyShippingId:    d.stickyShippingId     ?? 1,
          stickyOfferId:       d.stickyOfferId        ?? 29,
          stickyBillingModelId: d.stickyBillingModelId ?? 2,
          stickyConsultationCampaignId: d.stickyConsultationCampaignId ?? 1,
          stickyConsultationProductId: d.stickyConsultationProductId ?? 29,
          stickyConsultationShippingId: d.stickyConsultationShippingId ?? 1,
          stickyConsultationBillingModelId: d.stickyConsultationBillingModelId ?? 2,
          checkoutChampLoginId: d.checkoutChampLoginId || "",
          checkoutChampPassword: d.checkoutChampPassword || "",
          checkoutChampCampaignId: d.checkoutChampCampaignId ?? 1,
          checkoutChampPrepaidCampaignId: d.checkoutChampPrepaidCampaignId || "",
          checkoutChampProductId: d.checkoutChampProductId ?? 1,
          checkoutChampShippingId: d.checkoutChampShippingId ?? 1,
          checkoutChampCustomBaseUrl: d.checkoutChampCustomBaseUrl || "https://api.checkoutchamp.com",
          checkoutChampConsultationCampaignId: d.checkoutChampConsultationCampaignId ?? 1,
          checkoutChampConsultationProductId: d.checkoutChampConsultationProductId ?? 3366,
      checkoutChampConsultationShippingId: d.checkoutChampConsultationShippingId ?? 1,
    };
  };

  const { data: settingsData, isLoading: loading, refetch: fetchSettings } = useQuery({
    queryKey: ["admin-crm-settings"],
    queryFn: async () => {
      const res = await adminApi.get("/admin/crm-settings");
      return res.data?.data || null;
    },
    meta: { errorMessage: "Failed to load settings." },
  });

  // Seed the editable form once when settings arrive, adjusting state
  // during render instead of via an effect.
  const [appliedSettingsData, setAppliedSettingsData] = useState(undefined);
  if (settingsData && settingsData !== appliedSettingsData) {
    setAppliedSettingsData(settingsData);
    setFormData(transformSettings(settingsData));
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  };
  const handleToggle = (k) => setFormData((p) => ({ ...p, [k]: !p[k] }));

  const handleSubmit = async (e) => {
    e?.preventDefault();
    try {
      setSaving(true);
      const res = await adminApi.put("/admin/crm-settings", {
        ...formData,
        campaignId:          Number(formData.campaignId),
        prepaidCampaignId:   formData.prepaidCampaignId ? Number(formData.prepaidCampaignId) : null,
        routeId:             Number(formData.routeId || 1),
        connectionId:        Number(formData.connectionId),
        shippingProfileId:   Number(formData.shippingProfileId),
        paymentMethodId:     Number(formData.paymentMethodId),
        cardTypeId:          Number(formData.cardTypeId),
        currencySign:        formData.currencySign?.trim()       || "$",
        supportEmail:        formData.supportEmail?.trim()       || "",
        doctorSupportEmail:  formData.doctorSupportEmail?.trim() || "",
        mailProvider:        formData.mailProvider               || "resend",
        mailApiKey:          formData.mailApiKey?.trim()         || "",
        mailFromEmail:       formData.mailFromEmail?.trim()      || "",
        smtpHost:            formData.smtpHost?.trim()           || "",
        smtpPort:            Number(formData.smtpPort || 587),
        smtpUser:            formData.smtpUser?.trim()           || "",
        smtpPass:            formData.smtpPass?.trim()           || "",
        smtpSecure:          Boolean(formData.smtpSecure),
        resendApiKey:        (formData.mailProvider === "resend" ? formData.mailApiKey : formData.resendApiKey)?.trim() || "",
        resendFromEmail:     formData.mailFromEmail?.trim()      || "",
        aiProvider:          formData.aiProvider                 || "groq",
        aiApiKey:            formData.aiApiKey?.trim()           || "",
        aiModel:             formData.aiModel?.trim()            || "",
        aiCustomBaseUrl:     formData.aiCustomBaseUrl?.trim()    || "",
        groqApiKey:          (formData.aiProvider === "groq" ? formData.aiApiKey : formData.groqApiKey)?.trim() || "",
        consultationItemId:  Number(formData.consultationItemId  || 3366),
        consultationOfferId: Number(formData.consultationOfferId || 29),
        consultationCampaignId: formData.consultationCampaignId ? Number(formData.consultationCampaignId) : null,
        crmProvider:         formData.crmProvider                || "vrio",
        stickyDomain:        formData.stickyDomain?.trim()       || "",
        stickyUsername:      formData.stickyUsername?.trim()     || "",
        stickyPassword:      formData.stickyPassword?.trim()     || "",
        stickyCampaignId:    Number(formData.stickyCampaignId    || 1),
        stickyPrepaidCampaignId: formData.stickyPrepaidCampaignId ? Number(formData.stickyPrepaidCampaignId) : null,
        stickyShippingId:    Number(formData.stickyShippingId    || 1),
        stickyOfferId:       Number(formData.stickyOfferId       || 29),
        stickyBillingModelId: Number(formData.stickyBillingModelId || 2),
        stickyConsultationCampaignId: Number(formData.stickyConsultationCampaignId || 1),
        stickyConsultationProductId: Number(formData.stickyConsultationProductId || 29),
        stickyConsultationShippingId: Number(formData.stickyConsultationShippingId || 1),
        stickyConsultationBillingModelId: Number(formData.stickyConsultationBillingModelId || 2),
        checkoutChampLoginId: formData.checkoutChampLoginId?.trim() || "",
        checkoutChampPassword: formData.checkoutChampPassword?.trim() || "",
        checkoutChampCampaignId: Number(formData.checkoutChampCampaignId || 1),
        checkoutChampPrepaidCampaignId: formData.checkoutChampPrepaidCampaignId ? Number(formData.checkoutChampPrepaidCampaignId) : null,
        checkoutChampProductId: Number(formData.checkoutChampProductId || 1),
        checkoutChampShippingId: Number(formData.checkoutChampShippingId || 1),
        checkoutChampCustomBaseUrl: formData.checkoutChampCustomBaseUrl?.trim() || "https://api.checkoutchamp.com",
        checkoutChampConsultationCampaignId: Number(formData.checkoutChampConsultationCampaignId || 1),
        checkoutChampConsultationProductId: Number(formData.checkoutChampConsultationProductId || 3366),
        checkoutChampConsultationShippingId: Number(formData.checkoutChampConsultationShippingId || 1),
      });
      const sign = formData.currencySign?.trim() || "$";
      localStorage.setItem("telemed_currency_sign", sign);
      window.dispatchEvent(new Event("currency-updated"));
      toast.success(res.data?.message || "Settings saved successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  const handleSendTestEmail = async (e) => {
    e?.preventDefault();
    if (!testEmail || !testEmail.includes("@")) {
      toast.error("Please enter a valid recipient email address for testing.");
      return;
    }
    try {
      setSendingTestEmail(true);
      const res = await adminApi.post("/admin/mail/test-email", { targetEmail: testEmail.trim() });
      toast.success(res.data?.message || "Test email dispatched successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send test email. Please verify provider credentials.");
    } finally {
      setSendingTestEmail(false);
    }
  };

  const handleTestAiConnection = async () => {
    try {
      setTestingAi(true);
      setAiTestResult(null);
      const res = await adminApi.post("/admin/ai/test-connection");
      setAiTestResult(res.data?.data);
      toast.success(res.data?.message || "AI connection test successful!");
    } catch (err) {
      toast.error(err.response?.data?.message || "AI connection test failed. Please verify credentials and save first.");
    } finally {
      setTestingAi(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        <p className="text-sm font-medium text-slate-500">Loading settings...</p>
      </div>
    );
  }

  const selectedProvider = MAIL_PROVIDERS.find((p) => p.id === (formData.mailProvider || "resend")) || MAIL_PROVIDERS[0];
  const selectedAiProvider = AI_PROVIDERS.find((p) => p.id === (formData.aiProvider || "groq")) || AI_PROVIDERS[0];
  const selectedCrmProvider = CRM_PROVIDERS.find((p) => p.id === (formData.crmProvider || "vrio")) || CRM_PROVIDERS[0];

  const mailOk = formData.mailProvider === "smtp"
    ? Boolean(formData.smtpHost?.trim() && formData.mailFromEmail?.trim())
    : Boolean((formData.mailApiKey?.trim() || formData.resendApiKey?.trim()) && formData.mailFromEmail?.trim());

  const aiOk = formData.aiProvider === "custom"
    ? Boolean(formData.aiCustomBaseUrl?.trim() || formData.aiApiKey?.trim())
    : Boolean(formData.aiApiKey?.trim() || formData.groqApiKey?.trim());

  const crmOk = formData.crmProvider === "sticky"
    ? Boolean(formData.stickyDomain?.trim() && formData.stickyUsername?.trim() && formData.stickyPassword?.trim())
    : formData.crmProvider === "checkoutchamp"
    ? Boolean(formData.checkoutChampLoginId?.trim() && formData.checkoutChampPassword?.trim())
    : true; // Vrio has built-in defaults

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Platform Settings</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage integrations, mail, AI, and CRM gateway configuration.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={fetchSettings} disabled={loading || saving} className="rounded-xl gap-2 font-bold h-10">
            <RefreshCw className="w-4 h-4" /> Reload
          </Button>
          <Button onClick={handleSubmit} disabled={saving} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl gap-2 font-bold h-10 shadow-lg shadow-indigo-600/20">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save All
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-1 bg-slate-100/80 p-1.5 rounded-2xl overflow-x-auto w-fit">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const hasDot = (tab.id === "mail" && !mailOk) || (tab.id === "ai" && !aiOk) || (tab.id === "crm" && !crmOk);
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                isActive ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800 hover:bg-white/50"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? tab.colorClass : ""}`} />
              {tab.label}
              {hasDot && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-rose-500 border-2 border-slate-100" />
              )}
            </button>
          );
        })}
      </div>

      {/* ── TAB: GENERAL ── */}
      {activeTab === "general" && (
        <div className="space-y-6">
          <Card className="rounded-2xl border-slate-200/80 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-indigo-600" />
              <h2 className="text-sm font-bold text-slate-900">Gateway Status &amp; Mode</h2>
            </div>
            <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
              {[
                { key: "isEnabled",  title: "Enable CRM Gateway",      desc: "Route pharmacy orders & consultations to active CRM on checkout.", ac: "border-indigo-600 bg-indigo-50/20", ic: "text-indigo-600" },
                { key: "isTestMode", title: "Sandbox / Test Mode",     desc: "Simulate transactions without charging live cards.", ac: "border-amber-500 bg-amber-50/20", ic: "text-amber-500" },
              ].map((item) => (
                <div key={item.key} onClick={() => handleToggle(item.key)}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition flex items-start justify-between ${formData[item.key] ? item.ac : "border-slate-200 bg-slate-50 hover:border-slate-300"}`}>
                  <div className="space-y-1 pr-4">
                    <span className="text-sm font-bold text-slate-900 block">{item.title}</span>
                    <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                  </div>
                  <span className={`transition ${formData[item.key] ? item.ic : "text-slate-300"}`}>
                    {formData[item.key] ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-slate-200/80 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-sm font-black text-indigo-600">
                  {formData.currencySign || "$"}
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Store Currency Symbol</h2>
                  <p className="text-xs text-slate-400">Controls the global symbol across pharmacy, cart and checkout.</p>
                </div>
              </div>
              <div className="px-3 py-1 bg-indigo-50 rounded-xl border border-indigo-100 text-xs font-bold text-indigo-700">
                Preview: {formData.currencySign || "$"}370.00
              </div>
            </div>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <Input name="currencySign" value={formData.currencySign} onChange={handleChange}
                  placeholder="$" maxLength={6}
                  className="rounded-xl font-bold text-base border-slate-200 text-center text-indigo-700 h-11 w-full sm:w-32" />
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-slate-400 font-medium">Presets:</span>
                  {CURRENCY_PRESETS.map((p) => (
                    <button key={p.s} type="button" onClick={() => setFormData((prev) => ({ ...prev, currencySign: p.s }))}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border cursor-pointer ${
                        formData.currencySign === p.s ? "bg-indigo-600 text-white border-indigo-600" : "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200"
                      }`}>{p.l}</button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-slate-200/80 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                <LifeBuoy className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">Help &amp; Support Contact Emails</h2>
                <p className="text-xs text-slate-400">Official addresses displayed to patients &amp; doctors.</p>
              </div>
            </div>
            <CardContent className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
              {[
                { name: "supportEmail",      label: "Patient Support Email",  ic: "text-indigo-600",  hint: "Shown in patient portal & confirmation emails." },
                { name: "doctorSupportEmail",label: "Doctor Support Email",   ic: "text-emerald-600", hint: "Shown in physician portal & clinical inquiries." },
              ].map((f) => (
                <div key={f.name}>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Mail className={`w-3.5 h-3.5 ${f.ic}`} /> {f.label}
                  </label>
                  <Input type="email" name={f.name} value={formData[f.name]} onChange={handleChange}
                    className="rounded-xl font-semibold border-slate-200 h-11" />
                  <span className="text-[11px] text-slate-400 mt-1 block">{f.hint}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Public Production Domains & URLs */}
          <Card className="rounded-2xl border-slate-200/80 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                  <ExternalLink className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Public Production Domains &amp; URLs</h2>
                  <p className="text-xs text-slate-400">Used in all outgoing emails, verification links, and prescription links instead of localhost.</p>
                </div>
              </div>
            </div>
            <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <ExternalLink className="w-3.5 h-3.5 text-blue-600" /> Live Frontend URL (Patient / Doctor Web App)
                </label>
                <Input
                  type="url"
                  name="frontendUrl"
                  value={formData.frontendUrl || ""}
                  onChange={handleChange}
                  placeholder="https://your-telemed.netlify.app or https://your-site.vercel.app"
                  className="rounded-xl font-semibold border-slate-200 h-11 text-xs"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  All email buttons (Verify Account, Reset Password, View Invoice) link to this domain.
                </span>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Server className="w-3.5 h-3.5 text-indigo-600" /> Backend API URL (Render Web Service)
                </label>
                <Input
                  type="url"
                  name="appUrl"
                  value={formData.appUrl || ""}
                  onChange={handleChange}
                  placeholder="https://telemed-zuls.onrender.com"
                  className="rounded-xl font-semibold border-slate-200 h-11 text-xs"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Used for uploaded lab reports, profile image assets, and API routes.
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── TAB: MAIL ── */}
      {activeTab === "mail" && (
        <div className="space-y-6">
          {/* Status Alert Banner */}
          <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border ${mailOk ? "bg-emerald-50 border-emerald-200" : "bg-amber-50 border-amber-200"}`}>
            <div className="flex items-start gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${mailOk ? "bg-emerald-600 text-white" : "bg-amber-500 text-white"}`}>
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <p className={`text-sm font-bold ${mailOk ? "text-emerald-900" : "text-amber-900"}`}>
                  {mailOk ? `${selectedProvider?.name || "Email Gateway"} Active & Ready` : "Email Gateway Incomplete"}
                </p>
                <p className={`text-xs mt-0.5 ${mailOk ? "text-emerald-700" : "text-amber-700"}`}>
                  {mailOk
                    ? `Transactional emails (confirmations, OTPs, invoices) will dispatch via ${selectedProvider?.name}.`
                    : `Provide the credentials for ${selectedProvider?.name || "your provider"} below to enable appointment alerts and receipts.`}
                </p>
              </div>
            </div>
            <Badge className={mailOk ? "bg-emerald-100 text-emerald-800 border-emerald-300 font-bold self-start sm:self-auto" : "bg-amber-100 text-amber-800 border-amber-300 font-bold self-start sm:self-auto"}>
              {mailOk ? "✓ Active" : "⚠ Configuration Required"}
            </Badge>
          </div>

          {/* Provider Selection Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900">1. Select Email Provider</h2>
                <p className="text-xs text-slate-500">Choose your transactional email delivery service</p>
              </div>
              <Badge variant="outline" className="text-[11px] font-semibold text-slate-600 bg-white">
                Active: <span className="text-indigo-600 font-bold ml-1">{selectedProvider?.name}</span>
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {MAIL_PROVIDERS.map((provider) => {
                const isSelected = (formData.mailProvider || "resend") === provider.id;
                return (
                  <button
                    key={provider.id}
                    type="button"
                    onClick={() => setFormData((p) => ({ ...p, mailProvider: provider.id }))}
                    className={`text-left p-4 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                      isSelected
                        ? `${provider.activeRing} bg-white shadow-sm`
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2.5">
                        <div className={`w-8 h-8 rounded-xl ${provider.iconBg} text-white flex items-center justify-center text-xs font-bold shadow-sm`}>
                          {provider.id === "smtp" ? <Server className="w-4 h-4" /> : provider.name.slice(0, 2).toUpperCase()}
                        </div>
                        <Badge className={`text-[10px] font-bold py-0 px-2 border ${provider.badgeClass}`}>
                          {provider.badge}
                        </Badge>
                      </div>
                      <div className="font-bold text-sm text-slate-900">{provider.name}</div>
                      <div className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-snug">{provider.desc}</div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className={`font-semibold ${isSelected ? "text-indigo-600" : "text-slate-400"}`}>
                        {isSelected ? "Selected" : "Select"}
                      </span>
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center border ${
                        isSelected ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-300"
                      }`}>
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Provider Credentials Form */}
          <Card className="rounded-2xl border-slate-200/80 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className={`w-7 h-7 rounded-xl ${selectedProvider?.iconBg || "bg-violet-600"} text-white flex items-center justify-center text-xs font-bold`}>
                  {selectedProvider?.id === "smtp" ? <Server className="w-3.5 h-3.5" /> : <Key className="w-3.5 h-3.5" />}
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">
                    2. {selectedProvider?.name} Credentials &amp; Sender Settings
                  </h2>
                  <p className="text-xs text-slate-400">Configure connection details and verified dispatch address.</p>
                </div>
              </div>
            </div>

            <CardContent className="p-6 space-y-5">
              {/* If SMTP */}
              {formData.mailProvider === "smtp" ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 block">
                        SMTP Host / Server
                      </label>
                      <Input
                        type="text"
                        name="smtpHost"
                        value={formData.smtpHost || ""}
                        onChange={handleChange}
                        placeholder="e.g. smtp.gmail.com or email-smtp.us-east-1.amazonaws.com"
                        className="rounded-xl font-mono text-xs border-slate-200 h-11"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 block">
                        Port
                      </label>
                      <Input
                        type="number"
                        name="smtpPort"
                        value={formData.smtpPort ?? 587}
                        onChange={handleChange}
                        placeholder="587"
                        className="rounded-xl font-mono text-xs border-slate-200 h-11"
                      />
                      <span className="text-[10px] text-slate-400 mt-1 block">Usually 587 (TLS) or 465 (SSL)</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 block">
                        SMTP Username
                      </label>
                      <Input
                        type="text"
                        name="smtpUser"
                        value={formData.smtpUser || ""}
                        onChange={handleChange}
                        placeholder="username or email"
                        className="rounded-xl text-xs border-slate-200 h-11"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 block">
                        SMTP Password / App Password
                      </label>
                      <div className="relative">
                        <Input
                          type={showSmtpPass ? "text" : "password"}
                          name="smtpPass"
                          value={formData.smtpPass || ""}
                          onChange={handleChange}
                          placeholder="••••••••••••••••"
                          className="rounded-xl pr-20 font-mono text-xs border-slate-200 h-11"
                        />
                        <button
                          type="button"
                          onClick={() => setShowSmtpPass(!showSmtpPass)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-indigo-600 hover:text-indigo-700 cursor-pointer"
                        >
                          {showSmtpPass ? "Hide" : "Show"}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                    <div>
                      <p className="text-xs font-bold text-slate-800">Use Secure SSL / TLS Direct (Port 465)</p>
                      <p className="text-[11px] text-slate-500">Toggle ON for port 465. Keep OFF for port 587 (STARTTLS).</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleToggle("smtpSecure")}
                      className={`text-2xl cursor-pointer transition ${formData.smtpSecure ? "text-indigo-600" : "text-slate-300"}`}
                    >
                      {formData.smtpSecure ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
                    </button>
                  </div>
                </div>
              ) : (
                /* If Resend, SendGrid, or Postmark */
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 block">
                    {selectedProvider?.keyLabel || "API Key"}
                  </label>
                  <div className="relative">
                    <Input
                      type={showMailApiKey ? "text" : "password"}
                      name="mailApiKey"
                      value={formData.mailApiKey || ""}
                      onChange={handleChange}
                      placeholder={selectedProvider?.keyPlaceholder || "API Key"}
                      className="rounded-xl pr-20 font-mono text-xs border-slate-200 h-11"
                    />
                    <button
                      type="button"
                      onClick={() => setShowMailApiKey(!showMailApiKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-indigo-600 hover:text-indigo-700 cursor-pointer"
                    >
                      {showMailApiKey ? "Hide" : "Show"}
                    </button>
                  </div>
                  {selectedProvider?.docsUrl && (
                    <p className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1">
                      <Info className="w-3.5 h-3.5 shrink-0" />
                      Generate your credentials at{" "}
                      <a
                        href={selectedProvider.docsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-indigo-600 hover:underline font-semibold inline-flex items-center gap-0.5"
                      >
                        {selectedProvider.docsLabel} <ExternalLink className="w-3 h-3" />
                      </a>
                    </p>
                  )}
                </div>
              )}

              {/* Verified From Email */}
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 block">
                  Verified Sender Address (From Email)
                </label>
                <Input
                  type="text"
                  name="mailFromEmail"
                  value={formData.mailFromEmail || ""}
                  onChange={handleChange}
                  placeholder="TeleClinic Support <noreply@yourdomain.com>"
                  className="rounded-xl font-semibold border-slate-200 h-11 text-xs"
                />
                <p className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1">
                  <Info className="w-3.5 h-3.5 shrink-0" />
                  Must be verified in your {selectedProvider?.name || "email"} account DNS settings. Format: Display Name &lt;email@domain.com&gt;
                </p>
              </div>

              {/* Notice */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1.5">
                <p className="font-bold text-slate-900">Transactional emails routed through this gateway:</p>
                <ul className="list-disc list-inside space-y-1 text-slate-600 text-[11px]">
                  <li>Doctor account invitations &amp; verification emails</li>
                  <li>Patient appointment confirmations, reminders &amp; recheckups</li>
                  <li>Official pharmacy order invoices &amp; receipts</li>
                  <li>Patient password reset &amp; security tokens</li>
                  <li>Customer support ticket created &amp; resolution alerts</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Test Email Dispatcher Card */}
          <Card className="rounded-2xl border-slate-200/80 shadow-sm overflow-hidden bg-gradient-to-br from-white to-indigo-50/20">
            <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                  <Send className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">3. Test Email Dispatcher</h2>
                  <p className="text-xs text-slate-400">Dispatch a live test email to verify credentials and inbox deliverability.</p>
                </div>
              </div>
              <Badge variant="outline" className="text-xs font-semibold bg-white text-indigo-700 border-indigo-200">
                Testing: {selectedProvider?.name}
              </Badge>
            </div>

            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <Input
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="Enter recipient email (e.g. your personal email address)..."
                  className="rounded-xl border-slate-200 h-11 text-xs font-medium flex-1"
                />
                <Button
                  type="button"
                  onClick={handleSendTestEmail}
                  disabled={sendingTestEmail || !testEmail}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl gap-2 font-bold h-11 px-5 cursor-pointer shadow-md shadow-indigo-600/15"
                >
                  {sendingTestEmail ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  {sendingTestEmail ? "Sending..." : "Send Test Email"}
                </Button>
              </div>
              <p className="text-[11px] text-slate-400 mt-2">
                Tip: If you recently edited credentials or switched provider, remember to click <b className="text-slate-600">Save All</b> at the top first so the backend uses your newest configuration.
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── TAB: AI SETTINGS ── */}
      {activeTab === "ai" && (
        <div className="space-y-6">
          {/* Status Alert Banner */}
          <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border ${aiOk ? "bg-emerald-50 border-emerald-200" : "bg-rose-50 border-rose-200"}`}>
            <div className="flex items-start gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${aiOk ? "bg-emerald-600 text-white" : "bg-rose-500 text-white"}`}>
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <p className={`text-sm font-bold ${aiOk ? "text-emerald-900" : "text-rose-900"}`}>
                  {aiOk ? `${selectedAiProvider?.name || "AI Engine"} Active & Operational` : "AI Engine Incomplete"}
                </p>
                <p className={`text-xs mt-0.5 ${aiOk ? "text-emerald-700" : "text-rose-700"}`}>
                  {aiOk
                    ? `TeleMed clinical AI features are powered by ${selectedAiProvider?.name} (${formData.aiModel || selectedAiProvider?.defaultModel}).`
                    : `Provide credentials for ${selectedAiProvider?.name || "your chosen AI service"} below to activate clinical AI features.`}
                </p>
              </div>
            </div>
            <Badge className={aiOk ? "bg-emerald-100 text-emerald-800 border-emerald-300 font-bold self-start sm:self-auto" : "bg-rose-100 text-rose-800 border-rose-300 font-bold self-start sm:self-auto"}>
              {aiOk ? "✓ Active" : "⚠ Key Required"}
            </Badge>
          </div>

          {/* Provider Selection Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900">1. Select AI Engine Provider</h2>
                <p className="text-xs text-slate-500">Choose the foundation LLM service powering healthcare features</p>
              </div>
              <Badge variant="outline" className="text-[11px] font-semibold text-slate-600 bg-white">
                Active: <span className="text-orange-600 font-bold ml-1">{selectedAiProvider?.name}</span>
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {AI_PROVIDERS.map((provider) => {
                const isSelected = (formData.aiProvider || "groq") === provider.id;
                return (
                  <button
                    key={provider.id}
                    type="button"
                    onClick={() => setFormData((p) => ({
                      ...p,
                      aiProvider: provider.id,
                      // Automatically set default model if empty or switching
                      aiModel: p.aiProvider !== provider.id ? provider.defaultModel : p.aiModel
                    }))}
                    className={`text-left p-4 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                      isSelected
                        ? `${provider.activeRing} bg-white shadow-sm`
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2.5">
                        <div className={`w-8 h-8 rounded-xl ${provider.iconBg} text-white flex items-center justify-center text-xs font-bold shadow-sm`}>
                          <Sparkles className="w-4 h-4" />
                        </div>
                        <Badge className={`text-[10px] font-bold py-0 px-2 border ${provider.badgeClass}`}>
                          {provider.badge}
                        </Badge>
                      </div>
                      <div className="font-bold text-sm text-slate-900">{provider.name}</div>
                      <div className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-snug">{provider.desc}</div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className={`font-semibold ${isSelected ? "text-orange-600" : "text-slate-400"}`}>
                        {isSelected ? "Selected" : "Select"}
                      </span>
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center border ${
                        isSelected ? "border-orange-600 bg-orange-600 text-white" : "border-slate-300"
                      }`}>
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Provider Credentials & Model Card */}
          <Card className="rounded-2xl border-slate-200/80 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className={`w-7 h-7 rounded-xl ${selectedAiProvider?.iconBg || "bg-orange-600"} text-white flex items-center justify-center text-xs font-bold`}>
                  <Key className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">
                    2. {selectedAiProvider?.name} Credentials &amp; Model Selection
                  </h2>
                  <p className="text-xs text-slate-400">Configure connection authentication and preferred LLM model.</p>
                </div>
              </div>
            </div>

            <CardContent className="p-6 space-y-5">
              {/* API Key */}
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 block">
                  {selectedAiProvider?.keyLabel || "API Key"}
                </label>
                <div className="relative">
                  <Input
                    type={showAiApiKey ? "text" : "password"}
                    name="aiApiKey"
                    value={formData.aiApiKey || ""}
                    onChange={handleChange}
                    placeholder={selectedAiProvider?.keyPlaceholder || "Enter API Key"}
                    className="rounded-xl pr-20 font-mono text-xs border-slate-200 h-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAiApiKey(!showAiApiKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-orange-600 hover:text-orange-700 cursor-pointer"
                  >
                    {showAiApiKey ? "Hide" : "Show"}
                  </button>
                </div>
                {selectedAiProvider?.docsUrl && (
                  <p className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1">
                    <Info className="w-3.5 h-3.5 shrink-0" />
                    Get your key at{" "}
                    <a
                      href={selectedAiProvider.docsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-orange-600 hover:underline font-semibold inline-flex items-center gap-0.5"
                    >
                      {selectedAiProvider.docsLabel} <ExternalLink className="w-3 h-3" />
                    </a>
                  </p>
                )}
              </div>

              {/* If Custom: Base URL */}
              {formData.aiProvider === "custom" && (
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 block">
                    Custom Base URL (OpenAI-Compatible Endpoint)
                  </label>
                  <Input
                    type="text"
                    name="aiCustomBaseUrl"
                    value={formData.aiCustomBaseUrl || ""}
                    onChange={handleChange}
                    placeholder="e.g. https://api.deepseek.com/v1 or https://openrouter.ai/api/v1"
                    className="rounded-xl font-mono text-xs border-slate-200 h-11"
                  />
                  <p className="text-[11px] text-slate-400 mt-1.5">
                    Enter the root API URL without trailing slash. The standard <code>/chat/completions</code> endpoint will be called automatically.
                  </p>
                </div>
              )}

              {/* Model Selection & Presets */}
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 block">
                  Model Identifier
                </label>
                <Input
                  type="text"
                  name="aiModel"
                  value={formData.aiModel || ""}
                  onChange={handleChange}
                  placeholder={`Default: ${selectedAiProvider?.defaultModel}`}
                  className="rounded-xl font-mono text-xs border-slate-200 h-11"
                />
                {selectedAiProvider?.modelPresets?.length > 0 && (
                  <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] font-semibold text-slate-400 mr-1">Recommended Presets:</span>
                    {selectedAiProvider.modelPresets.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => setFormData((p) => ({ ...p, aiModel: preset.id }))}
                        className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                          formData.aiModel === preset.id
                            ? "bg-orange-600 text-white border-orange-600 shadow-xs"
                            : "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200"
                        }`}
                      >
                        {preset.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Healthcare Features Summary Grid */}
              <div className="pt-2">
                <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 block">
                  AI Features Powered By This Engine:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { icon: "💬", label: "AI Health Advisor",      desc: "Patient conversational health chat with clinical triage and specialist referral recommendations" },
                    { icon: "🧪", label: "Lab Report Analyzer",    desc: "PDF lab test parsing with normal/abnormal value detection and clear patient explanations" },
                    { icon: "📋", label: "Consultation Summaries", desc: "Auto-generated post-appointment clinical recaps for patients and doctors" },
                    { icon: "💊", label: "Prescription Reader",    desc: "Smart prescription text extraction with automatic pharmacy cart matching" },
                  ].map((f) => (
                    <div key={f.label} className={`p-3.5 rounded-xl border flex items-start gap-3 ${aiOk ? "border-orange-100 bg-orange-50/40" : "border-slate-200 bg-slate-50/50 opacity-60"}`}>
                      <span className="text-xl">{f.icon}</span>
                      <div>
                        <p className="text-xs font-bold text-slate-800">{f.label}</p>
                        <p className="text-[11px] text-slate-500 leading-relaxed">{f.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Test AI Connection Tool */}
          <Card className="rounded-2xl border-slate-200/80 shadow-sm overflow-hidden bg-gradient-to-br from-white to-orange-50/20">
            <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">3. Test AI Engine Connection</h2>
                  <p className="text-xs text-slate-400">Ping the configured model to verify API authentication and measure latency.</p>
                </div>
              </div>
              <Badge variant="outline" className="text-xs font-semibold bg-white text-orange-700 border-orange-200">
                Provider: {selectedAiProvider?.name}
              </Badge>
            </div>

            <CardContent className="p-6 space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <p className="text-xs text-slate-600">
                    Click the button below to dispatch a diagnostic test prompt through your active provider.
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Remember to click <b className="text-slate-600">Save All</b> first if you have just entered or changed your API key.
                  </p>
                </div>
                <Button
                  type="button"
                  onClick={handleTestAiConnection}
                  disabled={testingAi}
                  className="bg-orange-600 hover:bg-orange-700 text-white rounded-xl gap-2 font-bold h-11 px-5 cursor-pointer shadow-md shadow-orange-600/15 shrink-0"
                >
                  {testingAi ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  {testingAi ? "Testing Connection..." : "Test AI Connection"}
                </Button>
              </div>

              {/* Diagnostic Result Box */}
              {aiTestResult && (
                <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/70 text-emerald-900 text-xs space-y-2 mt-3 animate-in fade-in-50">
                  <div className="flex items-center justify-between">
                    <span className="font-bold flex items-center gap-1.5 text-emerald-800">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Connection Verified Successfully
                    </span>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-emerald-200 text-emerald-900 border-emerald-300 text-[10px]">
                        Latency: {aiTestResult.latencyMs}ms
                      </Badge>
                      <Badge className="bg-white text-emerald-900 border-emerald-300 text-[10px] font-mono">
                        Model: {aiTestResult.model}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-emerald-800 bg-white/80 p-3 rounded-lg border border-emerald-200 font-sans italic">
                    &ldquo;{aiTestResult.reply}&rdquo;
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── TAB: CRM GATEWAY ── */}
      {activeTab === "crm" && (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-slate-50 border border-blue-100 rounded-2xl p-5 flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-600/20">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-bold text-sm text-slate-900">CRM &amp; Transaction Gateway Engine</p>
                  <Badge className="bg-blue-600 text-white border-blue-700 text-[10px] font-bold uppercase tracking-wider">
                    Active: {selectedCrmProvider?.name}
                  </Badge>
                </div>
                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed max-w-2xl">
                  Select your active CRM provider. Pharmacy checkout and telemedicine video consultation charges are automatically authorized and imported through your selected gateway.
                </p>
              </div>
            </div>
            {selectedCrmProvider?.docsUrl && (
              <a
                href={selectedCrmProvider.docsUrl}
                target="_blank"
                rel="noreferrer"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 transition shadow-2xs shrink-0"
              >
                <span>{selectedCrmProvider.docsLabel}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>

          {/* Step 1: Provider Selection Cards */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  1. Choose Active CRM Provider
                </h2>
                <p className="text-xs text-slate-400">Click a provider card below to switch the live payment and fulfillment engine.</p>
              </div>
              <Badge variant="outline" className="text-[11px] font-bold border-slate-200">
                {CRM_PROVIDERS.length} Supported Gateways
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {CRM_PROVIDERS.map((provider) => {
                const isSelected = (formData.crmProvider || "vrio") === provider.id;
                return (
                  <div
                    key={provider.id}
                    onClick={() => setFormData((p) => ({ ...p, crmProvider: provider.id }))}
                    className={`relative p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? provider.activeRing
                        : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs"
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-xl ${provider.iconBg} text-white flex items-center justify-center font-black text-xs shadow-xs`}>
                            {provider.name.charAt(0)}
                          </div>
                          <div>
                            <span className="text-sm font-bold text-slate-900 block leading-tight">{provider.name}</span>
                            <span className="text-[10px] text-slate-400 font-medium">{provider.tagline}</span>
                          </div>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${provider.badgeClass}`}>
                          {provider.badge}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed mb-4">{provider.desc}</p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-400">
                        {isSelected ? "Active Gateway" : "Click to Activate"}
                      </span>
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                        isSelected ? "bg-blue-600 text-white" : "border-2 border-slate-300"
                      }`}>
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step 2: Dynamic Gateway Credentials Form */}
          <div className="space-y-6">
            <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              2. {selectedCrmProvider?.name} Credentials &amp; Parameters
            </h2>

            {/* ── PROVIDER: VRIO CRM ── */}
            {formData.crmProvider === "vrio" && (
              <div className="space-y-6">
                <Card className="rounded-2xl border-slate-200/80 shadow-sm overflow-hidden">
                  <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2.5">
                    <Key className="w-5 h-5 text-blue-600" />
                    <div>
                      <h2 className="text-sm font-bold text-slate-900">Vrio API Authentication</h2>
                      <p className="text-xs text-slate-400">Private API Key or Bearer Token for Vrio CRM integration.</p>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 block">
                      Vrio API Key / Bearer Token
                    </label>
                    <div className="relative">
                      <Input
                        type={showApiKey ? "text" : "password"}
                        name="apiKey"
                        value={formData.apiKey}
                        onChange={handleChange}
                        placeholder="Enter your Vrio CRM API Key or leave blank for SDK default"
                        className="rounded-xl pr-24 font-mono text-xs border-slate-200 h-11"
                      />
                      <button
                        type="button"
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
                      >
                        {showApiKey ? "Hide" : "Show"}
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1">
                      <Info className="w-3.5 h-3.5" /> If empty, the default token in <code>.api/apis/vrio-api</code> is used.
                    </p>
                  </CardContent>
                </Card>

                <Card className="rounded-2xl border-slate-200/80 shadow-sm overflow-hidden">
                  <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                        <Video className="w-4 h-4" />
                      </div>
                      <div>
                        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                          Telemedicine Consultation Product
                          <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-[10px] font-bold">Pay-to-Consult</Badge>
                        </h2>
                        <p className="text-xs text-slate-400">Maps video consultation bookings to dedicated Vrio product &amp; campaign IDs.</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-xl border border-indigo-100 text-xs font-mono font-bold">
                      Item #{formData.consultationItemId || 3366} · Offer #{formData.consultationOfferId || 29}
                    </span>
                  </div>
                  <CardContent className="p-6 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                      <div>
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 block">Consultation Item ID *</label>
                        <Input
                          type="number"
                          name="consultationItemId"
                          value={formData.consultationItemId}
                          onChange={handleChange}
                          min="1"
                          required
                          placeholder="3366"
                          className="rounded-xl border-slate-200 font-semibold h-11"
                        />
                        <span className="text-[11px] text-slate-400 mt-1 block">Vrio product item ID for video consultations</span>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 block">Consultation Offer ID *</label>
                        <Input
                          type="number"
                          name="consultationOfferId"
                          value={formData.consultationOfferId}
                          onChange={handleChange}
                          min="1"
                          required
                          placeholder="29"
                          className="rounded-xl border-slate-200 font-semibold h-11"
                        />
                        <span className="text-[11px] text-slate-400 mt-1 block">Vrio campaign offer ID for billing</span>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 block">Consultation Campaign ID</label>
                        <Input
                          type="number"
                          name="consultationCampaignId"
                          value={formData.consultationCampaignId || ""}
                          onChange={handleChange}
                          min="1"
                          placeholder={`Default: ${formData.campaignId || 1}`}
                          className="rounded-xl border-slate-200 font-semibold h-11"
                        />
                        <span className="text-[11px] text-slate-400 mt-1 block">Optional: overrides primary campaign for doctor calls</span>
                      </div>
                    </div>
                    <div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-100 text-xs text-blue-900 flex items-start gap-2.5">
                      <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <p className="leading-relaxed">
                        Consultation payments are dispatched with <strong>Item ID {formData.consultationItemId || 3366}</strong>,{" "}
                        <strong>Offer ID {formData.consultationOfferId || 29}</strong>, and Campaign ID {formData.consultationCampaignId || formData.campaignId || 1}. On authorization, appointments are confirmed with a Vrio Transaction Reference ID.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-2xl border-slate-200/80 shadow-sm overflow-hidden">
                  <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2.5">
                    <Layers className="w-5 h-5 text-blue-600" />
                    <div>
                      <h2 className="text-sm font-bold text-slate-900">Campaign &amp; Gateway Parameters</h2>
                      <p className="text-xs text-slate-400">Transaction routing, payment profiles, and prepaid card fallback settings.</p>
                    </div>
                  </div>
                  <CardContent className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                    {[
                      { name: "campaignId",        label: "Primary Campaign ID",  hint: "Standard credit/debit card campaign" },
                      { name: "prepaidCampaignId", label: "Prepaid Campaign ID",  hint: "Dedicated campaign for prepaid cards", amber: true },
                      { name: "routeId",           label: "Route ID",             hint: "Vrio routing gateway ID (route_id)" },
                      { name: "connectionId",      label: "Connection ID",        hint: "Payment processor connection" },
                      { name: "shippingProfileId", label: "Shipping Profile ID",  hint: "Default fulfillment profile" },
                      { name: "paymentMethodId",   label: "Payment Method ID",    hint: "1 = Credit Card, 2 = ACH" },
                      { name: "cardTypeId",        label: "Card Type ID",         hint: "1 = Visa, 2 = MasterCard" },
                    ].map((f) => (
                      <div key={f.name}>
                        <label className={`text-xs font-bold uppercase tracking-wider mb-2 block ${f.amber ? "text-amber-800" : "text-slate-700"}`}>
                          {f.label}
                        </label>
                        <Input
                          type="number"
                          name={f.name}
                          value={formData[f.name]}
                          onChange={handleChange}
                          min="1"
                          className={`rounded-xl font-semibold h-11 ${f.amber ? "border-amber-200 bg-amber-50/30" : "border-slate-200"}`}
                        />
                        <span className="text-[11px] text-slate-400 mt-1 block">{f.hint}</span>
                      </div>
                    ))}
                    <div>
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 block">Action Mode</label>
                      <select
                        name="action"
                        value={formData.action}
                        onChange={handleChange}
                        className="w-full h-11 px-3 rounded-xl border border-slate-200 text-xs font-bold bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="process">process (Charge &amp; Authorize)</option>
                        <option value="authorize">authorize (Auth Only)</option>
                        <option value="prospect">prospect (Lead Only)</option>
                      </select>
                      <span className="text-[11px] text-slate-400 mt-1 block">Transaction processing action</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* ── PROVIDER: STICKY.IO ── */}
            {formData.crmProvider === "sticky" && (
              <div className="space-y-6">
                {/* sticky.io Card 1: API Authentication */}
                <Card className="rounded-2xl border-slate-200/80 shadow-sm overflow-hidden">
                  <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Key className="w-5 h-5 text-emerald-600" />
                      <div>
                        <h2 className="text-sm font-bold text-slate-900">sticky.io API Credentials</h2>
                        <p className="text-xs text-slate-400">Connect to your sticky.io tenant subdomain and API user account.</p>
                      </div>
                    </div>
                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-bold">
                      Basic Auth (/api/v1/new_order)
                    </Badge>
                  </div>
                  <CardContent className="p-6 space-y-5">
                    <div>
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 block">
                        sticky.io Domain / Hostname *
                      </label>
                      <Input
                        type="text"
                        name="stickyDomain"
                        value={formData.stickyDomain || ""}
                        onChange={handleChange}
                        placeholder="e.g. yourcompany.sticky.io or tenant.sticky.io"
                        className="rounded-xl font-mono text-xs border-slate-200 h-11"
                      />
                      <p className="text-[11px] text-slate-400 mt-1.5">
                        Enter your sticky.io tenant URL. The API endpoint <code>https://&lt;domain&gt;/api/v1/new_order</code> will be called automatically.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 block">
                          API Username *
                        </label>
                        <Input
                          type="text"
                          name="stickyUsername"
                          value={formData.stickyUsername || ""}
                          onChange={handleChange}
                          placeholder="sticky API username"
                          className="rounded-xl font-mono text-xs border-slate-200 h-11"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 block">
                          API Password *
                        </label>
                        <div className="relative">
                          <Input
                            type={showStickyPass ? "text" : "password"}
                            name="stickyPassword"
                            value={formData.stickyPassword || ""}
                            onChange={handleChange}
                            placeholder="sticky API password"
                            className="rounded-xl pr-20 font-mono text-xs border-slate-200 h-11"
                          />
                          <button
                            type="button"
                            onClick={() => setShowStickyPass(!showStickyPass)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-emerald-600 hover:text-emerald-700 cursor-pointer"
                          >
                            {showStickyPass ? "Hide" : "Show"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* sticky.io Card 2: Telemedicine Consultation Product */}
                <Card className="rounded-2xl border-slate-200/80 shadow-sm overflow-hidden">
                  <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                        <Video className="w-4 h-4" />
                      </div>
                      <div>
                        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                          Telemedicine Consultation Product
                          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-bold">Pay-to-Consult</Badge>
                        </h2>
                        <p className="text-xs text-slate-400">Maps consultation appointments to their sticky.io product, campaign &amp; billing profile.</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100 text-xs font-mono font-bold">
                      Product #{formData.stickyConsultationProductId || 29} · Campaign #{formData.stickyConsultationCampaignId || 1}
                    </span>
                  </div>
                  <CardContent className="p-6 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
                      <div>
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 block">Consultation Product ID *</label>
                        <Input
                          type="number"
                          name="stickyConsultationProductId"
                          value={formData.stickyConsultationProductId}
                          onChange={handleChange}
                          min="1"
                          placeholder="29"
                          className="rounded-xl border-slate-200 font-semibold h-11"
                        />
                        <span className="text-[11px] text-slate-400 mt-1 block">sticky.io Product ID for consultations</span>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 block">Consultation Campaign ID *</label>
                        <Input
                          type="number"
                          name="stickyConsultationCampaignId"
                          value={formData.stickyConsultationCampaignId}
                          onChange={handleChange}
                          min="1"
                          placeholder="1"
                          className="rounded-xl border-slate-200 font-semibold h-11"
                        />
                        <span className="text-[11px] text-slate-400 mt-1 block">Campaign ID for consultation billing</span>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 block">Shipping Profile ID *</label>
                        <Input
                          type="number"
                          name="stickyConsultationShippingId"
                          value={formData.stickyConsultationShippingId}
                          onChange={handleChange}
                          min="1"
                          placeholder="1"
                          className="rounded-xl border-slate-200 font-semibold h-11"
                        />
                        <span className="text-[11px] text-slate-400 mt-1 block">Digital/Default shipping method ID</span>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 block">Billing Model ID *</label>
                        <Input
                          type="number"
                          name="stickyConsultationBillingModelId"
                          value={formData.stickyConsultationBillingModelId}
                          onChange={handleChange}
                          min="1"
                          placeholder="2"
                          className="rounded-xl border-slate-200 font-semibold h-11"
                        />
                        <span className="text-[11px] text-slate-400 mt-1 block">1 = Prepaid, 2 = Standard</span>
                      </div>
                    </div>
                    <div className="p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-100 text-xs text-emerald-900 flex items-start gap-2.5">
                      <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <p className="leading-relaxed">
                        Consultation payments are dispatched with <strong>Product ID {formData.stickyConsultationProductId || 29}</strong>,{" "}
                        <strong>Campaign ID {formData.stickyConsultationCampaignId || 1}</strong>, and <strong>Billing Model ID {formData.stickyConsultationBillingModelId || 2}</strong>.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* sticky.io Card 3: Campaign & Gateway Parameters */}
                <Card className="rounded-2xl border-slate-200/80 shadow-sm overflow-hidden">
                  <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2.5">
                    <Layers className="w-5 h-5 text-emerald-600" />
                    <div>
                      <h2 className="text-sm font-bold text-slate-900">Campaign &amp; Gateway Parameters (Pharmacy Stock)</h2>
                      <p className="text-xs text-slate-400">Configure default pharmacy order campaign, prepaid fallback, and shipping.</p>
                    </div>
                  </div>
                  <CardContent className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                    <div>
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 block">Primary Campaign ID *</label>
                      <Input
                        type="number"
                        name="stickyCampaignId"
                        value={formData.stickyCampaignId}
                        onChange={handleChange}
                        min="1"
                        className="rounded-xl border-slate-200 font-semibold h-11"
                      />
                      <span className="text-[11px] text-slate-400 mt-1 block">Standard pharmacy campaign ID</span>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-2 block">Prepaid Campaign ID</label>
                      <Input
                        type="number"
                        name="stickyPrepaidCampaignId"
                        value={formData.stickyPrepaidCampaignId || ""}
                        onChange={handleChange}
                        min="1"
                        placeholder="Optional fallback"
                        className="rounded-xl border-amber-200 bg-amber-50/30 font-semibold h-11"
                      />
                      <span className="text-[11px] text-slate-400 mt-1 block">Prepaid card fallback retry campaign</span>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 block">Default Shipping ID *</label>
                      <Input
                        type="number"
                        name="stickyShippingId"
                        value={formData.stickyShippingId}
                        onChange={handleChange}
                        min="1"
                        className="rounded-xl border-slate-200 font-semibold h-11"
                      />
                      <span className="text-[11px] text-slate-400 mt-1 block">Pharmacy shipping method profile ID</span>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 block">Default Product/Offer ID *</label>
                      <Input
                        type="number"
                        name="stickyOfferId"
                        value={formData.stickyOfferId}
                        onChange={handleChange}
                        min="1"
                        className="rounded-xl border-slate-200 font-semibold h-11"
                      />
                      <span className="text-[11px] text-slate-400 mt-1 block">Fallback pharmacy product ID</span>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 block">Billing Model ID *</label>
                      <Input
                        type="number"
                        name="stickyBillingModelId"
                        value={formData.stickyBillingModelId}
                        onChange={handleChange}
                        min="1"
                        className="rounded-xl border-slate-200 font-semibold h-11"
                      />
                      <span className="text-[11px] text-slate-400 mt-1 block">1 = Prepaid, 2 = Standard</span>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 block">Payment Method</label>
                      <select
                        disabled
                        className="w-full h-11 px-3 rounded-xl border border-slate-200 text-xs font-bold bg-slate-50 text-slate-600 focus:outline-none"
                      >
                        <option value="creditcard">creditcard (Direct API)</option>
                      </select>
                      <span className="text-[11px] text-slate-400 mt-1 block">Default sticky.io payment method</span>
                    </div>
                  </CardContent>
                </Card>

                <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex items-start gap-3">
                  <Info className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-emerald-950 space-y-1">
                    <p className="font-bold">sticky.io Integration Details</p>
                    <p className="text-emerald-900/90 leading-relaxed">
                      Orders placed on TeleClinic checkout will be posted via JSON to <code>https://{formData.stickyDomain || "&lt;domain&gt;"}/api/v1/new_order</code> using HTTP Basic Authentication. Response codes <code>100</code> indicate transaction approval and capture an order ID.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ── PROVIDER: CHECKOUTCHAMP ── */}
            {formData.crmProvider === "checkoutchamp" && (
              <div className="space-y-6">
                {/* CheckoutChamp Card 1: API Authentication */}
                <Card className="rounded-2xl border-slate-200/80 shadow-sm overflow-hidden">
                  <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Key className="w-5 h-5 text-violet-600" />
                      <div>
                        <h2 className="text-sm font-bold text-slate-900">CheckoutChamp (Konnektive) Credentials</h2>
                        <p className="text-xs text-slate-400">Connect to CheckoutChamp API for direct order importing.</p>
                      </div>
                    </div>
                    <Badge className="bg-violet-50 text-violet-700 border-violet-200 text-[10px] font-bold">
                      /order/import/
                    </Badge>
                  </div>
                  <CardContent className="p-6 space-y-5">
                    <div>
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 block">
                        API Base URL
                      </label>
                      <Input
                        type="text"
                        name="checkoutChampCustomBaseUrl"
                        value={formData.checkoutChampCustomBaseUrl || ""}
                        onChange={handleChange}
                        placeholder="https://api.checkoutchamp.com"
                        className="rounded-xl font-mono text-xs border-slate-200 h-11"
                      />
                      <p className="text-[11px] text-slate-400 mt-1.5">
                        Default: <code>https://api.checkoutchamp.com</code>. Update only if using a custom proxy or vanity domain.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 block">
                          API Login ID *
                        </label>
                        <Input
                          type="text"
                          name="checkoutChampLoginId"
                          value={formData.checkoutChampLoginId || ""}
                          onChange={handleChange}
                          placeholder="Enter your CheckoutChamp loginId"
                          className="rounded-xl font-mono text-xs border-slate-200 h-11"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 block">
                          API Password *
                        </label>
                        <div className="relative">
                          <Input
                            type={showCheckoutChampPass ? "text" : "password"}
                            name="checkoutChampPassword"
                            value={formData.checkoutChampPassword || ""}
                            onChange={handleChange}
                            placeholder="Enter your CheckoutChamp password"
                            className="rounded-xl pr-20 font-mono text-xs border-slate-200 h-11"
                          />
                          <button
                            type="button"
                            onClick={() => setShowCheckoutChampPass(!showCheckoutChampPass)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-violet-600 hover:text-violet-700 cursor-pointer"
                          >
                            {showCheckoutChampPass ? "Hide" : "Show"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* CheckoutChamp Card 2: Telemedicine Consultation Product */}
                <Card className="rounded-2xl border-slate-200/80 shadow-sm overflow-hidden">
                  <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center text-violet-600">
                        <Video className="w-4 h-4" />
                      </div>
                      <div>
                        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                          Telemedicine Consultation Product
                          <Badge className="bg-violet-50 text-violet-700 border-violet-200 text-[10px] font-bold">Pay-to-Consult</Badge>
                        </h2>
                        <p className="text-xs text-slate-400">Maps consultation appointments to their CheckoutChamp product &amp; campaign IDs.</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-violet-50 text-violet-700 rounded-xl border border-violet-100 text-xs font-mono font-bold">
                      Product #{formData.checkoutChampConsultationProductId || 3366} · Campaign #{formData.checkoutChampConsultationCampaignId || 1}
                    </span>
                  </div>
                  <CardContent className="p-6 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                      <div>
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 block">Consultation Product ID *</label>
                        <Input
                          type="number"
                          name="checkoutChampConsultationProductId"
                          value={formData.checkoutChampConsultationProductId}
                          onChange={handleChange}
                          min="1"
                          placeholder="3366"
                          className="rounded-xl border-slate-200 font-semibold h-11"
                        />
                        <span className="text-[11px] text-slate-400 mt-1 block">Product ID mapped for video consultations</span>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 block">Consultation Campaign ID *</label>
                        <Input
                          type="number"
                          name="checkoutChampConsultationCampaignId"
                          value={formData.checkoutChampConsultationCampaignId}
                          onChange={handleChange}
                          min="1"
                          placeholder="1"
                          className="rounded-xl border-slate-200 font-semibold h-11"
                        />
                        <span className="text-[11px] text-slate-400 mt-1 block">CheckoutChamp campaign ID for consultations</span>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 block">Shipping Method ID</label>
                        <Input
                          type="number"
                          name="checkoutChampConsultationShippingId"
                          value={formData.checkoutChampConsultationShippingId}
                          onChange={handleChange}
                          min="1"
                          placeholder="1"
                          className="rounded-xl border-slate-200 font-semibold h-11"
                        />
                        <span className="text-[11px] text-slate-400 mt-1 block">Digital consultation shipping ID</span>
                      </div>
                    </div>
                    <div className="p-3.5 bg-violet-50/60 rounded-xl border border-violet-100 text-xs text-violet-900 flex items-start gap-2.5">
                      <Info className="w-4 h-4 text-violet-600 shrink-0 mt-0.5" />
                      <p className="leading-relaxed">
                        Consultation payments are imported with <strong>Product ID {formData.checkoutChampConsultationProductId || 3366}</strong> and{" "}
                        <strong>Campaign ID {formData.checkoutChampConsultationCampaignId || 1}</strong>.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* CheckoutChamp Card 3: Campaign & Gateway Parameters */}
                <Card className="rounded-2xl border-slate-200/80 shadow-sm overflow-hidden">
                  <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2.5">
                    <Layers className="w-5 h-5 text-violet-600" />
                    <div>
                      <h2 className="text-sm font-bold text-slate-900">Campaign &amp; Gateway Parameters (Pharmacy Stock)</h2>
                      <p className="text-xs text-slate-400">Configure default pharmacy order campaign, prepaid fallback, and shipping.</p>
                    </div>
                  </div>
                  <CardContent className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                    <div>
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 block">Primary Campaign ID *</label>
                      <Input
                        type="number"
                        name="checkoutChampCampaignId"
                        value={formData.checkoutChampCampaignId}
                        onChange={handleChange}
                        min="1"
                        className="rounded-xl border-slate-200 font-semibold h-11"
                      />
                      <span className="text-[11px] text-slate-400 mt-1 block">Standard pharmacy campaign ID</span>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-2 block">Prepaid Campaign ID</label>
                      <Input
                        type="number"
                        name="checkoutChampPrepaidCampaignId"
                        value={formData.checkoutChampPrepaidCampaignId || ""}
                        onChange={handleChange}
                        min="1"
                        placeholder="Optional fallback"
                        className="rounded-xl border-amber-200 bg-amber-50/30 font-semibold h-11"
                      />
                      <span className="text-[11px] text-slate-400 mt-1 block">Prepaid card fallback retry campaign</span>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 block">Default Product ID *</label>
                      <Input
                        type="number"
                        name="checkoutChampProductId"
                        value={formData.checkoutChampProductId}
                        onChange={handleChange}
                        min="1"
                        className="rounded-xl border-slate-200 font-semibold h-11"
                      />
                      <span className="text-[11px] text-slate-400 mt-1 block">Fallback pharmacy product ID</span>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 block">Default Shipping ID *</label>
                      <Input
                        type="number"
                        name="checkoutChampShippingId"
                        value={formData.checkoutChampShippingId}
                        onChange={handleChange}
                        min="1"
                        className="rounded-xl border-slate-200 font-semibold h-11"
                      />
                      <span className="text-[11px] text-slate-400 mt-1 block">Pharmacy fulfillment shipping ID</span>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 block">Pay Source</label>
                      <select
                        disabled
                        className="w-full h-11 px-3 rounded-xl border border-slate-200 text-xs font-bold bg-slate-50 text-slate-600 focus:outline-none"
                      >
                        <option value="CREDITCARD">CREDITCARD (Direct API)</option>
                      </select>
                      <span className="text-[11px] text-slate-400 mt-1 block">Default pay source for order import</span>
                    </div>
                  </CardContent>
                </Card>

                <div className="p-4 bg-violet-50/70 border border-violet-200 rounded-2xl flex items-start gap-3">
                  <Info className="w-5 h-5 text-violet-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-violet-950 space-y-1">
                    <p className="font-bold">CheckoutChamp (Konnektive) Integration Details</p>
                    <p className="text-violet-900/90 leading-relaxed">
                      Orders will be dispatched directly to <code>{formData.checkoutChampCustomBaseUrl || "https://api.checkoutchamp.com"}/order/import/</code> with paySource <code>CREDITCARD</code>, customer billing details, and product IDs.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bottom Save Bar */}
      <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
        <Button onClick={handleSubmit} disabled={saving}
          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl gap-2 font-bold px-8 h-12 shadow-lg shadow-indigo-600/20">
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
          Save All Settings
        </Button>
      </div>
    </div>
  );
}
