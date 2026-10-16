import Link from "next/link";
import { CircleCheck, Clock, ShieldX, Hourglass, IdCard } from "lucide-react";
import { requireOperator } from "@/lib/auth";
import { getOperatorBuses } from "@/lib/data/queries";
import { getVehicleType, labelFor, SEATING } from "@/lib/constants/vehicles";
import { formatINR } from "@/lib/format";
import PageHeader from "@/components/ui/PageHeader";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import BusPhoto from "@/components/vehicles/BusPhoto";
import styles from "../operator.module.css";

export const metadata = { title: "My buses" };

// Explains exactly where each bus is in the approval process.
function busState(bus, operatorStatus) {
  if (bus.live) return { badge: <Badge tone="success">Live</Badge>, icon: CircleCheck, text: "Visible in search and bookable." };
  if (bus.status === "rejected") return { badge: <Badge status="rejected" kind="review" />, icon: ShieldX, text: `Not approved: ${bus.rejectionReason ?? "contact partner support"}. Edit the bus to fix it and submit again.`, error: true };
  if (bus.status === "approved" && bus.driver?.status !== "approved") return { badge: <Badge tone="neutral">Hidden</Badge>, icon: IdCard, text: "Approved, but hidden until its driver is approved. Assign an approved driver or wait for the review." };
  if (bus.status === "approved") return { badge: <Badge tone="neutral">Hidden</Badge>, icon: Hourglass, text: "Approved, but hidden until your operator account is active again." };
  if (operatorStatus !== "approved") return { badge: <Badge status="pending" kind="review" />, icon: Hourglass, text: "Queued. Reviewed right after your operator account is verified." };
  return { badge: <Badge status="pending" kind="review" />, icon: Clock, text: "Our team is checking this bus's documents." };
}

export default async function OperatorBusesPage({ searchParams }) {
  const [viewer, params] = await Promise.all([requireOperator("/operator/buses"), searchParams]);
  const buses = await getOperatorBuses(viewer.id);
  const canAdd = viewer.record.status !== "rejected";

  return (
    <>
      <PageHeader
        title="My buses"
        description="Each bus is reviewed separately and goes live once it and its driver are approved. Editing a bus sends it for review again."
        actions={canAdd && <Link href="/operator/buses/new" className="btn btn-primary">Add a bus</Link>}
      />
      {(params.added || params.updated) && (
        <p className="alert alert-success" style={{ marginBottom: 24 }}>
          {params.added ? "Bus submitted for review." : "Changes saved and sent for review."} You&apos;ll see it go live here once approved.
        </p>
      )}

      {buses.length === 0 ? (
        <EmptyState title="No buses yet" text="Add your first bus with photos, documents, seats, amenities and your rate per km.">
          {canAdd && <Link href="/operator/buses/new" className="btn btn-primary">Add your first bus</Link>}
        </EmptyState>
      ) : (
        <div className={styles.fleet}>
          {buses.map((bus) => {
            const state = busState(bus, viewer.record.status);
            const Icon = state.icon;
            return (
              <article key={bus.id} className={styles.bus}>
                <div className={styles.busArt}><BusPhoto type={bus.type} src={bus.photoUrls[0]} alt={bus.title} sizes="340px" /></div>
                <div className={styles.busBody}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                    <span className="hint">{bus.registrationNumber}</span>
                    {state.badge}
                  </div>
                  <h3 className={styles.busTitle}>{bus.title}</h3>
                  <p className="hint">
                    {getVehicleType(bus.type)?.label.split(" (")[0]} · {labelFor(SEATING, bus.seating)} · {bus.seats} seats · {bus.ac ? "AC" : "Non-AC"} · {formatINR(bus.ratePerKm)}/km
                  </p>
                  <p className="hint"><IdCard size={13} /> Driver: {bus.driver?.name ?? "not assigned"}</p>
                  <p className={styles.busStatus} style={state.error ? { color: "var(--danger)" } : undefined}><Icon size={14} /> {state.text}</p>
                  <div className={styles.busActions}>
                    {canAdd && <Link href={`/operator/buses/${bus.id}/edit`} className="btn btn-outline btn-sm">{bus.status === "rejected" ? "Fix and resubmit" : "Edit"}</Link>}
                    <Link href={`/operator/availability?bus=${bus.id}`} className="btn btn-outline btn-sm">Availability</Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}
