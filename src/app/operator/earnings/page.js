import { requireOperator } from "@/lib/auth";
import { getOperatorSummary } from "@/lib/data/queries";
import { formatINR, formatDate, formatDateRange } from "@/lib/format";
import PageHeader from "@/components/ui/PageHeader";
import StatCard from "@/components/ui/StatCard";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import styles from "../operator.module.css";

export const metadata = { title: "Earnings" };

export default async function EarningsPage() {
  const viewer = await requireOperator("/operator/earnings");
  const s = await getOperatorSummary(viewer.id);
  const rows = s.bookings.filter((b) => b.status !== "cancelled").reverse();
  const commissionPaid = rows.reduce((sum, b) => sum + b.commission, 0);

  return (
    <>
      <PageHeader
        title="Earnings"
        description={`Travellers pay General Travels online. Our ${s.commissionRate}% commission (on the fare before GST) is deducted automatically and the rest is paid to you after each completed trip.`}
      />
      <div className={styles.stats}>
        <StatCard label="Paid out to you" value={formatINR(s.paidOut)} />
        <StatCard label="Due on upcoming trips" value={formatINR(s.upcomingPayouts)} />
        <StatCard label="Commission" value={formatINR(commissionPaid)} note="on these bookings" />
        <StatCard label="Trips" value={rows.length} />
      </div>

      <section className={styles.section}>
        {rows.length === 0 ? (
          <EmptyState title="No earnings yet" text="Payouts appear here once your buses are booked." />
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Booking</th>
                  <th>Trip</th>
                  <th>Fare</th>
                  <th>Commission</th>
                  <th>Your payout</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((b) => (
                  <tr key={b.id}>
                    <td>
                      <p><strong>{b.ref}</strong></p>
                      <p className="hint">{b.busTitle}</p>
                    </td>
                    <td>
                      <p>{b.from === b.to ? `Local · ${b.from}` : `${b.from} → ${b.to}`}</p>
                      <p className="hint">{formatDateRange(b.startDate, b.endDate)}</p>
                    </td>
                    <td>{formatINR(b.fare.total)}</td>
                    <td>
                      <p>{formatINR(b.commission)}</p>
                      <p className="hint">{b.commissionRate}%</p>
                    </td>
                    <td><strong>{formatINR(b.ownerPayout)}</strong></td>
                    <td>
                      {b.payout?.status === "paid" ? (
                        <>
                          <Badge tone="success">Paid</Badge>
                          <p className="hint">{formatDate(b.payout.paidAt)}</p>
                        </>
                      ) : (
                        <Badge tone="warning">After the trip</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
