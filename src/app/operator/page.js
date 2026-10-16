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
  const hasDriver = s.drivers.length > 0;
  const hasBus = s.buses.length > 0;
  return [
    { title: "Personal and company details", text: "Submitted.", state: "done" },
    {
      title: "One-time verification by General Travels",
      text: approved
        ? "Verified. You won't need to do this again."
        : rejected
          ? `Not approved: ${operator.rejectionReason ?? "see your profile"}`
          : "Our team is verifying your details, usually within one working day.",
      state: approved ? "done" : rejected ? "blocked" : "current",
      action: rejected ? { href: "/operator/profile", label: "Correct and re-apply" } : undefined,
    },
    {
      title: "Add your drivers",
      text: hasDriver ? `${s.drivers.length} driver${s.drivers.length > 1 ? "s" : ""} added.` : "Name, licence, PSV badge and a photo of each driver.",
      state: hasDriver ? "done" : rejected ? "todo" : "current",
      action: !hasDriver && !rejected ? { href: "/operator/drivers/new", label: "Add a driver" } : undefined,
    },
    {
      title: "Add your buses",
      text: hasBus ? `${s.buses.length} bus${s.buses.length > 1 ? "es" : ""} added. Add more any time.` : "Photos, documents, seats, amenities and your rate per km.",
      state: hasBus ? "done" : hasDriver && !rejected ? "current" : "todo",
      action: hasDriver && !hasBus && !rejected ? { href: "/operator/buses/new", label: "Add your first bus" } : undefined,
    },
    {
      title: "Each bus and driver approved, then live",
      text: s.liveBuses
        ? `${s.liveBuses} bus${s.liveBuses > 1 ? "es are" : " is"} live and bookable.`
        : approved
          ? "We check every bus's documents and its driver's licence."
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
  const rejectedDrivers = s.drivers.filter((d) => d.status === "rejected").length;

  return (
    <>
      <PageHeader
        title={`Welcome, ${operator.ownerName.split(" ")[0]}`}
        description="Upcoming trips, payouts and your fleet at a glance."
        actions={operator.status !== "rejected" && <Link href="/operator/buses/new" className="btn btn-primary">Add a bus</Link>}
      />

      {params.welcome && (
        <div className={styles.banner}>
          <Sparkles size={20} />
          <p><strong>Your details are submitted.</strong> Add your drivers and buses now. Our team verifies your account and each bus and driver, and buses go live as soon as they&apos;re approved.</p>
        </div>
      )}
      {operator.status === "pending" && !params.welcome && (
        <div className={`${styles.banner} ${styles.bannerWarn}`}>
          <Clock size={20} />
          <p><strong>Account under review.</strong> You can add drivers and buses meanwhile. They&apos;re reviewed right after your account is verified.</p>
        </div>
      )}
      {operator.status === "rejected" && (
        <div className={`${styles.banner} ${styles.bannerError}`}>
          <ShieldX size={20} />
          <p>
            <strong>Your account wasn&apos;t approved.</strong> Reason: {operator.rejectionReason ?? "not given"}.{" "}
            <Link href="/operator/profile"><u>Correct your details and re-apply</u></Link>
          </p>
        </div>
      )}
      {(s.rejectedBuses > 0 || rejectedDrivers > 0) && operator.status !== "rejected" && (
        <div className={`${styles.banner} ${styles.bannerError}`}>
          <ShieldX size={20} />
          <p>
            <strong>Needs your attention:</strong>{" "}
            {s.rejectedBuses > 0 && <Link href="/operator/buses"><u>{s.rejectedBuses} bus{s.rejectedBuses > 1 ? "es" : ""} not approved</u></Link>}
            {s.rejectedBuses > 0 && rejectedDrivers > 0 && " · "}
            {rejectedDrivers > 0 && <Link href="/operator/drivers"><u>{rejectedDrivers} driver{rejectedDrivers > 1 ? "s" : ""} not approved</u></Link>}
            . See the reason, fix it and submit again.
          </p>
        </div>
      )}

      <div className={styles.stats}>
        <StatCard label="Upcoming trips" value={s.upcoming.length} href="/operator/bookings" />
        <StatCard label="Buses live" value={`${s.liveBuses} / ${s.buses.length}`} note={s.pendingBuses ? `${s.pendingBuses} under review` : null} href="/operator/buses" />
        <StatCard label="Paid out to you" value={formatINR(s.paidOut)} note={s.upcomingPayouts ? `${formatINR(s.upcomingPayouts)} on upcoming trips` : null} href="/operator/earnings" />
        <StatCard label="Commission rate" value={`${s.commissionRate}%`} note="of the fare before GST" />
      </div>

      <div className={showOnboarding ? styles.twoCol : undefined}>
        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <h2>{s.toComplete.length ? "Trips to mark completed" : "Upcoming trips"}</h2>
            <Link href="/operator/bookings">All trips →</Link>
          </div>
          {(s.toComplete.length ? s.toComplete : s.upcoming).length ? (
            <div className="stack">
              {(s.toComplete.length ? s.toComplete : s.upcoming).slice(0, 3).map((b) => <OperatorBookingCard key={b.id} booking={b} />)}
            </div>
          ) : (
            <p className={styles.quiet}>No upcoming trips. When a traveller pays for one of your buses, the trip is confirmed and shows up here.</p>
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
