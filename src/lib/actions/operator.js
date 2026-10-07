"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireOperator } from "@/lib/auth";
import { writeSession } from "@/lib/session";
import { updateDb, newId } from "@/lib/data/store";
import { isValidAmenity } from "@/lib/constants/amenities";
import { CITIES, getVehicleType } from "@/lib/constants/vehicles";
import { str, int, list, required, normalizePhone, PHONE_RE, EMAIL_RE } from "@/lib/validation";

const GST_RE = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][0-9A-Z]Z[0-9A-Z]$/;
const PAN_RE = /^[A-Z]{5}[0-9]{4}[A-Z]$/;

// Step 1 for a bus owner: create the operator account. It starts "pending"
// until the General Travels team verifies it (once).
export async function registerOperator(prevState, formData) {
  const values = {
    businessName: str(formData, "businessName"),
    ownerName: str(formData, "ownerName"),
    phone: str(formData, "phone"),
    email: str(formData, "email"),
    city: str(formData, "city"),
    fleetSize: int(formData, "fleetSize"),
    gstNumber: str(formData, "gstNumber").toUpperCase(),
    panNumber: str(formData, "panNumber").toUpperCase(),
  };

  const errors = {};
  required(errors, values, ["businessName", "ownerName", "phone", "city", "panNumber"]);
  if (values.phone && !PHONE_RE.test(values.phone)) errors.phone = "Enter a valid 10-digit mobile number";
  if (values.email && !EMAIL_RE.test(values.email)) errors.email = "Enter a valid email";
  if (values.city && !CITIES.includes(values.city)) errors.city = "Choose a city from the list";
  if (values.gstNumber && !GST_RE.test(values.gstNumber)) errors.gstNumber = "Enter a valid 15-character GSTIN";
  if (values.panNumber && !PAN_RE.test(values.panNumber)) errors.panNumber = "Enter a valid PAN (e.g. ABCDE1234F)";
  if (Object.keys(errors).length) return { errors, values };

  const phone = normalizePhone(values.phone);
  const id = await updateDb((db) => {
    if (db.operators.some((o) => o.phone === phone)) return null;
    const operator = { id: newId("op"), ...values, phone, status: "pending", createdAt: new Date().toISOString() };
    db.operators.push(operator);
    return operator.id;
  });
  if (!id) return { values, errors: { phone: "An operator account already uses this number. Sign in instead." } };

  await writeSession({ role: "operator", id });
  revalidatePath("/admin", "layout");
  redirect("/operator?welcome=1");
}

// Every bus is reviewed on its own. It goes live once the operator is approved
// and admin approves this bus.
export async function createBus(prevState, formData) {
  const viewer = await requireOperator();
  if (viewer.record.status === "rejected") return { formError: "Your operator account was not approved, so you can't add buses." };

  const values = {
    title: str(formData, "title"),
    type: str(formData, "type"),
    seats: int(formData, "seats"),
    ac: formData.get("ac") === "on",
    modelYear: int(formData, "modelYear"),
    registrationNumber: str(formData, "registrationNumber").toUpperCase(),
    baseCity: str(formData, "baseCity"),
    serviceCities: list(formData, "serviceCities").filter((c) => CITIES.includes(c)),
    ratePerKm: int(formData, "ratePerKm"),
    minKmPerDay: int(formData, "minKmPerDay"),
    driverAllowancePerDay: int(formData, "driverAllowancePerDay"),
    amenities: list(formData, "amenities").filter(isValidAmenity),
    documents: {
      rc: formData.get("doc_rc") === "on",
      insurance: formData.get("doc_insurance") === "on",
      permit: formData.get("doc_permit") === "on",
      fitness: formData.get("doc_fitness") === "on",
    },
  };

  const errors = {};
  required(errors, values, ["title", "type", "seats", "registrationNumber", "baseCity", "ratePerKm", "minKmPerDay", "driverAllowancePerDay"]);
  const type = getVehicleType(values.type);
  if (values.type && !type) errors.type = "Invalid vehicle type";
  if (type && values.seats && (values.seats < type.seatRange[0] || values.seats > type.seatRange[1])) {
    errors.seats = `${type.label} usually has ${type.seatRange[0]}–${type.seatRange[1]} seats`;
  }
  const year = new Date().getFullYear();
  if (values.modelYear && (values.modelYear < 1995 || values.modelYear > year + 1)) errors.modelYear = "Invalid year";
  if (values.baseCity && !CITIES.includes(values.baseCity)) errors.baseCity = "Choose a city from the list";
  if (values.ratePerKm !== null && values.ratePerKm <= 0) errors.ratePerKm = "Must be positive";
  if (values.minKmPerDay !== null && values.minKmPerDay < 0) errors.minKmPerDay = "Can't be negative";
  if (values.driverAllowancePerDay !== null && values.driverAllowancePerDay < 0) errors.driverAllowancePerDay = "Can't be negative";
  if (values.amenities.length === 0) errors.amenities = "Select at least one amenity";
  if (Object.keys(errors).length) return { errors, values };

  // The base city is always a pickup city.
  if (!values.serviceCities.includes(values.baseCity)) values.serviceCities.unshift(values.baseCity);

  await updateDb((db) => {
    db.buses.push({
      id: newId("bus"),
      operatorId: viewer.id,
      ...values,
      // TODO: real uploads (photos, RC, insurance, permit, fitness) → object storage.
      status: "pending",
      createdAt: new Date().toISOString(),
    });
  });

  revalidatePath("/operator", "layout");
  revalidatePath("/admin", "layout");
  redirect("/operator/buses?added=1");
}

// Operator confirms or declines a booking request.
export async function respondToBooking(formData) {
  const viewer = await requireOperator();
  const id = str(formData, "id");
  const decision = str(formData, "decision");
  if (!["confirm", "decline", "complete"].includes(decision)) throw new Error("Invalid decision");

  await updateDb((db) => {
    const booking = db.bookings.find((b) => b.id === id && b.operatorId === viewer.id);
    if (!booking) throw new Error("Booking not found");
    if (decision === "complete") {
      if (booking.status !== "confirmed") throw new Error("Only confirmed trips can be completed");
      booking.status = "completed";
      booking.completedAt = new Date().toISOString();
      return;
    }
    if (booking.status !== "pending") throw new Error("This booking has already been answered");
    booking.status = decision === "confirm" ? "confirmed" : "declined";
    booking.respondedAt = new Date().toISOString();
  });

  // TODO: notify the customer (WhatsApp / SMS / email).
  revalidatePath("/operator", "layout");
  revalidatePath("/bookings", "layout");
  revalidatePath("/admin", "layout");
}
