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
      operator: "Registers with personal and company details: Aadhaar, PAN, GSTIN and address.",
      admin: "Verifies the operator. This happens only once per operator.",
      customer: null,
    },
  },
  {
    title: "2 · Listing",
    cells: {
      operator: "Adds drivers, then each bus with photos, documents, seats, amenities and rate per km.",
      admin: "Approves every bus and driver after checking RC, PUC, insurance, permit, fitness, ownership and licence. Rejections come with a reason.",
      customer: "Only approved buses with approved drivers appear in search.",
    },
  },
  {
    title: "3 · Booking",
    cells: {
      customer: "Searches, compares up to 5 buses, sees the fixed fare and pays online. The booking is confirmed instantly.",
      operator: "Keeps an availability calendar, so buses booked elsewhere never show up. No accept step needed.",
      admin: "Sees every booking, payment and commission, and steps in if needed.",
    },
  },
  {
    title: "4 · Trip",
    cells: {
      customer: "Gets the driver's name, photo and phone number and the vehicle number once paid.",
      operator: "Gets the traveller's contact, runs the trip, marks it completed and is paid out.",
      admin: "Handles support and GST invoicing.",
    },
  },
];

const RULES = [
  "An operator is approved once. After that, they can keep adding buses.",
  "Every bus is approved separately, so one operator can have many buses at different stages.",
  "A bus is bookable only when the operator, that bus and its driver are all approved.",
  "Fares are fixed and calculated the same way for everyone, with no negotiation.",
  "Contact details stay private on both sides until the traveller pays.",
  "Owners pay a commission on each booking, deducted automatically from the payment.",
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
            <li>Compare up to 5 buses side by side. Each shows its exact total fare for your trip.</li>
            <li>Sign in with your mobile number and pay 25% or the full fare online. Your booking is confirmed instantly.</li>
            <li>You then see the driver&apos;s name, photo and phone number and the vehicle number.</li>
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
            <li>Register with your personal and company details. Your account shows <em>Under review</em> until our team verifies it (once).</li>
            <li>Add your drivers and buses with their documents. Each one is reviewed separately, and a rejection tells you what to fix.</li>
            <li>When a bus is approved, it goes live in search at the rates you set.</li>
            <li>Block dates when a bus isn&apos;t free. Paid bookings are confirmed automatically. After the trip, mark it completed and get paid.</li>
          </ol>
          <Link href="/become-a-partner" className="btn btn-primary">List your bus</Link>
        </article>

        <article id="admin" className={styles.role}>
          <UserCheck size={22} />
          <h2>For the General Travels team</h2>
          <ol>
            <li><strong>Operators queue:</strong> verify new bus owners once (Aadhaar, PAN, GSTIN).</li>
            <li><strong>Buses and drivers:</strong> approve each one, or reject it with a reason. Bus approval unlocks only after its operator is approved.</li>
            <li><strong>Bookings and commission:</strong> monitor every booking, payment and payout, and set commission rates.</li>
            <li>Suspend an operator or a bus at any time to take it out of search.</li>
          </ol>
          <Link href="/login?role=admin" className="btn btn-outline">Admin sign in</Link>
        </article>
      </section>
    </>
  );
}
