export function uid(prefix = "id") {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

export function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export function formatTripRange(startDate, endDate) {
  if (!startDate && !endDate) return "Flexible dates";
  return [startDate || "?", endDate || "?"].join(" - ");
}

export function getCoverLabel(value) {
  return value && value.trim() ? value.trim() : "Trip";
}

export function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function byNewestDate(left, right, field) {
  return String(right[field] || "").localeCompare(String(left[field] || ""));
}

export function findTripById(trips, tripId) {
  return trips.find((trip) => trip.id === tripId) || null;
}
