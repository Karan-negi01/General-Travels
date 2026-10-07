const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
const num = new Intl.NumberFormat("en-IN");
const dateFmt = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

export function formatINR(amount) {
  return inr.format(amount);
}

export function formatNumber(value) {
  return num.format(value);
}

// Dates are stored as "YYYY-MM-DD" strings; format them in UTC so the day never shifts.
export function formatDate(value) {
  if (!value) return "";
  return dateFmt.format(new Date(value));
}

export function formatDateRange(start, end) {
  if (!end || end === start) return formatDate(start);
  return `${formatDate(start)} – ${formatDate(end)}`;
}

// Today's date in India as "YYYY-MM-DD" (the platform operates on IST).
export function todayISO() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
}
