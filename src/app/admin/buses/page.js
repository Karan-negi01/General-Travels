import { requireAdmin } from "@/lib/auth";
import { getAllBuses } from "@/lib/data/queries";
import { setBusStatus } from "@/lib/actions/admin";
import { getVehicleType } from "@/lib/constants/vehicles";
import { formatINR } from "@/lib/format";
import PageHeader from "@/components/ui/PageHeader";
import Badge from "@/components/ui/Badge";
import ReviewActions from "@/components/ui/ReviewActions";
import styles from "../admin.module.css";

export const metadata = { title: "Buses" };

const DOCS = { rc: "RC", insurance: "Insurance", permit: "Permit", fitness: "Fitness" };

export default async function AdminBusesPage() {
  await requireAdmin("/admin/buses");
  const buses = await getAllBuses();
  return (
    <>
      <PageHeader
        title="Buses"
        description="Approve every bus on its own. Check the documents, and make sure listings contain no phone numbers or branding so bookings stay on the platform."
      />
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Bus</th>
              <th>Operator</th>
              <th>Documents</th>
              <th>Rates</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {buses.map((bus) => (
              <tr key={bus.id}>
                <td>
                  <p className={styles.strong}>{bus.title}</p>
                  <p className="hint">{getVehicleType(bus.type)?.label.split(" (")[0]} · {bus.seats} seats · {bus.ac ? "AC" : "Non-AC"}</p>
                  <p className="hint">{bus.registrationNumber} · {bus.amenities.length} amenities</p>
                </td>
                <td>
                  <p>{bus.operatorName}</p>
                  {bus.operatorStatus !== "approved" && <Badge status={bus.operatorStatus} kind="review">Operator {bus.operatorStatus === "pending" ? "unverified" : "rejected"}</Badge>}
                </td>
                <td>
                  <div className={styles.docs}>
                    {Object.entries(DOCS).map(([key, label]) => (
                      <span key={key} className={`${styles.doc} ${bus.documents?.[key] ? styles.docOk : styles.docMissing}`}>{label}</span>
                    ))}
                  </div>
                </td>
                <td>
                  <p>{formatINR(bus.ratePerKm)}/km</p>
                  <p className="hint">Min {bus.minKmPerDay} km/day</p>
                  <p className="hint">Driver {formatINR(bus.driverAllowancePerDay)}/day</p>
                </td>
                <td>{bus.live ? <Badge tone="success">Live</Badge> : <Badge status={bus.status} kind="review" />}</td>
                <td>
                  <ReviewActions
                    id={bus.id}
                    status={bus.status}
                    action={setBusStatus}
                    blockedReason={bus.operatorStatus !== "approved" ? "Verify the operator first" : undefined}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
