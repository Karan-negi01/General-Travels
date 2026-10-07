import Link from "next/link";
import { CircleCheck, Clock, ShieldX, Hourglass } from "lucide-react";
import { requireOperator } from "@/lib/auth";
import { getOperatorBuses } from "@/lib/data/queries";
import { getVehicleType } from "@/lib/constants/vehicles";
import { formatINR } from "@/lib/format";
import PageHeader from "@/components/ui/PageHeader";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import BusArt from "@/components/vehicles/BusArt";
import styles from "../operator.module.css";

export const metadata = { title: "My buses" };

// Explains exactly where each bus is in the approval process.
function busState(bus, operatorStatus) {
  if (bus.live) return { badge: <Badge tone="success">Live</Badge>, icon: CircleCheck, text: "Visible in search and bookable." };
  if (bus.status === "rejected") return { badge: <Badge status="rejected" kind="review" />, icon: ShieldX, text: "Not approved. Contact partner support for details." };
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
        description="Each bus is reviewed separately and goes live once approved."
        actions={canAdd && <Link href="/operator/buses/new" className="btn btn-primary">Add a bus</Link>}
      />
      {params.added && (
        <p className="alert alert-success" style={{ marginBottom: 24 }}>
          Bus submitted for review. You&apos;ll see it go live here once approved.
        </p>
      )}

      {buses.length === 0 ? (
        <EmptyState title="No buses yet" text="Add your first bus with its seats, amenities, pickup cities and rate per km.">
          {canAdd && <Link href="/operator/buses/new" className="btn btn-primary">Add your first bus</Link>}
        </EmptyState>
      ) : (
        <div className={styles.fleet}>
          {buses.map((bus) => {
            const state = busState(bus, viewer.record.status);
            const Icon = state.icon;
            return (
              <article key={bus.id} className={styles.bus}>
                <div className={styles.busArt}><BusArt type={bus.type} tone={bus.live ? "dark" : "light"} /></div>
                <div className={styles.busBody}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                    <span className="hint">{bus.registrationNumber}</span>
                    {state.badge}
                  </div>
                  <h3 className={styles.busTitle}>{bus.title}</h3>
                  <p className="hint">
                    {getVehicleType(bus.type)?.label.split(" (")[0]} · {bus.seats} seats · {bus.ac ? "AC" : "Non-AC"} · {formatINR(bus.ratePerKm)}/km
                  </p>
                  <p className={styles.busStatus}><Icon size={14} /> {state.text}</p>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}
