/**
 * Drops today's slots whose start time has already passed (patient's local
 * clock). `dateString` is the picker's "YYYY-MM-DD"; slots look like
 * { start: "HH:mm", end: "HH:mm" }. Other days are returned unchanged.
 */
export function removePastSlots(dateString, slots) {
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  if (dateString !== today || !Array.isArray(slots)) return slots;

  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  return slots.filter((slot) => {
    const [hours, minutes] = String(slot?.start || "").split(":").map(Number);
    if (Number.isNaN(hours) || Number.isNaN(minutes)) return true;
    return hours * 60 + minutes > nowMinutes;
  });
}
