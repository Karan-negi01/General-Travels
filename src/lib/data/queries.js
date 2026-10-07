import "server-only";

import { readDb } from "./store";
import { calculateFare } from "../pricing";
import { BLOCKING_BOOKING_STATUSES } from "../constants/status";
import { todayISO } from "../format";

// ---------- Rules shared by pages and actions ----------

// A bus is bookable only when its operator AND the bus itself are approved.
export function isLive(bus, operator) {
  return bus.status === "approved" && operator?.status === "approved";
}

export function busMatches(bus, criteria) {
  const { city, passengers, type, amenities = [], ac } = criteria;
  if (city && !bus.serviceCities.includes(city)) return false;
  if (passengers && bus.seats < Number(passengers)) return false;
  if (type && bus.type !== type) return false;
  if (ac && !bus.ac) return false;
  return amenities.every((a) => bus.amenities.includes(a));
}

// True when no pending/confirmed booking of this bus overlaps the dates.
export function isAvailable(db, busId, startDate, endDate) {
  return !db.bookings.some(
    (b) =>
      b.busId === busId &&
      BLOCKING_BOOKING_STATUSES.includes(b.status) &&
      b.startDate <= endDate &&
      startDate <= b.endDate
  );
}

// ---------- Public-safe shapes ----------
// Customers never see the operator's name, phone or the registration number
// before the operator confirms a booking. That keeps deals on the platform.

function toPublicBus(bus, operator) {
  const { registrationNumber, documents, operatorId, ...rest } = bus;
  return { ...rest, operator: { label: `Verified operator · ${operator.city}` } };
}

function index(list) {
  return new Map(list.map((x) => [x.id, x]));
}

// ---------- Customer-facing ----------

// `trip` (optional) adds a fare and an availability flag to every bus.
export async function searchBuses(criteria = {}, trip = null) {
  const db = await readDb();
  const operators = index(db.operators);
  return db.buses
    .filter((b) => isLive(b, operators.get(b.operatorId)) && busMatches(b, criteria))
    .map((b) => ({
      ...toPublicBus(b, operators.get(b.operatorId)),
      fare: trip ? calculateFare(b, trip) : null,
      available: trip ? isAvailable(db, b.id, trip.startDate, trip.endDate) : true,
    }))
    .sort((a, b) => Number(b.available) - Number(a.available) || (a.fare?.total ?? a.ratePerKm) - (b.fare?.total ?? b.ratePerKm));
}

export async function getPublicBus(id, trip = null) {
  const db = await readDb();
  const bus = db.buses.find((b) => b.id === id);
  const operator = bus && db.operators.find((o) => o.id === bus.operatorId);
  if (!bus || !isLive(bus, operator)) return null;
  return {
    ...toPublicBus(bus, operator),
    fare: trip ? calculateFare(bus, trip) : null,
    available: trip ? isAvailable(db, bus.id, trip.startDate, trip.endDate) : true,
  };
}

export async function getPlatformStats() {
  const db = await readDb();
  const operators = index(db.operators);
  const live = db.buses.filter((b) => isLive(b, operators.get(b.operatorId)));
  return {
    operators: db.operators.filter((o) => o.status === "approved").length,
    buses: live.length,
    cities: new Set(live.flatMap((b) => b.serviceCities)).size,
  };
}

// Contacts are shared once the operator confirms.
function contactsShared(booking) {
  return booking.status === "confirmed" || booking.status === "completed";
}

export async function getCustomerBookings(customerId) {
  const db = await readDb();
  const buses = index(db.buses);
  return db.bookings
    .filter((b) => b.customerId === customerId)
    .map((b) => ({ ...b, bus: buses.get(b.busId) && { title: buses.get(b.busId).title, type: buses.get(b.busId).type, seats: buses.get(b.busId).seats } }))
    .sort((a, b) => b.startDate.localeCompare(a.startDate));
}

export async function getCustomerBooking(id, customerId) {
  const db = await readDb();
  const booking = db.bookings.find((b) => b.id === id && b.customerId === customerId);
  if (!booking) return null;
  const bus = db.buses.find((b) => b.id === booking.busId);
  const operator = db.operators.find((o) => o.id === booking.operatorId);
  return {
    ...booking,
    bus: toPublicBus(bus, operator),
    operatorContact: contactsShared(booking)
      ? { businessName: operator.businessName, ownerName: operator.ownerName, phone: operator.phone, email: operator.email, registrationNumber: bus.registrationNumber }
      : null,
  };
}

// ---------- Operator-facing ----------

export async function getOperator(id) {
  const db = await readDb();
  return db.operators.find((o) => o.id === id) ?? null;
}

export async function getOperatorBuses(operatorId) {
  const db = await readDb();
  const operator = db.operators.find((o) => o.id === operatorId);
  return db.buses
    .filter((b) => b.operatorId === operatorId)
    .map((b) => ({ ...b, live: isLive(b, operator) }))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getOperatorBookings(operatorId) {
  const db = await readDb();
  const buses = index(db.buses);
  const customers = index(db.customers);
  return db.bookings
    .filter((b) => b.operatorId === operatorId)
    .map((b) => {
      const customer = customers.get(b.customerId);
      return {
        ...b,
        busTitle: buses.get(b.busId)?.title,
        customer: contactsShared(b)
          ? { name: customer.name, phone: customer.phone, email: customer.email }
          : { name: customer.name.split(" ")[0] }, // first name only until confirmed
      };
    })
    .sort((a, b) => a.startDate.localeCompare(b.startDate));
}

export async function getOperatorSummary(operatorId) {
  const [buses, bookings] = await Promise.all([getOperatorBuses(operatorId), getOperatorBookings(operatorId)]);
  const today = todayISO();
  return {
    buses,
    bookings,
    liveBuses: buses.filter((b) => b.live).length,
    pendingBuses: buses.filter((b) => b.status === "pending").length,
    requests: bookings.filter((b) => b.status === "pending"),
    upcoming: bookings.filter((b) => b.status === "confirmed" && b.endDate >= today),
    earnings: bookings.filter((b) => contactsShared(b)).reduce((sum, b) => sum + b.fare.total, 0),
  };
}

// ---------- Admin ----------

export async function getAdminOverview() {
  const db = await readDb();
  const operators = index(db.operators);
  const count = (list, status) => list.filter((x) => x.status === status).length;
  return {
    operators: { total: db.operators.length, pending: count(db.operators, "pending") },
    buses: {
      total: db.buses.length,
      pending: count(db.buses, "pending"),
      live: db.buses.filter((b) => isLive(b, operators.get(b.operatorId))).length,
    },
    bookings: {
      total: db.bookings.length,
      pending: count(db.bookings, "pending"),
      value: db.bookings.filter((b) => contactsShared(b)).reduce((s, b) => s + b.fare.total, 0),
    },
    customers: db.customers.length,
  };
}

export async function getAllOperators() {
  const db = await readDb();
  return db.operators
    .map((o) => {
      const own = db.buses.filter((b) => b.operatorId === o.id);
      return { ...o, busCount: own.length, pendingBuses: own.filter((b) => b.status === "pending").length };
    })
    .sort((a, b) => Number(b.status === "pending") - Number(a.status === "pending") || b.createdAt.localeCompare(a.createdAt));
}

export async function getAllBuses() {
  const db = await readDb();
  const operators = index(db.operators);
  return db.buses
    .map((b) => {
      const operator = operators.get(b.operatorId);
      return { ...b, operatorName: operator?.businessName ?? "Unknown", operatorStatus: operator?.status, live: isLive(b, operator) };
    })
    .sort((a, b) => Number(b.status === "pending") - Number(a.status === "pending") || b.createdAt.localeCompare(a.createdAt));
}

export async function getAllBookings() {
  const db = await readDb();
  const buses = index(db.buses);
  const operators = index(db.operators);
  const customers = index(db.customers);
  return db.bookings
    .map((b) => ({
      ...b,
      busTitle: buses.get(b.busId)?.title,
      operatorName: operators.get(b.operatorId)?.businessName,
      customerName: customers.get(b.customerId)?.name,
    }))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
