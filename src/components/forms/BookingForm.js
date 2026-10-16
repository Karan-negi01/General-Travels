"use client";

import { useActionState } from "react";
import { createBooking } from "@/lib/actions/booking";
import Field from "@/components/ui/Field";

// Booking step 1: the trip is already chosen (hidden fields), the traveller
// adds the pickup point and continues to payment. The server recomputes the fare.
export default function BookingForm({ busId, tripParams, total }) {
  const [state, formAction, pending] = useActionState(createBooking, {});
  const e = state?.errors ?? {};

  return (
    <form action={formAction} className="stack" noValidate>
      <input type="hidden" name="busId" value={busId} />
      {Object.entries(tripParams).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}

      {state?.error && <p className="alert alert-error" role="alert">{state.error}</p>}
      {Object.entries(e)
        .filter(([key]) => key !== "pickupAddress")
        .map(([key, message]) => <p key={key} className="alert alert-error" role="alert">{message}</p>)}

      <Field label="Pickup address" htmlFor="pickupAddress" error={e.pickupAddress}>
        <input id="pickupAddress" name="pickupAddress" className="input" placeholder="Building, street, landmark" autoComplete="street-address" />
      </Field>
      <Field label="Notes for the driver (optional)" htmlFor="notes">
        <textarea id="notes" name="notes" className="textarea" rows={2} placeholder="Pickup time, stops on the way, luggage…" />
      </Field>
      <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={pending}>
        {pending ? "Reserving…" : `Continue to payment · ${total}`}
      </button>
      <p className="hint" style={{ textAlign: "center" }}>
        Pay 25% now or the full fare. Your booking is confirmed as soon as you pay, and you get the driver&apos;s details straight away.
      </p>
    </form>
  );
}
