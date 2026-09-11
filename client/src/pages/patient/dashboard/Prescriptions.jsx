import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  FileText,
  Loader2,
  Pill,
  Calendar,
  User,
  Download,
  Stethoscope,
  Sparkles,
  ShoppingCart,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Info,
  Clock,
  Filter,
  X,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import api from "@/api/axios";
import { downloadPrescriptionPdf } from "@/utils/prescriptionGenerator";

export default function Prescriptions() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const targetApptId = searchParams.get("appointmentId");

  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aiAnalyzingId, setAiAnalyzingId] = useState(null);
  const [aiResult, setAiResult] = useState(null);

  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        const { data } = await api.get("/prescriptions/patient");
        setPrescriptions(data?.data || []);
      } catch (error) {
        console.error("Failed to load prescriptions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPrescriptions();
  }, []);

  const filteredPrescriptions = useMemo(() => {
    if (!targetApptId) return prescriptions;
    return prescriptions.filter(
      (p) =>
        p.appointment?._id === targetApptId ||
        p.appointment === targetApptId ||
        p._id === targetApptId
    );
  }, [prescriptions, targetApptId]);

  const clearAppointmentFilter = () => {
    searchParams.delete("appointmentId");
    setSearchParams(searchParams);
  };

  const handleAIReadAndAddToCart = async (prescription) => {
    try {
      setAiAnalyzingId(prescription._id);
      const res = await api.post("/ai/read-prescription-to-cart", {
        prescriptionId: prescription._id,
      });

      const data = res.data?.data;
      if (data && data.cartItems?.length > 0) {
        // Retrieve existing cart or create fresh
        const currentCart = JSON.parse(localStorage.getItem("pharmacyCart") || "[]");

        // Merge matched medicines into cart
        const updatedCart = [...currentCart];
        for (const item of data.cartItems) {
          const existingIndex = updatedCart.findIndex((c) => c.medicineId === item.medicineId);
          if (existingIndex > -1) {
            updatedCart[existingIndex].quantity += item.quantity;
          } else {
            updatedCart.push(item);
          }
        }

        // Persist to localStorage
        localStorage.setItem("pharmacyCart", JSON.stringify(updatedCart));

        setAiResult({
          ...data,
          totalCartItems: updatedCart.reduce((sum, i) => sum + i.quantity, 0),
        });

        toast.success(`🤖 AI analyzed prescription and added ${data.matchedItemsCount} medicines to your Pharmacy Cart!`);
      }
    } catch (err) {
      console.error("Failed to process prescription via AI:", err);
      toast.error(err.response?.data?.message || "AI failed to process this prescription.");
    } finally {
      setAiAnalyzingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            AI-Powered Digital Pharmacy Integration
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            My Prescriptions
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Review digital prescriptions and use AI to automatically add prescribed medications to your pharmacy cart
          </p>
        </div>

        <Link to="/patient/pharmacy">
          <Button variant="outline" className="rounded-2xl border-slate-200 text-slate-700 hover:bg-slate-50 gap-2 h-11 text-xs sm:text-sm">
            <ShoppingCart className="w-4 h-4 text-blue-600" /> View Pharmacy Cart
          </Button>
        </Link>
      </div>

      {/* Appointment-Specific Filter Active Banner */}
      {targetApptId && (
        <div className="p-4 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-3xl shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center text-cyan-300 shrink-0">
              <Filter className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
                  Appointment Prescription View
                </span>
                <Badge className="bg-blue-500 text-white font-mono text-[10px]">
                  #{targetApptId.slice(-6).toUpperCase()}
                </Badge>
              </div>
              <p className="text-xs text-blue-100/90 mt-0.5">
                Showing prescription corresponding to this consultation session.
              </p>
            </div>
          </div>

          <Button
            onClick={clearAppointmentFilter}
            variant="outline"
            className="bg-white/10 hover:bg-white/20 text-white border-white/20 rounded-2xl h-10 text-xs font-bold gap-1.5 shrink-0"
          >
            <X className="w-3.5 h-3.5" /> View All Prescriptions
          </Button>
        </div>
      )}

      {/* AI Processed Modal / Drawer */}
      {aiResult && (
        <Card className="border-0 shadow-lg rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-300">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-cyan-300 text-xs font-bold border border-cyan-400/30">
                <Sparkles className="w-3.5 h-3.5" /> AI Prescription Reader Output
              </div>
              <h2 className="text-2xl font-bold tracking-tight">
                {aiResult.matchedItemsCount} Medications Formulated & Loaded into Cart
              </h2>
              <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed">
                {aiResult.aiAnalysis?.summary}
              </p>

              {/* Medication Schedule Guidance */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                {aiResult.aiAnalysis?.medicationSchedule?.map((sched, idx) => (
                  <div key={idx} className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/10 text-xs space-y-1">
                    <span className="font-bold text-white block">{sched.medicine}</span>
                    <p className="text-cyan-200 text-[11px] font-medium">{sched.howToTake}</p>
                    <p className="text-slate-300 text-[10px] italic">{sched.foodTiming}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
              <Button
                onClick={() => navigate("/patient/pharmacy")}
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-2xl h-12 px-6 shadow-lg shadow-emerald-500/20 gap-2 text-sm"
              >
                <ShoppingCart className="w-4 h-4" /> Go to Cart & Checkout (₹{aiResult.totalEstimatedCost}) <ArrowRight className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                onClick={() => setAiResult(null)}
                className="text-slate-300 hover:text-white hover:bg-white/10 rounded-2xl text-xs h-10"
              >
                Dismiss Analysis
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Prescriptions List */}
      {filteredPrescriptions.length === 0 ? (
        <Card className="border-0 shadow-sm text-center py-20 bg-white rounded-3xl">
          <CardContent className="space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
              <FileText className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">
                {targetApptId
                  ? "No Prescription Found For This Appointment"
                  : "No Prescriptions Issued Yet"}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto mt-1">
                {targetApptId
                  ? "The doctor has not issued a digital prescription for this appointment session."
                  : "Prescriptions issued by doctors during virtual appointments will appear here with 1-click AI pharmacy ordering."}
              </p>
            </div>
            {targetApptId && (
              <Button
                onClick={clearAppointmentFilter}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl h-11 px-6 text-sm gap-2 shadow-md shadow-blue-500/20"
              >
                View All Prescriptions
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredPrescriptions.map((p) => {
            const isTarget =
              targetApptId &&
              (p.appointment?._id === targetApptId ||
                p.appointment === targetApptId ||
                p._id === targetApptId);

            return (
              <Card
                key={p._id}
                className={`border transition-all rounded-3xl bg-white overflow-hidden flex flex-col justify-between ${
                  isTarget
                    ? "ring-2 ring-blue-500 shadow-xl border-blue-200"
                    : "border-slate-100 shadow-sm hover:shadow-md"
                }`}
              >
                <div>
                  {/* Card Header */}
                  <CardHeader className="bg-gradient-to-r from-blue-50/60 via-slate-50 to-indigo-50/40 p-5 border-b border-slate-100">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <Stethoscope className="w-4 h-4 text-blue-600" />
                          <CardTitle className="text-base font-bold text-slate-900">
                            Dr. {p.doctor?.firstName} {p.doctor?.lastName}
                          </CardTitle>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 ml-6">
                          {p.doctor?.specialization || "General Physician"} • {p.doctor?.hospital || "TeleClinic Healthcare"}
                        </p>
                      </div>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800 font-bold text-[10px] rounded-lg">
                        {new Date(p.createdAt).toLocaleDateString()}
                      </Badge>
                    </div>
                  </CardHeader>

                  {/* Card Body */}
                  <CardContent className="p-5 sm:p-6 space-y-4">
                    {/* Diagnosis */}
                    <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Clinical Diagnosis
                      </span>
                      <p className="text-sm font-bold text-slate-900 mt-0.5">{p.diagnosis}</p>
                    </div>

                    {/* Medicines List */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                          <Pill className="w-3.5 h-3.5 text-blue-600" /> Prescribed Medications ({p.medicines?.length || 0})
                        </span>
                      </div>

                      <div className="space-y-2">
                        {p.medicines?.map((med, idx) => (
                          <div key={idx} className="p-3 bg-white border border-slate-100 rounded-2xl text-xs flex justify-between items-center shadow-xs">
                            <div>
                              <p className="font-bold text-slate-800 text-sm">{med.name}</p>
                              <p className="text-slate-500 text-[11px] mt-0.5">
                                {med.dosage} • {med.duration}
                                {med.instructions ? ` • ${med.instructions}` : ""}
                              </p>
                            </div>
                            <span className="px-2.5 py-1 bg-blue-50 text-blue-700 font-bold text-[11px] rounded-lg">
                              {med.frequency}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Notes */}
                    {p.notes && (
                      <div className="text-xs text-amber-900 bg-amber-50/70 border border-amber-100/80 p-3 rounded-2xl">
                        <span className="font-bold text-amber-800 block mb-0.5">Doctor's Clinical Notes:</span>
                        {p.notes}
                      </div>
                    )}

                    {/* Validity & Recheckup Schedule */}
                    <div className="p-3.5 bg-gradient-to-r from-indigo-50/80 to-purple-50/60 rounded-2xl border border-indigo-100/70 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-indigo-900 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-indigo-600" /> Validity Period:
                        </span>
                        <Badge className="bg-indigo-100 text-indigo-800 text-[10px] font-bold">
                          {p.validityDays || 14} Days
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between text-slate-600 text-[11px] pt-1 border-t border-indigo-100/60">
                        <span>Scheduled Recheckup:</span>
                        <strong className="text-indigo-950 font-bold">
                          {p.validUntil
                            ? new Date(p.validUntil).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })
                            : p.followUpDate
                            ? new Date(p.followUpDate).toLocaleDateString()
                            : "Standard Period"}
                        </strong>
                      </div>

                      {p.reminderSent && (
                        <div className="text-[10px] text-pink-600 font-semibold flex items-center gap-1 pt-0.5">
                          🌸 Caring check-in & email was sent for this prescription
                        </div>
                      )}
                    </div>

                    {/* Clinical Authentication: Signature & Stamp Box */}
                    <div className="p-3.5 bg-slate-50/90 rounded-2xl border border-slate-200/70 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        {p.clinicStamp || p.doctor?.clinicStamp ? (
                          <img
                            src={p.clinicStamp || p.doctor?.clinicStamp}
                            alt="Clinic Stamp"
                            className="w-12 h-12 object-contain"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-xl border border-dashed border-slate-300 bg-white flex items-center justify-center text-[8px] text-slate-400 font-bold text-center">
                            Official Seal
                          </div>
                        )}
                        <div className="text-[10px] text-slate-500 leading-tight">
                          <p className="font-bold text-slate-800">
                            {p.doctor?.hospital || "TeleClinic Medical Center"}
                          </p>
                          <p className="text-slate-400 text-[9px]">
                            Lic: {p.doctor?.licenseNumber || "Certified"}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        {p.signature || p.doctor?.signature ? (
                          <img
                            src={p.signature || p.doctor?.signature}
                            alt="Doctor Signature"
                            className="h-8 max-w-[120px] object-contain ml-auto"
                          />
                        ) : (
                          <div className="h-7 w-20 border border-dashed border-slate-300 bg-white flex items-center justify-center text-[9px] text-slate-400 ml-auto rounded font-bold">
                            Signed
                          </div>
                        )}
                        <p className="font-bold text-slate-900 text-[11px] mt-0.5">
                          Dr. {p.doctor?.firstName} {p.doctor?.lastName}
                        </p>
                        <p className="text-[9px] text-emerald-600 font-bold flex items-center justify-end gap-1">
                          <ShieldCheck className="w-2.5 h-2.5" /> Digitally Authenticated
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </div>

                {/* Bottom Action Buttons */}
                <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center gap-2.5">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      downloadPrescriptionPdf(p);
                      toast.success("Official Prescription PDF downloaded!");
                    }}
                    className="w-full sm:w-auto flex-1 rounded-2xl h-11 text-xs font-bold gap-2 border-slate-200 text-slate-700 hover:bg-slate-100 cursor-pointer shadow-xs"
                  >
                    <Download className="w-4 h-4 text-blue-600" />
                    <span>Download Official Prescription (PDF)</span>
                  </Button>

                  <Button
                    onClick={() => handleAIReadAndAddToCart(p)}
                    disabled={aiAnalyzingId === p._id}
                    className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-2xl h-11 text-xs shadow-md shadow-blue-500/10 gap-2 cursor-pointer"
                  >
                    {aiAnalyzingId === p._id ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Matching Stock...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-cyan-300" /> AI Read & Add to Cart <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
