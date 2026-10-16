import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { getAdminOverview, getAllOperators, getAllBuses, getAllDrivers } from "@/lib/data/queries";
import { setOperatorStatus, setBusStatus, setDriverStatus } from "@/lib/actions/admin";
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
  const [o, operators, buses, drivers] = await Promise.all([getAdminOverview(), getAllOperators(), getAllBuses(), getAllDrivers()]);
  const pendingOperators = operators.filter((x) => x.status === "pending");
  const pendingDrivers = drivers.filter((x) => x.status === "pending");
  const pendingBuses = buses.filter((x) => x.status === "pending");

  return (
    <>
      <PageHeader title="Overview" description="Verify each owner once, then each of their drivers and buses. A bus is bookable only when its owner, the bus and its driver are all approved." />

      <div className={styles.stats}>
        <StatCard label="Buses live" value={`${o.buses.live} / ${o.buses.total}`} note={o.buses.pending ? `${o.buses.pending} to review` : null} href="/admin/buses" />
        <StatCard label="Paid bookings" value={o.bookings.total} note={`${formatINR(o.bookings.value)} booked`} href="/admin/bookings" />
        <StatCard label="Collected (demo)" value={formatINR(o.bookings.collected)} note="net of refunds" href="/admin/bookings" />
        <StatCard label="Commission earned" value={formatINR(o.bookings.commission)} note={`Default rate ${o.defaultCommissionRate}%`} href="/admin/settings" />
      </div>

      <div className={styles.queues}>
        <section className={styles.queue}>
          <div className={styles.queueHead}>
            <div>
              <p className={styles.queueStep}>Step 1 · once per owner</p>
              <h2>Owners to verify</h2>
            </div>
            <Link href="/admin/operators">All operators →</Link>
          </div>
          {pendingOperators.length === 0 ? (
            <p className={styles.clear}>All caught up. No owners waiting.</p>
          ) : (
            pendingOperators.map((op) => (
              <div key={op.id} className={styles.item}>
                <div>
                  <p className={styles.itemTitle}>{op.businessName}</p>
                  <p className="hint">
                    {op.ownerName} · {op.city} · PAN {op.panNumber}{op.gstNumber ? ` · GST ${op.gstNumber}` : ""} · Aadhaar ••••{op.aadhaarNumber?.slice(-4)}
                  </p>
                  <p className="hint">{op.address} · {op.busCount} bus{op.busCount === 1 ? "" : "es"}, {op.driverCount} driver{op.driverCount === 1 ? "" : "s"} · joined {formatDate(op.createdAt)}{op.resubmittedAt ? " · re-applied" : ""}</p>
                </div>
                <ReviewActions id={op.id} status={op.status} action={setOperatorStatus} />
              </div>
            ))
          )}
        </section>

        <section className={styles.queue}>
          <div className={styles.queueHead}>
            <div>
              <p className={styles.queueStep}>Step 2 · every driver</p>
              <h2>Drivers to verify</h2>
            </div>
            <Link href="/admin/drivers">All drivers →</Link>
          </div>
          {pendingDrivers.length === 0 ? (
            <p className={styles.clear}>All caught up. No drivers waiting.</p>
          ) : (
            pendingDrivers.map((d) => (
              <div key={d.id} className={styles.item}>
                <div>
                  <p className={styles.itemTitle}>{d.name}</p>
                  <p className="hint">{d.operatorName} · Licence {d.licenceNumber} until {formatDate(d.licenceExpiry)} · {d.experienceYears} yrs</p>
                  <p className="hint">
                    {d.licenceFile && <a href={`/files/${d.licenceFile}`} target="_blank" rel="noreferrer"><u>Licence</u></a>}
                    {d.photo && <> · <a href={`/files/${d.photo}`} target="_blank" rel="noreferrer"><u>Photo</u></a></>}
                  </p>
                </div>
                <ReviewActions id={d.id} status={d.status} action={setDriverStatus} />
              </div>
            ))
          )}
        </section>

        <section className={styles.queue}>
          <div className={styles.queueHead}>
            <div>
              <p className={styles.queueStep}>Step 3 · every bus</p>
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
                    {getVehicleType(bus.type)?.label.split(" (")[0]} · {bus.seats} seats · {bus.registrationNumber} · {bus.operatorName} · driver {bus.driver?.name ?? "none"}{" "}
                    {bus.operatorStatus !== "approved" && <Badge status={bus.operatorStatus} kind="review">Operator {bus.operatorStatus === "pending" ? "unverified" : "rejected"}</Badge>}
                  </p>
                  <p className="hint"><Link href="/admin/buses"><u>Check photos and documents</u></Link></p>
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
