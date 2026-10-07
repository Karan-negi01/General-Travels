import "server-only";

import { readDb } from "./store";

// ---------- Public-safe shapes ----------
// Customers must never see vendor contact details or registration numbers
// before a booking is confirmed — that's what stops off-platform deals.

function toPublicVehicle(vehicle, vendor) {
  const { registrationNumber, documents, vendorId, ...rest } = vehicle;
  return {
    ...rest,
    operator: {
      id: vendor.id,
      // Display a masked name only; the real name/phone is revealed after booking.
      label: `Verified operator · ${vendor.city}`,
      verified: vendor.status === "approved",
    },
  };
}

// ---------- Matching ----------

export function vehicleMatches(vehicle, criteria) {
  const { city, passengers, type, amenities = [], ac } = criteria;
  if (city && !vehicle.serviceCities.includes(city)) return false;
  if (passengers && vehicle.seats < Number(passengers)) return false;
  if (type && vehicle.type !== type) return false;
  if (ac && !vehicle.ac) return false;
  return amenities.every((a) => vehicle.amenities.includes(a));
}

function isListable(vehicle, vendorsById) {
  const vendor = vendorsById.get(vehicle.vendorId);
  return vehicle.status === "approved" && vendor?.status === "approved";
}

function indexVendors(db) {
  return new Map(db.vendors.map((v) => [v.id, v]));
}

// ---------- Customer-facing ----------

export async function searchVehicles(criteria = {}) {
  const db = await readDb();
  const vendors = indexVendors(db);
  return db.vehicles
    .filter((v) => isListable(v, vendors) && vehicleMatches(v, criteria))
    .sort((a, b) => a.ratePerKm - b.ratePerKm)
    .map((v) => toPublicVehicle(v, vendors.get(v.vendorId)));
}

export async function getPublicVehicle(id) {
  const db = await readDb();
  const vendors = indexVendors(db);
  const vehicle = db.vehicles.find((v) => v.id === id);
  if (!vehicle || !isListable(vehicle, vendors)) return null;
  return toPublicVehicle(vehicle, vendors.get(vehicle.vendorId));
}

export async function getEnquiryWithQuotes(id) {
  const db = await readDb();
  const enquiry = db.enquiries.find((e) => e.id === id);
  if (!enquiry) return null;
  const vendors = indexVendors(db);

  const quotes = db.quotes
    .filter((q) => q.enquiryId === id)
    .sort((a, b) => a.amount - b.amount)
    .map((q) => {
      const vendor = vendors.get(q.vendorId);
      const vehicle = db.vehicles.find((v) => v.id === q.vehicleId);
      const revealed = q.status === "accepted";
      return {
        ...q,
        vehicle: vehicle && toPublicVehicle(vehicle, vendor),
        // Contact details only after the customer has accepted this quote.
        vendorContact: revealed
          ? { name: vendor.name, contactName: vendor.contactName, phone: vendor.phone, email: vendor.email }
          : null,
      };
    });

  return { enquiry, quotes };
}

// ---------- Vendor-facing ----------

export async function getVendor(id) {
  const db = await readDb();
  return db.vendors.find((v) => v.id === id) ?? null;
}

export async function getVendorVehicles(vendorId) {
  const db = await readDb();
  return db.vehicles.filter((v) => v.vendorId === vendorId);
}

// Open enquiries that at least one of this vendor's approved vehicles can serve.
// Customer contact details are stripped — vendors only see the requirement.
export async function getMatchingEnquiries(vendorId) {
  const db = await readDb();
  const fleet = db.vehicles.filter((v) => v.vendorId === vendorId && v.status === "approved");

  return db.enquiries
    .filter((e) => e.status === "open")
    .map((e) => {
      const eligibleVehicles = fleet.filter((v) =>
        vehicleMatches(v, {
          city: e.pickupCity,
          passengers: e.passengers,
          type: e.vehicleType || undefined,
          amenities: e.requiredAmenities,
        })
      );
      const myQuote = db.quotes.find((q) => q.enquiryId === e.id && q.vendorId === vendorId);
      const { customerName, phone, email, organisation, ...requirement } = e;
      return { ...requirement, eligibleVehicles, myQuote };
    })
    .filter((e) => e.eligibleVehicles.length > 0)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

// ---------- Admin ----------

export async function getAdminOverview() {
  const db = await readDb();
  const count = (list, status) => list.filter((x) => x.status === status).length;
  return {
    vendors: { total: db.vendors.length, pending: count(db.vendors, "pending") },
    vehicles: { total: db.vehicles.length, pending: count(db.vehicles, "pending") },
    enquiries: { total: db.enquiries.length, open: count(db.enquiries, "open") },
    quotes: { total: db.quotes.length },
  };
}

export async function getAllVendors() {
  const db = await readDb();
  return db.vendors
    .map((v) => ({ ...v, vehicleCount: db.vehicles.filter((x) => x.vendorId === v.id).length }))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getAllVehicles() {
  const db = await readDb();
  const vendors = indexVendors(db);
  return db.vehicles
    .map((v) => ({ ...v, vendorName: vendors.get(v.vendorId)?.name ?? "Unknown" }))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getAllEnquiries() {
  const db = await readDb();
  return db.enquiries
    .map((e) => ({ ...e, quoteCount: db.quotes.filter((q) => q.enquiryId === e.id).length }))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
