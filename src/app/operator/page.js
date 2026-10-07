import Link from "next/link";
import { Clock, ShieldX, Sparkles } from "lucide-react";
import { requireOperator } from "@/lib/auth";
import { getOperatorSummary } from "@/lib/data/queries";
import { formatINR } from "@/lib/format";
import PageHeader from "@/components/ui/PageHeader";
import StatCard from "@/components/ui/StatCard";
import Stepper from "@/components/ui/Stepper";
import OperatorBookingCard from "@/components/bookings/OperatorBookingCard";
import styles from "./operator.module.css";

export const metadata = { title: { absolute: "Dashboard · Operator portal" } };

function onboardingSteps(operator, s) {
  const approved = operator.status === "approved";
  const rejected = operator.status === "rejected";
  const hasBus = s.buses.length > 0;
  return [
    { title: "Operator account created", text: "Business details submitted.", state: "done" },
    {
      title: "One-time verification by General Travels",
      text: approved
        ? "Verified. You won't need to do this again."
        : rejected
          ? "Not approved. Please contact partner support."
          : "Our team is checking your PAN/GSTIN and will call you, usually within one working day.",
      state: approved ? "done" : rejected ? "blocked" : "current",
    },
    {
      title: "Add your buses",
      text: hasBus ? `${s.buses.length} bus${s.buses.length > 1 ? "es" : ""} added. Add more any time.` : "List each vehicle with its seats, amenities and rate per km.",
      state: hasBus ? "done" : rejected ? "todo" : "current",
      action: !hasBus && !rejected ? { href: "/operator/buses/new", label: "Add your first bus" } : undefined,
    },
    {
      title: "Each bus approved, then live",
      text: s.liveBuses
        ? `${s.liveBuses} bus${s.liveBuses > 1 ? "es are" : " is"} live and bookable.`
        : approved
          ? "We review every bus separately (RC, insurance, permit, fitness)."
          : "Bus reviews start once your account is verified.",
      state: s.liveBuses ? "done" : hasBus && approved ? "current" : "todo",
    },
  ];
}

export default async function OperatorDashboard({ searchParams }) {
  const [viewer, params] = await Promise.all([requireOperator("/operator"), searchParams]);
  const operator = viewer.record;
  const s = await getOperatorSummary(operator.id);
  const showOnboarding = s.liveBuses === 0 || operator.status !== "approved";

  return (
    <>
      <PageHeader
        title={`Welcome, ${operator.ownerName.split(" ")[0]}`}
        description="Booking requests, upcoming trips and your fleet at a glance."
        actions={operator.status !== "rejected" && <Link href="/operator/buses/new" className="btn btn-primary">Add a bus</Link>}
      />

      {params.welcome && (
        <div className={styles.banner}>
          <Sparkles size={20} />
          <p><strong>Your operator account is created.</strong> Add your buses now. Our team reviews your account and each bus, and buses go live as soon as they&apos;re approved.</p>
        </div>
      )}
      {operator.status === "pending" && !params.welcome && (
        <div className={`${styles.banner} ${styles.bannerWarn}`}>
          <Clock size={20} />
          <p><strong>Account under review.</strong> You can add buses meanwhile. They&apos;ll be reviewed right after your account is verified.</p>
        </div>
      )}
      {operator.status === "rejected" && (
        <div className={`${styles.banner} ${styles.bannerError}`}>
          <ShieldX size={20} />
          <p><strong>Your account wasn&apos;t approved.</strong> Your buses are hidden from travellers. Contact partner support to re-apply.</p>
        </div>
      )}

      <div className={styles.stats}>
        <StatCard label="Booking requests" value={s.requests.length} note={s.requests.length ? "Waiting for you" : null} href="/operator/bookings" />
        <StatCard label="Upcoming trips" value={s.upcoming.length} href="/operator/bookings" />
        <StatCard label="Buses live" value={`${s.liveBuses} / ${s.buses.length}`} note={s.pendingBuses ? `${s.pendingBuses} under review` : null} href="/operator/buses" />
        <StatCard label="Confirmed business" value={formatINR(s.earnings)} />
      </div>

      <div className={showOnboarding ? styles.twoCol : undefined}>
        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <h2>Needs your response</h2>
            <Link href="/operator/bookings">All bookings →</Link>
          </div>
          {s.requests.length ? (
            <div className="stack">
              {s.requests.slice(0, 3).map((b) => <OperatorBookingCard key={b.id} booking={b} />)}
            </div>
          ) : (
            <p className={styles.quiet}>No new booking requests. When a traveller books one of your buses, it shows up here for you to confirm.</p>
          )}
        </section>

        {showOnboarding && (
          <section className={`${styles.section} ${styles.card}`}>
            <h2 className={styles.cardTitle}>Getting live</h2>
            <Stepper steps={onboardingSteps(operator, s)} />
          </section>
        )}
      </div>
    </>
  );
}
