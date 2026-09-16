import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Trash2,
  Save,
  FileText,
  Loader2,
  Pill,
  Calendar,
  BellRing,
  Heart,
  Send,
  Download,
  ShieldCheck,
  ShoppingBag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import api from "@/api/axios";
import doctorApi from "@/api/doctorApi";
import { downloadPrescriptionPdf } from "@/utils/prescriptionGenerator";

export default function PrescriptionPanel({ appointmentId, isDoctor }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sendingReminder, setSendingReminder] = useState(false);
  const [prescription, setPrescription] = useState(null);

  const [form, setForm] = useState({
    diagnosis: "",
    notes: "",
    validityDays: 14,
    validUntil: "",
    remindRecheckup: true,
    medicines: [
      {
        name: "",
        dosage: "",
        frequency: "",
        duration: "",
        instructions: "",
      },
    ],
  });

  const calculateTargetDate = (days) => {
    const d = new Date();
    d.setDate(d.getDate() + Number(days));
    return d.toISOString().split("T")[0];
  };

  useEffect(() => {
    const fetchPrescription = async () => {
      try {
        const client = isDoctor ? doctorApi : api;
        const { data } = await client.get(`/prescriptions/appointment/${appointmentId}`);
        if (data?.data) {
          const pres = data.data;
          setPrescription(pres);
          const computedDate = pres.validUntil
            ? pres.validUntil.split("T")[0]
            : pres.followUpDate
            ? pres.followUpDate.split("T")[0]
            : calculateTargetDate(pres.validityDays || 14);

          setForm({
            diagnosis: pres.diagnosis || "",
            notes: pres.notes || "",
            validityDays: pres.validityDays || 14,
            validUntil: computedDate,
            remindRecheckup: pres.remindRecheckup !== undefined ? pres.remindRecheckup : true,
            medicines: pres.medicines?.length
              ? pres.medicines
              : [{ name: "", dosage: "", frequency: "", duration: "", instructions: "" }],
          });
        } else {
          // Defaults for fresh form
          setForm((prev) => ({
            ...prev,
            validUntil: calculateTargetDate(14),
          }));
        }
      } catch (error) {
        console.error("Failed to load prescription:", error);
      } finally {
        setLoading(false);
      }
    };

    if (appointmentId) {
      fetchPrescription();
    }
  }, [appointmentId, isDoctor]);

  const handleValidityPreset = (days) => {
    const target = calculateTargetDate(days);
    setForm((prev) => ({
      ...prev,
      validityDays: days,
      validUntil: target,
    }));
  };

  const handleCustomDateChange = (e) => {
    const selectedDate = e.target.value;
    if (!selectedDate) return;
    const diffTime = Math.abs(new Date(selectedDate) - new Date());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    setForm((prev) => ({
      ...prev,
      validUntil: selectedDate,
      validityDays: diffDays > 0 ? diffDays : 1,
    }));
  };

  const handleAddMedicine = () => {
    setForm((prev) => ({
      ...prev,
      medicines: [
        ...prev.medicines,
        { name: "", dosage: "", frequency: "", duration: "", instructions: "" },
      ],
    }));
  };

  const handleRemoveMedicine = (index) => {
    setForm((prev) => ({
      ...prev,
      medicines: prev.medicines.filter((_, i) => i !== index),
    }));
  };

  const handleMedicineChange = (index, field, value) => {
    setForm((prev) => {
      const updated = [...prev.medicines];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, medicines: updated };
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.diagnosis.trim()) {
      return toast.error("Please enter a diagnosis.");
    }
    const validMedicines = form.medicines.filter((m) => m.name.trim());
    if (validMedicines.length === 0) {
      return toast.error("Please add at least one medicine with a name.");
    }

    setSaving(true);
    try {
      const payload = {
        appointmentId,
        diagnosis: form.diagnosis.trim(),
        notes: form.notes.trim(),
        validityDays: Number(form.validityDays || 14),
        validUntil: form.validUntil || null,
        followUpDate: form.validUntil || null,
        recheckupDate: form.validUntil || null,
        remindRecheckup: Boolean(form.remindRecheckup),
        medicines: validMedicines,
      };

      const { data } = await doctorApi.post("/prescriptions", payload);
      setPrescription(data.data);
      toast.success("Prescription & Recheckup schedule saved successfully!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save prescription.");
    } finally {
      setSaving(false);
    }
  };

  const handleSendReminderNow = async () => {
    if (!prescription?._id) {
      return toast.error("Please save the prescription first before sending a reminder.");
    }

    try {
      setSendingReminder(true);
      const { data } = await doctorApi.post(`/prescriptions/${prescription._id}/send-recheckup-reminder`);
      toast.success(data.message || "Sweet recheckup reminder & email sent to patient!");
      setPrescription((prev) => ({
        ...prev,
        reminderSent: true,
        reminderSentAt: new Date().toISOString(),
        reminderEmailSent: data.data?.emailSent ?? true,
      }));
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send recheckup reminder.");
    } finally {
      setSendingReminder(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  // If patient viewing and no prescription exists yet
  if (!isDoctor && !prescription) {
    return (
      <div className="text-center py-12 px-4">
        <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
          <FileText className="w-6 h-6" />
        </div>
        <h3 className="font-semibold text-gray-900 text-lg">No Prescription Yet</h3>
        <p className="text-sm text-gray-500 mt-1">
          The doctor will write and submit your prescription during or after the consultation.
        </p>
      </div>
    );
  }

  // Patient Read-Only View
  if (!isDoctor && prescription) {
    return (
      <div className="space-y-6">
        {/* Sweet Recheckup Notice Banner */}
        <div className="p-4 bg-gradient-to-r from-indigo-50 to-pink-50 rounded-2xl border border-indigo-100/80 flex items-start gap-3.5 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-white shadow-xs flex items-center justify-center text-indigo-600 shrink-0">
            <Heart className="w-5 h-5 text-pink-500 fill-pink-500" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-slate-900 text-sm">
                Prescription Validity & Scheduled Recheckup
              </h4>
              <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100 text-[10px] font-bold">
                {prescription.validityDays || 14} Days Validity
              </Badge>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Valid until:{" "}
              <strong className="text-indigo-900">
                {prescription.validUntil
                  ? new Date(prescription.validUntil).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })
                  : prescription.followUpDate
                  ? new Date(prescription.followUpDate).toLocaleDateString()
                  : "Standard Period"}
              </strong>
              . You'll receive a caring dashboard reminder and email check-in when it's time for your follow-up!
            </p>
          </div>
        </div>

        <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-start gap-3">
          <Pill className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-emerald-900">Diagnosis</h4>
            <p className="text-sm text-emerald-800 mt-0.5">{prescription.diagnosis}</p>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-semibold text-gray-900 text-sm tracking-wide uppercase">
            Prescribed Medicines ({prescription.medicines?.length || 0})
          </h4>
          {prescription.medicines?.map((med, idx) => (
            <Card key={idx} className="border shadow-none rounded-xl">
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-gray-900">{med.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Dosage: {med.dosage}</p>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full">
                    {med.frequency}
                  </span>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between text-xs text-gray-600">
                  <span>Duration: <strong>{med.duration}</strong></span>
                  {med.instructions && <span>Instructions: {med.instructions}</span>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {prescription.notes && (
          <div className="p-4 bg-gray-50 rounded-xl">
            <h4 className="text-xs font-semibold text-gray-500 uppercase">Doctor's Advice / Notes</h4>
            <p className="text-sm text-gray-800 mt-1 whitespace-pre-wrap">{prescription.notes}</p>
          </div>
        )}

        {/* Clinical Authentication & Signature Box */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            {prescription.clinicStamp || prescription.doctor?.clinicStamp ? (
              <img
                src={prescription.clinicStamp || prescription.doctor?.clinicStamp}
                alt="Clinic Stamp"
                className="w-12 h-12 object-contain"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl border border-dashed border-slate-300 bg-white flex items-center justify-center text-[8px] text-slate-400 font-bold text-center">
                Clinic Seal
              </div>
            )}
            <div>
              <p className="font-bold text-slate-800">
                {prescription.doctor?.hospital || "TeleClinic Medical Center"}
              </p>
              <p className="text-slate-400 text-[10px]">
                Lic: {prescription.doctor?.licenseNumber || "Certified"}
              </p>
            </div>
          </div>

          <div className="text-right">
            {prescription.signature || prescription.doctor?.signature ? (
              <img
                src={prescription.signature || prescription.doctor?.signature}
                alt="Doctor Signature"
                className="h-8 max-w-[120px] object-contain ml-auto"
              />
            ) : (
              <span className="text-xs text-slate-400 italic">Signed</span>
            )}
            <p className="font-bold text-slate-900 text-xs mt-0.5">
              Dr. {prescription.doctor?.firstName} {prescription.doctor?.lastName}
            </p>
            <p className="text-[9px] text-emerald-600 font-bold flex items-center justify-end gap-1">
              <ShieldCheck className="w-3 h-3" /> Digitally Authenticated
            </p>
          </div>
        </div>

        {/* Patient Action Buttons: PDF Download & Pharmacy Order */}
        <div className="space-y-2.5 pt-1">
          <Button
            type="button"
            onClick={() => {
              downloadPrescriptionPdf(prescription);
              toast.success("Official Prescription PDF downloaded!");
            }}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl h-11 text-xs gap-2 shadow-sm cursor-pointer"
          >
            <Download className="w-4 h-4" /> Download Official Prescription (PDF)
          </Button>

          <Link to="/patient/pharmacy" className="block w-full">
            <Button
              type="button"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl h-11 text-xs gap-2 shadow-sm shadow-emerald-500/20 cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" /> Order Prescribed Medicines at Pharmacy ➔
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Doctor Form / Editor View
  return (
    <form onSubmit={handleSave} className="space-y-5 pb-4">
      {/* Reminder Trigger Bar if prescription exists */}
      {prescription && (
        <div className="p-3.5 bg-indigo-50/80 rounded-2xl border border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <BellRing className="w-4 h-4 text-indigo-600" />
            <div>
              <p className="text-xs font-bold text-slate-900">
                Patient Recheckup & Validity Reminder
              </p>
              <p className="text-[11px] text-slate-500">
                {prescription.reminderSent
                  ? `🌸 Sweet reminder was sent to patient (${new Date(prescription.reminderSentAt).toLocaleDateString()})`
                  : "Patient will be notified on validity date via dashboard & sweet email"}
              </p>
            </div>
          </div>

          <Button
            type="button"
            size="sm"
            disabled={sendingReminder}
            onClick={handleSendReminderNow}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold gap-1.5 h-8.5 shadow-sm"
          >
            {sendingReminder ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Sending...
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" /> Send Sweet Reminder Now
              </>
            )}
          </Button>
        </div>
      )}

      {/* Diagnosis */}
      <div className="space-y-1.5">
        <Label htmlFor="diagnosis" className="text-sm font-semibold">
          Primary Diagnosis *
        </Label>
        <Input
          id="diagnosis"
          placeholder="e.g. Acute Viral Bronchitis, Migraine"
          value={form.diagnosis}
          onChange={(e) => setForm({ ...form, diagnosis: e.target.value })}
          required
        />
      </div>

      {/* Prescription Validity & Recheckup Schedule (Doctor Setting) */}
      <Card className="border-indigo-100 bg-indigo-50/40 rounded-2xl overflow-hidden shadow-xs">
        <CardContent className="p-4 space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-600" />
              <Label className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Prescription Validity & Recheckup Schedule
              </Label>
            </div>
            <Badge className="bg-indigo-100 text-indigo-800 border-indigo-200 text-[11px] font-bold">
              {form.validityDays} Days Window
            </Badge>
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { label: "7 Days", days: 7 },
              { label: "14 Days (2 Wks)", days: 14 },
              { label: "30 Days (1 Mo)", days: 30 },
              { label: "60 Days (2 Mos)", days: 60 },
              { label: "90 Days (3 Mos)", days: 90 },
            ].map((preset) => (
              <button
                key={preset.days}
                type="button"
                onClick={() => handleValidityPreset(preset.days)}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition border ${
                  Number(form.validityDays) === preset.days
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Date Picker & Automatic Reminder Toggle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <Label htmlFor="validUntil" className="text-[11px] font-semibold text-slate-600 block mb-1">
                Scheduled Recheckup Date
              </Label>
              <Input
                id="validUntil"
                type="date"
                value={form.validUntil}
                onChange={handleCustomDateChange}
                className="bg-white text-xs rounded-xl h-9"
              />
            </div>

            <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-200">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-slate-800 block">
                  Automatic Patient Reminders
                </span>
                <span className="text-[10px] text-slate-500 block">
                  Sweet email & dashboard alert
                </span>
              </div>
              <input
                type="checkbox"
                checked={form.remindRecheckup}
                onChange={(e) => setForm({ ...form, remindRecheckup: e.target.checked })}
                className="w-4 h-4 text-indigo-600 rounded cursor-pointer accent-indigo-600"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Medicines */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-semibold">Medicines *</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddMedicine}
            className="h-8 gap-1.5 text-xs text-emerald-700 border-emerald-200 hover:bg-emerald-50"
          >
            <Plus className="w-3.5 h-3.5" /> Add Medicine
          </Button>
        </div>

        {form.medicines.map((med, idx) => (
          <div
            key={idx}
            className="p-3.5 rounded-xl border border-gray-200 bg-gray-50/50 space-y-3 relative group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500">#{idx + 1}</span>
              {form.medicines.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveMedicine(idx)}
                  className="text-gray-400 hover:text-red-600 transition-colors p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <Input
                placeholder="Medicine Name (e.g. Paracetamol)"
                value={med.name}
                onChange={(e) => handleMedicineChange(idx, "name", e.target.value)}
                className="bg-white"
                required
              />
              <Input
                placeholder="Dosage (e.g. 500mg, 10ml)"
                value={med.dosage}
                onChange={(e) => handleMedicineChange(idx, "dosage", e.target.value)}
                className="bg-white"
                required
              />
              <Input
                placeholder="Frequency (e.g. 1-0-1, TDS)"
                value={med.frequency}
                onChange={(e) => handleMedicineChange(idx, "frequency", e.target.value)}
                className="bg-white"
                required
              />
              <Input
                placeholder="Duration (e.g. 5 days, 2 weeks)"
                value={med.duration}
                onChange={(e) => handleMedicineChange(idx, "duration", e.target.value)}
                className="bg-white"
                required
              />
            </div>

            <Input
              placeholder="Instructions (e.g. After food with warm water)"
              value={med.instructions}
              onChange={(e) => handleMedicineChange(idx, "instructions", e.target.value)}
              className="bg-white text-xs"
            />
          </div>
        ))}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="notes" className="text-sm font-semibold">
          Advice / Notes
        </Label>
        <Textarea
          id="notes"
          rows={3}
          placeholder="Dietary precautions, lifestyle advice, test recommendations..."
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
        />
      </div>
      {/* Electronic Authentication Notice */}
      <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="text-[11px] text-slate-600">
            Automatically authenticated with your <strong>Digital Signature & Clinic Seal</strong>
          </span>
        </div>
        <Badge variant="outline" className="bg-white text-[10px] font-bold text-slate-700">
          e-Rx Certified
        </Badge>
      </div>

      <Button
        type="submit"
        disabled={saving}
        className="w-full bg-indigo-600 hover:bg-indigo-700 font-semibold gap-2 h-11 text-white rounded-2xl shadow-md shadow-indigo-600/20"
      >
        {saving ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" /> Saving Prescription...
          </>
        ) : (
          <>
            <Save className="w-4 h-4" /> Save Prescription & Set Recheckup
          </>
        )}
      </Button>
    </form>
  );
}
