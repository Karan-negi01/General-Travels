import Link from "next/link";
import { ArrowRight, BadgeIndianRupee, ShieldCheck, LockKeyhole, ReceiptText, Users, Bus, UserCheck } from "lucide-react";
import TripSearch from "@/components/forms/TripSearch";
import BusPhoto from "@/components/vehicles/BusPhoto";
import { HERO_PHOTO } from "@/lib/constants/photos";
import BusCard from "@/components/vehicles/BusCard";
import { VEHICLE_TYPES } from "@/lib/constants/vehicles";
import { searchBuses, getPlatformStats } from "@/lib/data/queries";
import styles from "./home.module.css";

const ROLES = [
  {
    icon: Users,
    who: "Travellers",
    title: "Book a whole bus in minutes",
    points: ["Search by route, dates and group size", "See the full fare upfront, with GST", "Operator confirms and shares driver details"],
    link: { href: "/buses", label: "Find a bus" },
  },
  {
    icon: Bus,
    who: "Bus owners",
    title: "List your fleet, get bookings",
    points: ["Register once. Our team verifies you", "Add each bus. Each one is approved before it goes live", "Accept bookings at the rates you set"],
    link: { href: "/become-a-partner", label: "List your bus" },
  },
  {
    icon: UserCheck,
    who: "General Travels team",
    title: "Verifies every listing",
    points: ["Approves each operator once (GST, PAN, call)", "Approves every bus (RC, insurance, permit, fitness)", "Oversees bookings and support"],
    link: { href: "/how-it-works", label: "See the approval process" },
  },
];

const PROMISES = [
  { icon: BadgeIndianRupee, title: "Fixed, upfront fares", text: "Rate per km, driver allowance and GST, shown line by line before you book." },
  { icon: ShieldCheck, title: "Verified twice", text: "Every operator and every single bus is checked by our team." },
  { icon: LockKeyhole, title: "Private until confirmed", text: "Contact details are shared only after the operator confirms your trip." },
  { icon: ReceiptText, title: "GST invoices", text: "Built for corporate, government and institutional travel desks." },
];

export default async function HomePage() {
  const [featured, stats] = await Promise.all([searchBuses(), getPlatformStats()]);

  return (
    <>
      <section className={styles.hero}>
        <div className={`container ${styles.heroGrid}`}>
          <div className={styles.heroCopy}>
            <p className="eyebrow">Premium bus &amp; coach hire</p>
            <h1 className={styles.heroTitle}>
              Travel together, <em>in a class of your own.</em>
            </h1>
            <p className={styles.heroText}>
              Luxury coaches, buses and tempo travellers from operators we&apos;ve personally verified. One fixed price, no
              haggling, no surprises.
            </p>
            <dl className={styles.stats}>
              <div><dt>Verified operators</dt><dd>{stats.operators}</dd></div>
              <div><dt>Buses live</dt><dd>{stats.buses}</dd></div>
              <div><dt>Cities served</dt><dd>{stats.cities}</dd></div>
            </dl>
          </div>
          <div className={styles.heroArt} aria-hidden="true">
            <BusPhoto photo={HERO_PHOTO} sizes="(max-width: 960px) 0px, 520px" priority />
            <div className={styles.heroBadge}>
              <ShieldCheck size={18} />
              <div>
                <strong>Verified fleet</strong>
                <span>RC · Insurance · Permit · Fitness</span>
              </div>
            </div>
          </div>
        </div>
        <div className="container">
          <div className={styles.searchCard}>
            <TripSearch />
          </div>
        </div>
      </section>

      <section className={`container ${styles.section}`}>
        <div className={styles.sectionHead}>
          <p className="eyebrow">One platform, three roles</p>
          <h2 className={styles.sectionTitle}>How General Travels works</h2>
        </div>
        <div className={styles.roles}>
          {ROLES.map(({ icon: Icon, who, title, points, link }, i) => (
            <article key={who} className={styles.role}>
              <div className={styles.roleTop}>
                <span className={styles.roleIcon}><Icon size={20} /></span>
                <span className={styles.roleStep}>0{i + 1}</span>
              </div>
              <p className={styles.roleWho}>{who}</p>
              <h3 className={styles.roleTitle}>{title}</h3>
              <ul>
                {points.map((p) => <li key={p}>{p}</li>)}
              </ul>
              <Link href={link.href} className={styles.roleLink}>{link.label} <ArrowRight size={14} /></Link>
            </article>
          ))}
        </div>
      </section>

      <section className={`container ${styles.section}`}>
        <div className={styles.sectionHead}>
          <p className="eyebrow">The fleet</p>
          <h2 className={styles.sectionTitle}>The right vehicle for every group</h2>
        </div>
        <div className={styles.fleet}>
          {VEHICLE_TYPES.map((t) => (
            <Link key={t.id} href={`/buses?type=${t.id}`} className={styles.fleetItem}>
              <div className={styles.fleetArt}><BusPhoto type={t.id} sizes="(max-width: 640px) 100vw, 380px" /></div>
              <div className={styles.fleetBody}>
                <h3>{t.label.split(" (")[0]}</h3>
                <p>{t.seatRange[0]}–{t.seatRange[1]} seats</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {featured.length > 0 && (
        <section className={`container ${styles.section}`}>
          <div className={styles.sectionHeadRow}>
            <div>
              <p className="eyebrow">Ready to book</p>
              <h2 className={styles.sectionTitle}>Featured buses</h2>
            </div>
            <Link href="/buses" className="btn btn-outline">View all buses <ArrowRight size={16} /></Link>
          </div>
          <div className="stack">
            {featured.slice(0, 3).map((bus) => <BusCard key={bus.id} bus={bus} />)}
          </div>
        </section>
      )}

      <section className={styles.promises}>
        <div className="container">
          <div className={styles.sectionHead}>
            <p className="eyebrow">Our promise</p>
            <h2 className={styles.sectionTitle}>Travel the way it should be</h2>
          </div>
          <div className={styles.promiseGrid}>
            {PROMISES.map(({ icon: Icon, title, text }) => (
              <div key={title} className={styles.promise}>
                <Icon size={24} strokeWidth={1.6} />
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container">
        <div className={styles.partner}>
          <div>
            <p className={`eyebrow ${styles.eyebrowLight}`}>For bus owners</p>
            <h2>Own buses or tempo travellers?</h2>
            <p>Register once, list every vehicle in your fleet and receive confirmed bookings from corporates, institutions and families. You set the rates.</p>
          </div>
          <div className={styles.partnerActions}>
            <Link href="/become-a-partner" className="btn btn-white btn-lg">List your bus</Link>
            <Link href="/login?role=operator" className="btn btn-ghost btn-lg">Operator sign in</Link>
          </div>
        </div>
      </section>
    </>
  );
}
