import "server-only";

import { readDb } from "./store";
import { calculateFare } from "../pricing";
import { paidAmount, balanceDue } from "../payments";
import { PAYMENT_HOLD_MINUTES } from "../constants/status";
import { todayISO } from "../format";

// ---------- Rules shared by pages and actions ----------

// A bus is bookable only when its operator, the bus AND its driver are approved.
export function isLive(bus, operator, driver) {
  return bus.status === "approved" && operator?.status === "approved" && driver?.status === "approved";
}

export function busMatches(bus, criteria) {
  const { city, passengers, type, amenities = [], ac, seating } = criteria;
  if (city && !bus.serviceCities.includes(city)) return false;
  if (passengers && bus.seats < Number(passengers)) return false;
  if (type && bus.type !== type) return false;
  if (seating && bus.seating !== seating) return false;
  if (ac && !bus.ac) return false;
  return amenities.every((a) => bus.amenities.includes(a));
}

// A confirmed booking holds the bus; an unpaid one holds it only for the payment window.
export function holdsBus(booking, now = Date.now()) {
  if (booking.status === "confirmed") return true;
  if (booking.status !== "payment_pending") return false;
  return now - Date.parse(booking.createdAt) < PAYMENT_HOLD_MINUTES * 60_000;
}

const overlaps = (aStart, aEnd, bStart, bEnd) => aStart <= bEnd && bStart <= aEnd;

// True when no booking holds the bus and the owner hasn't blocked any of the dates.
// `exceptBookingId` lets a booking that's being paid ignore its own hold.
export function isAvailable(db, bus, startDate, endDate, exceptBookingId = null) {
  const now = Date.now();
  const booked = db.bookings.some(
    (b) => b.busId === bus.id && b.id !== exceptBookingId && holdsBus(b, now) && overlaps(b.startDate, b.endDate, startDate, endDate)
  );
  const blocked = (bus.blockedDates ?? []).some((d) => overlaps(d.start, d.end, startDate, endDate));
  return !booked && !blocked;
}

export function commissionRateFor(db, operator) {
  return operator?.commissionRate ?? db.settings.defaultCommissionRate;
}

export function fileUrl(id) {
  return id ? `/files/${id}` : null;
}

// ---------- Public-safe shapes ----------
// Travellers never see the operator's name, phone, the driver or the
// registration number before a booking is paid. That keeps deals on the platform.

function toPublicBus(bus, operator) {
  const { registrationNumber, documents, operatorId, driverId, blockedDates, rejectionReason, photos = [], ...rest } = bus;
  return { ...rest, photoUrls: photos.map(fileUrl), operator: { label: `Verified operator · ${operator.city}` } };
}

function index(list) {
  return new Map(list.map((x) => [x.id, x]));
}

function liveBusesOf(db) {
  const operators = index(db.operators);
  const drivers = index(db.drivers);
  return db.buses.filter((b) => isLive(b, operators.get(b.operatorId), drivers.get(b.driverId)));
}

function withTrip(db, bus, trip) {
  const operator = db.operators.find((o) => o.id === bus.operatorId);
  return {
    ...toPublicBus(bus, operator),
    fare: trip ? calculateFare(bus, trip) : null,
    available: trip ? isAvailable(db, bus, trip.startDate, trip.endDate) : true,
  };
}

// ---------- Customer-facing ----------

// `trip` (optional) adds a fare and an availability flag to every bus.
export async function searchBuses(criteria = {}, trip = null) {
  const db = await readDb();
  return liveBusesOf(db)
    .filter((b) => busMatches(b, criteria))
    .map((b) => withTrip(db, b, trip))
    .sort((a, b) => Number(b.available) - Number(a.available) || (a.fare?.total ?? a.ratePerKm) - (b.fare?.total ?? b.ratePerKm));
}

export async function getPublicBus(id, trip = null) {
  const db = await readDb();
  const bus = liveBusesOf(db).find((b) => b.id === id);
  return bus ? withTrip(db, bus, trip) : null;
}

// Up to 5 live buses side by side, in the order the traveller picked them.
export async function getBusesForCompare(ids, trip = null) {
  const db = await readDb();
  const live = index(liveBusesOf(db));
  return ids
    .slice(0, 5)
    .map((id) => live.get(id))
    .filter(Boolean)
    .map((b) => withTrip(db, b, trip));
}

export async function getPlatformStats() {
  const db = await readDb();
  const live = liveBusesOf(db);
  return {
    operators: db.operators.filter((o) => o.status === "approved").length,
    buses: live.length,
    cities: new Set(live.flatMap((b) => b.serviceCities)).size,
  };
}

// Contacts are shared once the traveller has paid.
function contactsShared(booking) {
  return booking.status === "confirmed" || booking.status === "completed";
}

function paymentSummary(booking) {
  return { paid: paidAmount(booking), balance: balanceDue(booking) };
}

export async function getCustomerBookings(customerId) {
  const db = await readDb();
  const buses = index(db.buses);
  return db.bookings
    .filter((b) => b.customerId === customerId)
    .map((b) => {
      const bus = buses.get(b.busId);
      return { ...b, ...paymentSummary(b), expired: b.status === "payment_pending" && !holdsBus(b), bus: bus && { title: bus.title, type: bus.type, seats: bus.seats, photoUrl: fileUrl(bus.photos?.[0]) } };
    })
    .sort((a, b) => b.startDate.localeCompare(a.startDate));
}

export async function getCustomerBooking(id, customerId) {
  const db = await readDb();
  const booking = db.bookings.find((b) => b.id === id && b.customerId === customerId);
  if (!booking) return null;
  const bus = db.buses.find((b) => b.id === booking.busId);
  const operator = db.operators.find((o) => o.id === booking.operatorId);
  const driver = db.drivers.find((d) => d.id === booking.driverId);
  return {
    ...booking,
    ...paymentSummary(booking),
    expired: booking.status === "payment_pending" && !holdsBus(booking),
    stillAvailable: booking.status === "payment_pending" ? isAvailable(db, bus, booking.startDate, booking.endDate, booking.id) : true,
    bus: toPublicBus(bus, operator),
    operatorContact: contactsShared(booking)
      ? { businessName: operator.businessName, phone: operator.phone, email: operator.email, registrationNumber: bus.registrationNumber }
      : null,
    driver: contactsShared(booking) && driver
      ? { name: driver.name, phone: driver.phone, experienceYears: driver.experienceYears, photoUrl: fileUrl(driver.photo) }
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
  const drivers = index(db.drivers);
  return db.buses
    .filter((b) => b.operatorId === operatorId)
    .map((b) => {
      const driver = drivers.get(b.driverId);
      return { ...b, driver: driver && { id: driver.id, name: driver.name, status: driver.status }, photoUrls: (b.photos ?? []).map(fileUrl), live: isLive(b, operator, driver) };
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getOperatorBus(id, operatorId) {
  const buses = await getOperatorBuses(operatorId);
  return buses.find((b) => b.id === id) ?? null;
}

export async function getOperatorDrivers(operatorId) {
  const db = await readDb();
  return db.drivers
    .filter((d) => d.operatorId === operatorId)
    .map((d) => ({ ...d, photoUrl: fileUrl(d.photo), buses: db.buses.filter((b) => b.driverId === d.id).map((b) => b.title) }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function getOperatorDriver(id, operatorId) {
  const drivers = await getOperatorDrivers(operatorId);
  return drivers.find((d) => d.id === id) ?? null;
}

export async function getOperatorBookings(operatorId) {
  const db = await readDb();
  const buses = index(db.buses);
  const customers = index(db.customers);
  const drivers = index(db.drivers);
  return db.bookings
    .filter((b) => b.operatorId === operatorId && b.status !== "payment_pending")
    .map((b) => {
      const customer = customers.get(b.customerId);
      return {
        ...b,
        ...paymentSummary(b),
        busTitle: buses.get(b.busId)?.title,
        driverName: drivers.get(b.driverId)?.name,
        customer: contactsShared(b)
          ? { name: customer.name, phone: customer.phone, email: customer.email }
          : { name: customer.name.split(" ")[0] },
      };
    })
    .sort((a, b) => a.startDate.localeCompare(b.startDate));
}

// Bookings and owner blocks per date, for the availability calendar.
export async function getBusCalendar(busId, operatorId) {
  const db = await readDb();
  const bus = db.buses.find((b) => b.id === busId && b.operatorId === operatorId);
  if (!bus) return null;
  const bookings = db.bookings
    .filter((b) => b.busId === bus.id && (b.status === "confirmed" || b.status === "completed"))
    .map((b) => ({ id: b.id, ref: b.ref, start: b.startDate, end: b.endDate, route: b.from === b.to ? `Local in ${b.from}` : `${b.from} → ${b.to}` }));
  return { bus: { id: bus.id, title: bus.title }, blocks: bus.blockedDates ?? [], bookings };
}

export async function getOperatorSummary(operatorId) {
  const [buses, bookings, drivers, db] = await Promise.all([getOperatorBuses(operatorId), getOperatorBookings(operatorId), getOperatorDrivers(operatorId), readDb()]);
  const today = todayISO();
  const operator = db.operators.find((o) => o.id === operatorId);
  return {
    buses,
    bookings,
    drivers,
    commissionRate: commissionRateFor(db, operator),
    liveBuses: buses.filter((b) => b.live).length,
    pendingBuses: buses.filter((b) => b.status === "pending").length,
    rejectedBuses: buses.filter((b) => b.status === "rejected").length,
    upcoming: bookings.filter((b) => b.status === "confirmed" && b.endDate >= today),
    toComplete: bookings.filter((b) => b.status === "confirmed" && b.startDate <= today),
    paidOut: bookings.filter((b) => b.payout?.status === "paid").reduce((s, b) => s + b.payout.amount, 0),
    upcomingPayouts: bookings.filter((b) => b.status === "confirmed").reduce((s, b) => s + b.ownerPayout, 0),
  };
}

// ---------- Admin ----------

export async function getSettings() {
  const db = await readDb();
  return db.settings;
}

export async function getAdminOverview() {
  const db = await readDb();
  const count = (list, status) => list.filter((x) => x.status === status).length;
  const paidBookings = db.bookings.filter(contactsShared);
  return {
    operators: { total: db.operators.length, pending: count(db.operators, "pending") },
    drivers: { total: db.drivers.length, pending: count(db.drivers, "pending") },
    buses: { total: db.buses.length, pending: count(db.buses, "pending"), live: liveBusesOf(db).length },
    bookings: {
      total: db.bookings.filter((b) => b.status !== "payment_pending").length,
      value: paidBookings.reduce((s, b) => s + b.fare.total, 0),
      collected: db.bookings.reduce((s, b) => s + paidAmount(b), 0) - db.bookings.reduce((s, b) => s + (b.refunds ?? []).reduce((t, r) => t + r.amount, 0), 0),
      commission: paidBookings.reduce((s, b) => s + b.commission, 0),
    },
    customers: db.customers.length,
    defaultCommissionRate: db.settings.defaultCommissionRate,
  };
}

export async function getAllOperators() {
  const db = await readDb();
  return db.operators
    .map((o) => {
      const own = db.buses.filter((b) => b.operatorId === o.id);
      return {
        ...o,
        effectiveCommissionRate: commissionRateFor(db, o),
        busCount: own.length,
        driverCount: db.drivers.filter((d) => d.operatorId === o.id).length,
        pendingBuses: own.filter((b) => b.status === "pending").length,
      };
    })
    .sort((a, b) => Number(b.status === "pending") - Number(a.status === "pending") || b.createdAt.localeCompare(a.createdAt));
}

export async function getAllDrivers() {
  const db = await readDb();
  const operators = index(db.operators);
  return db.drivers
    .map((d) => ({ ...d, photoUrl: fileUrl(d.photo), operatorName: operators.get(d.operatorId)?.businessName, buses: db.buses.filter((b) => b.driverId === d.id).map((b) => b.title) }))
    .sort((a, b) => Number(b.status === "pending") - Number(a.status === "pending") || b.createdAt.localeCompare(a.createdAt));
}

export async function getAllBuses() {
  const db = await readDb();
  const operators = index(db.operators);
  const drivers = index(db.drivers);
  return db.buses
    .map((b) => {
      const operator = operators.get(b.operatorId);
      const driver = drivers.get(b.driverId);
      return {
        ...b,
        operatorName: operator?.businessName ?? "Unknown",
        operatorStatus: operator?.status,
        driver: driver && { name: driver.name, status: driver.status, licenceNumber: driver.licenceNumber },
        photoUrls: (b.photos ?? []).map(fileUrl),
        live: isLive(b, operator, driver),
      };
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
      ...paymentSummary(b),
      refunded: (b.refunds ?? []).reduce((s, r) => s + r.amount, 0),
      expired: b.status === "payment_pending" && !holdsBus(b),
      busTitle: buses.get(b.busId)?.title,
      operatorName: operators.get(b.operatorId)?.businessName,
      customerName: customers.get(b.customerId)?.name,
    }))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

// Who may download an uploaded file: bus photos are public; a driver's photo is
// also shown to travellers with a paid booking for that driver; documents only
// to the owner who uploaded them and the admin.
export async function getFileForViewer(id, viewer) {
  const db = await readDb();
  const file = db.files.find((f) => f.id === id);
  if (!file) return null;
  if (file.kind === "photo") return file;
  if (viewer?.role === "admin") return file;
  if (viewer?.role === "operator" && viewer.id === file.operatorId) return file;
  if (file.kind === "driver-photo" && viewer?.role === "customer") {
    const driver = db.drivers.find((d) => d.photo === file.id);
    const hasTrip = driver && db.bookings.some((b) => b.customerId === viewer.id && b.driverId === driver.id && contactsShared(b));
    return hasTrip ? file : null;
  }
  return null;
}
