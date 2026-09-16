import { useEffect, useState, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  FileText,
  Loader2,
  Pill,
  Stethoscope,
  User,
  Clock,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Calendar,
  Search,
  X,
  ArrowLeft,
  Filter,
  Download,
  ShieldCheck,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import doctorApi from "@/api/doctorApi";
import { downloadPrescriptionPdf } from "@/utils/prescriptionGenerator";
import { toast } from "sonner";

export default function DoctorPrescriptions() {
  const [searchParams, setSearchParams] = useSearchParams();
  const targetApptId = searchParams.get("appointmentId");

  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        const { data } = await doctorApi.get("/prescriptions/doctor");
        const list = data?.data || [];
        setPrescriptions(list);

        // If target appointmentId is in query params, auto-expand the matching prescription
        if (targetApptId) {
          const matched = list.find(
            (p) =>
              p.appointment?._id === targetApptId ||
              p.appointment === targetApptId ||
              p._id === targetApptId
          );
          if (matched) {
            setExpandedId(matched._id);
          }
        }
      } catch (error) {
        console.error("Failed to load prescriptions:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPrescriptions();
  }, [targetApptId]);

  // Filtered list based on targetApptId and search query
  const filteredPrescriptions = useMemo(() => {
    let result = prescriptions;

    if (targetApptId) {
      result = result.filter(
        (p) =>
          p.appointment?._id === targetApptId ||
          p.appointment === targetApptId ||
          p._id === targetApptId
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((p) => {
        const patientName = `${p.patient?.firstName || ""} ${p.patient?.lastName || ""}`.toLowerCase();
        const diagnosis = (p.diagnosis || "").toLowerCase();
        const medNames = (p.medicines || []).map((m) => m.name.toLowerCase()).join(" ");
        return patientName.includes(q) || diagnosis.includes(q) || medNames.includes(q);
      });
    }

    return result;
  }, [prescriptions, targetApptId, searchQuery]);

  const clearAppointmentFilter = () => {
    searchParams.delete("appointmentId");
    setSearchParams(searchParams);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold mb-2">
            <FileText className="w-3.5 h-3.5" />
            Doctor Clinical Archive
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Issued Prescriptions
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Review and reference clinical prescriptions issued during teleconsultations
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/doctor/appointments">
            <Button variant="outline" className="rounded-2xl border-slate-200 text-slate-700 hover:bg-slate-50 gap-2 h-11 text-xs sm:text-sm font-semibold">
              <Calendar className="w-4 h-4 text-blue-600" /> All Appointments
            </Button>
          </Link>
          <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-2xl px-4 py-2.5">
            <Stethoscope className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-bold text-blue-900">
              {prescriptions.length} Total
            </span>
          </div>
        </div>
      </div>

      {/* Appointment-Specific Filter Active Banner */}
      {targetApptId && (
        <div className="p-4 bg-gradient-to-r from-indigo-900 via-blue-900 to-slate-900 text-white rounded-3xl shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center text-cyan-300 shrink-0">
              <Filter className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
                  Specific Appointment Filter Active
                </span>
                <Badge className="bg-indigo-500 text-white font-mono text-[10px]">
                  #{targetApptId.slice(-6).toUpperCase()}
                </Badge>
              </div>
              <p className="text-xs text-blue-100/90 mt-0.5">
                Showing prescription corresponding to this appointment.
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

      {/* Search Bar */}
      <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <Input
            placeholder="Search prescriptions by patient name, diagnosis, medication..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10 border-0 shadow-none bg-transparent text-xs sm:text-sm focus-visible:ring-0"
          />
        </div>
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="text-slate-400 hover:text-slate-600 p-2 text-xs font-bold"
          >
            Clear
          </button>
        )}
      </div>

      {/* Empty State */}
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
                  : searchQuery
                  ? "No Matching Prescriptions Found"
                  : "No Prescriptions Issued Yet"}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto mt-1">
                {targetApptId
                  ? "A prescription has not yet been recorded for this appointment session."
                  : searchQuery
                  ? "Try searching with a different patient name, symptom or medicine."
                  : "Prescriptions you create during video consultations will appear here."}
              </p>
            </div>
            {targetApptId && (
              <Button
                onClick={clearAppointmentFilter}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl h-11 px-6 text-sm gap-2 shadow-md shadow-blue-500/20"
              >
                <ArrowLeft className="w-4 h-4" /> View All Prescriptions
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredPrescriptions.map((p) => {
            const isExpanded = expandedId === p._id;
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
                    ? "ring-2 ring-indigo-500 shadow-xl border-indigo-200"
                    : "border-slate-100 shadow-sm hover:shadow-md"
                }`}
              >
                <div>
                  {/* Card Header */}
                  <CardHeader className="bg-gradient-to-r from-indigo-50/60 via-slate-50 to-blue-50/40 p-5 border-b border-slate-100">
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white font-black text-sm shrink-0 shadow-md shadow-indigo-200">
                          {p.patient?.firstName?.[0] || "P"}
                          {p.patient?.lastName?.[0] || ""}
                        </div>
                        <div className="min-w-0">
                          <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                            <User className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                            <span className="truncate">
                              {p.patient?.firstName} {p.patient?.lastName}
                            </span>
                          </CardTitle>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {p.patient?.email || "Patient Record"}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 font-bold text-[10px] rounded-lg shrink-0 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          {new Date(p.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </Badge>
                        {p.appointment?._id && (
                          <span className="text-[10px] font-mono text-slate-400">
                            Appt #{p.appointment._id.slice(-6).toUpperCase()}
                          </span>
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  {/* Card Body */}
                  <CardContent className="p-5 space-y-4">
                    {/* Diagnosis */}
                    <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Clinical Diagnosis
                      </span>
                      <p className="text-sm font-bold text-slate-900 mt-0.5">{p.diagnosis}</p>
                    </div>

                    {/* Medicines Summary */}
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Pill className="w-3.5 h-3.5 text-blue-600" />
                        Medications ({p.medicines?.length || 0})
                      </span>
                      <button
                        type="button"
                        onClick={() => setExpandedId(isExpanded ? null : p._id)}
                        className="text-[10px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition cursor-pointer"
                      >
                        {isExpanded ? (
                          <><ChevronUp className="w-3.5 h-3.5" /> Hide Details</>
                        ) : (
                          <><ChevronDown className="w-3.5 h-3.5" /> View Details</>
                        )}
                      </button>
                    </div>

                    {/* Medicine Pills Summary (collapsed) */}
                    {!isExpanded && (
                      <div className="flex flex-wrap gap-1.5">
                        {p.medicines?.slice(0, 3).map((med, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 bg-blue-50 text-blue-700 font-semibold text-[11px] rounded-lg border border-blue-100"
                          >
                            {med.name}
                          </span>
                        ))}
                        {p.medicines?.length > 3 && (
                          <span className="px-2.5 py-1 bg-slate-100 text-slate-500 font-semibold text-[11px] rounded-lg">
                            +{p.medicines.length - 3} more
                          </span>
                        )}
                      </div>
                    )}

                    {/* Full Medicine List (expanded) */}
                    {isExpanded && (
                      <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
                        {p.medicines?.map((med, idx) => (
                          <div
                            key={idx}
                            className="p-3 bg-white border border-slate-100 rounded-2xl text-xs flex justify-between items-center shadow-xs"
                          >
                            <div>
                              <p className="font-bold text-slate-800 text-sm">{med.name}</p>
                              <p className="text-slate-500 text-[11px] mt-0.5">
                                {med.dosage} • {med.duration}
                                {med.instructions ? ` • ${med.instructions}` : ""}
                              </p>
                            </div>
                            <span className="px-2.5 py-1 bg-blue-50 text-blue-700 font-bold text-[11px] rounded-lg shrink-0 ml-2">
                              {med.frequency}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Doctor's Notes */}
                    {p.notes && (
                      <div className="text-xs text-amber-900 bg-amber-50/70 border border-amber-100/80 p-3 rounded-2xl">
                        <span className="font-bold text-amber-800 block mb-0.5">Clinical Notes:</span>
                        {p.notes}
                      </div>
                    )}

                    {/* Validity & Follow-up */}
                    <div className="p-3.5 bg-gradient-to-r from-indigo-50/80 to-purple-50/60 rounded-2xl border border-indigo-100/70 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-indigo-900 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-indigo-600" /> Prescription Validity:
                        </span>
                        <Badge className="bg-indigo-100 text-indigo-800 text-[10px] font-bold">
                          {p.validityDays || 14} Days
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-slate-600 text-[11px] pt-1 border-t border-indigo-100/60">
                        <span>Follow-up / Recheckup:</span>
                        <strong className="text-indigo-950 font-bold">
                          {p.validUntil
                            ? new Date(p.validUntil).toLocaleDateString("en-IN", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })
                            : p.followUpDate
                            ? new Date(p.followUpDate).toLocaleDateString()
                            : "Standard Period"}
                        </strong>
                      </div>
                    </div>

                    {/* Clinical Authentication Preview */}
                    <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-200/60 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        {p.clinicStamp || p.doctor?.clinicStamp ? (
                          <img
                            src={p.clinicStamp || p.doctor?.clinicStamp}
                            alt="Clinic Stamp"
                            className="w-10 h-10 object-contain"
                          />
                        ) : (
                          <span className="w-8 h-8 rounded-lg border border-dashed border-slate-300 bg-white flex items-center justify-center text-[8px] text-slate-400 font-bold">
                            Seal
                          </span>
                        )}
                        <div>
                          <p className="font-bold text-slate-800 text-[11px]">
                            {p.doctor?.hospital || "Hospital Record"}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            Lic: {p.doctor?.licenseNumber || "Certified"}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        {p.signature || p.doctor?.signature ? (
                          <img
                            src={p.signature || p.doctor?.signature}
                            alt="Doctor Signature"
                            className="h-7 max-w-[100px] object-contain ml-auto"
                          />
                        ) : (
                          <span className="text-[10px] text-slate-400 font-semibold italic">
                            e-Signed
                          </span>
                        )}
                        <p className="text-[9px] text-emerald-600 font-bold flex items-center justify-end gap-1">
                          <ShieldCheck className="w-2.5 h-2.5" /> Authenticated
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </div>

                {/* Footer Metadata & Download Action */}
                <div className="px-5 pb-5 space-y-2">
                  <div className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-2xl px-4 py-2.5 text-xs text-slate-500">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        downloadPrescriptionPdf(p);
                        toast.success("Prescription PDF downloaded!");
                      }}
                      className="h-8 px-3 text-xs font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-xl gap-1.5 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" /> Download e-Rx PDF
                    </Button>

                    {p.appointment?._id && (
                      <Link
                        to={`/doctor/appointments`}
                        className="text-[11px] text-slate-600 font-bold hover:text-blue-600"
                      >
                        View Appointment →
                      </Link>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
