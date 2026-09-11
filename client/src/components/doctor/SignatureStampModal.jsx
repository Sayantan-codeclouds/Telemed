import { useState, useRef, useEffect } from "react";
import {
  FileBadge,
  PenTool,
  Upload,
  Eraser,
  CheckCircle2,
  X,
  Loader2,
  Building2,
  Sparkles,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import doctorApi from "@/api/doctorApi";

export default function SignatureStampModal({
  isOpen,
  onClose,
  doctor,
  onUpdated,
}) {
  const [activeTab, setActiveTab] = useState("signature"); // "signature" | "stamp"
  const [signatureMode, setSignatureMode] = useState("draw"); // "draw" | "upload"
  const [saving, setSaving] = useState(false);

  // Signatures & Stamp state (can be data URLs or existing URLs)
  const [signatureUrl, setSignatureUrl] = useState(doctor?.signature || "");
  const [stampUrl, setStampUrl] = useState(doctor?.clinicStamp || "");

  // HTML5 Canvas for drawing
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  // Sync with doctor prop changes
  useEffect(() => {
    if (doctor) {
      setSignatureUrl(doctor.signature || "");
      setStampUrl(doctor.clinicStamp || "");
    }
  }, [doctor]);

  // Initialize Canvas
  useEffect(() => {
    if (isOpen && activeTab === "signature" && signatureMode === "draw") {
      const timer = setTimeout(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        ctx.strokeStyle = "#0f172a";
        ctx.lineWidth = 2.5;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen, activeTab, signatureMode]);

  // Canvas Drawing Handlers
  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext("2d");

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext("2d");

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      const dataUrl = canvas.toDataURL("image/png");
      setSignatureUrl(dataUrl);
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
    setSignatureUrl("");
  };

  // Upload Handlers
  const handleSignatureFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      return toast.error("Please select an image file (PNG, JPG, or SVG).");
    }

    const reader = new FileReader();
    reader.onload = () => {
      setSignatureUrl(reader.result);
      toast.success("Signature image loaded!");
    };
    reader.readAsDataURL(file);
  };

  const handleStampFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      return toast.error("Please select an image file (PNG, JPG, or SVG).");
    }

    const reader = new FileReader();
    reader.onload = () => {
      setStampUrl(reader.result);
      toast.success("Clinic stamp image loaded!");
    };
    reader.readAsDataURL(file);
  };

  // Generate Default SVG Stamp for the doctor
  const handleGenerateDefaultStamp = () => {
    const doctorName = `DR. ${doctor?.firstName || ""} ${doctor?.lastName || ""}`.trim().toUpperCase();
    const hospital = (doctor?.hospital || "TELECLINIC VIRTUAL HEALTHCARE").toUpperCase();
    const license = (doctor?.licenseNumber || "CERTIFIED PRACTITIONER").toUpperCase();

    const svgString = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" width="240" height="240">
        <circle cx="120" cy="120" r="110" fill="none" stroke="#1e40af" stroke-width="4" stroke-dasharray="8 4" />
        <circle cx="120" cy="120" r="100" fill="none" stroke="#1e40af" stroke-width="2" />
        <circle cx="120" cy="120" r="70" fill="#eff6ff" stroke="#1e40af" stroke-width="1.5" />
        <path id="curveTop" d="M 30,120 A 90,90 0 0,1 210,120" fill="none" />
        <text font-size="10" font-family="Arial, sans-serif" font-weight="bold" fill="#1e40af" letter-spacing="1">
          <textPath href="#curveTop" startOffset="50%" text-anchor="middle">
            ${hospital.slice(0, 32)}
          </textPath>
        </text>
        <path id="curveBottom" d="M 210,120 A 90,90 0 0,1 30,120" fill="none" />
        <text font-size="10" font-family="Arial, sans-serif" font-weight="bold" fill="#1e40af" letter-spacing="1">
          <textPath href="#curveBottom" startOffset="50%" text-anchor="middle">
            REG: ${license.slice(0, 20)}
          </textPath>
        </text>
        <text x="120" y="108" font-size="16" font-family="Arial, sans-serif" font-weight="900" fill="#1e40af" text-anchor="middle">
          OFFICIAL
        </text>
        <text x="120" y="126" font-size="13" font-family="Arial, sans-serif" font-weight="bold" fill="#2563eb" text-anchor="middle">
          SEAL & STAMP
        </text>
        <text x="120" y="142" font-size="9" font-family="Arial, sans-serif" font-weight="bold" fill="#64748b" text-anchor="middle">
          ★ ${doctorName.slice(0, 24)} ★
        </text>
      </svg>
    `.trim();

    const encodedSvg = `data:image/svg+xml;utf8,${encodeURIComponent(svgString)}`;
    setStampUrl(encodedSvg);
    toast.success("Standard certified clinic stamp generated!");
  };

  // Save Credentials
  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await doctorApi.put("/doctors/profile", {
        signature: signatureUrl,
        clinicStamp: stampUrl,
      });

      toast.success("Digital Signature & Clinic Stamp saved successfully!");
      if (onUpdated) {
        onUpdated(res.data?.data || { ...doctor, signature: signatureUrl, clinicStamp: stampUrl });
      }
      onClose();
    } catch (err) {
      console.error("Failed to save credentials:", err);
      toast.error(err.response?.data?.message || "Failed to save signature and stamp.");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div
        className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col my-auto animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-blue-50/80 via-indigo-50/40 to-slate-50 relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white hover:bg-slate-100 border border-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center transition cursor-pointer shadow-xs"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <FileBadge className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">
                Digital Signature & Clinic Stamp
              </h3>
              <p className="text-xs text-slate-500">
                Dr. {doctor?.firstName} {doctor?.lastName} • Appears on all issued prescriptions & official PDFs
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 mt-5">
            <button
              type="button"
              onClick={() => setActiveTab("signature")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === "signature"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>Digital Signature</span>
              {signatureUrl && (
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("stamp")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === "stamp"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Clinic / Hospital Stamp</span>
              {stampUrl && (
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
              )}
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[70vh]">
          {/* TAB 1: Digital Signature */}
          {activeTab === "signature" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">
                  Select Signature Creation Method:
                </span>
                <div className="inline-flex rounded-xl bg-slate-100 p-1">
                  <button
                    type="button"
                    onClick={() => setSignatureMode("draw")}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      signatureMode === "draw"
                        ? "bg-white text-blue-600 shadow-2xs"
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    Draw Signature
                  </button>
                  <button
                    type="button"
                    onClick={() => setSignatureMode("upload")}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      signatureMode === "upload"
                        ? "bg-white text-blue-600 shadow-2xs"
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    Upload Image
                  </button>
                </div>
              </div>

              {signatureMode === "draw" ? (
                <div className="space-y-2">
                  <div className="border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50 p-2 relative overflow-hidden">
                    <canvas
                      ref={canvasRef}
                      width={480}
                      height={180}
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      onTouchStart={startDrawing}
                      onTouchMove={draw}
                      onTouchEnd={stopDrawing}
                      className="w-full h-44 bg-white rounded-xl touch-none cursor-crosshair border border-slate-200/60 shadow-inner"
                    />
                    <div className="absolute bottom-4 left-4 pointer-events-none text-[11px] text-slate-400 flex items-center gap-1 font-medium">
                      <PenTool className="w-3 h-3 text-slate-400" /> Draw your signature above using mouse or touch
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-slate-500">
                      Clean line rendering with transparency for prescription PDFs
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={clearCanvas}
                      className="text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl gap-1.5 cursor-pointer h-8"
                    >
                      <Eraser className="w-3.5 h-3.5" /> Clear Pad
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center bg-slate-50 space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">
                        Upload Signature File (PNG, JPG, SVG)
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Tip: Use a transparent PNG for the cleanest clinical appearance
                      </p>
                    </div>
                    <label className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-blue-600 font-bold text-xs rounded-xl cursor-pointer shadow-2xs">
                      <Upload className="w-3.5 h-3.5" /> Choose Signature File
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleSignatureFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              )}

              {/* Active Signature Preview */}
              {signatureUrl && (
                <div className="p-3.5 rounded-2xl bg-blue-50/50 border border-blue-100 flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800 block">
                      Active Signature Preview
                    </span>
                    <img
                      src={signatureUrl}
                      alt="Signature"
                      className="h-12 max-w-[160px] object-contain bg-white rounded-lg p-1 border border-blue-100 shadow-2xs"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setSignatureUrl("")}
                    className="text-slate-400 hover:text-rose-600 text-xs font-bold rounded-xl"
                  >
                    Remove
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Clinic Stamp */}
          {activeTab === "stamp" && (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center bg-slate-50 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">
                    Official Hospital / Clinic Rubber Stamp
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Upload your official hospital seal or clinic rubber stamp graphic
                  </p>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <label className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-blue-600 font-bold text-xs rounded-xl cursor-pointer shadow-2xs">
                    <Upload className="w-3.5 h-3.5" /> Upload Stamp Image
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleStampFileUpload}
                      className="hidden"
                    />
                  </label>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleGenerateDefaultStamp}
                    className="rounded-xl text-xs font-bold h-9 gap-1.5 border-slate-200 text-slate-700 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" /> Generate Certified Seal
                  </Button>
                </div>
              </div>

              {/* Active Stamp Preview */}
              {stampUrl && (
                <div className="p-3.5 rounded-2xl bg-indigo-50/50 border border-indigo-100 flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-800 block">
                      Active Clinic Seal Preview
                    </span>
                    <img
                      src={stampUrl}
                      alt="Clinic Stamp"
                      className="h-16 w-16 object-contain bg-white rounded-xl p-1 border border-indigo-100 shadow-2xs"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setStampUrl("")}
                    className="text-slate-400 hover:text-rose-600 text-xs font-bold rounded-xl"
                  >
                    Remove
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Live Combined Prescription Authenticity Preview */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 via-slate-100/50 to-blue-50/30 border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <span>Prescription Authentication Preview</span>
              <Badge className="bg-emerald-100 text-emerald-800 text-[10px] font-bold border-emerald-200">
                <ShieldCheck className="w-3 h-3 mr-1" /> Verified Clinical Rx
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200/60 shadow-2xs">
              {/* Left: Stamp */}
              <div className="flex items-center gap-2.5">
                {stampUrl ? (
                  <img
                    src={stampUrl}
                    alt="Stamp Preview"
                    className="w-12 h-12 object-contain"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl border border-dashed border-slate-300 bg-slate-50 flex items-center justify-center text-[9px] text-slate-400 text-center font-bold">
                    No Stamp
                  </div>
                )}
                <div className="text-[10px] text-slate-500 leading-tight">
                  <p className="font-bold text-slate-800">
                    {doctor?.hospital || "TeleClinic Medical Center"}
                  </p>
                  <p className="text-slate-400">
                    Lic: {doctor?.licenseNumber || "N/A"}
                  </p>
                </div>
              </div>

              {/* Right: Signature */}
              <div className="text-right">
                {signatureUrl ? (
                  <img
                    src={signatureUrl}
                    alt="Signature Preview"
                    className="h-9 max-w-[130px] object-contain ml-auto"
                  />
                ) : (
                  <div className="h-9 w-24 border border-dashed border-slate-300 bg-slate-50 flex items-center justify-center text-[9px] text-slate-400 ml-auto rounded font-bold">
                    No Signature
                  </div>
                )}
                <p className="font-bold text-slate-900 text-xs mt-0.5">
                  Dr. {doctor?.firstName} {doctor?.lastName}
                </p>
                <p className="text-[9px] text-slate-400 font-semibold">
                  {doctor?.qualification || "MBBS"} • Digitally Signed
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between p-5 border-t border-slate-100 bg-slate-50/60">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="rounded-xl text-xs font-bold h-10 px-4 cursor-pointer"
          >
            Cancel
          </Button>

          <Button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs h-10 px-6 gap-2 shadow-md shadow-blue-500/20 cursor-pointer"
          >
            {saving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" /> Save Credentials
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
