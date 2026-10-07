import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Phone, Mail, Building2, CarFront, PartyPopper } from "lucide-react";
import { requireCustomer } from "@/lib/auth";
import { getCustomerBooking } from "@/lib/data/queries";
import { cancelBooking } from "@/lib/actions/booking";
import { getVehicleType } from "@/lib/constants/vehicles";
import { formatDate, formatDateRange, todayISO } from "@/lib/format";
import Badge from "@/components/ui/Badge";
import Stepper from "@/components/ui/Stepper";
import FareBreakdown from "@/components/vehicles/FareBreakdown";
import BusArt from "@/components/vehicles/BusArt";
import styles from "../bookings.module.css";

export const metadata = { title: "Booking details" };

function timeline(booking) {
  const s = booking.status;
  if (s === "declined" || s === "cancelled") {
    return [
      { title: "Booked", text: formatDate(booking.createdAt), state: "done" },
      {
        title: s === "declined" ? "Operator couldn't take this trip" : "You cancelled this booking",
        text: s === "declined" ? "Nothing to pay. Please book another bus for these dates." : "Nothing to pay.",
        state: "blocked",
      },
    ];
  }
  return [
    { title: "Booked", text: `Fare locked on ${formatDate(booking.createdAt)}`, state: "done" },
    {
      title: "Operator confirms",
      text: s === "pending" ? "Waiting for the operator. Usually within a few hours." : "The bus is reserved for your dates.",
      state: s === "pending" ? "current" : "done",
    },
    {
      title: "Trip day",
      text: `Pickup on ${formatDate(booking.startDate)}`,
      state: s === "completed" ? "done" : s === "confirmed" ? "current" : "todo",
    },
    { title: "Completed", text: "GST invoice is sent after the trip.", state: s === "completed" ? "done" : "todo" },
  ];
}

export default async function BookingPage({ params, searchParams }) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const viewer = await requireCustomer(`/bookings/${id}`);
  const booking = await getCustomerBooking(id, viewer.id);
  if (!booking) notFound();

  const route = booking.from === booking.to ? `Local in ${booking.from}` : `${booking.from} → ${booking.to}`;
  const canCancel = ["pending", "confirmed"].includes(booking.status) && booking.startDate > todayISO();
  const contact = booking.operatorContact;

  return (
    <div className={`container ${styles.page}`}>
      <Link href="/bookings" className={styles.back}><ArrowLeft size={16} /> My bookings</Link>

      {query.new && (
        <div className={styles.success}>
          <PartyPopper size={22} />
          <div>
            <strong>Booking request sent.</strong> We&apos;ve asked the operator to confirm your bus. You&apos;ll see their details here once they do.
          </div>
        </div>
      )}

      <div className={styles.head}>
        <div>
          <p className="eyebrow">Booking {booking.ref}</p>
          <h1 className={styles.title}>{route}</h1>
          <p className="muted">
            {formatDateRange(booking.startDate, booking.endDate)} · {booking.tripType === "round-trip" ? "Round trip" : "One way"} · {booking.passengers} passengers
          </p>
        </div>
        <Badge status={booking.status} kind="booking" />
      </div>

      <div className={styles.detailGrid}>
        <div className="stack">
          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Status</h2>
            <Stepper steps={timeline(booking)} />
          </section>

          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Operator &amp; vehicle</h2>
            {contact ? (
              <ul className={styles.contact}>
                <li><Building2 size={16} /> <span><strong>{contact.businessName}</strong><small>{contact.ownerName}</small></span></li>
                <li><Phone size={16} /> <a href={`tel:+91${contact.phone}`}>+91 {contact.phone}</a></li>
                {contact.email && <li><Mail size={16} /> <a href={`mailto:${contact.email}`}>{contact.email}</a></li>}
                <li><CarFront size={16} /> <span>Vehicle no. <strong>{contact.registrationNumber}</strong></span></li>
              </ul>
            ) : (
              <p className="muted">
                {booking.status === "pending"
                  ? "Shared as soon as the operator confirms. Until then, both sides' contact details stay private."
                  : "Not shared for this booking."}
              </p>
            )}
          </section>

          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Trip details</h2>
            <dl className={styles.dl}>
              <div><dt>Pickup</dt><dd>{booking.pickupAddress}</dd></div>
              {booking.notes && <div><dt>Notes</dt><dd>{booking.notes}</dd></div>}
              <div><dt>Booked on</dt><dd>{formatDate(booking.createdAt)}</dd></div>
            </dl>
          </section>
        </div>

        <aside className="stack">
          <section className={styles.card}>
            <div className={styles.busMini}>
              <BusArt type={booking.bus.type} />
            </div>
            <p className="eyebrow" style={{ marginTop: 16 }}>{getVehicleType(booking.bus.type)?.label.split(" (")[0]}</p>
            <h3 className={styles.busTitle}>{booking.bus.title}</h3>
            <p className="hint">{booking.bus.seats} seats · {booking.bus.ac ? "AC" : "Non-AC"} · {booking.bus.operator.label}</p>
          </section>
          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Fare</h2>
            <FareBreakdown fare={booking.fare} />
          </section>
          {canCancel && (
            <form action={cancelBooking}>
              <input type="hidden" name="id" value={booking.id} />
              <button className="btn btn-danger btn-block">Cancel booking</button>
            </form>
          )}
        </aside>
      </div>
    </div>
  );
}
