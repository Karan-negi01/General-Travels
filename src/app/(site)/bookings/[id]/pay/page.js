import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Clock } from "lucide-react";
import { requireCustomer } from "@/lib/auth";
import { getCustomerBooking } from "@/lib/data/queries";
import { cancelBooking } from "@/lib/actions/booking";
import { advanceAmount, ADVANCE_RATE } from "@/lib/payments";
import { PAYMENT_HOLD_MINUTES } from "@/lib/constants/status";
import { tripToParams } from "@/lib/pricing";
import { formatINR, formatDateRange } from "@/lib/format";
import FareBreakdown from "@/components/vehicles/FareBreakdown";
import DemoCheckout from "@/components/forms/DemoCheckout";
import styles from "../../bookings.module.css";

export const metadata = { title: "Payment" };

export default async function PayPage({ params }) {
  const { id } = await params;
  const viewer = await requireCustomer(`/bookings/${id}/pay`);
  const booking = await getCustomerBooking(id, viewer.id);
  if (!booking) notFound();
  if (booking.status !== "payment_pending") redirect(`/bookings/${id}`);

  const route = booking.from === booking.to ? `Local in ${booking.from}` : `${booking.from} → ${booking.to}`;
  const options = [
    { id: "advance", label: `Pay ${ADVANCE_RATE * 100}% advance`, note: `Balance ${formatINR(booking.fare.total - advanceAmount(booking.fare))} before the trip`, amount: advanceAmount(booking.fare) },
    { id: "full", label: "Pay in full", note: "Nothing more to pay later", amount: booking.fare.total },
  ];

  return (
    <div className={`container ${styles.page}`}>
      <Link href={`/buses/${booking.busId}?${tripToParams(booking)}`} className={styles.back}><ArrowLeft size={16} /> Back to the bus</Link>

      <div className={styles.head}>
        <div>
          <p className="eyebrow">Booking {booking.ref} · payment</p>
          <h1 className={styles.title}>{route}</h1>
          <p className="muted">
            {booking.bus.title} · {formatDateRange(booking.startDate, booking.endDate)} · {booking.passengers} passengers
          </p>
        </div>
      </div>

      <div className={styles.detailGrid}>
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Pay to confirm</h2>
          {booking.stillAvailable ? (
            <>
              {!booking.expired && (
                <p className="hint" style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 16 }}>
                  <Clock size={14} /> We&apos;re holding this bus for you for {PAYMENT_HOLD_MINUTES} minutes.
                </p>
              )}
              <DemoCheckout bookingId={booking.id} options={options} />
            </>
          ) : (
            <p className="alert alert-error">
              Sorry, this bus was booked by someone else for these dates. <Link href={`/buses?${tripToParams(booking)}`}><u>See other buses</u></Link>
            </p>
          )}
        </section>

        <aside className="stack">
          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Fare</h2>
            <FareBreakdown fare={booking.fare} />
          </section>
          <form action={cancelBooking}>
            <input type="hidden" name="id" value={booking.id} />
            <button className="btn btn-outline btn-block">Cancel this booking</button>
          </form>
        </aside>
      </div>
    </div>
  );
}
