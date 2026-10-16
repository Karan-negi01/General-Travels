"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireCustomer } from "@/lib/auth";
import { updateDb, newId, newBookingRef } from "@/lib/data/store";
import { isLive, isAvailable, holdsBus, commissionRateFor } from "@/lib/data/queries";
import { calculateFare, parseTrip, tripToParams } from "@/lib/pricing";
import { PAYMENT_OPTIONS, PAYMENT_METHODS, amountFor, balanceDue, paidAmount, splitFare, demoPaymentId } from "@/lib/payments";
import { todayISO } from "@/lib/format";
import { str } from "@/lib/validation";

function revalidateBookings() {
  revalidatePath("/bookings", "layout");
  revalidatePath("/operator", "layout");
  revalidatePath("/admin", "layout");
  revalidatePath("/buses", "layout");
}

// Step 1: the traveller picks the bus at its fixed fare. The bus is held for
// a few minutes while they pay; paying confirms the booking straight away.
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
      const driver = bus && db.drivers.find((d) => d.id === bus.driverId);
      if (!bus || !isLive(bus, operator, driver)) throw new Error("This bus is no longer available for booking.");
      if (!bus.serviceCities.includes(trip.from)) throw new Error(`This bus doesn't pick up from ${trip.from}.`);
      if (trip.passengers > bus.seats) throw new Error(`This bus seats ${bus.seats}. Choose a bigger bus for ${trip.passengers} passengers.`);
      if (!isAvailable(db, bus, trip.startDate, trip.endDate)) throw new Error("This bus isn't available on those dates. Try other dates or another bus.");

      // The price is computed on the server, never trusted from the form.
      const fare = calculateFare(bus, trip);
      const booking = {
        id: newId("bk"),
        ref: newBookingRef(),
        customerId: viewer.id,
        busId: bus.id,
        operatorId: bus.operatorId,
        driverId: bus.driverId,
        ...trip,
        pickupAddress,
        notes,
        fare,
        ...splitFare(fare, commissionRateFor(db, operator)),
        payments: [],
        refunds: [],
        payout: null,
        status: "payment_pending",
        createdAt: new Date().toISOString(),
      };
      db.bookings.push(booking);
      return booking.id;
    });
  } catch (err) {
    return { error: err.message };
  }

  revalidateBookings();
  redirect(`/bookings/${id}/pay`);
}

// Step 2 (DEMO): simulated Razorpay payment. Paying the advance or the full
// fare confirms the booking immediately; there is no operator accept step.
export async function payBooking(prevState, formData) {
  const viewer = await requireCustomer();
  const id = str(formData, "id");
  const option = str(formData, "option");
  const method = str(formData, "method");
  if (!PAYMENT_OPTIONS.some((o) => o.id === option)) return { error: "Choose how much to pay." };
  if (!PAYMENT_METHODS.some((m) => m.id === method)) return { error: "Choose a payment method." };

  const result = await updateDb((db) => {
    const booking = db.bookings.find((b) => b.id === id && b.customerId === viewer.id);
    if (!booking) return { error: "Booking not found." };
    if (booking.status !== "payment_pending") return { error: "This booking is already paid." };
    const bus = db.buses.find((b) => b.id === booking.busId);
    const operator = db.operators.find((o) => o.id === booking.operatorId);
    const driver = db.drivers.find((d) => d.id === booking.driverId);
    if (!isLive(bus, operator, driver)) return { error: "This bus is no longer available. Please choose another bus." };
    // An expired hold is fine as long as nobody else took the dates meanwhile.
    if (!holdsBus(booking) && !isAvailable(db, bus, booking.startDate, booking.endDate, booking.id)) {
      return { error: "Sorry, this bus was booked by someone else while payment was pending. Please choose another bus." };
    }

    const now = new Date().toISOString();
    booking.payments.push({ id: demoPaymentId(), amount: amountFor(option, booking.fare), option, method, demo: true, paidAt: now });
    booking.status = "confirmed";
    booking.confirmedAt = now;
    return { ok: true };
  });
  if (result.error) return result;

  // TODO: notify the owner and the traveller (WhatsApp / SMS / email).
  revalidateBookings();
  redirect(`/bookings/${id}?paid=1`);
}

// DEMO: pays whatever is left after an advance.
export async function payBalance(prevState, formData) {
  const viewer = await requireCustomer();
  const id = str(formData, "id");
  const method = str(formData, "method");
  if (!PAYMENT_METHODS.some((m) => m.id === method)) return { error: "Choose a payment method." };

  const result = await updateDb((db) => {
    const booking = db.bookings.find((b) => b.id === id && b.customerId === viewer.id);
    if (!booking || booking.status !== "confirmed") return { error: "This booking can't take a payment now." };
    const amount = balanceDue(booking);
    if (amount === 0) return { error: "Nothing left to pay." };
    booking.payments.push({ id: demoPaymentId(), amount, option: "balance", method, demo: true, paidAt: new Date().toISOString() });
    return { ok: true };
  });
  if (result.error) return result;

  revalidateBookings();
  redirect(`/bookings/${id}?paid=balance`);
}

// Cancelling before the trip day refunds everything paid (simulated).
export async function cancelBooking(formData) {
  const id = str(formData, "id");
  const viewer = await requireCustomer();

  await updateDb((db) => {
    const booking = db.bookings.find((b) => b.id === id && b.customerId === viewer.id);
    if (!booking) throw new Error("Booking not found");
    if (!["payment_pending", "confirmed"].includes(booking.status) || booking.startDate <= todayISO()) {
      throw new Error("This booking can no longer be cancelled online. Please call support.");
    }
    const now = new Date().toISOString();
    const paid = paidAmount(booking);
    if (paid > 0) booking.refunds.push({ id: newId("rfnd_demo"), amount: paid, demo: true, refundedAt: now });
    booking.status = "cancelled";
    booking.cancelledAt = now;
  });

  revalidateBookings();
}

