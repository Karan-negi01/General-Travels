import { requireOperator } from "@/lib/auth";
import { getOperatorBookings } from "@/lib/data/queries";
import { todayISO } from "@/lib/format";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import OperatorBookingCard from "@/components/bookings/OperatorBookingCard";
import styles from "../operator.module.css";

export const metadata = { title: "Trips" };

export default async function OperatorTripsPage() {
  const viewer = await requireOperator("/operator/bookings");
  const bookings = await getOperatorBookings(viewer.id);
  const today = todayISO();

  const groups = [
    { title: "To mark completed", items: bookings.filter((b) => b.status === "confirmed" && b.startDate <= today) },
    { title: "Upcoming", items: bookings.filter((b) => b.status === "confirmed" && b.startDate > today) },
    { title: "Past & cancelled", items: bookings.filter((b) => !["confirmed"].includes(b.status)).reverse() },
  ];

  return (
    <>
      <PageHeader
        title="Trips"
        description="Travellers pay online and bookings are confirmed instantly. Keep your availability calendar up to date so a bus is never booked on a day it can't run."
      />
      {bookings.length === 0 ? (
        <EmptyState title="No trips yet" text="Once your buses are live, paid bookings appear here." />
      ) : (
        groups.map((g) =>
          g.items.length ? (
            <section key={g.title} className={styles.group}>
              <h2 className={styles.groupTitle}>{g.title} · {g.items.length}</h2>
              <div className="stack">
                {g.items.map((b) => <OperatorBookingCard key={b.id} booking={b} />)}
              </div>
            </section>
          ) : null
        )
      )}
    </>
  );
}
