import { useEffect, useState, useMemo } from "react";
import {
  Users,
  Search,
  Mail,
  Phone,
  Calendar,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import doctorApi from "@/api/doctorApi";

export default function DoctorPatients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const { data } = await doctorApi.get("/appointments/doctor");
        const appts = data?.data || [];

        // Extract unique patients from appointments
        const patientMap = new Map();
        appts.forEach((a) => {
          if (a.patient && !patientMap.has(a.patient._id)) {
            patientMap.set(a.patient._id, {
              ...a.patient,
              lastVisit: a.appointmentDate,
              totalAppointments: 1,
              latestReason: a.reason,
              latestStatus: a.status,
            });
          } else if (a.patient && patientMap.has(a.patient._id)) {
            const existing = patientMap.get(a.patient._id);
            existing.totalAppointments += 1;
            if (new Date(a.appointmentDate) > new Date(existing.lastVisit)) {
              existing.lastVisit = a.appointmentDate;
              existing.latestReason = a.reason;
              existing.latestStatus = a.status;
            }
          }
        });

        setPatients(Array.from(patientMap.values()));
      } catch (error) {
        console.error("Failed to load doctor patients:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  const filtered = useMemo(() => {
    return patients.filter((p) => {
      const term = search.toLowerCase().trim();
      const fullName = `${p.firstName || ""} ${p.lastName || ""}`.toLowerCase();
      const email = (p.email || "").toLowerCase();
      const phone = (p.phone || "").toLowerCase();
      const reason = (p.latestReason || "").toLowerCase();

      return (
        !term ||
        fullName.includes(term) ||
        email.includes(term) ||
        phone.includes(term) ||
        reason.includes(term)
      );
    });
  }, [patients, search]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
        <p className="text-sm font-semibold text-slate-500">Loading Patient Roster...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16">
      {/* Executive Header Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950 text-white p-8 sm:p-10 border border-slate-800 shadow-xl shadow-slate-950/20">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-cyan-300 text-xs font-semibold border border-white/10 backdrop-blur-md">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Doctor EHR Patient Directory
            </div>

            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              My Consulted Patients
            </h1>

            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Directory of patients who have booked or completed virtual consultations with you.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 backdrop-blur-md px-6 py-4 rounded-3xl text-center shrink-0">
            <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider block">
              Unique Patients Treated
            </span>
            <p className="text-3xl font-black text-white mt-0.5">{patients.length}</p>
          </div>
        </div>
      </div>

      {/* Search & Counter Bar */}
      <Card className="border border-slate-200/80 shadow-xs rounded-3xl bg-white p-4">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-88">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search by patient name, email, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-10 rounded-xl"
            />
          </div>

          <span className="text-xs text-slate-500 font-semibold px-2">
            Showing <strong>{filtered.length}</strong> of {patients.length} patients
          </span>
        </div>
      </Card>

      {/* Patients Grid */}
      {filtered.length === 0 ? (
        <Card className="border border-slate-200/80 shadow-xs text-center py-20 bg-white rounded-3xl">
          <CardContent className="space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <Users className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-slate-900">No Patients Found</h2>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {search
                  ? "No patients matched your search term."
                  : "Patients who schedule consultations will appear here automatically."}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((patient) => (
            <Card
              key={patient._id}
              className="border border-slate-200/80 shadow-xs hover:shadow-md transition-all rounded-3xl bg-white overflow-hidden flex flex-col justify-between"
            >
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-4">
                  <img
                    src={
                      patient.profileImage ||
                      `https://ui-avatars.com/api/?name=${patient.firstName || "Patient"}+${patient.lastName || ""}&background=059669&color=fff&size=150`
                    }
                    alt={patient.firstName}
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-slate-100 shadow-sm shrink-0"
                  />

                  <div className="space-y-0.5">
                    <h3 className="font-bold text-slate-900 text-base">
                      {patient.firstName} {patient.lastName}
                    </h3>
                    <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                      {patient.totalAppointments} Consultation{patient.totalAppointments > 1 ? "s" : ""}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
                  {patient.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{patient.email}</span>
                    </div>
                  )}

                  {patient.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{patient.phone}</span>
                    </div>
                  )}

                  {patient.lastVisit && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      <span className="font-medium">
                        Last Visit: {new Date(patient.lastVisit).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                {patient.latestReason && (
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Recent Chief Concern
                    </span>
                    <p className="text-slate-800 font-medium line-clamp-1">{patient.latestReason}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}