import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { requireOperator } from "@/lib/auth";
import { getOperatorBuses, getBusCalendar } from "@/lib/data/queries";
import { unblockDates } from "@/lib/actions/operator";
import { formatDateRange, todayISO } from "@/lib/format";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import BlockDatesForm from "@/components/forms/BlockDatesForm";
import styles from "./availability.module.css";

export const metadata = { title: "Availability" };

const MONTH_RE = /^\d{4}-\d{2}$/;
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const monthName = new Intl.DateTimeFormat("en-IN", { month: "long", year: "numeric", timeZone: "UTC" });

function shiftMonth(month, by) {
  const d = new Date(`${month}-01T00:00:00Z`);
  d.setUTCMonth(d.getUTCMonth() + by);
  return d.toISOString().slice(0, 7);
}

// Every day of the month, padded to whole weeks starting on Monday.
function monthDays(month) {
  const first = new Date(`${month}-01T00:00:00Z`);
  const lead = (first.getUTCDay() + 6) % 7;
  const count = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0)).getUTCDate();
  const days = Array.from({ length: lead }, () => null);
  for (let i = 1; i <= count; i++) days.push(`${month}-${String(i).padStart(2, "0")}`);
  while (days.length % 7) days.push(null);
  return days;
}

export default async function AvailabilityPage({ searchParams }) {
  const [viewer, params] = await Promise.all([requireOperator("/operator/availability"), searchParams]);
  const buses = await getOperatorBuses(viewer.id);
  const today = todayISO();

  if (buses.length === 0) {
    return (
      <>
        <PageHeader title="Availability" />
        <EmptyState title="No buses yet" text="Add a bus first, then mark the dates it isn't available.">
          <Link href="/operator/buses/new" className="btn btn-primary">Add a bus</Link>
        </EmptyState>
      </>
    );
  }

  const busId = buses.some((b) => b.id === params.bus) ? params.bus : buses[0].id;
  const month = MONTH_RE.test(params.month ?? "") ? params.month : today.slice(0, 7);
  const cal = await getBusCalendar(busId, viewer.id);
  const link = (m) => `/operator/availability?bus=${busId}&month=${m}`;

  const dayState = (day) => {
    const booking = cal.bookings.find((b) => b.start <= day && day <= b.end);
    if (booking) return { kind: "booked", label: booking.ref };
    const block = cal.blocks.find((b) => b.start <= day && day <= b.end);
    if (block) return { kind: "blocked", label: block.reason };
    return { kind: day < today ? "past" : "free", label: "" };
  };

  const upcomingBlocks = cal.blocks.filter((b) => b.end >= today);

  return (
    <>
      <PageHeader
        title="Availability"
        description="Mark the dates a bus can't take bookings, like a booking through your office or servicing. It won't appear in search for those dates. Paid bookings are confirmed instantly, so keep this up to date."
      />

      <nav className={styles.busTabs} aria-label="Choose a bus">
        {buses.map((b) => (
          <Link key={b.id} href={`/operator/availability?bus=${b.id}&month=${month}`} className={b.id === busId ? styles.activeTab : undefined} aria-current={b.id === busId ? "page" : undefined}>
            {b.title}
          </Link>
        ))}
      </nav>

      <div className={styles.layout}>
        <section className={styles.calendar}>
          <div className={styles.calHead}>
            <Link href={link(shiftMonth(month, -1))} className="btn btn-outline btn-sm" aria-label="Previous month"><ChevronLeft size={16} /></Link>
            <h2>{monthName.format(new Date(`${month}-01T00:00:00Z`))}</h2>
            <Link href={link(shiftMonth(month, 1))} className="btn btn-outline btn-sm" aria-label="Next month"><ChevronRight size={16} /></Link>
          </div>
          <div className={styles.grid}>
            {WEEKDAYS.map((d) => <span key={d} className={styles.weekday}>{d}</span>)}
            {monthDays(month).map((day, i) => {
              if (!day) return <span key={`pad-${i}`} />;
              const s = dayState(day);
              return (
                <span key={day} className={`${styles.day} ${styles[s.kind]} ${day === today ? styles.today : ""}`} title={s.label || undefined}>
                  <span className={styles.num}>{Number(day.slice(8))}</span>
                  {s.label && <span className={styles.tag}>{s.label}</span>}
                </span>
              );
            })}
          </div>
          <ul className={styles.legend}>
            <li><span className={`${styles.swatch} ${styles.free}`} /> Available</li>
            <li><span className={`${styles.swatch} ${styles.booked}`} /> Booked on General Travels</li>
            <li><span className={`${styles.swatch} ${styles.blocked}`} /> Marked not available</li>
          </ul>
        </section>

        <aside className="stack">
          <section className={styles.panel}>
            <h2 className={styles.panelTitle}>Mark dates as not available</h2>
            <BlockDatesForm busId={busId} minDate={today} />
          </section>
          <section className={styles.panel}>
            <h2 className={styles.panelTitle}>Blocked dates</h2>
            {upcomingBlocks.length === 0 ? (
              <p className="hint">Nothing blocked. This bus can be booked on any free date.</p>
            ) : (
              <ul className={styles.blocks}>
                {upcomingBlocks.map((b) => (
                  <li key={b.id}>
                    <div>
                      <strong>{formatDateRange(b.start, b.end)}</strong>
                      <p className="hint">{b.reason}</p>
                    </div>
                    <form action={unblockDates}>
                      <input type="hidden" name="busId" value={busId} />
                      <input type="hidden" name="blockId" value={b.id} />
                      <button className="btn btn-outline btn-sm">Remove</button>
                    </form>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </aside>
      </div>
    </>
  );
}
