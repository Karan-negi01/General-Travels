"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { updateDb, newId } from "@/lib/data/store";
import { isValidAmenity } from "@/lib/constants/amenities";
import { CITIES, TRIP_TYPES, CUSTOMER_TYPES, getVehicleType } from "@/lib/constants/vehicles";
import { str, int, list, required, PHONE_RE, EMAIL_RE } from "@/lib/validation";

export async function createEnquiry(prevState, formData) {
  const values = {
    tripType: str(formData, "tripType"),
    pickupCity: str(formData, "pickupCity"),
    dropCity: str(formData, "dropCity"),
    startDate: str(formData, "startDate"),
    endDate: str(formData, "endDate"),
    passengers: int(formData, "passengers"),
    vehicleType: str(formData, "vehicleType"),
    requiredAmenities: list(formData, "amenities").filter(isValidAmenity),
    customerType: str(formData, "customerType"),
    customerName: str(formData, "customerName"),
    organisation: str(formData, "organisation"),
    phone: str(formData, "phone"),
    email: str(formData, "email"),
    notes: str(formData, "notes"),
  };

  const errors = {};
  required(errors, values, ["tripType", "pickupCity", "startDate", "passengers", "customerType", "customerName", "phone"]);
  if (values.tripType && !TRIP_TYPES.some((t) => t.id === values.tripType)) errors.tripType = "Invalid trip type";
  if (values.pickupCity && !CITIES.includes(values.pickupCity)) errors.pickupCity = "Choose a city from the list";
  if (values.tripType !== "local" && !values.dropCity) errors.dropCity = "Required";
  if (values.customerType && !CUSTOMER_TYPES.some((t) => t.id === values.customerType)) errors.customerType = "Invalid";
  if (values.vehicleType && !getVehicleType(values.vehicleType)) errors.vehicleType = "Invalid vehicle type";
  if (values.passengers !== null && (values.passengers < 1 || values.passengers > 500)) errors.passengers = "1–500 passengers";
  if (values.endDate && values.startDate && values.endDate < values.startDate) errors.endDate = "End date is before start date";
  if (values.phone && !PHONE_RE.test(values.phone)) errors.phone = "Enter a valid phone number";
  if (values.email && !EMAIL_RE.test(values.email)) errors.email = "Enter a valid email";

  if (Object.keys(errors).length) {
    return { errors, values };
  }

  const id = await updateDb((db) => {
    const enquiry = {
      id: newId("enq"),
      ...values,
      endDate: values.endDate || values.startDate,
      status: "open",
      createdAt: new Date().toISOString(),
    };
    db.enquiries.push(enquiry);
    return enquiry.id;
  });

  // TODO: notify matching vendors (SMS / WhatsApp / email) — see docs/IMPLEMENTATION_PLAN.md
  revalidatePath("/vendor/enquiries");
  revalidatePath("/admin");
  redirect(`/enquiry/${id}?created=1`);
}

export async function acceptQuote(formData) {
  const quoteId = str(formData, "quoteId");
  const enquiryId = str(formData, "enquiryId");

  // TODO: once customers log in (OTP), verify the enquiry belongs to them.
  await updateDb((db) => {
    const enquiry = db.enquiries.find((e) => e.id === enquiryId);
    const quote = db.quotes.find((q) => q.id === quoteId && q.enquiryId === enquiryId);
    if (!enquiry || !quote || enquiry.status !== "open") {
      throw new Error("This quote can no longer be accepted.");
    }
    enquiry.status = "booked";
    enquiry.bookedQuoteId = quote.id;
    for (const q of db.quotes) {
      if (q.enquiryId !== enquiryId) continue;
      q.status = q.id === quoteId ? "accepted" : "declined";
    }
  });

  revalidatePath(`/enquiry/${enquiryId}`);
  revalidatePath("/vendor/enquiries");
  revalidatePath("/admin");
}
