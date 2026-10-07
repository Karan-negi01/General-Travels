"use client";

import { useActionState } from "react";
import { submitQuote } from "@/lib/actions/vendor";
import { QUOTE_INCLUSIONS } from "@/lib/constants/quotes";
import styles from "./QuoteForm.module.css";

export default function QuoteForm({ enquiryId, vehicles, existing }) {
  const [state, formAction, pending] = useActionState(submitQuote, {});

  return (
    <form action={formAction} className={styles.form}>
      <input type="hidden" name="enquiryId" value={enquiryId} />
      <div className={styles.row}>
        <div className="field">
          <label htmlFor={`veh-${enquiryId}`}>Vehicle</label>
          <select id={`veh-${enquiryId}`} name="vehicleId" className="select" defaultValue={existing?.vehicleId ?? vehicles[0]?.id}>
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>{v.title} ({v.seats} seats)</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor={`amt-${enquiryId}`}>Total price (₹)</label>
          <input id={`amt-${enquiryId}`} name="amount" type="number" min="1" className="input" required defaultValue={existing?.amount ?? ""} />
        </div>
      </div>
      <fieldset className={styles.includes}>
        <legend className="label">Price includes</legend>
        {QUOTE_INCLUSIONS.map((inc) => (
          <label key={inc.id} className="check">
            <input type="checkbox" name="includes" value={inc.id} defaultChecked={existing?.includes?.includes(inc.id)} /> {inc.label}
          </label>
        ))}
      </fieldset>
      <input name="notes" className="input" placeholder="Note for the customer (optional)" defaultValue={existing?.notes ?? ""} />
      <div className={styles.footer}>
        {state?.error && <span className="field-error">{state.error}</span>}
        {state?.success && <span className={styles.ok}>Quote sent ✓</span>}
        <button type="submit" className="btn btn-secondary btn-sm" disabled={pending}>
          {pending ? "Sending…" : existing ? "Update quote" : "Send quote"}
        </button>
      </div>
    </form>
  );
}
