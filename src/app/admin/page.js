import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { getAdminOverview, getAllOperators, getAllBuses } from "@/lib/data/queries";
import { setOperatorStatus, setBusStatus } from "@/lib/actions/admin";
import { getVehicleType } from "@/lib/constants/vehicles";
import { formatINR, formatDate } from "@/lib/format";
import PageHeader from "@/components/ui/PageHeader";
import StatCard from "@/components/ui/StatCard";
import Badge from "@/components/ui/Badge";
import ReviewActions from "@/components/ui/ReviewActions";
import styles from "./admin.module.css";

export const metadata = { title: { absolute: "Overview · Admin" } };

export default async function AdminOverview() {
  await requireAdmin("/admin");
  const [o, operators, buses] = await Promise.all([getAdminOverview(), getAllOperators(), getAllBuses()]);
  const pendingOperators = operators.filter((x) => x.status === "pending");
  const pendingBuses = buses.filter((x) => x.status === "pending");

  return (
    <>
      <PageHeader title="Overview" description="Approve new operators once, then approve each of their buses. Only approved buses of approved operators can be booked." />

      <div className={styles.stats}>
        <StatCard label="Operators" value={o.operators.total} note={o.operators.pending ? `${o.operators.pending} to verify` : null} href="/admin/operators" />
        <StatCard label="Buses live" value={`${o.buses.live} / ${o.buses.total}`} note={o.buses.pending ? `${o.buses.pending} to review` : null} href="/admin/buses" />
        <StatCard label="Bookings" value={o.bookings.total} note={o.bookings.pending ? `${o.bookings.pending} awaiting operator` : null} href="/admin/bookings" />
        <StatCard label="Confirmed value" value={formatINR(o.bookings.value)} />
      </div>

      <div className={styles.queues}>
        <section className={styles.queue}>
          <div className={styles.queueHead}>
            <div>
              <p className={styles.queueStep}>Step 1 · once per operator</p>
              <h2>Operators to verify</h2>
            </div>
            <Link href="/admin/operators">All operators →</Link>
          </div>
          {pendingOperators.length === 0 ? (
            <p className={styles.clear}>All caught up. No operators waiting.</p>
          ) : (
            pendingOperators.map((op) => (
              <div key={op.id} className={styles.item}>
                <div>
                  <p className={styles.itemTitle}>{op.businessName}</p>
                  <p className="hint">
                    {op.ownerName} · {op.city} · PAN {op.panNumber}{op.gstNumber ? ` · GST ${op.gstNumber}` : ""} · {op.busCount} bus{op.busCount === 1 ? "" : "es"} waiting · joined {formatDate(op.createdAt)}
                  </p>
                </div>
                <ReviewActions id={op.id} status={op.status} action={setOperatorStatus} />
              </div>
            ))
          )}
        </section>

        <section className={styles.queue}>
          <div className={styles.queueHead}>
            <div>
              <p className={styles.queueStep}>Step 2 · every bus</p>
              <h2>Buses to approve</h2>
            </div>
            <Link href="/admin/buses">All buses →</Link>
          </div>
          {pendingBuses.length === 0 ? (
            <p className={styles.clear}>All caught up. No buses waiting.</p>
          ) : (
            pendingBuses.map((bus) => (
              <div key={bus.id} className={styles.item}>
                <div>
                  <p className={styles.itemTitle}>{bus.title}</p>
                  <p className="hint">
                    {getVehicleType(bus.type)?.label.split(" (")[0]} · {bus.seats} seats · {bus.registrationNumber} · {bus.operatorName}{" "}
                    {bus.operatorStatus !== "approved" && <Badge status={bus.operatorStatus} kind="review">Operator {bus.operatorStatus === "pending" ? "unverified" : "rejected"}</Badge>}
                  </p>
                </div>
                <ReviewActions
                  id={bus.id}
                  status={bus.status}
                  action={setBusStatus}
                  blockedReason={bus.operatorStatus !== "approved" ? "Verify the operator first" : undefined}
                />
              </div>
            ))
          )}
        </section>
      </div>
    </>
  );
}
