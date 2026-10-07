import { requireAdmin } from "@/lib/auth";
import { getAllOperators } from "@/lib/data/queries";
import { setOperatorStatus } from "@/lib/actions/admin";
import { formatDate } from "@/lib/format";
import PageHeader from "@/components/ui/PageHeader";
import Badge from "@/components/ui/Badge";
import ReviewActions from "@/components/ui/ReviewActions";
import styles from "../admin.module.css";

export const metadata = { title: "Operators" };

export default async function AdminOperatorsPage() {
  await requireAdmin("/admin/operators");
  const operators = await getAllOperators();
  return (
    <>
      <PageHeader
        title="Operators"
        description="Verify each bus owner once: PAN, GSTIN and a call. After that they can keep adding buses, and each bus is reviewed separately."
      />
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Operator</th>
              <th>Contact</th>
              <th>Tax IDs</th>
              <th>Buses</th>
              <th>Joined</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {operators.map((op) => (
              <tr key={op.id}>
                <td>
                  <p className={styles.strong}>{op.businessName}</p>
                  <p className="hint">{op.ownerName} · {op.city}</p>
                </td>
                <td>
                  <p>+91 {op.phone}</p>
                  {op.email && <p className="hint">{op.email}</p>}
                </td>
                <td>
                  <p className="hint">PAN {op.panNumber || "—"}</p>
                  <p className="hint">GST {op.gstNumber || "—"}</p>
                </td>
                <td>
                  {op.busCount}
                  {op.pendingBuses > 0 && <p className="hint">{op.pendingBuses} pending</p>}
                </td>
                <td>{formatDate(op.createdAt)}</td>
                <td><Badge status={op.status} kind="review" /></td>
                <td><ReviewActions id={op.id} status={op.status} action={setOperatorStatus} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
