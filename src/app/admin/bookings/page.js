import { requireAdmin } from "@/lib/auth";
import { getAllBookings } from "@/lib/data/queries";
import { formatINR, formatDateRange, formatDate } from "@/lib/format";
import PageHeader from "@/components/ui/PageHeader";
import Badge from "@/components/ui/Badge";
import styles from "../admin.module.css";

export const metadata = { title: "Bookings & payments" };

export default async function AdminBookingsPage() {
  await requireAdmin("/admin/bookings");
  const bookings = await getAllBookings();
  return (
    <>
      <PageHeader
        title="Bookings & payments"
        description="Every booking with what the traveller paid, the commission General Travels keeps and the owner's payout. Payments are simulated in this demo."
      />
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Booking</th>
              <th>Trip</th>
              <th>Bus · operator</th>
              <th>Traveller</th>
              <th>Fare</th>
              <th>Paid</th>
              <th>Commission</th>
              <th>Owner payout</th>
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
                <td>
                  <p>{formatINR(b.paid)}</p>
                  {b.balance > 0 && b.status === "confirmed" && <p className="hint">{formatINR(b.balance)} due</p>}
                  {b.refunded > 0 && <p className="hint">{formatINR(b.refunded)} refunded</p>}
                </td>
                <td>
                  {b.status === "cancelled" || b.status === "payment_pending" ? <span className="hint">—</span> : (
                    <>
                      <p>{formatINR(b.commission)}</p>
                      <p className="hint">{b.commissionRate}%</p>
                    </>
                  )}
                </td>
                <td>
                  {b.status === "cancelled" || b.status === "payment_pending" ? <span className="hint">—</span> : (
                    <>
                      <p>{formatINR(b.ownerPayout)}</p>
                      <p className="hint">{b.payout?.status === "paid" ? `Paid ${formatDate(b.payout.paidAt)}` : "After the trip"}</p>
                    </>
                  )}
                </td>
                <td>
                  <Badge status={b.expired ? "cancelled" : b.status} kind="booking">{b.expired ? "Unpaid, expired" : undefined}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
