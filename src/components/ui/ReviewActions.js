"use client";

import { useActionState } from "react";

// Approve / reject buttons for an admin review action. Rejecting (or suspending)
// asks for a reason, which the owner sees so they can fix it and re-apply.
// `blockedReason` disables approval and explains why (e.g. operator not approved yet).
export default function ReviewActions({ id, status, action, blockedReason }) {
  const [state, formAction, pending] = useActionState(action, {});
  const rejectLabel = status === "approved" ? "Suspend" : "Reject";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 180 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "flex-start" }}>
        {status !== "approved" && (
          <form action={formAction}>
            <input type="hidden" name="id" value={id} />
            <button name="status" value="approved" className="btn btn-secondary btn-sm" disabled={Boolean(blockedReason) || pending} title={blockedReason}>
              Approve
            </button>
          </form>
        )}
        {status !== "rejected" && (
          <details>
            <summary className="btn btn-danger btn-sm" style={{ listStyle: "none" }}>{rejectLabel}…</summary>
            <form action={formAction} className="stack" style={{ marginTop: 8, gap: 6 }}>
              <input type="hidden" name="id" value={id} />
              <input type="hidden" name="status" value="rejected" />
              <textarea name="reason" className="textarea" rows={3} required placeholder="Reason the owner will see, e.g. the permit has expired" aria-label="Reason" />
              <button className="btn btn-danger btn-sm" disabled={pending}>{rejectLabel} with this reason</button>
            </form>
          </details>
        )}
      </div>
      {blockedReason && status !== "approved" && <span className="hint">{blockedReason}</span>}
      {state?.error && <span className="field-error" role="alert">{state.error}</span>}
    </div>
  );
}
