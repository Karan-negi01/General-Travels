"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { updateDb, newId } from "@/lib/data/store";
import { getCurrentVendorId } from "@/lib/auth";
import { isValidAmenity } from "@/lib/constants/amenities";
import { CITIES, getVehicleType } from "@/lib/constants/vehicles";
import { QUOTE_INCLUSIONS } from "@/lib/constants/quotes";
import { vehicleMatches } from "@/lib/data/queries";
import { str, int, list, required, PHONE_RE, EMAIL_RE } from "@/lib/validation";

export async function registerVendor(prevState, formData) {
  const values = {
    name: str(formData, "name"),
    contactName: str(formData, "contactName"),
    phone: str(formData, "phone"),
    email: str(formData, "email"),
    city: str(formData, "city"),
    fleetSize: int(formData, "fleetSize"),
  };

  const errors = {};
  required(errors, values, ["name", "contactName", "phone", "city"]);
  if (values.phone && !PHONE_RE.test(values.phone)) errors.phone = "Enter a valid phone number";
  if (values.email && !EMAIL_RE.test(values.email)) errors.email = "Enter a valid email";
  if (values.city && !CITIES.includes(values.city)) errors.city = "Choose a city from the list";
  if (Object.keys(errors).length) return { errors, values };

  await updateDb((db) => {
    db.vendors.push({
      id: newId("ven"),
      ...values,
      status: "pending",
      onboarding: "self",
      documents: { gst: false, pan: false, businessProof: false },
      createdAt: new Date().toISOString(),
    });
  });

  revalidatePath("/admin/vendors");
  return { success: true, values: {} };
}

export async function createVehicle(prevState, formData) {
  const vendorId = await getCurrentVendorId();

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
  };

  const errors = {};
  required(errors, values, ["title", "type", "seats", "registrationNumber", "baseCity", "ratePerKm"]);
  const type = getVehicleType(values.type);
  if (values.type && !type) errors.type = "Invalid vehicle type";
  if (type && values.seats && (values.seats < type.seatRange[0] || values.seats > type.seatRange[1])) {
    errors.seats = `${type.label} usually has ${type.seatRange[0]}–${type.seatRange[1]} seats`;
  }
  const year = new Date().getFullYear();
  if (values.modelYear && (values.modelYear < 1995 || values.modelYear > year + 1)) errors.modelYear = "Invalid year";
  if (values.baseCity && !CITIES.includes(values.baseCity)) errors.baseCity = "Choose a city from the list";
  if (values.ratePerKm !== null && values.ratePerKm <= 0) errors.ratePerKm = "Must be positive";
  if (values.amenities.length === 0) errors.amenities = "Select at least one amenity";
  if (Object.keys(errors).length) return { errors, values };

  // Base city is always a service city.
  if (!values.serviceCities.includes(values.baseCity)) values.serviceCities.unshift(values.baseCity);

  await updateDb((db) => {
    db.vehicles.push({
      id: newId("veh"),
      vendorId,
      ...values,
      photos: [],
      // TODO: real uploads (RC, insurance, permit, fitness, photos) → object storage.
      documents: { rc: false, insurance: false, permit: false, fitness: false },
      status: "pending",
      createdAt: new Date().toISOString(),
    });
  });

  revalidatePath("/vendor");
  revalidatePath("/admin/vehicles");
  redirect("/vendor/vehicles?added=1");
}

export async function submitQuote(prevState, formData) {
  const vendorId = await getCurrentVendorId();
  const enquiryId = str(formData, "enquiryId");
  const vehicleId = str(formData, "vehicleId");
  const amount = int(formData, "amount");
  const includes = list(formData, "includes").filter((i) => QUOTE_INCLUSIONS.some((q) => q.id === i));
  const notes = str(formData, "notes");

  if (!amount || amount <= 0) return { error: "Enter a valid total amount" };

  try {
    await updateDb((db) => {
      const enquiry = db.enquiries.find((e) => e.id === enquiryId);
      const vehicle = db.vehicles.find((v) => v.id === vehicleId && v.vendorId === vendorId);
      if (!enquiry || enquiry.status !== "open") throw new Error("This enquiry is no longer open.");
      if (!vehicle || vehicle.status !== "approved") throw new Error("Choose one of your approved vehicles.");
      const fits = vehicleMatches(vehicle, {
        city: enquiry.pickupCity,
        passengers: enquiry.passengers,
        type: enquiry.vehicleType || undefined,
        amenities: enquiry.requiredAmenities,
      });
      if (!fits) throw new Error("That vehicle doesn't meet the customer's requirements.");

      const existing = db.quotes.find((q) => q.enquiryId === enquiryId && q.vendorId === vendorId);
      if (existing) {
        Object.assign(existing, { vehicleId, amount, includes, notes, updatedAt: new Date().toISOString() });
      } else {
        db.quotes.push({
          id: newId("quo"),
          enquiryId,
          vendorId,
          vehicleId,
          amount,
          includes,
          notes,
          status: "submitted",
          createdAt: new Date().toISOString(),
        });
      }
    });
  } catch (err) {
    return { error: err.message };
  }

  revalidatePath("/vendor/enquiries");
  revalidatePath(`/enquiry/${enquiryId}`);
  return { success: true };
}
