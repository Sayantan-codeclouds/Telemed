import { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Loader2,
  Search,
  Trash2,
  Calendar,
  Clock,
  X,
  Eye,
  ShieldCheck,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import adminApi from "@/api/adminApi";
import { useCurrency } from "@/contexts/CurrencyContext";
import { getProfileImageUrl } from "@/utils/imageUrl";
import AdminRescheduleModal from "@/components/admin/AdminRescheduleModal";

const statusColors = {
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  CONFIRMED: "bg-blue-50 text-blue-700 border-blue-200",
  IN_PROGRESS: "bg-purple-50 text-purple-700 border-purple-200",
  COMPLETED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  REJECTED: "bg-rose-50 text-rose-700 border-rose-200",
  CANCELLED: "bg-slate-100 text-slate-600 border-slate-200",
  NO_SHOW: "bg-orange-50 text-orange-700 border-orange-200",
};

const STATUS_LIST = [
  "ALL",
  "PENDING",
  "CONFIRMED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
  "REJECTED",
  "NO_SHOW",
];

const APPOINTMENTS_QUERY_KEY = ["admin-appointments"];

export default function AdminAppointments() {
  const { formatPrice } = useCurrency();
  const queryClient = useQueryClient();

  // Search & Filter & Sort state
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("newest");
  const [deletingId, setDeletingId] = useState(null);
  const [rescheduleAppointment, setRescheduleAppointment] = useState(null);
  const [viewingAppointment, setViewingAppointment] = useState(null);

  const { data: appointments = [], isLoading: loading } = useQuery({
    queryKey: APPOINTMENTS_QUERY_KEY,
    queryFn: async () => {
      const { data } = await adminApi.get("/admin/appointments");
      return data.data || [];
    },
    meta: { errorMessage: "Failed to load consultations." },
  });

  const setAppointments = (updater) => {
    queryClient.setQueryData(APPOINTMENTS_QUERY_KEY, (prev) =>
      typeof updater === "function" ? updater(prev || []) : updater
    );
  };

  const handleDeleteAppointment = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this appointment record?")) {
      return;
    }

    setDeletingId(id);
    try {
      const res = await adminApi.delete(`/admin/appointments/${id}`);
      toast.success(res.data.message || "Appointment deleted successfully.");
      setAppointments((prev) => prev.filter((a) => a._id !== id));
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete appointment.");
    } finally {
      setDeletingId(null);
    }
  };

  // Filter and Sort Appointments
  const processedAppointments = useMemo(() => {
    let list = appointments.filter((a) => {
      const term = search.toLowerCase().trim();
      const patientName = `${a.patient?.firstName || ""} ${a.patient?.lastName || ""}`.toLowerCase();
      const doctorName = `${a.doctor?.firstName || ""} ${a.doctor?.lastName || ""}`.toLowerCase();
      const spec = (a.doctor?.specialization || "").toLowerCase();
      const reason = (a.reason || "").toLowerCase();
      const status = (a.status || "").toLowerCase();

      const matchesSearch =
        !term ||
        patientName.includes(term) ||
        doctorName.includes(term) ||
        spec.includes(term) ||
        reason.includes(term) ||
        status.includes(term);

      const matchesStatus =
        statusFilter === "ALL" || (a.status || "").toUpperCase() === statusFilter;

      return matchesSearch && matchesStatus;
    });

    list.sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      }
      if (sortBy === "oldest") {
        return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      }
      if (sortBy === "appt-date-asc") {
        return new Date(a.appointmentDate || a.date || 0) - new Date(b.appointmentDate || b.date || 0);
      }
      if (sortBy === "appt-date-desc") {
        return new Date(b.appointmentDate || b.date || 0) - new Date(a.appointmentDate || a.date || 0);
      }
      if (sortBy === "fee-desc") {
        return Number(b.consultationFee ?? 0) - Number(a.consultationFee ?? 0);
      }
      if (sortBy === "fee-asc") {
        return Number(a.consultationFee ?? 0) - Number(b.consultationFee ?? 0);
      }
      return 0;
    });

    return list;
  }, [appointments, search, statusFilter, sortBy]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 border border-purple-100 text-purple-700 text-xs font-semibold mb-1">
            <Calendar className="w-3.5 h-3.5" /> TeleHealth Consultations
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Consultation Appointments</h1>
          <p className="text-gray-500 text-xs mt-0.5">
            {appointments.length} total scheduled visits platform-wide
          </p>
        </div>
      </div>

      {/* Search, Filter & Date Sorting Bar */}
      <Card className="border-0 shadow-sm rounded-2xl bg-white p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search patient, doctor, reason..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-10 rounded-xl bg-slate-50 border-slate-200 text-xs"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-800 outline-none cursor-pointer"
            >
              {STATUS_LIST.map((st) => (
                <option key={st} value={st}>
                  {st === "ALL" ? "All Statuses" : st.replace("_", " ")}
                </option>
              ))}
            </select>
          </div>

          {/* Date & Fee Sort */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-800 outline-none cursor-pointer font-semibold"
            >
              <option value="newest">📅 Booked: Newest First</option>
              <option value="oldest">📅 Booked: Oldest First</option>
              <option value="appt-date-asc">⏰ Visit Date: Earliest First</option>
              <option value="appt-date-desc">⏰ Visit Date: Latest First</option>
              <option value="fee-desc">💰 Fee: High to Low</option>
              <option value="fee-asc">💰 Fee: Low to High</option>
            </select>
          </div>
        </div>

        {/* Quick Filter Status Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-slate-100 no-scrollbar">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
            Status:
          </span>
          {STATUS_LIST.map((st) => {
            const count =
              st === "ALL"
                ? appointments.length
                : appointments.filter((a) => (a.status || "").toUpperCase() === st).length;

            return (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`shrink-0 text-xs px-2.5 py-1 rounded-full font-semibold transition cursor-pointer ${
                  statusFilter === st
                    ? "bg-purple-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {st === "ALL" ? "All" : st.replace("_", " ")} ({count})
              </button>
            );
          })}
        </div>
      </Card>

      {/* Appointments Table */}
      <Card className="border-0 shadow-sm rounded-2xl overflow-hidden bg-white">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-slate-50/70 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="text-left p-4">Patient</th>
                  <th className="text-left p-4">Doctor</th>
                  <th className="text-left p-4">Date & Time Slot</th>
                  <th className="text-left p-4">Status</th>
                  <th className="text-left p-4">Fee</th>
                  <th className="text-left p-4">Booked On</th>
                  <th className="text-right p-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-xs">
                {processedAppointments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-slate-400">
                      <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="font-semibold text-slate-600">No consultation appointments found</p>
                      <p className="text-[11px] mt-0.5">Try changing search or status filters</p>
                    </td>
                  </tr>
                ) : (
                  processedAppointments.map((appt) => {
                    const patientAvatar = getProfileImageUrl(
                      appt.patient?.profileImage,
                      `${appt.patient?.firstName || "P"} ${appt.patient?.lastName || "T"}`,
                      "2563eb"
                    );
                    const doctorAvatar = getProfileImageUrl(
                      appt.doctor?.profileImage,
                      `Dr. ${appt.doctor?.firstName || "D"} ${appt.doctor?.lastName || "R"}`,
                      "16a34a"
                    );

                    return (
                      <tr
                        key={appt._id}
                        className="hover:bg-slate-50/60 transition-colors"
                      >
                        {/* Patient */}
                        <td className="p-4">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={patientAvatar}
                              alt="Patient"
                              onError={(e) => {
                                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                  (appt.patient?.firstName || "P") + " " + (appt.patient?.lastName || "T")
                                )}&background=2563eb&color=fff&size=80`;
                              }}
                              className="w-9 h-9 rounded-xl object-cover bg-slate-100 shrink-0 border border-slate-200 shadow-2xs"
                            />
                            <div>
                              <p className="font-semibold text-gray-900">
                                {appt.patient
                                  ? `${appt.patient.firstName} ${appt.patient.lastName}`
                                  : "Unknown Patient"}
                              </p>
                              <p className="text-gray-400 text-[11px]">
                                {appt.patient?.email || "—"}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Doctor */}
                        <td className="p-4">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={doctorAvatar}
                              alt="Doctor"
                              onError={(e) => {
                                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                  "Dr " + (appt.doctor?.firstName || "D") + " " + (appt.doctor?.lastName || "R")
                                )}&background=16a34a&color=fff&size=80`;
                              }}
                              className="w-9 h-9 rounded-xl object-cover bg-slate-100 shrink-0 border border-slate-200 shadow-2xs"
                            />
                            <div>
                              <p className="font-semibold text-gray-900">
                                {appt.doctor
                                  ? `Dr. ${appt.doctor.firstName} ${appt.doctor.lastName}`
                                  : "Unassigned"}
                              </p>
                              <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-medium">
                                {appt.doctor?.specialization || "General"}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Date & Slot */}
                        <td className="p-4 text-gray-600">
                          <div className="flex items-center gap-1 font-semibold text-slate-800">
                            <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                            <span>
                              {appt.appointmentDate || appt.date
                                ? new Date(appt.appointmentDate || appt.date).toLocaleDateString(undefined, {
                                    weekday: "short",
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  })
                                : "—"}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-slate-500 text-[11px] mt-0.5 font-medium">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>
                              {(appt.slot?.start && appt.slot?.end)
                                ? `${appt.slot.start} – ${appt.slot.end}`
                                : (appt.timeSlot?.start && appt.timeSlot?.end)
                                ? `${appt.timeSlot.start} – ${appt.timeSlot.end}`
                                : appt.time || "—"}
                            </span>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="p-4">
                          <div className="flex flex-col gap-1 items-start">
                            <Badge
                              variant="secondary"
                              className={`text-[10px] font-bold border ${
                                statusColors[appt.status] || "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {appt.status?.replace("_", " ") || "UNKNOWN"}
                            </Badge>
                            {appt.isRescheduled && (
                              <Badge className="bg-purple-50 text-purple-700 border border-purple-200 text-[9px] font-bold">
                                Rescheduled
                              </Badge>
                            )}
                          </div>
                        </td>

                        {/* Fee */}
                        <td className="p-4">
                          <p className="text-gray-900 text-xs font-bold">
                            {formatPrice(appt.consultationFee ?? 0)}
                          </p>
                          {appt.vrioOrderId && (
                            <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 text-[10px] bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 mt-1">
                              <ShieldCheck className="w-2.5 h-2.5 text-emerald-600" />
                              Vrio #{appt.vrioOrderId}
                            </span>
                          )}
                        </td>

                        {/* Booked On */}
                        <td className="p-4 text-gray-500 text-xs">
                          {appt.createdAt
                            ? new Date(appt.createdAt).toLocaleDateString(undefined, {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })
                            : "—"}
                        </td>

                        {/* Actions */}
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {/* Details Button */}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setViewingAppointment(appt)}
                              className="h-8 w-8 p-0 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer"
                              title="View Details & History"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </Button>

                            {/* Reschedule Button */}
                            {appt.status !== "COMPLETED" && appt.status !== "CANCELLED" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setRescheduleAppointment(appt)}
                                className="h-8 w-8 p-0 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg cursor-pointer"
                                title="Reschedule Consultation"
                              >
                                <Calendar className="w-3.5 h-3.5 text-purple-600" />
                              </Button>
                            )}

                            {/* Delete Button */}
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={deletingId === appt._id}
                              onClick={() => handleDeleteAppointment(appt._id)}
                              className="h-8 w-8 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                              title="Delete Consultation"
                            >
                              {deletingId === appt._id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Trash2 className="w-3.5 h-3.5" />
                              )}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Admin Reschedule Modal */}
      {rescheduleAppointment && (
        <AdminRescheduleModal
          key={rescheduleAppointment._id}
          isOpen={Boolean(rescheduleAppointment)}
          onClose={() => setRescheduleAppointment(null)}
          appointment={rescheduleAppointment}
          onSuccess={(updatedAppt) => {
            setAppointments((prev) =>
              prev.map((a) => (a._id === updatedAppt._id ? updatedAppt : a))
            );
            if (viewingAppointment?._id === updatedAppt._id) {
              setViewingAppointment(updatedAppt);
            }
          }}
        />
      )}

      {/* Details & History Modal */}
      {viewingAppointment && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <Card className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border-0 overflow-hidden flex flex-col max-h-[92vh]">
            <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                  Admin Consultation Audit
                </span>
                <h3 className="text-base font-black text-slate-900">
                  Appointment #{viewingAppointment._id.slice(-6).toUpperCase()}
                </h3>
              </div>
              <button
                onClick={() => setViewingAppointment(null)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-5 sm:p-6 space-y-4 overflow-y-auto text-xs">
              {/* Patient & Doctor info */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Patient
                  </span>
                  <p className="font-bold text-slate-900 mt-0.5">
                    {viewingAppointment.patient?.firstName} {viewingAppointment.patient?.lastName}
                  </p>
                  <p className="text-slate-500 text-[11px]">{viewingAppointment.patient?.email}</p>
                  <p className="text-slate-500 text-[11px]">{viewingAppointment.patient?.phone || "No phone"}</p>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Doctor
                  </span>
                  <p className="font-bold text-slate-900 mt-0.5">
                    Dr. {viewingAppointment.doctor?.firstName} {viewingAppointment.doctor?.lastName}
                  </p>
                  <p className="text-emerald-600 font-bold text-[11px]">
                    {viewingAppointment.doctor?.specialization}
                  </p>
                  <p className="text-slate-500 text-[11px]">{viewingAppointment.doctor?.hospital}</p>
                </div>
              </div>

              {/* Timing & Fee */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Date & Window
                  </span>
                  <p className="font-bold text-slate-900 mt-0.5">
                    {new Date(viewingAppointment.appointmentDate || viewingAppointment.date).toLocaleDateString()}
                  </p>
                  <p className="text-indigo-600 font-bold text-[11px]">
                    {viewingAppointment.slot?.start || viewingAppointment.time} - {viewingAppointment.slot?.end || ""}
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Financial & Vrio Gateway
                  </span>
                  <p className="font-bold text-slate-900 mt-0.5">
                    Fee: {formatPrice(viewingAppointment.consultationFee ?? 0)}
                  </p>
                  <div className="flex flex-wrap items-center gap-1.5 mt-1">
                    <Badge className="text-[10px] font-bold">
                      {viewingAppointment.status}
                    </Badge>
                    {viewingAppointment.vrioOrderId && (
                      <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-bold">
                        💳 Vrio #{viewingAppointment.vrioOrderId}
                      </Badge>
                    )}
                    <Badge className={`text-[10px] font-bold ${viewingAppointment.paymentStatus === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                      {viewingAppointment.paymentStatus || 'PAID'}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Reason */}
              {viewingAppointment.reason && (
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Clinical Complaint / Patient Reason
                  </span>
                  <p className="text-slate-800 font-medium mt-0.5 leading-relaxed">
                    {viewingAppointment.reason}
                  </p>
                </div>
              )}

              {/* Reschedule History */}
              {viewingAppointment.rescheduleHistory?.length > 0 ? (
                <div className="p-3.5 bg-purple-50/60 rounded-2xl border border-purple-100 space-y-2">
                  <span className="text-[10px] font-bold text-purple-800 uppercase tracking-wider block">
                    Reschedule Audit Trail ({viewingAppointment.rescheduleHistory.length})
                  </span>
                  <div className="space-y-1.5">
                    {viewingAppointment.rescheduleHistory.map((item, idx) => (
                      <div
                        key={idx}
                        className="text-[11px] bg-white p-2.5 rounded-xl border border-purple-100 text-slate-700 flex flex-col gap-0.5"
                      >
                        <div className="flex items-center justify-between font-bold">
                          <span>
                            Original: {new Date(item.previousDate).toLocaleDateString()} (
                            {item.previousSlot?.start})
                          </span>
                          <span className="text-[10px] text-slate-400 font-normal">
                            {new Date(item.rescheduledAt).toLocaleString()}
                          </span>
                        </div>
                        {item.reason && (
                          <p className="text-slate-500 italic text-[10px] mt-0.5">{item.reason}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-[11px] text-slate-400 italic">
                  This consultation has never been rescheduled.
                </p>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              {viewingAppointment.status !== "COMPLETED" && viewingAppointment.status !== "CANCELLED" && (
                <Button
                  onClick={() => {
                    const toReschedule = viewingAppointment;
                    setViewingAppointment(null);
                    setRescheduleAppointment(toReschedule);
                  }}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl h-9 px-4 text-xs gap-1.5 cursor-pointer shadow-sm"
                >
                  <Calendar className="w-3.5 h-3.5" /> Reschedule Now
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => setViewingAppointment(null)}
                className="ml-auto rounded-xl h-9 px-4 text-xs font-bold"
              >
                Close
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
