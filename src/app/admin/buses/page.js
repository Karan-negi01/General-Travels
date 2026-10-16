import { requireAdmin } from "@/lib/auth";
import { getAllBuses } from "@/lib/data/queries";
import { setBusStatus } from "@/lib/actions/admin";
import { getVehicleType, labelFor, SEATING, BUS_DOCUMENTS } from "@/lib/constants/vehicles";
import { formatINR } from "@/lib/format";
import PageHeader from "@/components/ui/PageHeader";
import Badge from "@/components/ui/Badge";
import ReviewActions from "@/components/ui/ReviewActions";
import styles from "../admin.module.css";

export const metadata = { title: "Buses" };

export default async function AdminBusesPage() {
  await requireAdmin("/admin/buses");
  const buses = await getAllBuses();
  return (
    <>
      <PageHeader
        title="Buses"
        description="Approve every bus on its own. Open each document, check the photos, and make sure listings contain no phone numbers or branding so bookings stay on the platform. Rejecting asks for a reason the owner will see."
      />
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Bus</th>
              <th>Operator · driver</th>
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
                  <p className="hint">{getVehicleType(bus.type)?.label.split(" (")[0]} · {labelFor(SEATING, bus.seating)} · {bus.seats} seats · {bus.ac ? "AC" : "Non-AC"} · {bus.modelYear}</p>
                  <p className="hint">{bus.registrationNumber} · {bus.amenities.length} amenities</p>
                  {bus.photoUrls.length > 0 ? (
                    <div className={styles.thumbs}>
                      {bus.photoUrls.slice(0, 4).map((src) => (
                        <a key={src} href={src} target="_blank" rel="noreferrer">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={src} alt="Bus photo" />
                        </a>
                      ))}
                    </div>
                  ) : (
                    <p className="hint">No photos uploaded (stock photo shown)</p>
                  )}
                </td>
                <td>
                  <p>{bus.operatorName}</p>
                  {bus.operatorStatus !== "approved" && <Badge status={bus.operatorStatus} kind="review">Operator {bus.operatorStatus === "pending" ? "unverified" : "rejected"}</Badge>}
                  <p className="hint">Driver: {bus.driver?.name ?? "none"}</p>
                  {bus.driver && bus.driver.status !== "approved" && <Badge status={bus.driver.status} kind="review">Driver {bus.driver.status === "pending" ? "unverified" : "rejected"}</Badge>}
                </td>
                <td>
                  <div className={styles.docs}>
                    {BUS_DOCUMENTS.map((d) =>
                      bus.documents?.[d.id] ? (
                        <a key={d.id} className={`${styles.doc} ${styles.docOk}`} href={`/files/${bus.documents[d.id]}`} target="_blank" rel="noreferrer" title={`Open ${d.label}`}>{d.short}</a>
                      ) : (
                        <span key={d.id} className={`${styles.doc} ${styles.docMissing}`} title={`${d.label} missing`}>{d.short}</span>
                      )
                    )}
                  </div>
                </td>
                <td>
                  <p>{formatINR(bus.ratePerKm)}/km</p>
                  <p className="hint">Min {bus.minKmPerDay} km/day</p>
                  <p className="hint">Driver {formatINR(bus.driverAllowancePerDay)}/day</p>
                </td>
                <td>
                  {bus.live ? <Badge tone="success">Live</Badge> : <Badge status={bus.status} kind="review" />}
                  {bus.status === "rejected" && bus.rejectionReason && <p className={styles.reason}>{bus.rejectionReason}</p>}
                  {bus.resubmittedAt && bus.status === "pending" && <p className="hint">Resubmitted</p>}
                </td>
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
