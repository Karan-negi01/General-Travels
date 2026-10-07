import { CalendarDays, Users, Bus, Phone, MapPin } from "lucide-react";
import { respondToBooking } from "@/lib/actions/operator";
import { formatINR, formatDateRange, todayISO } from "@/lib/format";
import Badge from "@/components/ui/Badge";
import styles from "./OperatorBookingCard.module.css";

export default function OperatorBookingCard({ booking }) {
  const route = booking.from === booking.to ? `Local in ${booking.from}` : `${booking.from} → ${booking.to}`;
  const shared = Boolean(booking.customer.phone);
  const tripStarted = booking.startDate <= todayISO();

  return (
    <article className={`${styles.card} ${booking.status === "pending" ? styles.pending : ""}`}>
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
        </p>
        <div className={styles.customer}>
          {shared ? (
            <>
              <p><strong>{booking.customer.name}</strong> · <a href={`tel:+91${booking.customer.phone}`}><Phone size={13} /> +91 {booking.customer.phone}</a></p>
              <p className="hint"><MapPin size={12} /> {booking.pickupAddress}</p>
            </>
          ) : (
            <p className="hint">
              Traveller: <strong>{booking.customer.name}</strong> · pickup in {booking.from}. Full contact and address are shared once you confirm.
            </p>
          )}
          {booking.notes && <p className={styles.notes}>“{booking.notes}”</p>}
        </div>
      </div>

      <div className={styles.aside}>
        <p className={styles.amountLabel}>Trip value</p>
        <p className={styles.amount}>{formatINR(booking.fare.total)}</p>
        <p className="hint">{booking.fare.billableKm} km · incl. GST</p>
        {booking.status === "pending" && (
          <form action={respondToBooking} className={styles.actions}>
            <input type="hidden" name="id" value={booking.id} />
            <button name="decision" value="confirm" className="btn btn-primary btn-sm">Confirm</button>
            <button name="decision" value="decline" className="btn btn-outline btn-sm">Decline</button>
          </form>
        )}
        {booking.status === "confirmed" && tripStarted && (
          <form action={respondToBooking} className={styles.actions}>
            <input type="hidden" name="id" value={booking.id} />
            <button name="decision" value="complete" className="btn btn-secondary btn-sm">Mark completed</button>
          </form>
        )}
      </div>
    </article>
  );
}
