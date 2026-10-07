import Link from "next/link";
import { ArrowRight, MapPin, CalendarDays, Users } from "lucide-react";
import { requireCustomer } from "@/lib/auth";
import { getCustomerBookings } from "@/lib/data/queries";
import { formatINR, formatDateRange, todayISO } from "@/lib/format";
import Badge from "@/components/ui/Badge";
import BusArt from "@/components/vehicles/BusArt";
import EmptyState from "@/components/ui/EmptyState";
import styles from "./bookings.module.css";

export const metadata = { title: "My bookings" };

function BookingRow({ booking }) {
  const route = booking.from === booking.to ? `Local in ${booking.from}` : `${booking.from} → ${booking.to}`;
  return (
    <Link href={`/bookings/${booking.id}`} className={styles.row}>
      <div className={styles.rowArt}><BusArt type={booking.bus?.type} /></div>
      <div className={styles.rowBody}>
        <p className={styles.ref}>{booking.ref}</p>
        <h3 className={styles.route}>{route}</h3>
        <p className={styles.rowMeta}>
          <span><CalendarDays size={14} /> {formatDateRange(booking.startDate, booking.endDate)}</span>
          <span><Users size={14} /> {booking.passengers} passengers</span>
          <span><MapPin size={14} /> {booking.bus?.title}</span>
        </p>
      </div>
      <div className={styles.rowAside}>
        <Badge status={booking.status} kind="booking" />
        <p className={styles.amount}>{formatINR(booking.fare.total)}</p>
        <span className={styles.view}>Details <ArrowRight size={14} /></span>
      </div>
    </Link>
  );
}

export default async function MyBookingsPage() {
  const viewer = await requireCustomer("/bookings");
  const bookings = await getCustomerBookings(viewer.id);
  const today = todayISO();
  const upcoming = bookings.filter((b) => ["pending", "confirmed"].includes(b.status) && b.endDate >= today).reverse();
  const past = bookings.filter((b) => !upcoming.includes(b));

  return (
    <div className={`container ${styles.page}`}>
      <div className={styles.head}>
        <div>
          <p className="eyebrow">Traveller account</p>
          <h1 className={styles.title}>Hello, {viewer.name.split(" ")[0]}</h1>
          <p className="muted">Your trips with General Travels.</p>
        </div>
        <Link href="/buses" className="btn btn-primary">Book another bus</Link>
      </div>

      {bookings.length === 0 ? (
        <EmptyState title="No trips yet" text="Find a bus for your group. Fares are fixed and shown before you book.">
          <Link href="/buses" className="btn btn-primary">Find a bus</Link>
        </EmptyState>
      ) : (
        <>
          <section className={styles.group}>
            <h2 className={styles.groupTitle}>Upcoming</h2>
            {upcoming.length ? upcoming.map((b) => <BookingRow key={b.id} booking={b} />) : <p className="muted">No upcoming trips.</p>}
          </section>
          {past.length > 0 && (
            <section className={styles.group}>
              <h2 className={styles.groupTitle}>Past &amp; cancelled</h2>
              {past.map((b) => <BookingRow key={b.id} booking={b} />)}
            </section>
          )}
        </>
      )}
    </div>
  );
}
