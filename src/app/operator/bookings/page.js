import { requireOperator } from "@/lib/auth";
import { getOperatorBookings } from "@/lib/data/queries";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import OperatorBookingCard from "@/components/bookings/OperatorBookingCard";
import styles from "../operator.module.css";

export const metadata = { title: "Bookings" };

export default async function OperatorBookingsPage() {
  const viewer = await requireOperator("/operator/bookings");
  const bookings = await getOperatorBookings(viewer.id);

  const groups = [
    { title: "Needs your response", items: bookings.filter((b) => b.status === "pending") },
    { title: "Upcoming & ongoing", items: bookings.filter((b) => b.status === "confirmed") },
    { title: "Past", items: bookings.filter((b) => !["pending", "confirmed"].includes(b.status)).reverse() },
  ];

  return (
    <>
      <PageHeader
        title="Bookings"
        description="Confirm requests quickly. Travellers see your details only after you confirm, and you see theirs."
      />
      {bookings.length === 0 ? (
        <EmptyState title="No bookings yet" text="Once your buses are live, traveller bookings appear here for you to confirm." />
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
