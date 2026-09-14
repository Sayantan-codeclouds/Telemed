import { useState, useRef, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Bot,
  Sparkles,
  Send,
  Loader2,
  Stethoscope,
  ArrowRight,
  MessageSquare,
  Lightbulb,
  Trash2,
  Copy,
  Check,
  User,
  FileText,
  Upload,
  Download,
  FlaskConical,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import api from "@/api/axios";
import jsPDF from "jspdf";
import html2canvas from "html2canvas-pro";
import * as pdfjsLib from "pdfjs-dist";

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).href;

/**
 * Clean, lightweight Markdown formatter for rich AI clinical chat responses
 */
function MarkdownMessage({ content }) {
  if (!content) return null;

  const lines = content.split("\n");
  const elements = [];
  let inList = false;
  let listItems = [];
  let inTable = false;
  let tableRows = [];

  const flushList = () => {
    if (inList && listItems.length > 0) {
      elements.push(
        <ul key={`list-${elements.length}`} className="my-2 space-y-1.5 pl-1">
          {listItems.map((item, idx) => (
            <li key={idx} className="text-xs text-slate-700 flex items-start gap-2 leading-relaxed">
              <span className="text-purple-600 font-bold mt-0.5">•</span>
              <span dangerouslySetInnerHTML={{ __html: formatInline(item) }} />
            </li>
          ))}
        </ul>
      );
      listItems = [];
      inList = false;
    }
  };

  const flushTable = () => {
    if (inTable && tableRows.length > 0) {
      const headers = tableRows[0];
      const rows = tableRows.slice(1).filter((r) => !r.every((c) => /^[-:| ]+$/.test(c)));

      elements.push(
        <div key={`table-${elements.length}`} className="my-3 overflow-x-auto rounded-xl border border-slate-200">
          <table className="min-w-full text-xs text-left">
            {headers && (
              <thead className="bg-slate-100/80 text-slate-800 font-bold border-b border-slate-200">
                <tr>
                  {headers.map((h, i) => (
                    <th key={i} className="px-3 py-2" dangerouslySetInnerHTML={{ __html: formatInline(h) }} />
                  ))}
                </tr>
              </thead>
            )}
            <tbody className="divide-y divide-slate-100 bg-white">
              {rows.map((row, rIdx) => (
                <tr key={rIdx} className={rIdx % 2 === 0 ? "bg-white" : "bg-slate-50/50"}>
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="px-3 py-2 text-slate-700 font-medium" dangerouslySetInnerHTML={{ __html: formatInline(cell) }} />
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      tableRows = [];
      inTable = false;
    }
  };

  const formatInline = (text) => {
    if (!text) return "";
    return text
      .replace(/\*\*(.*?)\*\*/g, "<strong class='font-bold text-slate-900'>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em class='italic'>$1</em>")
      .replace(/`([^`]+)`/g, "<code class='bg-slate-100 text-purple-700 px-1 py-0.5 rounded text-[11px] font-mono'>$1</code>");
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
      flushList();
      inTable = true;
      const cols = trimmed.slice(1, -1).split("|").map((c) => c.trim());
      tableRows.push(cols);
      continue;
    } else {
      flushTable();
    }

    if (/^---$|^___$|^\*\*\*$/.test(trimmed)) {
      flushList();
      elements.push(<hr key={`hr-${i}`} className="my-3 border-slate-200" />);
      continue;
    }

    if (trimmed.startsWith("### ")) {
      flushList();
      elements.push(
        <h4 key={`h3-${i}`} className="text-xs font-bold text-purple-900 uppercase tracking-wider mt-3 mb-1 flex items-center gap-1.5">
          <span dangerouslySetInnerHTML={{ __html: formatInline(trimmed.slice(4)) }} />
        </h4>
      );
      continue;
    }

    if (trimmed.startsWith("## ") || trimmed.startsWith("# ")) {
      flushList();
      const text = trimmed.startsWith("## ") ? trimmed.slice(3) : trimmed.slice(2);
      elements.push(
        <h3 key={`h2-${i}`} className="text-sm font-black text-slate-900 mt-3 mb-1.5">
          <span dangerouslySetInnerHTML={{ __html: formatInline(text) }} />
        </h3>
      );
      continue;
    }

    if (trimmed.startsWith("- ") || trimmed.startsWith("* ") || trimmed.startsWith("• ") || /^\d+\.\s/.test(trimmed)) {
      inList = true;
      const cleanItem = trimmed.replace(/^[-*•]\s+/, "").replace(/^\d+\.\s+/, "");
      listItems.push(cleanItem);
      continue;
    } else {
      flushList();
    }

    if (!trimmed) continue;

    elements.push(
      <p key={`p-${i}`} className="text-xs text-slate-700 leading-relaxed font-normal my-1.5">
        <span dangerouslySetInnerHTML={{ __html: formatInline(trimmed) }} />
      </p>
    );
  }

  flushList();
  flushTable();

  return <div className="space-y-1">{elements}</div>;
}

// ---- Helper: extract text from a PDF File using pdf.js ----
async function extractPdfText(file) {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let fullText = "";
  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map((item) => item.str).join(" ");
    fullText += `\n--- Page ${pageNum} ---\n${pageText}`;
  }
  return fullText.trim();
}

// ---- Helper: Download chat visually as high-resolution PDF snapshot ----
async function downloadElementAsPdf(element, fileName = "lab-report-analysis.pdf", options = {}) {
  if (!element) return;

  // Create clean printable clone container
  const printContainer = document.createElement("div");
  printContainer.setAttribute("data-pdf-container", "true");
  printContainer.style.position = "fixed";
  printContainer.style.top = "0px";
  printContainer.style.left = "0px";
  printContainer.style.width = "780px";
  printContainer.style.backgroundColor = "#ffffff";
  printContainer.style.padding = "32px";
  printContainer.style.fontFamily = "Inter, system-ui, -apple-system, sans-serif";
  printContainer.style.zIndex = "-99999";
  printContainer.style.pointerEvents = "none";

  // Header branding
  const headerHtml = `
    <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #f1f5f9; padding-bottom: 16px; margin-bottom: 24px;">
      <div style="display: flex; align-items: center; gap: 12px;">
        <div style="width: 36px; height: 36px; border-radius: 10px; background: #0f172a; display: flex; align-items: center; justify-content: center; color: #ffffff; font-size: 18px;">
          🏥
        </div>
        <div>
          <h1 style="font-size: 17px; font-weight: 800; color: #0f172a; margin: 0; line-height: 1.2;">TeleClinic AI</h1>
          <p style="font-size: 11px; font-weight: 600; color: #64748b; margin: 0;">${options.subtitle || "AI Health & Clinical Lab Analysis"}</p>
        </div>
      </div>
      <div style="text-align: right;">
        <span style="display: inline-block; font-size: 10px; font-weight: 700; background: #f8fafc; color: #475569; border: 1px solid #e2e8f0; padding: 4px 10px; border-radius: 9999px; margin-bottom: 4px;">
          ${options.reportName || "Clinical Report"}
        </span>
        <p style="font-size: 10px; color: #94a3b8; margin: 0;">Generated: ${new Date().toLocaleString()}</p>
      </div>
    </div>
  `;

  // Clone content
  const clonedContent = element.cloneNode(true);
  clonedContent.style.maxHeight = "none";
  clonedContent.style.height = "auto";
  clonedContent.style.overflow = "visible";
  clonedContent.style.backgroundColor = "transparent";

  // Reset any internal scrollable containers and strip CSS animations that could cause opacity: 0
  clonedContent.querySelectorAll("*").forEach((el) => {
    el.classList?.remove?.("animate-in", "fade-in", "duration-200");
    el.style.animation = "none";
    el.style.transition = "none";
    el.style.opacity = "1";
    if (el.classList?.contains("overflow-y-auto") || el.classList?.contains("overflow-x-auto")) {
      el.style.overflow = "visible";
      el.style.maxHeight = "none";
    }
  });

  // Remove small interactive buttons from clone (copy button, suggestion pills)
  clonedContent.querySelectorAll("button").forEach((btn) => {
    if (
      btn.title === "Copy response" ||
      btn.getAttribute("title")?.includes("Copy") ||
      btn.textContent?.includes("Copy") ||
      btn.textContent?.includes("Copied")
    ) {
      btn.remove();
    }
  });

  printContainer.innerHTML = headerHtml;
  printContainer.appendChild(clonedContent);

  // Footer disclaimer
  const footerHtml = document.createElement("div");
  footerHtml.style.marginTop = "28px";
  footerHtml.style.paddingTop = "16px";
  footerHtml.style.borderTop = "1px solid #f1f5f9";
  footerHtml.style.fontSize = "10px";
  footerHtml.style.color = "#94a3b8";
  footerHtml.style.display = "flex";
  footerHtml.style.justifyContent = "space-between";
  footerHtml.innerHTML = `
    <span>⚠️ TeleClinic AI educational insights are for reference only. Not a formal diagnosis.</span>
    <span>teleclinic.health</span>
  `;
  printContainer.appendChild(footerHtml);

  document.body.appendChild(printContainer);

  try {
    const fullHeight = Math.max(printContainer.scrollHeight, printContainer.offsetHeight, 100);

    const canvas = await html2canvas(printContainer, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
      windowWidth: 780,
      width: 780,
      height: fullHeight,
      x: 0,
      y: 0,
      scrollX: 0,
      scrollY: 0,
      onclone: (clonedDoc) => {
        const target = clonedDoc.querySelector('[data-pdf-container="true"]');
        if (target) {
          target.style.position = "static";
          target.style.zIndex = "1";
          target.style.pointerEvents = "auto";
        }
      },
    });

    if (!canvas || canvas.width === 0 || canvas.height === 0) {
      throw new Error("Canvas snapshot returned empty dimensions.");
    }

    const doc = new jsPDF({ unit: "pt", format: "a4", orientation: "portrait" });
    const pdfWidth = doc.internal.pageSize.getWidth();
    const pdfHeight = doc.internal.pageSize.getHeight();

    const pageHeightPx = Math.floor((canvas.width * pdfHeight) / pdfWidth);
    let renderedHeight = 0;

    while (renderedHeight < canvas.height) {
      const currentSliceHeight = Math.min(pageHeightPx, canvas.height - renderedHeight);
      if (currentSliceHeight <= 0) break;

      const pageCanvas = document.createElement("canvas");
      pageCanvas.width = canvas.width;
      pageCanvas.height = currentSliceHeight;
      const ctx = pageCanvas.getContext("2d");
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
      ctx.drawImage(
        canvas,
        0, renderedHeight, canvas.width, currentSliceHeight,
        0, 0, canvas.width, currentSliceHeight
      );

      const pageImgData = pageCanvas.toDataURL("image/jpeg", 0.95);
      const slicePdfHeight = (currentSliceHeight * pdfWidth) / canvas.width;

      if (renderedHeight > 0) {
        doc.addPage();
      }
      doc.addImage(pageImgData, "JPEG", 0, 0, pdfWidth, slicePdfHeight);
      renderedHeight += currentSliceHeight;
    }

    doc.save(fileName);
  } finally {
    document.body.removeChild(printContainer);
  }
}

export default function AIAssistant() {
  const [activeTab, setActiveTab] = useState("chat"); // "chat" | "lab"

  // ---------------- Health Chat State ----------------
  const [chatMessages, setChatMessages] = useState([
    {
      sender: "ai",
      text: "Hello! I am your **TeleClinic AI Health & Wellness Assistant**.\n\nAsk me anything about symptoms, home care remedies, diet and nutrition, medications, exercise, sleep habits, or when to consult a specialist doctor.",
      timestamp: "Just now",
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const chatEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  // ---------------- Lab Report State ----------------
  const [labMessages, setLabMessages] = useState([]);
  const [labInput, setLabInput] = useState("");
  const [labLoading, setLabLoading] = useState(false);
  const [labFile, setLabFile] = useState(null); // { name, text }
  const [pdfParseLoading, setPdfParseLoading] = useState(false);
  const [labCopiedIndex, setLabCopiedIndex] = useState(null);
  const labEndRef = useRef(null);
  const labContainerRef = useRef(null);
  const fileInputRef = useRef(null);

  const quickPrompts = [
    { title: "Fever & Chills", query: "What are the best home remedies for a mild fever (100 F) and body aches?" },
    { title: "Migraine Relief", query: "How can I relieve a throbbing headache or migraine naturally?" },
    { title: "Lower Blood Pressure", query: "What diet and lifestyle changes help lower blood pressure naturally?" },
    { title: "Acid Reflux & GERD", query: "What foods soothe acid reflux and what should I strictly avoid?" },
    { title: "Sleep & Insomnia", query: "What are proven natural steps to fall asleep faster without pills?" },
    { title: "Immunity Boost", query: "What daily nutrition and vitamins strengthen the immune system?" },
  ];

  useEffect(() => {
    if (activeTab === "chat") {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, activeTab, chatLoading]);

  useEffect(() => {
    if (activeTab === "lab") {
      labEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [labMessages, activeTab, labLoading]);

  // ---- Health Chat ----
  const handleSendMessage = async (customQuery = null) => {
    const query = (customQuery || inputMessage).trim();
    if (!query || chatLoading) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const userMsg = { sender: "user", text: query, timestamp: timeStr };
    const newMessages = [...chatMessages, userMsg];
    setChatMessages(newMessages);
    if (!customQuery) setInputMessage("");
    setChatLoading(true);

    try {
      const storedPatient = JSON.parse(localStorage.getItem("patient") || "{}");
      const { data } = await api.post("/ai/health-advice", {
        message: query,
        history: newMessages.slice(-10).map((m) => ({
          sender: m.sender,
          text: typeof m.text === "string" ? m.text : m.text?.reply || m.text?.directAnswer || JSON.stringify(m.text),
        })),
        patientContext: {
          age: storedPatient.dateOfBirth
            ? new Date().getFullYear() - new Date(storedPatient.dateOfBirth).getFullYear()
            : 28,
          gender: storedPatient.gender || "Unspecified",
          allergies: storedPatient.allergies || [],
          medicalConditions: storedPatient.medicalConditions || [],
        },
      });

      const replyData = data?.data;
      const replyText = typeof replyData === "string"
        ? replyData
        : (replyData?.reply || replyData?.directAnswer || "I am here to assist you.");
      const suggestedSpec = replyData?.suggestedSpecialization || null;

      setChatMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: replyText,
          suggestedSpecialization: suggestedSpec,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } catch (error) {
      console.error("AI chat error:", error);
      toast.error(error.response?.data?.message || "Failed to get AI health advice.");
    } finally {
      setChatLoading(false);
    }
  };

  const handleClearChat = () => {
    setChatMessages([
      {
        sender: "ai",
        text: "Chat cleared. Hello! I am your **TeleClinic AI Health & Wellness Assistant**. How can I help you today?",
        timestamp: "Just now",
      },
    ]);
    toast.success("Conversation history reset.");
  };

  const handleCopyText = (text, index, isLab = false) => {
    const stringText = typeof text === "string" ? text : text?.reply || text?.directAnswer || JSON.stringify(text);
    navigator.clipboard.writeText(stringText);
    if (isLab) {
      setLabCopiedIndex(index);
      setTimeout(() => setLabCopiedIndex(null), 2000);
    } else {
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    }
    toast.success("Copied to clipboard!");
  };

  // ---- Lab Report Upload ----
  const handlePdfUpload = useCallback(async (file) => {
    if (!file || file.type !== "application/pdf") {
      toast.error("Please upload a valid PDF file.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("PDF must be under 10 MB.");
      return;
    }

    setPdfParseLoading(true);
    try {
      const text = await extractPdfText(file);
      if (!text || text.trim().length < 50) {
        toast.error("Could not extract text from this PDF. It may be a scanned image-only PDF.");
        setPdfParseLoading(false);
        return;
      }

      setLabFile({ name: file.name, text });
      setLabMessages([]);

      // Auto-send initial analysis
      const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      const autoMsg = { sender: "user", text: "Please analyze this lab report and summarize the key findings.", timestamp: timeStr };
      setLabMessages([autoMsg]);
      setLabLoading(true);

      const { data } = await api.post("/ai/analyze-lab-report", {
        reportText: text,
        message: "Please analyze this lab report and summarize the key findings, highlight any abnormal values, and provide general wellness suggestions.",
        history: [],
        mode: "analyze",
      });

      const reply = data?.data?.reply || "Analysis complete.";
      setLabMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: reply,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
      toast.success(`"${file.name}" analyzed successfully!`);
    } catch (err) {
      console.error("PDF parse error:", err);
      toast.error("Failed to parse PDF. Please try again.");
    } finally {
      setPdfParseLoading(false);
      setLabLoading(false);
    }
  }, []);

  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handlePdfUpload(file);
    e.target.value = "";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handlePdfUpload(file);
  };

  const handleDragOver = (e) => e.preventDefault();

  // ---- Lab Chat ----
  const handleLabSend = async () => {
    const query = labInput.trim();
    if (!query || labLoading) return;
    if (!labFile) {
      toast.error("Please upload a lab report PDF first.");
      return;
    }

    const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const userMsg = { sender: "user", text: query, timestamp: timeStr };
    const newMessages = [...labMessages, userMsg];
    setLabMessages(newMessages);
    setLabInput("");
    setLabLoading(true);

    try {
      const { data } = await api.post("/ai/analyze-lab-report", {
        reportText: labFile.text,
        message: query,
        history: newMessages.slice(-10).map((m) => ({
          sender: m.sender,
          text: typeof m.text === "string" ? m.text : m.text?.reply || JSON.stringify(m.text),
        })),
        mode: "chat",
      });

      const reply = data?.data?.reply || "I'm here to help with your lab report.";
      setLabMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: reply,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to get AI analysis.");
    } finally {
      setLabLoading(false);
    }
  };

  const handleClearLab = () => {
    setLabFile(null);
    setLabMessages([]);
    setLabInput("");
    toast.success("Lab session cleared.");
  };

  const handleDownloadPdf = async () => {
    if (labMessages.length === 0) {
      toast.error("No analysis to download yet.");
      return;
    }
    if (!labContainerRef.current) {
      toast.error("Could not find chat content to capture.");
      return;
    }
    setDownloadingPdf(true);
    try {
      const safeName = labFile?.name?.replace(/\.pdf$/i, "") || "lab-report";
      await downloadElementAsPdf(labContainerRef.current, `${safeName}-analysis.pdf`, {
        subtitle: "AI Clinical Lab Report Analysis",
        reportName: labFile?.name || "Lab Report",
      });
      toast.success("Visual PDF downloaded successfully!");
    } catch (err) {
      console.error("PDF export error:", err);
      toast.error("Failed to generate PDF. Please try again.");
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleDownloadHealthChatPdf = async () => {
    if (chatMessages.length <= 1) {
      toast.error("No conversation to download yet.");
      return;
    }
    if (!chatContainerRef.current) {
      toast.error("Could not find chat content to capture.");
      return;
    }
    setDownloadingPdf(true);
    try {
      await downloadElementAsPdf(chatContainerRef.current, "health-advisor-consultation.pdf", {
        subtitle: "AI Health & Wellness Clinical Consultation",
        reportName: "Consultation Chat",
      });
      toast.success("Visual PDF downloaded successfully!");
    } catch (err) {
      console.error("PDF export error:", err);
      toast.error("Failed to generate PDF. Please try again.");
    } finally {
      setDownloadingPdf(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-teal-600 flex items-center justify-center text-white shadow-md shadow-purple-200">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900">AI Health Assistant</h1>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                ● Live Clinical AI
              </span>
            </div>
            <p className="text-gray-500 text-xs mt-0.5">
              Conversational health advisor & AI-powered lab report analyzer
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2">
          {activeTab === "chat" && chatMessages.length > 1 && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={downloadingPdf}
                onClick={handleDownloadHealthChatPdf}
                className="text-xs text-slate-600 hover:text-purple-600 hover:bg-purple-50 rounded-xl h-9 px-3 gap-1.5 cursor-pointer border-slate-200"
              >
                {downloadingPdf ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-600" /> Generating...
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" /> Download PDF
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearChat}
                className="text-xs text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl h-9 px-3 gap-1.5 cursor-pointer border-slate-200"
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear Chat
              </Button>
            </div>
          )}
          {activeTab === "lab" && labMessages.length > 0 && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={downloadingPdf}
                onClick={handleDownloadPdf}
                className="text-xs text-slate-600 hover:text-teal-600 hover:bg-teal-50 rounded-xl h-9 px-3 gap-1.5 cursor-pointer border-slate-200"
              >
                {downloadingPdf ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-teal-600" /> Generating...
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" /> Download PDF
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearLab}
                className="text-xs text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl h-9 px-3 gap-1.5 cursor-pointer border-slate-200"
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear
              </Button>
            </div>
          )}

          <div className="flex bg-slate-100 p-1 rounded-2xl shrink-0">
            <button
              onClick={() => setActiveTab("chat")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "chat"
                  ? "bg-white text-purple-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <MessageSquare className="w-4 h-4" /> Health Advisor
            </button>
            <button
              onClick={() => setActiveTab("lab")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "lab"
                  ? "bg-white text-teal-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <FlaskConical className="w-4 h-4" /> Lab Report AI
            </button>
          </div>
        </div>
      </div>

      {/* ---- TAB 1: Health Advisor Chat ---- */}
      {activeTab === "chat" && (
        <div className="space-y-4">
          {/* Quick Prompt Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" /> Prompts:
            </span>
            {quickPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(p.query)}
                className="shrink-0 text-xs bg-white border border-slate-200 text-slate-700 hover:border-purple-300 hover:bg-purple-50/50 hover:text-purple-700 font-semibold px-3 py-1.5 rounded-full transition shadow-2xs cursor-pointer"
              >
                {p.title}
              </button>
            ))}
          </div>

          {/* Chat Window */}
          <Card className="border border-slate-200/80 shadow-xs rounded-3xl bg-white overflow-hidden flex flex-col h-[640px]">
            <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-slate-50/60">
              {chatMessages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"} animate-in fade-in duration-200`}
                >
                  {msg.sender === "user" ? (
                    <div className="flex items-start gap-2 max-w-lg">
                      <div className="space-y-1">
                        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl rounded-tr-none px-4 py-3 text-xs sm:text-sm shadow-sm font-medium leading-relaxed">
                          {typeof msg.text === "string" ? msg.text : msg.text?.reply || JSON.stringify(msg.text)}
                        </div>
                        {msg.timestamp && (
                          <p className="text-[10px] text-slate-400 text-right pr-1">{msg.timestamp}</p>
                        )}
                      </div>
                      <div className="w-7 h-7 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 mt-0.5">
                        <User className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-3 max-w-2xl">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shrink-0 mt-1 shadow-xs">
                        <Bot className="w-4 h-4" />
                      </div>
                      <div className="space-y-2 flex-1">
                        <div className="bg-white border border-slate-200/80 rounded-3xl rounded-tl-none p-5 sm:p-6 shadow-xs space-y-3 relative group">
                          <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-xs">
                            <span className="font-bold text-slate-900 flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-purple-600" /> TeleClinic AI Advisor
                            </span>
                            <button
                              onClick={() => handleCopyText(msg.text, index)}
                              className="text-slate-400 hover:text-slate-700 text-[11px] flex items-center gap-1 p-1 rounded hover:bg-slate-100 transition cursor-pointer"
                              title="Copy response"
                            >
                              {copiedIndex === index ? (
                                <><Check className="w-3 h-3 text-emerald-600" /> <span className="text-emerald-600 font-bold">Copied</span></>
                              ) : (
                                <><Copy className="w-3 h-3" /> Copy</>
                              )}
                            </button>
                          </div>
                          <MarkdownMessage
                            content={
                              typeof msg.text === "string"
                                ? msg.text
                                : msg.text?.reply || msg.text?.directAnswer || JSON.stringify(msg.text)
                            }
                          />
                          {/* Recommended Doctor Category & Direct Action Button */}
                          {(() => {
                            const spec = msg.suggestedSpecialization || (index > 0 ? "General Physician" : null);
                            if (spec) {
                              return (
                                <div className="mt-4 p-4 rounded-2xl bg-gradient-to-br from-purple-50/90 via-indigo-50/40 to-white border border-purple-200/90 shadow-2xs space-y-3">
                                  {/* Top Header Row: Icon + Category Info & Action Button */}
                                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                                        <Stethoscope className="w-5 h-5" />
                                      </div>
                                      <div>
                                        <div className="flex items-center gap-2">
                                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-700 bg-purple-100/90 px-2 py-0.5 rounded-md border border-purple-200 whitespace-nowrap">
                                            Recommended Specialist
                                          </span>
                                        </div>
                                        <h4 className="text-sm font-bold text-slate-900 mt-0.5">
                                          {spec}
                                        </h4>
                                      </div>
                                    </div>

                                    <Link to={`/patient/doctors?specialization=${encodeURIComponent(spec)}`} className="w-full sm:w-auto shrink-0">
                                      <Button
                                        size="sm"
                                        className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs h-9 px-4 font-bold shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap"
                                      >
                                        Book Consultation <ArrowRight className="w-3.5 h-3.5" />
                                      </Button>
                                    </Link>
                                  </div>

                                  {/* Descriptive subtitle with breathing room */}
                                  <p className="text-xs text-slate-600 leading-relaxed border-t border-purple-100/80 pt-2.5">
                                    Connect with certified <strong>{spec}s</strong> on TeleClinic via encrypted video for clinical diagnosis, guidance, and digital prescriptions.
                                  </p>
                                </div>
                              );
                            }
                            if (index === 0) {
                              return (
                                <div className="mt-3.5 p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                                  <div className="flex items-center gap-2.5 text-xs text-slate-600">
                                    <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                                      <Stethoscope className="w-3.5 h-3.5" />
                                    </div>
                                    <span>Looking to speak with a physician right away?</span>
                                  </div>
                                  <Link to="/patient/doctors" className="w-full sm:w-auto shrink-0">
                                    <Button size="sm" variant="outline" className="w-full sm:w-auto text-purple-700 border-purple-200 hover:bg-purple-50 rounded-xl text-xs h-8 px-3 font-semibold shrink-0 cursor-pointer flex items-center justify-center gap-1">
                                      Browse All Doctors <ArrowRight className="w-3 h-3" />
                                    </Button>
                                  </Link>
                                </div>
                              );
                            }
                            return null;
                          })()}
                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                            <span>Educational Guidance • Not a substitute for formal diagnosis</span>
                            {msg.timestamp && <span>{msg.timestamp}</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {chatLoading && (
                <div className="flex items-start gap-3 max-w-md animate-in fade-in">
                  <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="p-4 bg-white rounded-3xl rounded-tl-none border border-slate-200/80 shadow-xs flex items-center gap-3">
                    <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                    <p className="text-xs text-slate-600 font-semibold">Consulting clinical AI & medical knowledge base...</p>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-4 border-t border-slate-200 bg-white">
              <form
                onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
                className="flex items-center gap-3"
              >
                <Input
                  placeholder="Ask about symptoms, medical doubts, remedies, medications, sleep..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  className="rounded-2xl bg-slate-50 border-slate-200 focus:bg-white text-xs sm:text-sm h-12 shadow-2xs"
                  disabled={chatLoading}
                />
                <Button
                  type="submit"
                  disabled={chatLoading || !inputMessage.trim()}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold rounded-2xl h-12 px-6 shrink-0 shadow-md shadow-purple-200 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </Card>
        </div>
      )}

      {/* ---- TAB 2: Lab Report AI Analyzer ---- */}
      {activeTab === "lab" && (
        <div className="space-y-4">
          {/* Info banner */}
          <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-200/80 rounded-2xl">
            <FlaskConical className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
            <div className="text-xs text-teal-900">
              <strong className="font-bold">How it works:</strong> Upload your PDF lab report → AI extracts and analyzes the text → Get a clear summary with normal/abnormal flags → Ask follow-up questions in chat → Download the full analysis as PDF.
            </div>
          </div>

          {/* Upload Zone — shown when no file loaded */}
          {!labFile && (
            <div
              className="border-2 border-dashed border-slate-300 rounded-3xl p-12 text-center bg-slate-50/60 hover:border-teal-400 hover:bg-teal-50/30 transition-colors cursor-pointer group"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={handleFileInputChange}
              />
              {pdfParseLoading ? (
                <div className="space-y-3">
                  <Loader2 className="w-12 h-12 animate-spin text-teal-600 mx-auto" />
                  <p className="text-sm font-bold text-teal-700">Parsing PDF & extracting text...</p>
                  <p className="text-xs text-slate-500">This may take a few seconds</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-teal-500 to-cyan-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-teal-200 group-hover:scale-105 transition-transform">
                    <Upload className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="text-base font-bold text-slate-800">Drop your Lab Report PDF here</p>
                    <p className="text-xs text-slate-500 mt-1">or click to browse — supports blood tests, urine tests, imaging, pathology reports</p>
                  </div>
                  <div className="flex items-center justify-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1"><FileText className="w-3.5 h-3.5" /> PDF only</span>
                    <span>•</span>
                    <span>Max 10 MB</span>
                    <span>•</span>
                    <span>Text-based PDF required</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* File loaded — chat interface */}
          {labFile && (
            <Card className="border border-slate-200/80 shadow-xs rounded-3xl bg-white overflow-hidden flex flex-col h-[640px]">
              {/* File header bar */}
              <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-teal-50 to-cyan-50 border-b border-teal-100">
                <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-teal-900 truncate">{labFile.name}</p>
                  <p className="text-[10px] text-teal-700">{Math.round(labFile.text.length / 5)} words extracted • Ready for analysis</p>
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs text-teal-700 font-semibold flex items-center gap-1 hover:text-teal-900 cursor-pointer shrink-0 border border-teal-200 bg-white rounded-xl px-2.5 py-1.5 hover:bg-teal-50 transition"
                >
                  <Upload className="w-3 h-3" /> Change
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={handleFileInputChange}
                />
              </div>

              {/* Messages */}
              <div ref={labContainerRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-slate-50/60">
                {labMessages.length === 0 && !labLoading && (
                  <div className="flex flex-col items-center justify-center h-full text-center space-y-3 py-12">
                    <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto">
                      <FlaskConical className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-bold text-slate-700">Starting analysis...</p>
                    <p className="text-xs text-slate-400">AI is reading your lab report</p>
                  </div>
                )}

                {labMessages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"} animate-in fade-in duration-200`}
                  >
                    {msg.sender === "user" ? (
                      <div className="flex items-start gap-2 max-w-lg">
                        <div className="space-y-1">
                          <div className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-2xl rounded-tr-none px-4 py-3 text-xs sm:text-sm shadow-sm font-medium leading-relaxed">
                            {typeof msg.text === "string" ? msg.text : msg.text?.reply || JSON.stringify(msg.text)}
                          </div>
                          {msg.timestamp && (
                            <p className="text-[10px] text-slate-400 text-right pr-1">{msg.timestamp}</p>
                          )}
                        </div>
                        <div className="w-7 h-7 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center shrink-0 mt-0.5">
                          <User className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-3 max-w-2xl">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-teal-600 to-cyan-600 text-white flex items-center justify-center shrink-0 mt-1 shadow-xs">
                          <FlaskConical className="w-4 h-4" />
                        </div>
                        <div className="space-y-2 flex-1">
                          <div className="bg-white border border-slate-200/80 rounded-3xl rounded-tl-none p-5 sm:p-6 shadow-xs space-y-3">
                            <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-xs">
                              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5 text-teal-600" /> Lab Report Analyzer
                              </span>
                              <button
                                onClick={() => handleCopyText(msg.text, index, true)}
                                className="text-slate-400 hover:text-slate-700 text-[11px] flex items-center gap-1 p-1 rounded hover:bg-slate-100 transition cursor-pointer"
                              >
                                {labCopiedIndex === index ? (
                                  <><Check className="w-3 h-3 text-emerald-600" /> <span className="text-emerald-600 font-bold">Copied</span></>
                                ) : (
                                  <><Copy className="w-3 h-3" /> Copy</>
                                )}
                              </button>
                            </div>
                            <MarkdownMessage
                              content={typeof msg.text === "string" ? msg.text : msg.text?.reply || JSON.stringify(msg.text)}
                            />
                            {/* Doctor Review Recommendation Card */}
                            <div className="mt-4 p-4 rounded-2xl bg-gradient-to-br from-teal-50/90 via-cyan-50/40 to-white border border-teal-200/90 shadow-2xs space-y-3">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                                    <Stethoscope className="w-5 h-5" />
                                  </div>
                                  <div>
                                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-700 bg-teal-100/90 px-2 py-0.5 rounded-md border border-teal-200 whitespace-nowrap">
                                      Clinical Review
                                    </span>
                                    <h4 className="text-sm font-bold text-slate-900 mt-0.5">
                                      Consult a General Physician
                                    </h4>
                                  </div>
                                </div>

                                <Link to="/patient/doctors?specialization=General%20Physician" className="w-full sm:w-auto shrink-0">
                                  <Button
                                    size="sm"
                                    className="w-full sm:w-auto bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs h-9 px-4 font-bold shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap"
                                  >
                                    Book Consultation <ArrowRight className="w-3.5 h-3.5" />
                                  </Button>
                                </Link>
                              </div>

                              <p className="text-xs text-slate-600 leading-relaxed border-t border-teal-100/80 pt-2.5">
                                Discuss your lab indicators, abnormal ranges, and potential next steps with a board-certified physician.
                              </p>
                            </div>
                            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                              <span>Educational Analysis • Not a medical diagnosis</span>
                              {msg.timestamp && <span>{msg.timestamp}</span>}
                            </div>
                          </div>
                          {/* Quick follow-up prompts after first AI response */}
                          {index === 1 && (
                            <div className="flex flex-wrap gap-2 pl-1">
                              {[
                                "Which values are abnormal?",
                                "What diet changes should I make?",
                                "Should I see a doctor urgently?",
                                "Explain my cholesterol levels",
                              ].map((q, qi) => (
                                <button
                                  key={qi}
                                  onClick={() => { setLabInput(q); }}
                                  className="text-[11px] bg-teal-50 border border-teal-200 text-teal-700 font-semibold px-2.5 py-1 rounded-full hover:bg-teal-100 transition cursor-pointer flex items-center gap-1"
                                >
                                  <ChevronRight className="w-3 h-3" />{q}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {labLoading && (
                  <div className="flex items-start gap-3 max-w-md animate-in fade-in">
                    <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <FlaskConical className="w-4 h-4" />
                    </div>
                    <div className="p-4 bg-white rounded-3xl rounded-tl-none border border-slate-200/80 shadow-xs flex items-center gap-3">
                      <Loader2 className="w-4 h-4 animate-spin text-teal-600" />
                      <p className="text-xs text-slate-600 font-semibold">Analyzing lab values with clinical AI...</p>
                    </div>
                  </div>
                )}
                <div ref={labEndRef} />
              </div>

              {/* Input Bar */}
              <div className="p-4 border-t border-slate-200 bg-white">
                <div className="flex items-center gap-3">
                  <div className="flex-1 relative">
                    <Input
                      placeholder='Ask a follow-up question about your report, e.g. "What does high creatinine mean?"'
                      value={labInput}
                      onChange={(e) => setLabInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleLabSend(); } }}
                      className="rounded-2xl bg-slate-50 border-slate-200 focus:bg-white text-xs sm:text-sm h-12 shadow-2xs pr-3"
                      disabled={labLoading}
                    />
                  </div>
                  <Button
                    onClick={handleLabSend}
                    disabled={labLoading || !labInput.trim()}
                    className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-bold rounded-2xl h-12 px-6 shrink-0 shadow-md shadow-teal-200 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
                <div className="mt-2 flex items-center gap-1.5 text-[10px] text-slate-400">
                  <AlertCircle className="w-3 h-3" />
                  <span>AI analysis is for educational purposes only. Always consult your doctor for medical advice.</span>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
