import { requireAdmin } from "@/lib/auth";
import { getAllDrivers } from "@/lib/data/queries";
import { setDriverStatus } from "@/lib/actions/admin";
import { formatDate, todayISO } from "@/lib/format";
import PageHeader from "@/components/ui/PageHeader";
import Badge from "@/components/ui/Badge";
import ReviewActions from "@/components/ui/ReviewActions";
import styles from "../admin.module.css";

export const metadata = { title: "Drivers" };

export default async function AdminDriversPage() {
  await requireAdmin("/admin/drivers");
  const drivers = await getAllDrivers();
  const today = todayISO();
  return (
    <>
      <PageHeader
        title="Drivers"
        description="Owners provide the drivers. Check each licence (valid, right class), PSV badge and ID. A bus is live only while its driver is approved."
      />
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Driver</th>
              <th>Owner</th>
              <th>Licence</th>
              <th>Files</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {drivers.map((d) => (
              <tr key={d.id}>
                <td>
                  <p className={styles.strong}>{d.name}</p>
                  <p className="hint">+91 {d.phone} · {d.experienceYears} yrs</p>
                  <p className="hint">Aadhaar ••••{d.aadhaarNumber?.slice(-4)}</p>
                  <p className="hint">Drives: {d.buses.length ? d.buses.join(", ") : "—"}</p>
                </td>
                <td>{d.operatorName}</td>
                <td>
                  <p>{d.licenceNumber}</p>
                  <p className="hint" style={d.licenceExpiry <= today ? { color: "var(--danger)" } : undefined}>Valid until {formatDate(d.licenceExpiry)}</p>
                  {d.psvBadge && <p className="hint">PSV {d.psvBadge}</p>}
                </td>
                <td>
                  <div className={styles.docs}>
                    {d.licenceFile ? <a className={`${styles.doc} ${styles.docOk}`} href={`/files/${d.licenceFile}`} target="_blank" rel="noreferrer">Licence</a> : <span className={`${styles.doc} ${styles.docMissing}`}>Licence</span>}
                    {d.photo ? <a className={`${styles.doc} ${styles.docOk}`} href={`/files/${d.photo}`} target="_blank" rel="noreferrer">Photo</a> : <span className={`${styles.doc} ${styles.docMissing}`}>Photo</span>}
                  </div>
                </td>
                <td>
                  <Badge status={d.status} kind="review" />
                  {d.status === "rejected" && d.rejectionReason && <p className={styles.reason}>{d.rejectionReason}</p>}
                </td>
                <td><ReviewActions id={d.id} status={d.status} action={setDriverStatus} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
