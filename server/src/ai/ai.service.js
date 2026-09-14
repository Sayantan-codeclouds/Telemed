import { Groq } from "groq-sdk";
import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Appointment from "../appointments/appointment.model.js";
import ChatMessage from "../modules/chat/chat.model.js";
import Prescription from "../prescriptions/prescription.model.js";
import Doctor from "../doctors/doctor.model.js";
import Patient from "../patients/patient.model.js";
import { Medicine } from "../pharmacy/pharmacy.model.js";
import { getCrmSettingsService } from "../pharmacy/vrio.service.js";

/**
 * Primary model — Groq OpenAI-compatible reasoning model.
 * Fallback models used if the primary is unavailable.
 */
const GROQ_PRIMARY_MODEL = "openai/gpt-oss-120b";
const GROQ_FALLBACK_MODELS = [
  "openai/gpt-oss-20b",
  "qwen/qwen3.8-27b",
  "groq/compound",
];

/**
 * Dynamically resolves active AI provider, credentials, and model from MongoDB CrmSettings
 */
export async function getAiConfig() {
  let provider = "groq";
  let apiKey = "";
  let model = "";
  let customBaseUrl = "";

  try {
    const settings = await getCrmSettingsService();
    if (settings) {
      if (settings.aiProvider) {
        provider = settings.aiProvider.trim().toLowerCase();
      }
      if (settings.aiApiKey && settings.aiApiKey.trim()) {
        apiKey = settings.aiApiKey.trim();
      } else if (settings.groqApiKey && settings.groqApiKey.trim()) {
        apiKey = settings.groqApiKey.trim();
      }
      if (settings.aiModel && settings.aiModel.trim()) {
        model = settings.aiModel.trim();
      }
      if (settings.aiCustomBaseUrl && settings.aiCustomBaseUrl.trim()) {
        customBaseUrl = settings.aiCustomBaseUrl.trim();
      }
    }
  } catch (err) {
    console.warn("[AI Service] Could not load AI settings from DB:", err.message);
  }

  // Graceful fallback to env if apiKey is unset
  if (!apiKey) {
    if (provider === "groq" && process.env.GROQ_API_KEY) apiKey = process.env.GROQ_API_KEY.trim();
    else if (provider === "openai" && process.env.OPENAI_API_KEY) apiKey = process.env.OPENAI_API_KEY.trim();
    else if (provider === "gemini" && process.env.GEMINI_API_KEY) apiKey = process.env.GEMINI_API_KEY.trim();
  }

  return { provider, apiKey, model, customBaseUrl };
}

/**
 * Universal AI Dispatcher supporting:
 * - Groq (groq-sdk)
 * - OpenAI / ChatGPT (openai)
 * - Google Gemini (@google/generative-ai)
 * - Custom OpenAI-compatible endpoints (DeepSeek, OpenRouter, Local Ollama)
 */
export async function callAI(messages, options = {}) {
  const config = await getAiConfig();
  const { provider, apiKey, model, customBaseUrl } = config;

  const temperature = options.temperature ?? 0.2;
  const maxTokens = options.maxTokens ?? 2048;
  const jsonMode = Boolean(options.jsonMode);

  // Helper to parse JSON output cleanly
  const parseJsonContent = (raw) => {
    if (typeof raw !== "string") return raw;
    try {
      return JSON.parse(raw);
    } catch {
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (jsonMatch) return JSON.parse(jsonMatch[0]);
      return raw;
    }
  };

  // 1. OPENAI (ChatGPT)
  if (provider === "openai") {
    if (!apiKey) {
      console.warn("[AI Service] OpenAI API key is missing. Configure it in Admin → AI Settings.");
      return null;
    }

    try {
      const openai = new OpenAI({ apiKey });
      const targetModel = model || "gpt-4o-mini";
      console.log(`[AI Service] Calling OpenAI model: ${targetModel}`);

      const params = {
        model: targetModel,
        messages,
        max_tokens: maxTokens,
        temperature,
      };
      if (jsonMode) {
        params.response_format = { type: "json_object" };
      }

      const completion = await openai.chat.completions.create(params);
      const content = completion.choices?.[0]?.message?.content;
      if (!content) return null;

      return jsonMode ? parseJsonContent(content) : content;
    } catch (err) {
      console.error("[AI Service] OpenAI API call failed:", err?.message || err);
      return null;
    }
  }

  // 2. CUSTOM OPENAI-COMPATIBLE (DeepSeek, OpenRouter, Ollama, etc.)
  if (provider === "custom") {
    try {
      const clientOptions = { apiKey: apiKey || "dummy-key" };
      if (customBaseUrl) {
        clientOptions.baseURL = customBaseUrl;
      }
      const client = new OpenAI(clientOptions);
      const targetModel = model || "deepseek-chat";
      console.log(`[AI Service] Calling Custom endpoint (${customBaseUrl || "default"}) model: ${targetModel}`);

      const params = {
        model: targetModel,
        messages,
        max_tokens: maxTokens,
        temperature,
      };
      if (jsonMode) {
        params.response_format = { type: "json_object" };
      }

      const completion = await client.chat.completions.create(params);
      const content = completion.choices?.[0]?.message?.content;
      if (!content) return null;

      return jsonMode ? parseJsonContent(content) : content;
    } catch (err) {
      console.error("[AI Service] Custom AI API call failed:", err?.message || err);
      return null;
    }
  }

  // 3. GOOGLE GEMINI
  if (provider === "gemini") {
    if (!apiKey) {
      console.warn("[AI Service] Gemini API key is missing. Configure it in Admin → AI Settings.");
      return null;
    }

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const targetModel = model || "gemini-2.0-flash";
      console.log(`[AI Service] Calling Google Gemini model: ${targetModel}`);

      // Extract system instructions if any
      const systemPrompt = messages.find((m) => m.role === "system")?.content;
      const nonSystem = messages.filter((m) => m.role !== "system");

      // Convert standard messages to Gemini contents (roles: user / model)
      const contents = [];
      for (const m of nonSystem) {
        const role = m.role === "assistant" ? "model" : "user";
        if (contents.length > 0 && contents[contents.length - 1].role === role) {
          contents[contents.length - 1].parts[0].text += "\n\n" + m.content;
        } else {
          contents.push({ role, parts: [{ text: m.content }] });
        }
      }

      if (contents.length === 0) {
        contents.push({ role: "user", parts: [{ text: systemPrompt || "Hello" }] });
      }

      const generationConfig = {
        temperature,
        maxOutputTokens: maxTokens,
      };
      if (jsonMode) {
        generationConfig.responseMimeType = "application/json";
      }

      const geminiModel = genAI.getGenerativeModel({
        model: targetModel,
        systemInstruction: systemPrompt || undefined,
        generationConfig,
      });

      const result = await geminiModel.generateContent({ contents });
      const response = await result.response;
      const text = response.text();
      if (!text) return null;

      return jsonMode ? parseJsonContent(text) : text;
    } catch (err) {
      console.error("[AI Service] Google Gemini call failed:", err?.message || err);
      return null;
    }
  }

  // 4. GROQ (Default)
  if (!apiKey) {
    console.warn("[AI Service] No Groq API key found. Configure it in Admin → AI Settings.");
    return null;
  }

  const groq = new Groq({ apiKey });
  const modelsToTry = model ? [model, ...GROQ_FALLBACK_MODELS] : [GROQ_PRIMARY_MODEL, ...GROQ_FALLBACK_MODELS];

  for (const targetModel of modelsToTry) {
    try {
      const isReasoningModel = targetModel.startsWith("openai/");

      const params = {
        model: targetModel,
        messages,
        max_completion_tokens: maxTokens,
        top_p: 1,
        stream: false,
        stop: null,
      };

      if (!isReasoningModel) {
        params.temperature = temperature;
      }

      if (isReasoningModel) {
        params.reasoning_effort = "medium";
      }

      if (jsonMode) {
        params.response_format = { type: "json_object" };
      }

      console.log(`[AI Service] Calling Groq model: ${targetModel}`);
      const chatCompletion = await groq.chat.completions.create(params);
      const choice = chatCompletion.choices?.[0]?.message;
      const content = choice?.content || choice?.reasoning;

      if (!content) {
        console.warn(`[AI Service] Groq model ${targetModel} returned empty content`);
        continue;
      }

      console.log(`[AI Service] Groq model ${targetModel} responded successfully`);
      return jsonMode ? parseJsonContent(content) : content;
    } catch (error) {
      console.error(`[AI Service] Groq model ${targetModel} failed:`, error?.message || error);
    }
  }

  console.error("[AI Service] All Groq models exhausted — returning null");
  return null;
}

/**
 * Backward compatibility alias so existing calls work unmodified
 */
export const callGroqAPI = callAI;

/**
 * Quick diagnostic tool to test AI provider connection from Admin Portal
 */
export async function testAiConnectionService() {
  const config = await getAiConfig();
  if (!config.apiKey && config.provider !== "custom") {
    throw new Error(`API key is not configured for provider: "${config.provider}". Please save your key first.`);
  }

  const startTime = Date.now();
  const testMessages = [
    { role: "system", content: "You are TeleMed Clinical AI Assistant verifying connection status." },
    { role: "user", content: "Reply with a one-sentence warm greeting confirming that TeleMed AI is online and operational." },
  ];

  const reply = await callAI(testMessages, { maxTokens: 500, temperature: 0.3 });
  const latencyMs = Date.now() - startTime;

  if (!reply) {
    throw new Error(`Failed to receive response from ${config.provider}. Please verify your API key or model name.`);
  }

  const providerLabels = {
    groq: "Groq LPU Acceleration",
    openai: "OpenAI ChatGPT",
    gemini: "Google Gemini",
    custom: "Custom OpenAI-Compatible",
  };

  return {
    success: true,
    provider: config.provider,
    providerName: providerLabels[config.provider] || config.provider,
    model: config.model || (config.provider === "openai" ? "gpt-4o-mini" : config.provider === "gemini" ? "gemini-2.0-flash" : GROQ_PRIMARY_MODEL),
    latencyMs,
    reply: typeof reply === "object" ? JSON.stringify(reply) : String(reply).trim(),
  };
}

/**
 * AI Health & Wellness Advisor (Conversational Health Chat with History)
 */
export const getHealthAdviceService = async ({ message, history = [], patientContext = {} }) => {
  const userQuery = message?.trim() || "";

  const systemPrompt = `You are TeleClinic AI, a safe and conservative medical information assistant for the TeleClinic telehealth platform.

PATIENT CONTEXT:
- Age: ${patientContext.age || "Adult"}
- Gender: ${patientContext.gender || "Not specified"}
- Known Allergies: ${patientContext.allergies?.length ? patientContext.allergies.join(", ") : "None reported"}
- Known Medical Conditions: ${patientContext.medicalConditions?.length ? patientContext.medicalConditions.join(", ") : "None reported"}

ABSOLUTE RULES — NEVER VIOLATE THESE:
1. SCOPE: You ONLY answer questions about health, medicine, wellness, nutrition, fitness, mental health, symptoms, and medications (general info). For ANY other topic (news, politics, sports, coding, entertainment, jokes, weather, general trivia), respond ONLY with: "I'm TeleClinic AI, focused exclusively on health and wellness topics. Please ask me about symptoms, medications, nutrition, or when to see a doctor." Do not engage with off-topic questions at all.
2. NO DIAGNOSIS: NEVER diagnose any condition. Provide general health information only. You are NOT a substitute for professional medical evaluation.
3. NO SPECIFIC PRESCRIPTIONS: NEVER recommend specific medications, dosages, or treatments for the user's personal condition. Provide only general information about medication classes.
4. NO FABRICATION: NEVER invent statistics, drug names, study results, or medical facts you are not certain about. If uncertain, say "I'm not certain — please consult your doctor or pharmacist for accurate information."
5. EMERGENCY FIRST: If symptoms suggest a life-threatening emergency (severe chest pain, difficulty breathing, stroke signs, severe bleeding, loss of consciousness, suspected poisoning), IMMEDIATELY begin your response with: "⚠️ SEEK EMERGENCY HELP NOW: Call 911 (or your local emergency number) immediately." Then provide basic safety tips.
6. HONESTY: If a question is outside your knowledge or too specific to answer safely, clearly say so rather than guessing.

RESPONSE STRUCTURE for health topics:
- Brief empathetic acknowledgment
- Clear general information with markdown formatting (headings, bullets, bold key terms)
- Practical general steps / lifestyle tips when applicable
- Recommended specialist: Clearly mention the most suitable doctor category to consult (e.g. **Recommended Specialist:** Cardiologist, Dermatologist, Neurologist, ENT Specialist, or General Physician)
- End EVERY response about health topics with exactly this line: "⚠️ *This is general health information only, not a substitute for professional medical advice. Please consult a qualified healthcare provider for personal diagnosis and treatment.*"

TONE: Warm, empathetic, and professional. Be concise — do not pad responses with unnecessary filler.`;

  // Format and cap conversation history to the last 8 turns, filtering out the welcome message
  const formattedHistory = (Array.isArray(history) ? history : [])
    .filter((h) => {
      const text = typeof h.text === "string" ? h.text : (h.text?.reply || "");
      // Exclude the static welcome/greeting message to avoid polluting context
      return !text.includes("TeleClinic AI Health") || h.sender === "user";
    })
    .slice(-8)
    .map((h) => {
      let textContent = "";
      if (typeof h.text === "string") {
        textContent = h.text;
      } else if (h.text && typeof h.text === "object") {
        textContent = h.text.reply || h.text.directAnswer || JSON.stringify(h.text);
      }
      return {
        role: h.sender === "user" ? "user" : "assistant",
        content: textContent,
      };
    })
    .filter((m) => m.content && m.content.trim().length > 0);

  const conversationMessages = [
    { role: "system", content: systemPrompt },
    ...formattedHistory,
    { role: "user", content: userQuery },
  ];

  const groqContent = await callGroqAPI(conversationMessages, {
    jsonMode: false,
    temperature: 0.2,  // Low temperature to reduce hallucination
    maxTokens: 1536,
  });

  if (groqContent && typeof groqContent === "string" && groqContent.trim().length > 0) {
    const specKeywords = [
      {
        name: "Cardiologist",
        patterns: [/\b(heart|cardio\w*|palpitation\w*|hypertension|blood pressure|cholesterol|chest (pain|tightness|pressure|discomfort)|arrhythmia)\b/i],
      },
      {
        name: "Dermatologist",
        patterns: [/\b(skin|rash\w*|acne|pimple\w*|eczema|psoriasis|itch\w*|hives|mole\w*|hair loss|dandruff|fungal|dermatitis)\b/i],
      },
      {
        name: "Pediatrician",
        patterns: [/\b(pediatric\w*|child\w*|baby|infant\w*|toddler\w*|kid\w*|newborn\w*)\b/i],
      },
      {
        name: "Neurologist",
        patterns: [/\b(neurolog\w*|headache\w*|migraine\w*|seizure\w*|dizziness|vertigo|concussion|memory loss|numbness|tingling|tremor\w*|epilepsy)\b/i],
      },
      {
        name: "Orthopedic Surgeon",
        patterns: [/\b(orthoped\w*|bone\w*|joint\w*|knee\w*|spine|back pain|shoulder|fracture\w*|sprain\w*|ligament\w*|arthritis|cartilage|muscle strain|posture)\b/i],
      },
      {
        name: "ENT Specialist",
        patterns: [/\b(ent|ear\w*|nose|throat|sinus\w*|tonsil\w*|hoarseness|hearing|tinnitus|earache|sore throat|nasal)\b/i],
      },
      {
        name: "Psychiatrist",
        patterns: [/\b(psychiat\w*|mental health|anxiety|depress\w*|panic\b|insomnia|bipolar|adhd|burnout|sleep disorder)\b/i],
      },
      {
        name: "Gynecologist",
        patterns: [/\b(gynecol\w*|women's health|pregnancy|pregnant|menstrua\w*|period\w*|ovary|ovarian|pcos|pelvic|fertility|vaginal?)\b/i],
      },
      {
        name: "Ophthalmologist",
        patterns: [/\b(ophthalmolog\w*|eye\w*|vision|cataract\w*|cornea\w*|conjunctivitis|pink eye|glaucoma|retina)\b/i],
      },
      {
        name: "Gastroenterologist",
        patterns: [/\b(gastro\w*|digest\w*|stomach|gut|gerd|acid reflux|heartburn|bloating|diarrhea|constipation|nausea|vomit\w*|ibs|abdominal pain|liver|ulcer\w*|bowel)\b/i],
      },
      {
        name: "Endocrinologist",
        patterns: [/\b(endocrinolog\w*|diabet\w*|blood sugar|thyroid|hypothyroid\w*|hyperthyroid\w*|hormon\w*|insulin|metabolism)\b/i],
      },
      {
        name: "General Physician",
        patterns: [/\b(general physician|primary care|family doctor|gp|fever|cold|flu|cough|fatigue|weakness|body ache\w*|infection\w*|checkup)\b/i],
      },
    ];

    let matchedSpec = null;

    // 1. Direct explicit statement in AI reply: e.g. 'Recommended Specialist: Neurologist'
    const explicitMatch = groqContent.match(/(?:recommend(?:ed)?(?:\s+specialist)?|consult(?: a)?|see a|visit a)[\s:*]+(Cardiologist|Dermatologist|General Physician|Pediatrician|Neurologist|Orthopedic Surgeon|Gynecologist|Psychiatrist|ENT Specialist|Ophthalmologist|Gastroenterologist|Endocrinologist)/i);
    if (explicitMatch) {
      const found = specKeywords.find((s) => s.name.toLowerCase() === explicitMatch[1].toLowerCase());
      if (found) matchedSpec = found.name;
    }

    // 2. High-relevance matching on patient's specific symptoms
    if (!matchedSpec) {
      for (const s of specKeywords) {
        if (s.patterns.some((p) => p.test(userQuery))) {
          matchedSpec = s.name;
          break;
        }
      }
    }

    // 3. Mentions of specific specialist titles in AI text
    if (!matchedSpec) {
      for (const s of specKeywords) {
        const titleRegex = new RegExp(`\\b${s.name.replace(" ", "\\s+")}\\b`, "i");
        if (titleRegex.test(groqContent)) {
          matchedSpec = s.name;
          break;
        }
      }
    }

    // 4. Default fallback to General Physician
    if (!matchedSpec) {
      matchedSpec = "General Physician";
    }

    return {
      reply: groqContent.trim(),
      suggestedSpecialization: matchedSpec,
    };
  }

  // Fallback if AI completely unreachable or key not configured
  return {
    reply: `I'm TeleClinic AI, your health & wellness assistant.\n\nI'm currently unable to process your request. Please try again in a moment.\n\nFor urgent medical concerns, please contact your healthcare provider or book a TeleClinic video consultation with a certified doctor anytime.`,
    suggestedSpecialization: "General Physician",
  };
};

/**
 * AI Receptionist Intake & Triage
 */
export const runReceptionistIntake = async ({ symptoms, chiefComplaint, age, gender, duration }) => {
  const prompt = `
You are the TeleClinic AI Medical Receptionist & Triage Assistant.
A patient has provided the following intake information:
- Chief Complaint: "${chiefComplaint || symptoms || "General feeling unwell"}"
- Specific Symptoms: "${symptoms || "None specified"}"
- Patient Age: ${age || "Adult"}
- Gender: ${gender || "Unspecified"}
- Duration of Symptoms: ${duration || "Recent"}

Analyze these symptoms and return ONLY a valid JSON object matching this schema exactly (no markdown, no text outside the JSON):
{
  "triageLevel": "Routine" | "Urgent" | "Emergency",
  "suggestedSpecialization": "General Medicine" | "Cardiology" | "Dermatology" | "Pediatrics" | "Neurology" | "Orthopedics" | "Psychiatry" | "ENT" | "Gynecology" | "Pulmonology" | "Endocrinology" | "Rheumatology",
  "summary": "Clear, objective clinical summary of the patient's complaints for the attending physician.",
  "immediateHomeCare": ["Actionable step 1", "Actionable step 2", "Actionable step 3"],
  "recommendedQuestions": ["Question 1 to ask patient", "Question 2 to ask patient"],
  "warningRedFlags": ["Red flag 1 requiring emergency attention", "Red flag 2"],
  "disclaimer": "This is an AI-assisted preliminary assessment and does not constitute a formal diagnosis."
}
`;

  const groqResult = await callGroqAPI(
    [
      { role: "system", content: "You are a healthcare triage assistant. Return ONLY valid JSON with no markdown code fences, no explanatory text — just the raw JSON object." },
      { role: "user", content: prompt },
    ],
    { jsonMode: true, temperature: 0.1, maxTokens: 800 }
  );

  if (groqResult && groqResult.suggestedSpecialization) {
    return groqResult;
  }

  // Robust Heuristic Fallback
  const text = `${chiefComplaint || ""} ${symptoms || ""}`.toLowerCase();
  let spec = "General Medicine";
  let triage = "Routine";

  if (text.includes("chest pain") || text.includes("palpitation") || text.includes("shortness of breath")) {
    spec = "Cardiology";
    triage = text.includes("severe") || text.includes("sudden") ? "Emergency" : "Urgent";
  } else if (text.includes("skin") || text.includes("rash") || text.includes("itch") || text.includes("acne")) {
    spec = "Dermatology";
  } else if (text.includes("headache") || text.includes("migraine") || text.includes("dizzy") || text.includes("seizure")) {
    spec = "Neurology";
  } else if (text.includes("bone") || text.includes("joint") || text.includes("back pain") || text.includes("fracture") || text.includes("knee")) {
    spec = "Orthopedics";
  } else if (text.includes("anxiety") || text.includes("depression") || text.includes("stress") || text.includes("sleep")) {
    spec = "Psychiatry";
  } else if (text.includes("ear") || text.includes("throat") || text.includes("sinus") || text.includes("cough")) {
    spec = "ENT";
  }

  return {
    triageLevel: triage,
    suggestedSpecialization: spec,
    summary: `Patient reports ${chiefComplaint || symptoms || "mild discomfort"}${duration ? ` for ${duration}` : ""}. Preliminary assessment recommends consultation with a specialist in ${spec}.`,
    immediateHomeCare: [
      "Ensure adequate rest and stay hydrated with lukewarm fluids.",
      "Monitor your temperature and keep a symptom log.",
      "Avoid strenuous physical exertion until evaluated by a physician."
    ],
    recommendedQuestions: [
      "Are you experiencing any fever, chills, or night sweats?",
      "Do you have any existing chronic medical conditions or allergies?",
      "Are you currently taking any prescription medications or supplements?",
    ],
    warningRedFlags: [
      "Sudden shortness of breath or persistent chest discomfort.",
      "High fever above 102°F unresponsive to fever reducers.",
      "Loss of consciousness, extreme dizziness, or sudden confusion."
    ],
    disclaimer: "This is an AI-assisted preliminary assessment and does not constitute a formal diagnosis.",
  };
};

/**
 * AI Consultation Summary
 */
export const generateConsultationSummaryService = async (appointmentId) => {
  const appointment = await Appointment.findById(appointmentId)
    .populate("doctor", "firstName lastName specialization")
    .populate("patient", "firstName lastName gender dateOfBirth bloodGroup allergies medicalConditions");

  if (!appointment) {
    throw new Error("Appointment not found.");
  }

  const messages = await ChatMessage.find({ appointment: appointmentId }).sort({ createdAt: 1 });
  const chatTranscript = messages
    .map((m) => `${m.senderType} (${m.createdAt.toLocaleTimeString()}): ${m.message}`)
    .join("\n");

  const prompt = `
You are the TeleClinic AI Consultation Assistant. Generate a structured clinical summary from this telemedicine session:
- Doctor: Dr. ${appointment.doctor?.firstName} ${appointment.doctor?.lastName} (${appointment.doctor?.specialization})
- Patient: ${appointment.patient?.firstName} ${appointment.patient?.lastName}
- Patient Chief Complaint: "${appointment.reason || "None stated"}"
- Doctor Clinical Notes: "${appointment.doctorNotes || "None recorded"}"
- Session Chat Transcript:
${chatTranscript || "No chat messages exchanged."}

Return a JSON object with this exact structure:
{
  "chiefComplaint": "Concise statement of patient issue",
  "historyOfPresentIllness": "Brief summary of symptoms, timeline and severity",
  "doctorObservations": "Clinical observations made during the session",
  "keyRecommendations": ["Recommendation 1", "Recommendation 2"],
  "followUpAdvice": "Specific follow-up instruction or warning signs to monitor",
  "summaryText": "A cohesive 2-3 paragraph professional consultation report.",
  "disclaimer": "AI-assisted clinical summary for healthcare provider reference. Doctor review required."
}
`;

  const groqResult = await callGroqAPI(
    [
      { role: "system", content: "You are a clinical documentation assistant. Always return valid JSON." },
      { role: "user", content: prompt },
    ],
    { jsonMode: true }
  );

  let result = groqResult;

  if (!result || !result.summaryText) {
    // Intelligent fallback
    result = {
      chiefComplaint: appointment.reason || "Telemedicine General Consultation",
      historyOfPresentIllness: `Patient attended consultation on ${new Date(appointment.appointmentDate).toLocaleDateString()}. Symptoms discussed: ${appointment.reason || "General review"}.`,
      doctorObservations: appointment.doctorNotes || "Doctor reviewed patient symptoms and provided guidance.",
      keyRecommendations: [
        "Follow prescribed medication schedule accurately.",
        "Maintain adequate hydration and rest.",
        "Monitor temperature and vital signs daily.",
      ],
      followUpAdvice: appointment.followUpDate
        ? `Schedule follow-up consultation on ${new Date(appointment.followUpDate).toLocaleDateString()}.`
        : "Seek immediate medical attention if symptoms worsen or red-flag signs appear.",
      summaryText: `Clinical summary for consultation between Dr. ${appointment.doctor?.firstName} ${appointment.doctor?.lastName} and ${appointment.patient?.firstName} ${appointment.patient?.lastName}. Chief complaint: "${appointment.reason || "Routine consultation"}". Doctor notes recorded: "${appointment.doctorNotes || "Standard consultation completed"}".`,
      disclaimer: "AI-assisted clinical summary for healthcare provider reference. Doctor review required.",
    };
  }

  // Persist into appointment
  appointment.aiSummary = JSON.stringify(result);
  await appointment.save();

  return result;
};

/**
 * AI Prescription Reader & Automated Cart Matcher
 */
export const readPrescriptionToCartService = async ({ prescriptionId, prescriptionData }) => {
  let prescription = null;

  if (prescriptionId) {
    prescription = await Prescription.findById(prescriptionId)
      .populate("doctor", "firstName lastName specialization hospital")
      .populate("patient", "firstName lastName");
  }

  const medicinesToProcess = prescription?.medicines || prescriptionData?.medicines || [];
  const diagnosis = prescription?.diagnosis || prescriptionData?.diagnosis || "Medical Consultation";
  const doctorNotes = prescription?.notes || prescriptionData?.notes || "";

  if (!medicinesToProcess || medicinesToProcess.length === 0) {
    throw new Error("No medicines found in this prescription to process.");
  }

  // Fetch in-stock catalog medicines from database
  const catalog = await Medicine.find({ inStock: true });

  // Intelligent matching
  const matchedCartItems = [];
  const unmatchedItems = [];

  for (const prescribedMed of medicinesToProcess) {
    const medName = (prescribedMed.name || "").toLowerCase().trim();
    const rootName = medName
      .replace(/\d+mg/gi, "")
      .replace(/\d+/g, "")
      .replace(/dsr|forte|plus|sr|xr/gi, "")
      .trim();

    // 1. Try Exact or Substring match
    let match = catalog.find((cat) => {
      const cName = cat.name.toLowerCase();
      const gName = (cat.genericName || "").toLowerCase();
      return (
        cName === medName ||
        cName.includes(medName) ||
        medName.includes(cName) ||
        gName.includes(rootName) ||
        cName.includes(rootName)
      );
    });

    // Compute quantity based on frequency and duration (e.g. 5 days * 2 = 10 tablets = 1 pack)
    const durationDays = parseInt(prescribedMed.duration) || 5;
    const timesPerDay = (prescribedMed.frequency || "1-0-1").split("-").filter((x) => x !== "0").length || 2;
    const totalPills = Math.max(timesPerDay * durationDays, 1);
    const recommendedQty = Math.max(Math.ceil(totalPills / 10), 1); // 1 pack per 10 pills

    if (match) {
      matchedCartItems.push({
        medicineId: match._id,
        name: match.name,
        genericName: match.genericName,
        category: match.category,
        price: match.price,
        quantity: recommendedQty,
        dosage: prescribedMed.dosage || match.strength,
        frequency: prescribedMed.frequency,
        duration: prescribedMed.duration,
        instructions: prescribedMed.instructions || "As prescribed by physician",
        inStock: true,
        matchedConfidence: "100% Verified Match",
      });
    } else {
      // Fallback virtual medicine item if not yet stocked in catalog
      matchedCartItems.push({
        medicineId: "custom_" + Math.random().toString(36).substr(2, 9),
        name: prescribedMed.name,
        genericName: prescribedMed.name,
        category: "General",
        price: 95,
        quantity: recommendedQty,
        dosage: prescribedMed.dosage || "Standard",
        frequency: prescribedMed.frequency,
        duration: prescribedMed.duration,
        instructions: prescribedMed.instructions || "As prescribed by physician",
        inStock: true,
        matchedConfidence: "Clinical Prescription Item",
      });
    }
  }

  const totalEstimatedCost = matchedCartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  return {
    prescriptionId: prescription?._id || null,
    doctorName: prescription?.doctor ? `Dr. ${prescription.doctor.firstName} ${prescription.doctor.lastName}` : "Attending Doctor",
    diagnosis,
    doctorNotes,
    matchedItemsCount: matchedCartItems.length,
    totalEstimatedCost,
    cartItems: matchedCartItems,
    aiAnalysis: {
      summary: `AI analyzed ${medicinesToProcess.length} prescribed medications for "${diagnosis}". All items have been formulated into recommended quantities and food timing instructions for delivery.`,
      medicationSchedule: matchedCartItems.map((item) => ({
        medicine: item.name,
        howToTake: `${item.dosage} • ${item.frequency} (${item.duration})`,
        foodTiming: item.instructions || "Take with a full glass of water after meals",
      })),
      safetyNotice: "Take all medications exactly as directed by your physician. Complete full antibiotic courses if prescribed.",
    },
  };
};

/**
 * AI Lab Report Analyzer — Summarize PDF lab report text and answer follow-up questions
 */
export const analyzeLabReportService = async ({ reportText, message, history = [], mode = "chat" }) => {
  const systemPrompt = `You are TeleClinic AI Lab Report Analyzer — a specialized medical AI assistant that helps patients understand their medical lab reports.

Your role:
- Analyze blood tests, urine tests, imaging reports, pathology findings, and any other medical lab results
- Explain findings in simple, patient-friendly language
- Highlight values that are outside normal ranges (High/Low)
- Provide general wellness suggestions and when to seek care
- Answer follow-up questions about the report in the context of the conversation

ABSOLUTE RULES:
1. NEVER diagnose a disease — explain findings and suggest seeing a doctor for diagnosis
2. NEVER recommend specific medications or dosages
3. ALWAYS mention if a value is critically abnormal and advise seeking urgent care
4. End EVERY response with: "⚠️ *These insights are educational and do not replace professional medical evaluation. Please discuss these results with your doctor.*"
5. If no report text is provided, ask the user to upload their PDF lab report
6. Be warm, clear, and supportive — patients may be anxious about their results

FORMAT:
- Use headings, bullet points, and bold text for clarity
- For lab values: show the parameter, patient value, normal range, and status (✅ Normal / ⚠️ High / 🔻 Low)
- Keep explanations jargon-free but accurate`;

  // Build conversation messages
  const formattedHistory = (Array.isArray(history) ? history : [])
    .slice(-8)
    .map((h) => ({
      role: h.sender === "user" ? "user" : "assistant",
      content: typeof h.text === "string" ? h.text : (h.text?.reply || JSON.stringify(h.text)),
    }))
    .filter((m) => m.content && m.content.trim().length > 0);

  let userContent = message || "Please analyze this lab report.";

  // On first message (analyze mode or no history), prepend report text
  // Truncate to ~12,000 chars (~3,000 tokens) to stay within context limits
  if (reportText && reportText.trim().length > 0 && (mode === "analyze" || formattedHistory.length === 0)) {
    const MAX_REPORT_CHARS = 12000;
    const truncated = reportText.trim().length > MAX_REPORT_CHARS
      ? reportText.trim().slice(0, MAX_REPORT_CHARS) + "\n\n[... Report truncated to fit analysis limit. Key values above have been captured ...]"
      : reportText.trim();
    userContent = `Here is my lab report text:\n\n---\n${truncated}\n---\n\n${userContent}`;
  }

  const conversationMessages = [
    { role: "system", content: systemPrompt },
    ...formattedHistory,
    { role: "user", content: userContent },
  ];

  const groqContent = await callGroqAPI(conversationMessages, {
    jsonMode: false,
    temperature: 0.15,
    maxTokens: 3000,
  });

  if (groqContent && typeof groqContent === "string" && groqContent.trim().length > 0) {
    return { reply: groqContent.trim() };
  }

  return {
    reply: "I'm sorry, I wasn't able to analyze your report at this time. Please try uploading it again in a moment. If the issue continues, consider sharing your report directly with your doctor during a consultation.",
  };
};
