import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Clock,
  CalendarDays,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  Save,
  Loader2,
  Copy,
  Sparkles,
  AlertCircle,
  AlertTriangle,
  Wand2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import doctorApi from "@/api/doctorApi";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

// Helper to convert 24-hour "HH:mm" to human-friendly 12-hour format "h:mm AM/PM"
function format12Hour(timeStr) {
  if (!timeStr || typeof timeStr !== "string") return "";
  const parts = timeStr.split(":");
  if (parts.length < 2) return timeStr;
  const hours = parseInt(parts[0], 10);
  const minutes = parts[1];
  if (isNaN(hours)) return timeStr;
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes} ${period}`;
}

// Calculate duration in hours between start and end (if end > start)
function getDurationLabel(start, end) {
  if (!start || !end) return "";
  const [sH, sM] = start.split(":").map(Number);
  const [eH, eM] = end.split(":").map(Number);
  if (isNaN(sH) || isNaN(eH)) return "";
  const startMins = sH * 60 + sM;
  const endMins = eH * 60 + eM;
  const diffMins = endMins - startMins;
  if (diffMins <= 0) return "";
  const hrs = Math.floor(diffMins / 60);
  const mins = diffMins % 60;
  if (mins === 0) return `${hrs} hr${hrs > 1 ? "s" : ""}`;
  return `${hrs}h ${mins}m`;
}

// Validate a single slot
function validateSlot(slot, daySlots = [], currentIndex = -1) {
  const { start, end } = slot;
  if (!start || !end) {
    return { valid: false, error: "Both start and end times are required." };
  }

  const [sH, sM] = start.split(":").map(Number);
  const [eH, eM] = end.split(":").map(Number);
  const startMins = sH * 60 + sM;
  const endMins = eH * 60 + eM;

  if (endMins <= startMins) {
    return {
      valid: false,
      error: `End time (${format12Hour(end)}) cannot be earlier than or equal to start time (${format12Hour(start)}).`,
      isBackwards: true,
    };
  }

  // Check overlap with other slots in the same day
  for (let i = 0; i < daySlots.length; i++) {
    if (i === currentIndex) continue;
    const other = daySlots[i];
    if (!other.start || !other.end) continue;
    const [oS_H, oS_M] = other.start.split(":").map(Number);
    const [oE_H, oE_M] = other.end.split(":").map(Number);
    const oStartMins = oS_H * 60 + oS_M;
    const oEndMins = oE_H * 60 + oE_M;

    if (oEndMins <= oStartMins) continue; // Skip already invalid slots

    // Overlap condition: start < other.end AND end > other.start
    if (startMins < oEndMins && endMins > oStartMins) {
      return {
        valid: false,
        error: `Overlaps with slot ${other.start} - ${other.end} (${format12Hour(other.start)} - ${format12Hour(other.end)}).`,
        isOverlap: true,
      };
    }
  }

  return { valid: true };
}

export default function Availability() {
  const [availability, setAvailability] = useState([]);
  const [saving, setSaving] = useState(false);

  const { data: fetchedSchedule, isLoading: loading } = useQuery({
    queryKey: ["doctor-availability"],
    queryFn: async () => {
      const res = await doctorApi.get("/doctors/availability");
      return res.data?.data || [];
    },
    meta: { errorMessage: "Failed to load your availability schedule." },
  });

  // Seed the editable schedule once when it arrives, adjusted during render
  // instead of via an effect (availability is then a locally-edited draft).
  const [appliedSchedule, setAppliedSchedule] = useState(undefined);
  if (fetchedSchedule && fetchedSchedule !== appliedSchedule) {
    setAppliedSchedule(fetchedSchedule);

    // Ensure all 7 days are always represented in standard order
    const completeSchedule = DAYS.map((dayName) => {
      const found = fetchedSchedule.find((f) => f.day === dayName);
      if (found) {
        return {
          day: dayName,
          enabled: Boolean(found.enabled),
          slots: found.slots?.length
            ? found.slots.map((s) => ({ start: s.start, end: s.end }))
            : [],
        };
      }
      return {
        day: dayName,
        enabled: dayName !== "Sunday",
        slots:
          dayName !== "Sunday"
            ? [
                { start: "09:00", end: "13:00" },
                { start: "17:00", end: "20:00" },
              ]
            : [],
      };
    });

    setAvailability(completeSchedule);
  }

  const toggleDay = (dayIndex, forcedState = null) => {
    setAvailability((prev) => {
      const updated = [...prev];
      const newState = forcedState !== null ? forcedState : !updated[dayIndex].enabled;
      updated[dayIndex].enabled = newState;
      if (newState && updated[dayIndex].slots.length === 0) {
        updated[dayIndex].slots = [
          { start: "09:00", end: "13:00" },
          { start: "17:00", end: "20:00" },
        ];
      }
      return updated;
    });
  };

  const addSlot = (dayIndex) => {
    setAvailability((prev) => {
      const updated = [...prev];
      const currentSlots = updated[dayIndex].slots || [];

      // Smart default: If morning slots exist, suggest evening; otherwise suggest morning
      let defaultStart = "09:00";
      let defaultEnd = "13:00";

      if (currentSlots.length > 0) {
        const lastSlot = currentSlots[currentSlots.length - 1];
        if (lastSlot.end <= "13:00") {
          defaultStart = "17:00";
          defaultEnd = "20:00";
        } else if (lastSlot.end <= "18:00") {
          defaultStart = "18:30";
          defaultEnd = "21:30";
        } else {
          defaultStart = "14:00";
          defaultEnd = "17:00";
        }
      }

      updated[dayIndex].slots.push({
        start: defaultStart,
        end: defaultEnd,
      });
      return updated;
    });
  };

  const updateSlot = (dayIndex, slotIndex, field, value) => {
    setAvailability((prev) => {
      const updated = [...prev];
      updated[dayIndex].slots[slotIndex][field] = value;
      return updated;
    });
  };

  const removeSlot = (dayIndex, slotIndex) => {
    setAvailability((prev) => {
      const updated = [...prev];
      updated[dayIndex].slots.splice(slotIndex, 1);
      return updated;
    });
  };

  // Quick fix helper: Fix backwards slot (e.g. 17:00 - 01:00 -> 17:00 - 20:00)
  const fixSlotToEvening = (dayIndex, slotIndex) => {
    setAvailability((prev) => {
      const updated = [...prev];
      const slot = updated[dayIndex].slots[slotIndex];
      // If start is in late afternoon/evening (>= 16:00), default end to 20:00 or start + 3h
      const [sH] = slot.start.split(":").map(Number);
      if (sH >= 16) {
        slot.end = "20:00";
      } else {
        const endH = Math.min(sH + 4, 23);
        slot.end = `${String(endH).padStart(2, "0")}:00`;
      }
      return updated;
    });
    toast.success("Time window updated to a valid evening schedule!");
  };

  // Auto fix all invalid slots across the entire schedule
  const fixAllInvalidSlots = () => {
    setAvailability((prev) =>
      prev.map((day) => {
        if (!day.enabled) return day;
        const fixedSlots = day.slots.map((slot) => {
          const check = validateSlot(slot);
          if (!check.valid && check.isBackwards) {
            const [sH] = slot.start.split(":").map(Number);
            const fixedEnd = sH >= 16 ? "20:00" : `${String(Math.min(sH + 4, 23)).padStart(2, "0")}:00`;
            return { ...slot, end: fixedEnd };
          }
          return slot;
        });
        return { ...day, slots: fixedSlots };
      })
    );
    toast.success("All invalid time windows automatically corrected!");
  };

  // Quick preset: standard Morning (09:00-13:00) & Evening (17:00-20:00) on weekdays
  const applyStandardWeekdays = () => {
    setAvailability((prev) =>
      prev.map((item) => {
        if (item.day === "Saturday" || item.day === "Sunday") {
          return { ...item, enabled: false, slots: [] };
        }
        return {
          ...item,
          enabled: true,
          slots: [
            { start: "09:00", end: "13:00" },
            { start: "17:00", end: "20:00" },
          ],
        };
      })
    );
    toast.success("Applied Morning (9 AM-1 PM) & Evening (5 PM-8 PM) shifts to weekdays!");
  };

  // Quick preset: copy Monday to all days
  const copyMondayToAll = () => {
    const monday = availability.find((d) => d.day === "Monday");
    if (!monday) return;

    setAvailability((prev) =>
      prev.map((item) => ({
        ...item,
        enabled: monday.enabled,
        slots: monday.slots.map((s) => ({ ...s })),
      }))
    );
    toast.success("Monday's schedule copied to all 7 days!");
  };

  // Find all validation errors across active schedule
  const allErrors = [];
  availability.forEach((day, dayIndex) => {
    if (day.enabled && day.slots) {
      day.slots.forEach((slot, slotIndex) => {
        const validation = validateSlot(slot, day.slots, slotIndex);
        if (!validation.valid) {
          allErrors.push({
            day: day.day,
            dayIndex,
            slotIndex,
            slot,
            error: validation.error,
            isBackwards: validation.isBackwards,
          });
        }
      });
    }
  });

  const saveAvailability = async () => {
    const token = localStorage.getItem("doctorToken");
    if (!token) {
      toast.error("Doctor session expired. Please log in again.");
      return;
    }

    // Block save if any invalid slots exist
    if (allErrors.length > 0) {
      const first = allErrors[0];
      toast.error(
        `Cannot save: ${first.day} has an invalid slot (${first.slot.start} to ${first.slot.end}). ${first.error}`
      );
      return;
    }

    try {
      setSaving(true);

      const payload = availability.map((item) => ({
        day: item.day,
        enabled: Boolean(item.enabled),
        slots: item.enabled
          ? (item.slots || [])
              .filter((s) => s.start && s.end)
              .map((s) => ({ start: s.start.trim(), end: s.end.trim() }))
          : [],
      }));

      const res = await doctorApi.put("/doctors/availability", {
        availability: payload,
      });

      if (res.data?.data) {
        setAvailability(res.data.data);
      }

      toast.success(res.data?.message || "Weekly availability saved and active for patient bookings!");
    } catch (err) {
      console.error("Save availability error:", err);
      toast.error(err.response?.data?.message || "Unable to save availability.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
      </div>
    );
  }

  const activeDaysCount = availability.filter((d) => d.enabled && d.slots.length > 0).length;
  const totalSlotsCount = availability.reduce(
    (acc, d) => (d.enabled ? acc + d.slots.length : acc),
    0
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold mb-2">
            <Clock className="w-3.5 h-3.5" />
            TeleClinic Consultation Scheduling
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Doctor Weekly Availability
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Configure working days and consultation time slots for virtual patient appointments
          </p>
        </div>

        <Button
          onClick={saveAvailability}
          disabled={saving || allErrors.length > 0}
          className={`font-bold rounded-2xl h-11 px-6 text-xs sm:text-sm gap-2 shrink-0 shadow-md ${
            allErrors.length > 0
              ? "bg-slate-300 text-slate-500 cursor-not-allowed shadow-none"
              : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200"
          }`}
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Saving Schedule...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" /> Save Availability
            </>
          )}
        </Button>
      </div>

      {/* Invalid Slots Warning Banner with 1-Click Fix */}
      {allErrors.length > 0 && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-3xl text-rose-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-600 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-rose-900">
                {allErrors.length} Invalid Time Window{allErrors.length > 1 ? "s" : ""} Detected
              </p>
              <p className="text-[11px] text-rose-700 mt-0.5">
                {allErrors[0].day}: {allErrors[0].slot.start} to {allErrors[0].slot.end} ({allErrors[0].error})
              </p>
            </div>
          </div>

          <Button
            size="sm"
            onClick={fixAllInvalidSlots}
            className="bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs gap-1.5 shrink-0 shadow-sm"
          >
            <Wand2 className="w-3.5 h-3.5" /> Auto-Fix All Slots
          </Button>
        </div>
      )}

      {/* Overview & Quick Preset Bar */}
      <Card className="border-0 shadow-sm rounded-3xl bg-white p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <CalendarDays className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Schedule Overview: {activeDaysCount} Days Active • {totalSlotsCount} Time Windows
              </h3>
              <p className="text-slate-400 text-xs mt-0.5">
                Patients can only book consultations on enabled days and matching slot windows
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={applyStandardWeekdays}
              className="rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold gap-1.5 h-9"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Standard Shifts (9-1, 5-8)
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={copyMondayToAll}
              className="rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold gap-1.5 h-9"
            >
              <Copy className="w-3.5 h-3.5 text-blue-600" /> Copy Monday to All
            </Button>
          </div>
        </div>
      </Card>

      {/* Days List */}
      <div className="space-y-4">
        {availability.map((day, dayIndex) => {
          const hasDayErrors = allErrors.some((e) => e.dayIndex === dayIndex);

          return (
            <Card
              key={day.day}
              className={`border-0 shadow-sm rounded-3xl bg-white transition-all overflow-hidden ${
                hasDayErrors ? "ring-2 ring-rose-400" : ""
              }`}
            >
              <CardContent className="p-5 sm:p-6">
                {/* Day Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-slate-900 text-base w-28">
                      {day.day}
                    </h3>

                    {/* Available / Unavailable Toggle */}
                    <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200">
                      <button
                        type="button"
                        onClick={() => toggleDay(dayIndex, true)}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                          day.enabled
                            ? "bg-emerald-600 text-white shadow-xs"
                            : "text-slate-500 hover:text-slate-900"
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Available
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleDay(dayIndex, false)}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                          !day.enabled
                            ? "bg-rose-600 text-white shadow-xs"
                            : "text-slate-500 hover:text-slate-900"
                        }`}
                      >
                        <XCircle className="w-3.5 h-3.5" /> Unavailable
                      </button>
                    </div>

                    {/* Active Slots Counter Badge */}
                    {day.enabled && (
                      <Badge
                        variant="secondary"
                        className="text-[10px] bg-emerald-50 text-emerald-700 font-bold hidden md:inline-flex"
                      >
                        {day.slots.length} Window{day.slots.length !== 1 ? "s" : ""}
                      </Badge>
                    )}
                  </div>

                  {/* Add Time Window CTA */}
                  {day.enabled && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => addSlot(dayIndex)}
                      className="text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 text-xs font-semibold rounded-xl gap-1 self-start sm:self-auto cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Time Window
                    </Button>
                  )}
                </div>

                {/* Slots List / Unavailable Notice */}
                {day.enabled ? (
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    {day.slots.length === 0 ? (
                      <div className="text-xs text-slate-400 italic py-2 flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5" />
                        No time slots configured. Click "Add Time Window" to allow bookings on this day.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {day.slots.map((slot, slotIndex) => {
                          const slotValidation = validateSlot(slot, day.slots, slotIndex);
                          const duration = getDurationLabel(slot.start, slot.end);

                          return (
                            <div
                              key={slotIndex}
                              className={`flex flex-col gap-2 p-3 rounded-2xl border transition-all ${
                                !slotValidation.valid
                                  ? "bg-rose-50/70 border-rose-300 ring-1 ring-rose-300"
                                  : "bg-slate-50 border-slate-200/80 hover:border-slate-300"
                              }`}
                            >
                              {/* Time Input Controls */}
                              <div className="flex items-center gap-2">
                                <div className="flex flex-col">
                                  <input
                                    type="time"
                                    value={slot.start}
                                    onChange={(e) =>
                                      updateSlot(dayIndex, slotIndex, "start", e.target.value)
                                    }
                                    className={`w-24 bg-white border rounded-xl px-2 py-1.5 text-xs font-bold text-slate-800 outline-none transition ${
                                      !slotValidation.valid
                                        ? "border-rose-400 focus:ring-1 focus:ring-rose-500"
                                        : "border-slate-200 focus:ring-1 focus:ring-emerald-500"
                                    }`}
                                  />
                                </div>

                                <span className="text-xs text-slate-400 font-medium">to</span>

                                <div className="flex flex-col">
                                  <input
                                    type="time"
                                    value={slot.end}
                                    onChange={(e) =>
                                      updateSlot(dayIndex, slotIndex, "end", e.target.value)
                                    }
                                    className={`w-24 bg-white border rounded-xl px-2 py-1.5 text-xs font-bold text-slate-800 outline-none transition ${
                                      !slotValidation.valid
                                        ? "border-rose-400 focus:ring-1 focus:ring-rose-500"
                                        : "border-slate-200 focus:ring-1 focus:ring-emerald-500"
                                    }`}
                                  />
                                </div>

                                <button
                                  type="button"
                                  onClick={() => removeSlot(dayIndex, slotIndex)}
                                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition ml-auto cursor-pointer"
                                  title="Remove Slot"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              {/* 12-Hour Readable Time & Duration Badge */}
                              {slotValidation.valid ? (
                                <div className="flex items-center justify-between text-[11px] text-slate-500 px-0.5">
                                  <span className="font-semibold text-emerald-700">
                                    {format12Hour(slot.start)} – {format12Hour(slot.end)}
                                  </span>
                                  {duration && (
                                    <span className="text-[10px] bg-slate-200/70 text-slate-600 px-1.5 py-0.5 rounded-md font-medium">
                                      {duration}
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <div className="space-y-1.5 pt-0.5">
                                  <div className="text-[10px] font-bold text-rose-600 flex items-start gap-1 leading-tight">
                                    <AlertCircle className="w-3 h-3 shrink-0 mt-0.5" />
                                    <span>{slotValidation.error}</span>
                                  </div>
                                  {slotValidation.isBackwards && (
                                    <button
                                      type="button"
                                      onClick={() => fixSlotToEvening(dayIndex, slotIndex)}
                                      className="text-[10px] bg-rose-600 hover:bg-rose-700 text-white font-bold px-2 py-0.5 rounded-md transition cursor-pointer flex items-center gap-1"
                                    >
                                      <Wand2 className="w-2.5 h-2.5" />
                                      Fix to 20:00 (8 PM)
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-400 italic">
                    Doctor is marked unavailable on this day. No patient bookings will be accepted.
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Bottom Save Button Bar */}
      <div className="flex items-center justify-between pt-4">
        {allErrors.length > 0 ? (
          <p className="text-xs font-bold text-rose-600 flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4" /> Please resolve invalid time windows before saving.
          </p>
        ) : (
          <div />
        )}

        <Button
          onClick={saveAvailability}
          disabled={saving || allErrors.length > 0}
          className={`font-bold rounded-2xl h-12 px-8 text-sm gap-2 shadow-md ${
            allErrors.length > 0
              ? "bg-slate-300 text-slate-500 cursor-not-allowed shadow-none"
              : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200"
          }`}
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Saving Schedule...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" /> Save Availability Schedule
            </>
          )}
        </Button>
      </div>
    </div>
  );
}