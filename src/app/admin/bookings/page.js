import { requireAdmin } from "@/lib/auth";
import { getAllBookings } from "@/lib/data/queries";
import { formatINR, formatDateRange, formatDate } from "@/lib/format";
import PageHeader from "@/components/ui/PageHeader";
import Badge from "@/components/ui/Badge";
import styles from "../admin.module.css";

export const metadata = { title: "Bookings" };

export default async function AdminBookingsPage() {
  await requireAdmin("/admin/bookings");
  const bookings = await getAllBookings();
  return (
    <>
      <PageHeader title="Bookings" description="Every booking on the platform. Operators confirm their own bookings, and you can step in when a traveller needs help." />
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Booking</th>
              <th>Trip</th>
              <th>Bus · operator</th>
              <th>Traveller</th>
              <th>Fare</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.id}>
                <td>
                  <p className={styles.strong}>{b.ref}</p>
                  <p className="hint">{formatDate(b.createdAt)}</p>
                </td>
                <td>
                  <p>{b.from === b.to ? `Local · ${b.from}` : `${b.from} → ${b.to}`}</p>
                  <p className="hint">{formatDateRange(b.startDate, b.endDate)} · {b.passengers} pax</p>
                </td>
                <td>
                  <p>{b.busTitle}</p>
                  <p className="hint">{b.operatorName}</p>
                </td>
                <td>{b.customerName}</td>
                <td className={styles.strong}>{formatINR(b.fare.total)}</td>
                <td><Badge status={b.status} kind="booking" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
