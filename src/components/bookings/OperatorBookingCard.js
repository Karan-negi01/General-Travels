import { CalendarDays, Users, Bus, Phone, MapPin, IdCard } from "lucide-react";
import { completeTrip } from "@/lib/actions/operator";
import { formatINR, formatDateRange, todayISO } from "@/lib/format";
import Badge from "@/components/ui/Badge";
import styles from "./OperatorBookingCard.module.css";

// Paid bookings are confirmed automatically, so there's nothing to accept.
// After the trip the owner marks it completed and is paid out.
export default function OperatorBookingCard({ booking }) {
  const route = booking.from === booking.to ? `Local in ${booking.from}` : `${booking.from} → ${booking.to}`;
  const shared = Boolean(booking.customer.phone);
  const tripStarted = booking.startDate <= todayISO();
  const canComplete = booking.status === "confirmed" && tripStarted && booking.balance === 0;

  return (
    <article className={`${styles.card} ${canComplete ? styles.pending : ""}`}>
      <div className={styles.main}>
        <div className={styles.top}>
          <span className={styles.ref}>{booking.ref}</span>
          <Badge status={booking.status} kind="booking" />
        </div>
        <h3 className={styles.route}>{route}</h3>
        <p className={styles.meta}>
          <span><CalendarDays size={14} /> {formatDateRange(booking.startDate, booking.endDate)} · {booking.fare.days} day{booking.fare.days > 1 ? "s" : ""}</span>
          <span><Users size={14} /> {booking.passengers} pax</span>
          <span><Bus size={14} /> {booking.busTitle}</span>
          {booking.driverName && <span><IdCard size={14} /> {booking.driverName}</span>}
        </p>
        <div className={styles.customer}>
          {shared ? (
            <>
              <p><strong>{booking.customer.name}</strong> · <a href={`tel:+91${booking.customer.phone}`}><Phone size={13} /> +91 {booking.customer.phone}</a></p>
              <p className="hint"><MapPin size={12} /> {booking.pickupAddress}</p>
            </>
          ) : (
            <p className="hint">Traveller: <strong>{booking.customer.name}</strong> · pickup in {booking.from}</p>
          )}
          {booking.notes && <p className={styles.notes}>“{booking.notes}”</p>}
        </div>
      </div>

      <div className={styles.aside}>
        <p className={styles.amountLabel}>Your payout</p>
        <p className={styles.amount}>{formatINR(booking.ownerPayout)}</p>
        <p className="hint">Fare {formatINR(booking.fare.total)} − commission {formatINR(booking.commission)}</p>
        {booking.status === "confirmed" && booking.balance > 0 && (
          <p className="hint">Traveller has paid {formatINR(booking.paid)}. Balance {formatINR(booking.balance)} due before the trip.</p>
        )}
        {booking.payout?.status === "paid" && <p className="hint">Paid out to you</p>}
        {canComplete && (
          <form action={completeTrip} className={styles.actions}>
            <input type="hidden" name="id" value={booking.id} />
            <button className="btn btn-secondary btn-sm">Mark trip completed</button>
          </form>
        )}
      </div>
    </article>
  );
}
