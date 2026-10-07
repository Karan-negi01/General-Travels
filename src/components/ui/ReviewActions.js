// Approve / reject buttons that post to an admin server action.
// `blockedReason` disables approval and explains why (e.g. operator not approved yet).
export default function ReviewActions({ id, status, action, blockedReason }) {
  return (
    <form action={action} style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
      <input type="hidden" name="id" value={id} />
      {status !== "approved" && (
        <button name="status" value="approved" className="btn btn-secondary btn-sm" disabled={Boolean(blockedReason)} title={blockedReason}>
          Approve
        </button>
      )}
      {status !== "rejected" && (
        <button name="status" value="rejected" className="btn btn-danger btn-sm">
          {status === "approved" ? "Suspend" : "Reject"}
        </button>
      )}
      {blockedReason && status !== "approved" && <span className="hint" style={{ flexBasis: "100%" }}>{blockedReason}</span>}
    </form>
  );
}
