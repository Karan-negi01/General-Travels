const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
const dateFmt = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" });

export function formatINR(amount) {
  return inr.format(amount);
}

export function formatDate(value) {
  if (!value) return "";
  return dateFmt.format(new Date(value));
}

export function formatDateRange(start, end) {
  if (!end || end === start) return formatDate(start);
  return `${formatDate(start)} – ${formatDate(end)}`;
}
