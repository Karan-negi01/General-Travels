import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Phone, Mail, Building2, CarFront, PartyPopper, UserRound, CreditCard, RotateCcw } from "lucide-react";
import { requireCustomer } from "@/lib/auth";
import { getCustomerBooking } from "@/lib/data/queries";
import { cancelBooking } from "@/lib/actions/booking";
import { getVehicleType, labelFor, SEATING } from "@/lib/constants/vehicles";
import { PAYMENT_METHODS } from "@/lib/payments";
import { formatDate, formatDateRange, formatINR, todayISO } from "@/lib/format";
import Badge from "@/components/ui/Badge";
import Stepper from "@/components/ui/Stepper";
import FareBreakdown from "@/components/vehicles/FareBreakdown";
import BusPhoto from "@/components/vehicles/BusPhoto";
import DemoCheckout from "@/components/forms/DemoCheckout";
import styles from "../bookings.module.css";

export const metadata = { title: "Booking details" };

function timeline(booking) {
  const s = booking.status;
  if (s === "cancelled") {
    const refunded = booking.refunds.reduce((sum, r) => sum + r.amount, 0);
    return [
      { title: "Booked", text: formatDate(booking.createdAt), state: "done" },
      { title: "You cancelled this booking", text: refunded ? `${formatINR(refunded)} refunded to your original payment method.` : "Nothing was paid.", state: "blocked" },
    ];
  }
  return [
    { title: "Bus reserved", text: `Fare locked on ${formatDate(booking.createdAt)}`, state: "done" },
    {
      title: "Paid and confirmed",
      text: s === "payment_pending" ? "Pay to confirm your bus." : booking.balance > 0 ? `Advance paid. Balance ${formatINR(booking.balance)} due before the trip.` : "Paid in full. The bus is reserved for your dates.",
      state: s === "payment_pending" ? "current" : "done",
      action: s === "payment_pending" && !booking.expired ? { href: `/bookings/${booking.id}/pay`, label: "Pay now" } : undefined,
    },
    {
      title: "Trip day",
      text: `Pickup on ${formatDate(booking.startDate)}`,
      state: s === "completed" ? "done" : s === "confirmed" ? "current" : "todo",
    },
    { title: "Completed", text: "Your GST invoice is sent after the trip.", state: s === "completed" ? "done" : "todo" },
  ];
}

const methodLabel = (id) => labelFor(PAYMENT_METHODS, id);

export default async function BookingPage({ params, searchParams }) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const viewer = await requireCustomer(`/bookings/${id}`);
  const booking = await getCustomerBooking(id, viewer.id);
  if (!booking) notFound();

  const route = booking.from === booking.to ? `Local in ${booking.from}` : `${booking.from} → ${booking.to}`;
  const canCancel = ["payment_pending", "confirmed"].includes(booking.status) && booking.startDate > todayISO();
  const contact = booking.operatorContact;
  const driver = booking.driver;

  return (
    <div className={`container ${styles.page}`}>
      <Link href="/bookings" className={styles.back}><ArrowLeft size={16} /> My bookings</Link>

      {query.paid && booking.status === "confirmed" && (
        <div className={styles.success}>
          <PartyPopper size={22} />
          <div>
            <strong>{query.paid === "balance" ? "Balance paid." : "Payment received. Your bus is confirmed!"}</strong>{" "}
            {query.paid === "balance" ? "You've paid the full fare." : "Your driver's details are below. We've shared your pickup details with them."}
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
        <Badge status={booking.expired ? "cancelled" : booking.status} kind="booking">{booking.expired ? "Payment not completed" : undefined}</Badge>
      </div>

      <div className={styles.detailGrid}>
        <div className="stack">
          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Status</h2>
            <Stepper steps={timeline(booking)} />
            {booking.status === "payment_pending" && booking.expired && (
              <p className="hint" style={{ marginTop: 12 }}>
                The hold on this bus has ended.{" "}
                {booking.stillAvailable ? <Link href={`/bookings/${booking.id}/pay`}><u>It&apos;s still free. Pay now</u></Link> : "Someone else has booked it, so please choose another bus."}
              </p>
            )}
          </section>

          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Your driver &amp; vehicle</h2>
            {contact ? (
              <ul className={styles.contact}>
                {driver && (
                  <li>
                    {driver.photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={driver.photoUrl} alt={driver.name} className={styles.driverPhoto} />
                    ) : (
                      <UserRound size={16} />
                    )}
                    <span><strong>{driver.name}</strong><small>Driver · {driver.experienceYears} years experience</small></span>
                  </li>
                )}
                {driver && <li><Phone size={16} /> <a href={`tel:+91${driver.phone}`}>+91 {driver.phone}</a></li>}
                <li><CarFront size={16} /> <span>Vehicle no. <strong>{contact.registrationNumber}</strong></span></li>
                <li><Building2 size={16} /> <span><strong>{contact.businessName}</strong><small>Bus owner · <a href={`tel:+91${contact.phone}`}>+91 {contact.phone}</a></small></span></li>
                {contact.email && <li><Mail size={16} /> <a href={`mailto:${contact.email}`}>{contact.email}</a></li>}
              </ul>
            ) : (
              <p className="muted">
                {booking.status === "payment_pending"
                  ? "Shared as soon as you pay. Until then, both sides' contact details stay private."
                  : "Not shared for this booking."}
              </p>
            )}
          </section>

          {booking.status === "confirmed" && booking.balance > 0 && (
            <section className={styles.card}>
              <h2 className={styles.cardTitle}>Pay the balance</h2>
              <p className="muted" style={{ marginBottom: 16 }}>You&apos;ve paid {formatINR(booking.paid)}. Please pay the remaining {formatINR(booking.balance)} before the trip.</p>
              <DemoCheckout bookingId={booking.id} options={[{ id: "balance", label: "Balance", amount: booking.balance }]} balanceOnly />
            </section>
          )}

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
              <BusPhoto type={booking.bus.type} src={booking.bus.photoUrls[0]} alt={booking.bus.title} sizes="380px" />
            </div>
            <p className="eyebrow" style={{ marginTop: 16 }}>{getVehicleType(booking.bus.type)?.label.split(" (")[0]}</p>
            <h3 className={styles.busTitle}>{booking.bus.title}</h3>
            <p className="hint">{booking.bus.seats} seats · {labelFor(SEATING, booking.bus.seating)} · {booking.bus.ac ? "AC" : "Non-AC"} · {booking.bus.operator.label}</p>
          </section>
          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Fare</h2>
            <FareBreakdown fare={booking.fare} />
          </section>
          {(booking.payments.length > 0 || booking.refunds.length > 0) && (
            <section className={styles.card}>
              <h2 className={styles.cardTitle}>Payments</h2>
              <ul className={styles.payments}>
                {booking.payments.map((p) => (
                  <li key={p.id}>
                    <CreditCard size={15} />
                    <span>
                      {p.option === "advance" ? "Advance" : p.option === "balance" ? "Balance" : "Full fare"} · {methodLabel(p.method)}
                      <small>{formatDate(p.paidAt)} · {p.id}</small>
                    </span>
                    <strong>{formatINR(p.amount)}</strong>
                  </li>
                ))}
                {booking.refunds.map((r) => (
                  <li key={r.id}>
                    <RotateCcw size={15} />
                    <span>Refund<small>{formatDate(r.refundedAt)} · {r.id}</small></span>
                    <strong>−{formatINR(r.amount)}</strong>
                  </li>
                ))}
              </ul>
              {booking.payments.some((p) => p.demo) && <p className="hint" style={{ marginTop: 8 }}>Demo payments. No money was charged.</p>}
            </section>
          )}
          {canCancel && (
            <form action={cancelBooking}>
              <input type="hidden" name="id" value={booking.id} />
              <button className="btn btn-danger btn-block">Cancel booking{booking.paid ? ` · refund ${formatINR(booking.paid)}` : ""}</button>
            </form>
          )}
        </aside>
      </div>
    </div>
  );
}
