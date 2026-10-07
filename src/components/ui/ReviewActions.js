// Approve / reject buttons that post to an admin server action.
export default function ReviewActions({ id, status, action }) {
  return (
    <form action={action} style={{ display: "flex", gap: 6 }}>
      <input type="hidden" name="id" value={id} />
      {status !== "approved" && (
        <button name="status" value="approved" className="btn btn-secondary btn-sm">Approve</button>
      )}
      {status !== "rejected" && (
        <button name="status" value="rejected" className="btn btn-outline btn-sm">Reject</button>
      )}
    </form>
  );
}
