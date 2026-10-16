"use client";

import { useActionState } from "react";

// Sets a commission rate. With `id` it's one owner's rate (blank = platform
// default); without it, the platform default.
export default function CommissionForm({ action, id, rate, placeholder, compact = false }) {
  const [state, formAction, pending] = useActionState(action, {});
  return (
    <form action={formAction} style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
      {id && <input type="hidden" name="id" value={id} />}
      <input
        name="rate"
        type="number"
        min="0"
        max="50"
        step="0.5"
        className="input"
        defaultValue={rate ?? ""}
        placeholder={placeholder}
        aria-label="Commission rate in percent"
        style={{ width: compact ? 84 : 120 }}
      />
      <span className="hint">%</span>
      <button className="btn btn-outline btn-sm" disabled={pending}>{pending ? "Saving…" : "Save"}</button>
      {state?.error && <span className="field-error" style={{ flexBasis: "100%" }}>{state.error}</span>}
      {state?.ok && <span className="hint" style={{ flexBasis: "100%", color: "var(--success)" }}>Saved</span>}
    </form>
  );
}
