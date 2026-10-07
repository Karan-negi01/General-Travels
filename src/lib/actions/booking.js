"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireCustomer } from "@/lib/auth";
import { updateDb, newId, newBookingRef } from "@/lib/data/store";
import { isLive, isAvailable } from "@/lib/data/queries";
import { calculateFare, parseTrip, tripToParams } from "@/lib/pricing";
import { todayISO } from "@/lib/format";
import { str } from "@/lib/validation";

// Customer books a bus at its fixed fare. The booking waits for the operator
// to confirm (they may be unable to take it), then contacts are shared.
export async function createBooking(prevState, formData) {
  const busId = str(formData, "busId");
  const { trip, complete, errors } = parseTrip(formData);
  const viewer = await requireCustomer(`/buses/${busId}?${tripToParams(trip)}`);

  const pickupAddress = str(formData, "pickupAddress");
  const notes = str(formData, "notes").slice(0, 500);
  if (!pickupAddress) errors.pickupAddress = "Where should the bus pick you up?";
  if (!trip.passengers) errors.passengers = "How many passengers?";
  if (trip.startDate && trip.startDate < todayISO()) errors.start = "Start date is in the past";
  if (!complete || Object.keys(errors).length) return { errors };

  let id;
  try {
    id = await updateDb((db) => {
      const bus = db.buses.find((b) => b.id === busId);
      const operator = bus && db.operators.find((o) => o.id === bus.operatorId);
      if (!bus || !isLive(bus, operator)) throw new Error("This bus is no longer available for booking.");
      if (!bus.serviceCities.includes(trip.from)) throw new Error(`This bus doesn't pick up from ${trip.from}.`);
      if (trip.passengers > bus.seats) throw new Error(`This bus seats ${bus.seats}. Choose a bigger bus for ${trip.passengers} passengers.`);
      if (!isAvailable(db, bus.id, trip.startDate, trip.endDate)) throw new Error("This bus was just booked for those dates. Try other dates or another bus.");

      const booking = {
        id: newId("bk"),
        ref: newBookingRef(),
        customerId: viewer.id,
        busId: bus.id,
        operatorId: bus.operatorId,
        ...trip,
        pickupAddress,
        notes,
        // The price is computed on the server — never trusted from the form.
        fare: calculateFare(bus, trip),
        status: "pending",
        createdAt: new Date().toISOString(),
      };
      db.bookings.push(booking);
      return booking.id;
    });
  } catch (err) {
    return { error: err.message };
  }

  // TODO: notify the operator (WhatsApp / SMS) — see docs/IMPLEMENTATION_PLAN.md
  revalidatePath("/operator", "layout");
  revalidatePath("/admin", "layout");
  redirect(`/bookings/${id}?new=1`);
}

export async function cancelBooking(formData) {
  const id = str(formData, "id");
  const viewer = await requireCustomer();

  await updateDb((db) => {
    const booking = db.bookings.find((b) => b.id === id && b.customerId === viewer.id);
    if (!booking) throw new Error("Booking not found");
    if (!["pending", "confirmed"].includes(booking.status) || booking.startDate <= todayISO()) {
      throw new Error("This booking can no longer be cancelled online. Please call support.");
    }
    booking.status = "cancelled";
    booking.cancelledAt = new Date().toISOString();
  });

  revalidatePath("/bookings", "layout");
  revalidatePath("/operator", "layout");
  revalidatePath("/admin", "layout");
}
