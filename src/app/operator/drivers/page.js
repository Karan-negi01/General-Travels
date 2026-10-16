import Link from "next/link";
import { CircleCheck, Clock, ShieldX, Phone, BadgeCheck } from "lucide-react";
import { requireOperator } from "@/lib/auth";
import { getOperatorDrivers } from "@/lib/data/queries";
import { formatDate } from "@/lib/format";
import PageHeader from "@/components/ui/PageHeader";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import styles from "../operator.module.css";

export const metadata = { title: "Drivers" };

export default async function OperatorDriversPage({ searchParams }) {
  const [viewer, params] = await Promise.all([requireOperator("/operator/drivers"), searchParams]);
  const drivers = await getOperatorDrivers(viewer.id);

  return (
    <>
      <PageHeader
        title="Drivers"
        description="You provide the drivers for your buses. Our team checks each driver's licence and ID, and a bus is live only while its driver is approved."
        actions={<Link href="/operator/drivers/new" className="btn btn-primary">Add a driver</Link>}
      />
      {(params.added || params.updated) && (
        <p className="alert alert-success" style={{ marginBottom: 24 }}>
          {params.added ? "Driver submitted for review." : "Changes saved and sent for review."}
        </p>
      )}

      {drivers.length === 0 ? (
        <EmptyState title="No drivers yet" text="Add each driver with their licence, PSV badge, Aadhaar and a photo. Every bus needs one.">
          <Link href="/operator/drivers/new" className="btn btn-primary">Add your first driver</Link>
        </EmptyState>
      ) : (
        <div className={styles.fleet}>
          {drivers.map((d) => {
            const Icon = d.status === "approved" ? CircleCheck : d.status === "rejected" ? ShieldX : Clock;
            return (
              <article key={d.id} className={styles.bus}>
                <div className={styles.busBody}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                    <span className="hint">{d.experienceYears} yrs experience</span>
                    <Badge status={d.status} kind="review" />
                  </div>
                  <h3 className={styles.busTitle}>{d.name}</h3>
                  <p className="hint"><Phone size={13} /> +91 {d.phone}</p>
                  <p className="hint"><BadgeCheck size={13} /> Licence {d.licenceNumber} · valid until {formatDate(d.licenceExpiry)}{d.psvBadge ? ` · PSV ${d.psvBadge}` : ""}</p>
                  <p className="hint">Drives: {d.buses.length ? d.buses.join(", ") : "no bus yet"}</p>
                  <p className={styles.busStatus} style={d.status === "rejected" ? { color: "var(--danger)" } : undefined}>
                    <Icon size={14} />{" "}
                    {d.status === "approved" ? "Verified." : d.status === "rejected" ? `Not approved: ${d.rejectionReason ?? "contact partner support"}` : "Our team is checking the licence and ID."}
                  </p>
                  <div className={styles.busActions}>
                    <Link href={`/operator/drivers/${d.id}/edit`} className="btn btn-outline btn-sm">{d.status === "rejected" ? "Fix and resubmit" : "Edit"}</Link>
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
