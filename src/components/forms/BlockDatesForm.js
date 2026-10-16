"use client";

import { useActionState } from "react";
import { blockDates } from "@/lib/actions/operator";
import Field from "@/components/ui/Field";

// Owner marks dates when a bus can't take bookings (office booking, servicing…).
export default function BlockDatesForm({ busId, minDate }) {
  const [state, formAction, pending] = useActionState(blockDates, {});
  return (
    <form action={formAction} className="stack">
      <input type="hidden" name="busId" value={busId} />
      {state?.error && <p className="alert alert-error" role="alert">{state.error}</p>}
      {state?.ok && <p className="alert alert-success" role="status">Dates blocked. This bus won&apos;t show in search for them.</p>}
      <div className="form-grid">
        <Field label="From" htmlFor="block-start">
          <input id="block-start" name="start" type="date" min={minDate} className="input" required />
        </Field>
        <Field label="To" htmlFor="block-end" hint="Leave empty for a single day">
          <input id="block-end" name="end" type="date" min={minDate} className="input" />
        </Field>
      </div>
      <Field label="Reason (only you and our team see it)" htmlFor="block-reason">
        <input id="block-reason" name="reason" className="input" placeholder="Booked through our office" maxLength={80} />
      </Field>
      <button className="btn btn-primary" disabled={pending}>{pending ? "Saving…" : "Mark as not available"}</button>
    </form>
  );
}
