"use client";

import { useActionState } from "react";
import { createBooking } from "@/lib/actions/booking";
import Field from "@/components/ui/Field";

// Final step of booking: the trip is already chosen (hidden fields), the
// customer adds the pickup point. The server recomputes the fare.
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
      <Field label="Notes for the operator (optional)" htmlFor="notes">
        <textarea id="notes" name="notes" className="textarea" rows={2} placeholder="Pickup time, stops on the way, luggage…" />
      </Field>
      <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={pending}>
        {pending ? "Booking…" : `Book for ${total}`}
      </button>
      <p className="hint" style={{ textAlign: "center" }}>
        No payment now. The operator confirms within a few hours, then you&apos;ll see the driver and contact details.
      </p>
    </form>
  );
}
