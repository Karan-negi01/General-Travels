// Fixed-price fare engine. Every bus has a per-km rate, a minimum km per day and
// a driver allowance per day (set by its operator). The customer's trip decides
// the distance and number of days, so the price is known before booking —
// no quotes or negotiation.
//
// Pure functions only: used by pages (to show prices) and by the booking
// action (to compute the price that is actually charged).

import { CITIES, TRIP_TYPES } from "./constants/vehicles";
import { DATE_RE } from "./validation";

export const GST_RATE = 0.05; // GST on passenger transport by contract carriage
export const MAX_TRIP_DAYS = 30;

// Approximate city centres. Road distance ≈ straight-line distance × ROAD_FACTOR.
// Replace with a distance API (Google / Mapbox) when routes need to be exact.
const CITY_COORDS = {
  Delhi: [28.61, 77.21],
  Gurugram: [28.46, 77.03],
  Noida: [28.54, 77.39],
  Chandigarh: [30.73, 76.78],
  Jaipur: [26.91, 75.79],
  Agra: [27.18, 78.01],
  Dehradun: [30.32, 78.03],
  Shimla: [31.1, 77.17],
  Manali: [32.24, 77.19],
  Lucknow: [26.85, 80.95],
  Mumbai: [19.08, 72.88],
  Pune: [18.52, 73.86],
  Bengaluru: [12.97, 77.59],
  Hyderabad: [17.39, 78.49],
  Chennai: [13.08, 80.27],
  Kolkata: [22.57, 88.36],
  Ahmedabad: [23.02, 72.57],
};
const ROAD_FACTOR = 1.25;

export function distanceKm(from, to) {
  if (from === to) return 0;
  const a = CITY_COORDS[from];
  const b = CITY_COORDS[to];
  if (!a || !b) return null;
  const rad = (d) => (d * Math.PI) / 180;
  const dLat = rad(b[0] - a[0]);
  const dLng = rad(b[1] - a[1]);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a[0])) * Math.cos(rad(b[0])) * Math.sin(dLng / 2) ** 2;
  const straight = 2 * 6371 * Math.asin(Math.sqrt(h));
  return Math.round((straight * ROAD_FACTOR) / 5) * 5;
}

export function tripDays(startDate, endDate) {
  const ms = Date.parse(endDate) - Date.parse(startDate);
  return Math.round(ms / 86_400_000) + 1;
}

// Reads a trip from search params or form data (anything with string values).
// Returns { trip, complete, errors } — `complete` means a fare can be computed.
export function parseTrip(source) {
  const get = (key) => {
    const value = typeof source.get === "function" ? source.get(key) : source[key];
    return String((Array.isArray(value) ? value[0] : value) ?? "").trim();
  };

  const trip = {
    tripType: TRIP_TYPES.some((t) => t.id === get("tripType")) ? get("tripType") : "round-trip",
    from: CITIES.includes(get("from")) ? get("from") : "",
    to: CITIES.includes(get("to")) ? get("to") : "",
    startDate: DATE_RE.test(get("start")) ? get("start") : "",
    endDate: DATE_RE.test(get("end")) ? get("end") : "",
    passengers: Number.parseInt(get("passengers"), 10) || null,
  };
  if (!trip.to && trip.from) trip.to = trip.from;
  if (!trip.endDate) trip.endDate = trip.startDate;

  const errors = {};
  if (!trip.from) errors.from = "Choose a pickup city";
  if (!trip.startDate) errors.start = "Choose a start date";
  if (trip.startDate && trip.endDate < trip.startDate) errors.end = "Return date is before the start date";
  else if (trip.startDate && tripDays(trip.startDate, trip.endDate) > MAX_TRIP_DAYS) errors.end = `Trips can be up to ${MAX_TRIP_DAYS} days`;
  if (trip.passengers !== null && (trip.passengers < 1 || trip.passengers > 60)) errors.passengers = "1–60 passengers per bus";

  return { trip, complete: Object.keys(errors).length === 0, errors };
}

// Turns a trip into URL params (for links that carry the search along).
export function tripToParams(trip) {
  const params = new URLSearchParams();
  if (trip.tripType) params.set("tripType", trip.tripType);
  if (trip.from) params.set("from", trip.from);
  if (trip.to) params.set("to", trip.to);
  if (trip.startDate) params.set("start", trip.startDate);
  if (trip.endDate) params.set("end", trip.endDate);
  if (trip.passengers) params.set("passengers", String(trip.passengers));
  return params;
}

export function calculateFare(bus, trip) {
  const days = tripDays(trip.startDate, trip.endDate);
  const oneWayKm = distanceKm(trip.from, trip.to) ?? 0;
  const local = oneWayKm === 0;
  const tripKm = trip.tripType === "round-trip" ? oneWayKm * 2 : oneWayKm;
  // Operators charge a daily minimum, so short or local trips bill the minimum.
  const minimumKm = bus.minKmPerDay * days;
  const billableKm = Math.max(tripKm, minimumKm);

  const kmCharge = billableKm * bus.ratePerKm;
  const driverAllowance = bus.driverAllowancePerDay * days;
  const subtotal = kmCharge + driverAllowance;
  const gst = Math.round(subtotal * GST_RATE);

  return {
    local,
    days,
    tripKm,
    minimumKm,
    billableKm,
    ratePerKm: bus.ratePerKm,
    kmCharge,
    driverAllowance,
    driverAllowancePerDay: bus.driverAllowancePerDay,
    subtotal,
    gst,
    total: subtotal + gst,
  };
}
