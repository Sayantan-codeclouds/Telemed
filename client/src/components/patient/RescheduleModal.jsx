import { useState, useEffect, useMemo } from "react";
import {
  Calendar as CalendarIcon,
  Clock,
  AlertCircle,
  Loader2,
  CheckCircle2,
  X,
  Sparkles,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import api from "@/api/axios";
import { getProfileImageUrl } from "@/utils/imageUrl";

export default function RescheduleModal({
  appointment,
  isOpen,
  onClose,
  onSuccess,
}) {
  const [selectedDate, setSelectedDate] = useState("");
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [reason, setReason] = useState("");
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Generate next 10 days
  const upcomingDays = useMemo(() => {
    const days = [];
    const today = new Date();
    for (let i = 1; i <= 14; i++) {
      const d = new Date();
      d.setDate(today.getDate() + i);
      const dateString = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      const weekday = d.toLocaleDateString("en-US", { weekday: "short" });
      const fullWeekday = d.toLocaleDateString("en-US", { weekday: "long" });
      const dayNum = d.getDate();
      const month = d.toLocaleDateString("en-US", { month: "short" });
      days.push({
        dateString,
        weekday,
        fullWeekday,
        dayNum,
        month,
      });
    }
    return days;
  }, []);

  const doctorId = appointment?.doctor?._id || appointment?.doctor;

  useEffect(() => {
    if (isOpen && upcomingDays.length > 0) {
      const firstDate = upcomingDays[0].dateString;
      setSelectedDate(firstDate);
      fetchSlots(firstDate);
    }
    setSelectedSlot(null);
    setReason("");
  }, [isOpen, appointment]);

  const fetchSlots = async (date) => {
    if (!doctorId || !date) return;
    setLoadingSlots(true);
    try {
      const res = await api.get(`/doctors/${doctorId}/available-slots?date=${date}`);
      setSlots(res.data?.data || []);
      setSelectedSlot(null);
    } catch (err) {
      console.error("Failed to load available slots:", err);
      setSlots([]);
      toast.error("Could not load doctor's available slots for this date.");
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    fetchSlots(date);
  };

  const handleRescheduleSubmit = async () => {
    if (!selectedDate) {
      toast.error("Please pick a new date.");
      return;
    }
    if (!selectedSlot) {
      toast.error("Please choose a time slot.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.patch(`/appointments/${appointment._id}/reschedule`, {
        newDate: selectedDate,
        newSlot: selectedSlot,
        reason: reason.trim(),
      });

      toast.success("Appointment rescheduled successfully!");
      if (onSuccess) {
        onSuccess(res.data.data);
      }
      onClose();
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to reschedule appointment. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || !appointment) return null;

  const doctor = appointment.doctor || {};
  const currentFormattedDate = new Date(appointment.appointmentDate).toLocaleDateString(
    "en-US",
    {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <Card className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border-0 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-blue-50/50 via-white to-indigo-50/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">Reschedule Consultation</h3>
              <p className="text-xs text-slate-500">Pick a new date and convenient time slot</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto">
          {/* Current Appointment Banner */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img
                src={getProfileImageUrl(
                  doctor.profileImage,
                  `${doctor.firstName || "Dr"} ${doctor.lastName || ""}`,
                  "0284c7"
                )}
                alt={doctor.firstName || "Doctor"}
                className="w-12 h-12 rounded-xl object-cover border border-slate-200"
              />
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Dr. {doctor.firstName} {doctor.lastName}
                </h4>
                <p className="text-xs text-slate-500">
                  {doctor.specialization || "Physician"}
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Current Time
              </span>
              <Badge className="bg-amber-50 text-amber-800 border-amber-200 text-xs font-bold">
                {currentFormattedDate} ({appointment.slot?.start})
              </Badge>
            </div>
          </div>

          {/* Date Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              1. Select New Date
            </label>

            {/* Quick Day Selector Strip */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
              {upcomingDays.slice(0, 7).map((day) => {
                const isSelected = selectedDate === day.dateString;
                return (
                  <button
                    key={day.dateString}
                    type="button"
                    onClick={() => handleDateChange(day.dateString)}
                    className={`flex flex-col items-center justify-center min-w-[70px] py-2.5 px-2 rounded-2xl border text-center transition cursor-pointer ${
                      isSelected
                        ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20"
                        : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <span className="text-[10px] font-semibold uppercase opacity-80">
                      {day.weekday}
                    </span>
                    <span className="text-base font-black leading-tight">
                      {day.dayNum}
                    </span>
                    <span className="text-[10px] font-medium opacity-80">
                      {day.month}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Custom Date Input for dates beyond 7 days */}
            <div className="flex items-center gap-2 pt-1">
              <span className="text-xs text-slate-500 font-medium">Or pick any date:</span>
              <Input
                type="date"
                value={selectedDate}
                min={upcomingDays[0]?.dateString}
                onChange={(e) => handleDateChange(e.target.value)}
                className="w-auto h-9 text-xs rounded-xl"
              />
            </div>
          </div>

          {/* Time Slot Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                2. Available Time Slots
              </label>
              {slots.length > 0 && (
                <span className="text-[11px] font-bold text-blue-600">
                  {slots.length} slots available
                </span>
              )}
            </div>

            {loadingSlots ? (
              <div className="flex items-center justify-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <Loader2 className="w-5 h-5 animate-spin text-blue-600 mr-2" />
                <span className="text-xs font-semibold text-slate-500">
                  Checking Dr. {doctor.lastName}'s schedule...
                </span>
              </div>
            ) : slots.length === 0 ? (
              <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200 px-4">
                <AlertCircle className="w-6 h-6 text-amber-500 mx-auto mb-1.5" />
                <p className="text-xs font-bold text-slate-700">No open slots on this date</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Please pick another date from the calendar above.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-1">
                {slots.map((s, idx) => {
                  const isSelected =
                    selectedSlot?.start === s.start && selectedSlot?.end === s.end;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedSlot(s)}
                      className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition text-center cursor-pointer ${
                        isSelected
                          ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-blue-50/50 hover:border-blue-200"
                      }`}
                    >
                      <Clock className="w-3 h-3 inline-block mr-1 opacity-70" />
                      {s.start}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Reason for Rescheduling (Optional) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              3. Reason for Rescheduling <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <Input
              placeholder="e.g., Work conflict, feeling better, need morning appointment..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="h-10 text-xs rounded-xl"
            />
          </div>

          {/* Notice Box */}
          <div className="p-3 bg-blue-50/60 rounded-2xl border border-blue-100 flex items-start gap-2.5 text-xs text-blue-800">
            <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              No extra fees apply. Your appointment will be updated and Dr. {doctor.lastName} will receive an instant notification to confirm your new time.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 sm:p-6 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50/50">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={submitting}
            className="rounded-xl h-10 px-5 text-xs font-bold"
          >
            Cancel
          </Button>
          <Button
            onClick={handleRescheduleSubmit}
            disabled={!selectedDate || !selectedSlot || submitting}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-10 px-6 text-xs font-bold gap-2 shadow-md shadow-blue-500/20"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Rescheduling...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" /> Confirm Reschedule
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
}
