import Link from "next/link";
import { Building2, Landmark, GraduationCap, PartyPopper, Users, ClipboardList, MessagesSquare, BadgeCheck } from "lucide-react";
import SearchBar from "@/components/forms/SearchBar";
import AmenityIcon from "@/components/vehicles/AmenityIcon";
import { getAmenity } from "@/lib/constants/amenities";
import styles from "./page.module.css";

const SEGMENTS = [
  { icon: Building2, title: "Corporates", text: "Offsites, employee transport and client visits." },
  { icon: Landmark, title: "Government", text: "Ministries, departments and official delegations." },
  { icon: GraduationCap, title: "Institutions", text: "Schools, hospitals and universities." },
  { icon: PartyPopper, title: "Events & weddings", text: "Guest movement for events of any size." },
  { icon: Users, title: "Groups & families", text: "Pilgrimages, holidays and weekend trips." },
];

const STEPS = [
  { icon: ClipboardList, title: "Share your trip", text: "Route, dates, group size and the amenities you need." },
  { icon: MessagesSquare, title: "Compare quotes", text: "Verified operators with matching vehicles send you their best price." },
  { icon: BadgeCheck, title: "Book with confidence", text: "Pick a quote. We confirm the booking and stay with you on the trip." },
];

const FEATURED_AMENITIES = ["wifi", "charging-ports", "ac", "blankets", "washroom", "meals", "gps", "cctv"];

export default function HomePage() {
  return (
    <>
      <section className={styles.hero}>
        <div className="container">
          <p className={styles.eyebrow}>Charter buses · Tempo travellers · Luxury coaches</p>
          <h1 className={styles.heroTitle}>Hire the right vehicle for your group, from operators we&apos;ve verified.</h1>
          <p className={styles.heroText}>
            Tell us where you&apos;re going. Operators with matching vehicles compete for your trip, so you get the right
            amenities at a fair price.
          </p>
          <div className={styles.search}>
            <SearchBar />
          </div>
          <p className={styles.heroAlt}>
            Planning something bigger? <Link href="/enquiry/new">Post a requirement and get quotes →</Link>
          </p>
        </div>
      </section>

      <section className={`container ${styles.section}`}>
        <h2 className={styles.sectionTitle}>How it works</h2>
        <ol className={styles.steps}>
          {STEPS.map(({ icon: Icon, title, text }, i) => (
            <li key={title} className="card">
              <span className={styles.stepNum}>{i + 1}</span>
              <Icon size={24} className={styles.stepIcon} />
              <h3>{title}</h3>
              <p className="muted">{text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className={`container ${styles.section}`}>
        <h2 className={styles.sectionTitle}>Who we serve</h2>
        <div className={styles.segments}>
          {SEGMENTS.map(({ icon: Icon, title, text }) => (
            <div key={title} className={styles.segment}>
              <Icon size={22} />
              <h3>{title}</h3>
              <p className="muted">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className={`container ${styles.section}`}>
        <h2 className={styles.sectionTitle}>Filter by the amenities that matter</h2>
        <div className={styles.amenities}>
          {FEATURED_AMENITIES.map((id) => (
            <Link key={id} href={`/buses?amenities=${id}`} className={styles.amenity}>
              <AmenityIcon id={id} size={20} />
              {getAmenity(id).label}
            </Link>
          ))}
        </div>
      </section>

      <section className="container">
        <div className={styles.partnerCta}>
          <div>
            <h2>Own buses or tempo travellers?</h2>
            <p>List your fleet on General Travels and receive trip requests from corporates, government bodies and groups.</p>
          </div>
          <Link href="/become-a-partner" className="btn btn-primary">Become a partner</Link>
        </div>
      </section>
    </>
  );
}
