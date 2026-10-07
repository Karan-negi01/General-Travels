import Link from "next/link";
import { Users, Bus, UserCheck, Check } from "lucide-react";
import { formatINR } from "@/lib/format";
import { calculateFare } from "@/lib/pricing";
import styles from "./how.module.css";

const EXAMPLE_BUS = { ratePerKm: 38, minKmPerDay: 250, driverAllowancePerDay: 800 };
const EXAMPLE = calculateFare(EXAMPLE_BUS, { tripType: "round-trip", from: "Delhi", to: "Agra", startDate: "2026-01-01", endDate: "2026-01-01" });

export const metadata = {
  title: "How it works",
  description: "How travellers, bus operators and the General Travels team use the platform.",
};

const LANES = [
  { id: "operator", icon: Bus, label: "Bus operator" },
  { id: "admin", icon: UserCheck, label: "General Travels admin" },
  { id: "customer", icon: Users, label: "Traveller" },
];

const STAGES = [
  {
    title: "1 · Onboarding",
    cells: {
      operator: "Registers the business with PAN and GSTIN.",
      admin: "Verifies the operator. This happens only once per operator.",
      customer: null,
    },
  },
  {
    title: "2 · Listing",
    cells: {
      operator: "Adds each bus: seats, amenities, pickup cities and rate per km.",
      admin: "Approves every bus on its own after checking RC, insurance, permit and fitness.",
      customer: "Only approved buses from approved operators appear in search.",
    },
  },
  {
    title: "3 · Booking",
    cells: {
      customer: "Searches route, dates and group size, sees the fixed fare and books.",
      operator: "Gets the request and confirms it, or declines if the bus is unavailable.",
      admin: "Sees every booking and steps in if needed.",
    },
  },
  {
    title: "4 · Trip",
    cells: {
      customer: "Gets the operator's phone number and vehicle number once confirmed.",
      operator: "Gets the traveller's contact, runs the trip, then marks it completed.",
      admin: "Handles support and GST invoicing.",
    },
  },
];

const RULES = [
  "An operator is approved once. After that, they can keep adding buses.",
  "Every bus is approved separately, so one operator can have many buses at different stages.",
  "A bus is bookable only when both the operator and that bus are approved.",
  "Fares are fixed and calculated the same way for everyone, with no negotiation.",
  "Contact details stay private on both sides until the operator confirms.",
];

export default function HowItWorksPage() {
  return (
    <>
      <section className={styles.hero}>
        <div className="container">
          <p className="eyebrow">How it works</p>
          <h1 className={styles.title}>One platform. <em>Three roles.</em></h1>
          <p className={styles.lead}>
            Travellers book buses. Bus owners list them. The General Travels team approves every operator and every bus
            in between, so travellers only ever see vehicles we&apos;ve checked.
          </p>
        </div>
      </section>

      <section className={`container ${styles.section}`}>
        <h2 className={styles.h2}>The full journey</h2>
        <div className={styles.lanesWrap}>
          <div className={styles.lanes} style={{ "--stages": STAGES.length }}>
            <div className={styles.corner} />
            {STAGES.map((s) => <div key={s.title} className={styles.stage}>{s.title}</div>)}
            {LANES.map(({ id, icon: Icon, label }) => (
              <div key={id} className={styles.laneRow} data-lane={id}>
                <div className={styles.laneLabel}><Icon size={18} /> {label}</div>
                {STAGES.map((s) => (
                  <div key={s.title} className={s.cells[id] ? styles.cell : styles.cellEmpty}>
                    {s.cells[id] ?? "—"}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={`container ${styles.section}`}>
        <div className={styles.rules}>
          <div>
            <p className="eyebrow">Ground rules</p>
            <h2 className={styles.h2}>What keeps the platform trustworthy</h2>
          </div>
          <ul>
            {RULES.map((r) => (
              <li key={r}><Check size={18} /> {r}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className={`container ${styles.section} ${styles.roleGrid}`}>
        <article id="travellers" className={styles.role}>
          <Users size={22} />
          <h2>For travellers</h2>
          <ol>
            <li>Enter pickup city, destination, dates and group size.</li>
            <li>Compare buses. Each shows its exact total fare for your trip.</li>
            <li>Sign in with your mobile number and book. No payment is taken now.</li>
            <li>The operator confirms. You then see their phone number and the vehicle number.</li>
          </ol>
          <div className={styles.formula}>
            <p className={styles.formulaTitle}>How the fare is calculated</p>
            <p>(greater of route km or minimum km/day × days) × rate per km<br />+ driver allowance × days + 5% GST</p>
            <p className="hint">
              Example: Delhi → Agra round trip in one day, in a {formatINR(EXAMPLE_BUS.ratePerKm)}/km van ≈ {EXAMPLE.tripKm} km →{" "}
              <strong>{formatINR(EXAMPLE.total)}</strong> all-in.
            </p>
          </div>
          <Link href="/buses" className="btn btn-primary">Find a bus</Link>
        </article>

        <article id="operators" className={styles.role}>
          <Bus size={22} />
          <h2>For bus operators</h2>
          <ol>
            <li>Register your business. Your account shows <em>Under review</em> until our team verifies it (once).</li>
            <li>Add your buses at any time. Each one is reviewed separately.</li>
            <li>When a bus is approved, it goes live in search at the rates you set.</li>
            <li>Confirm or decline booking requests. After the trip, mark it completed.</li>
          </ol>
          <Link href="/become-a-partner" className="btn btn-primary">List your bus</Link>
        </article>

        <article id="admin" className={styles.role}>
          <UserCheck size={22} />
          <h2>For the General Travels team</h2>
          <ol>
            <li><strong>Operators queue:</strong> verify new bus owners once (PAN, GSTIN, a call).</li>
            <li><strong>Buses queue:</strong> approve each bus. Approval unlocks only after its operator is approved.</li>
            <li><strong>Bookings:</strong> monitor every booking across the platform.</li>
            <li>Suspend an operator or a bus at any time to take it out of search.</li>
          </ol>
          <Link href="/login?role=admin" className="btn btn-outline">Admin sign in</Link>
        </article>
      </section>
    </>
  );
}
