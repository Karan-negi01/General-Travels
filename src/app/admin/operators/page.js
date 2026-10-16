import { requireAdmin } from "@/lib/auth";
import { getAllOperators } from "@/lib/data/queries";
import { setOperatorStatus, setOperatorCommission } from "@/lib/actions/admin";
import { formatDate } from "@/lib/format";
import PageHeader from "@/components/ui/PageHeader";
import Badge from "@/components/ui/Badge";
import ReviewActions from "@/components/ui/ReviewActions";
import CommissionForm from "@/components/forms/CommissionForm";
import styles from "../admin.module.css";

export const metadata = { title: "Operators" };

export default async function AdminOperatorsPage() {
  await requireAdmin("/admin/operators");
  const operators = await getAllOperators();
  return (
    <>
      <PageHeader
        title="Operators"
        description="Verify each bus owner once using their personal and company details. Rejecting asks for a reason, which the owner sees so they can correct it and re-apply. Leave the commission blank to use the default."
      />
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Owner</th>
              <th>Contact</th>
              <th>IDs</th>
              <th>Fleet</th>
              <th>Commission</th>
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
                  <p className="hint">{op.address}</p>
                  <p className="hint">Joined {formatDate(op.createdAt)}{op.resubmittedAt ? ` · re-applied ${formatDate(op.resubmittedAt)}` : ""}</p>
                </td>
                <td>
                  <p>+91 {op.phone}</p>
                  {op.email && <p className="hint">{op.email}</p>}
                </td>
                <td>
                  <p className="hint">PAN {op.panNumber || "—"}</p>
                  <p className="hint">GST {op.gstNumber || "—"}</p>
                  <p className="hint">Aadhaar ••••{op.aadhaarNumber?.slice(-4) || "—"}</p>
                </td>
                <td>
                  {op.busCount} bus{op.busCount === 1 ? "" : "es"}
                  {op.pendingBuses > 0 && <p className="hint">{op.pendingBuses} pending</p>}
                  <p className="hint">{op.driverCount} driver{op.driverCount === 1 ? "" : "s"}</p>
                </td>
                <td>
                  <CommissionForm action={setOperatorCommission} id={op.id} rate={op.commissionRate} placeholder={`${op.effectiveCommissionRate}`} compact />
                  <p className="hint">{op.commissionRate == null ? "Default" : "Custom rate"}</p>
                </td>
                <td>
                  <Badge status={op.status} kind="review" />
                  {op.status === "rejected" && op.rejectionReason && <p className={styles.reason}>{op.rejectionReason}</p>}
                </td>
                <td><ReviewActions id={op.id} status={op.status} action={setOperatorStatus} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
