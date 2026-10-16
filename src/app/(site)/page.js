import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeIndianRupee,
  ShieldCheck,
  LockKeyhole,
  ReceiptText,
  Search,
  CreditCard,
  IdCard,
  Building2,
  GraduationCap,
  PartyPopper,
  Users,
  Check,
} from "lucide-react";
import TripSearch from "@/components/forms/TripSearch";
import BusPhoto from "@/components/vehicles/BusPhoto";
import { HERO_PHOTO } from "@/lib/constants/photos";
import { VEHICLE_TYPES, getVehicleType, labelFor, SEATING } from "@/lib/constants/vehicles";
import { searchBuses, getPlatformStats } from "@/lib/data/queries";
import { formatINR, todayISO } from "@/lib/format";
import styles from "./home.module.css";

const STEPS = [
  { icon: Search, title: "Search and compare", text: "Enter your route, dates and group size. Filter by seating, AC and amenities, and compare up to five buses side by side." },
  { icon: CreditCard, title: "Pay and it's confirmed", text: "See one fixed fare with GST. Pay 25% or the full amount online and your bus is confirmed instantly." },
  { icon: IdCard, title: "Travel with a verified driver", text: "Get your driver's name, photo and number straight away. Every driver's licence is checked by our team." },
];

const PROMISES = [
  { icon: BadgeIndianRupee, title: "Fixed, upfront fares", text: "Rate per km, driver allowance and GST, shown line by line before you pay. No haggling." },
  { icon: ShieldCheck, title: "Verified three times", text: "Every owner, every bus and every driver is checked by our team before a listing goes live." },
  { icon: LockKeyhole, title: "Secure online payment", text: "Pay by UPI, card or net banking. Cancel before the trip day for a full refund." },
  { icon: ReceiptText, title: "GST invoices", text: "Proper invoices for every trip, ready for corporate, government and institution travel desks." },
];

const AUDIENCES = [
  { icon: Building2, title: "Corporate offsites", text: "Team outings, airport transfers and client visits." },
  { icon: GraduationCap, title: "Schools & colleges", text: "Excursions, industrial visits and sports meets." },
  { icon: PartyPopper, title: "Weddings & events", text: "Guest transfers between hotels and venues." },
  { icon: Users, title: "Family & pilgrim trips", text: "Char Dham, Vaishno Devi, hill holidays and more." },
];

// Routes shown with a live "from" price for a one-day round trip a week out.
// Routes with no available bus are left out.
const ROUTES = [
  { from: "Delhi", to: "Agra", note: "Taj Mahal day trip" },
  { from: "Delhi", to: "Jaipur", note: "The Pink City" },
  { from: "Chandigarh", to: "Shimla", note: "Into the hills" },
  { from: "Delhi", to: "Dehradun", note: "Gateway to Mussoorie" },
  { from: "Delhi", to: "Manali", note: "Mountain getaway" },
  { from: "Delhi", to: "Lucknow", note: "City of Nawabs" },
];

function nextWeek() {
  const d = new Date(`${todayISO()}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 7);
  return d.toISOString().slice(0, 10);
}

async function routesWithPrices() {
  const date = nextWeek();
  const priced = await Promise.all(
    ROUTES.map(async (r) => {
      const trip = { tripType: "round-trip", from: r.from, to: r.to, startDate: date, endDate: date, passengers: null };
      const buses = (await searchBuses({ city: r.from }, trip)).filter((b) => b.available);
      const query = new URLSearchParams({ tripType: "round-trip", from: r.from, to: r.to, start: date, end: date });
      return { ...r, price: buses.length ? Math.min(...buses.map((b) => b.fare.total)) : null, href: `/buses?${query}` };
    })
  );
  return priced.filter((r) => r.price !== null);
}

// The flagship type leads the fleet grid as the large tile.
const FLEET = [getVehicleType("luxury-coach"), ...VEHICLE_TYPES.filter((t) => t.id !== "luxury-coach")];

export default async function HomePage() {
  const [featured, stats, routes] = await Promise.all([searchBuses(), getPlatformStats(), routesWithPrices()]);

  return (
    <>
      {/* ---------- Hero ---------- */}
      <section className={styles.hero}>
        <div className={styles.heroImage} aria-hidden="true">
          <BusPhoto photo={HERO_PHOTO} sizes="100vw" priority />
        </div>
        <div className={`container ${styles.heroInner}`}>
          <p className={styles.kicker}>Premium bus &amp; coach hire across India</p>
          <h1 className={styles.heroTitle}>
            Travel together, <em>in a class of your own.</em>
          </h1>
          <p className={styles.heroText}>
            Luxury coaches, buses and tempo travellers from owners we&apos;ve verified ourselves. One fixed fare, paid
            online, confirmed instantly.
          </p>
          <ul className={styles.heroStats}>
            <li><strong>{stats.buses}</strong><span>verified buses live</span></li>
            <li><strong>{stats.operators}</strong><span>trusted fleet owners</span></li>
            <li><strong>{stats.cities}</strong><span>pickup cities</span></li>
          </ul>
        </div>
      </section>

      <div className="container">
        <div className={styles.searchCard}>
          <TripSearch />
        </div>
        <ul className={styles.trustRow}>
          <li><ShieldCheck size={16} /> Every owner, bus &amp; driver verified</li>
          <li><BadgeIndianRupee size={16} /> Fixed fares, GST included</li>
          <li><LockKeyhole size={16} /> Secure online payment</li>
          <li><ReceiptText size={16} /> GST invoice for every trip</li>
        </ul>
      </div>

      {/* ---------- Popular routes ---------- */}
      {routes.length > 0 && (
        <section className={`container ${styles.section}`}>
          <div className={styles.head}>
            <div>
              <p className={styles.eyebrow}>Popular routes</p>
              <h2 className={styles.title}>Where groups are <em>heading</em></h2>
            </div>
            <p className={styles.headNote}>Lowest fare for a one-day round trip, all-inclusive with GST.</p>
          </div>
          <div className={styles.routes}>
            {routes.map((r) => (
              <Link key={`${r.from}-${r.to}`} href={r.href} className={styles.route}>
                <span className={styles.routeNote}>{r.note}</span>
                <span className={styles.routeName}>
                  {r.from} <ArrowRight size={18} aria-label="to" /> {r.to}
                </span>
                <span className={styles.routeFoot}>
                  <span>from <strong>{formatINR(r.price)}</strong></span>
                  <span className={styles.routeGo}><ArrowUpRight size={16} /></span>
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ---------- How it works ---------- */}
      <section className={`container ${styles.section}`}>
        <div className={styles.head}>
          <div>
            <p className={styles.eyebrow}>How it works</p>
            <h2 className={styles.title}>Booked in minutes, <em>not phone calls</em></h2>
          </div>
          <Link href="/how-it-works" className={styles.textLink}>The full process <ArrowRight size={16} /></Link>
        </div>
        <ol className={styles.steps}>
          {STEPS.map(({ icon: Icon, title, text }, i) => (
            <li key={title} className={styles.step}>
              <span className={styles.stepNum}>0{i + 1}</span>
              <span className={styles.stepIcon}><Icon size={22} strokeWidth={1.7} /></span>
              <h3>{title}</h3>
              <p>{text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ---------- Fleet ---------- */}
      <section className={`container ${styles.section}`}>
        <div className={styles.head}>
          <div>
            <p className={styles.eyebrow}>The fleet</p>
            <h2 className={styles.title}>The right vehicle <em>for every group</em></h2>
          </div>
          <Link href="/buses" className={styles.textLink}>Browse all buses <ArrowRight size={16} /></Link>
        </div>
        <div className={styles.fleet}>
          {FLEET.map((t, i) => (
            <Link key={t.id} href={`/buses?type=${t.id}`} className={`${styles.fleetItem} ${i === 0 ? styles.fleetLead : ""}`}>
              <BusPhoto type={t.id} sizes={i === 0 ? "(max-width: 760px) 100vw, 600px" : "(max-width: 760px) 100vw, 300px"} />
              <span className={styles.fleetShade} />
              <span className={styles.fleetText}>
                <strong>{t.label.split(" (")[0]}</strong>
                <span>{t.seatRange[0]}–{t.seatRange[1]} seats</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ---------- Featured buses ---------- */}
      {featured.length > 0 && (
        <section className={`container ${styles.section}`}>
          <div className={styles.head}>
            <div>
              <p className={styles.eyebrow}>Ready to book</p>
              <h2 className={styles.title}>Handpicked <em>for you</em></h2>
            </div>
            <Link href="/buses" className={styles.textLink}>View all buses <ArrowRight size={16} /></Link>
          </div>
          <div className={styles.featured}>
            {featured.slice(0, 3).map((bus) => (
              <Link key={bus.id} href={`/buses/${bus.id}`} className={styles.card}>
                <div className={styles.cardImage}>
                  <BusPhoto type={bus.type} src={bus.photoUrls[0]} alt={bus.title} sizes="(max-width: 760px) 100vw, 380px" />
                  <span className={styles.cardTag}>{getVehicleType(bus.type)?.label.split(" (")[0]}</span>
                </div>
                <div className={styles.cardBody}>
                  <h3>{bus.title}</h3>
                  <p className={styles.cardMeta}>
                    {bus.seats} seats · {labelFor(SEATING, bus.seating)} · {bus.ac ? "AC" : "Non-AC"} · {bus.modelYear} model
                  </p>
                  <p className={styles.cardVerified}><ShieldCheck size={14} /> {bus.operator.label}</p>
                  <div className={styles.cardFoot}>
                    <span><strong>{formatINR(bus.ratePerKm)}</strong> / km</span>
                    <span className={styles.cardCta}>View &amp; book <ArrowRight size={14} /></span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ---------- Promises (dark band) ---------- */}
      <section className={styles.band}>
        <div className="container">
          <div className={styles.bandHead}>
            <p className={`${styles.eyebrow} ${styles.eyebrowLight}`}>Our promise</p>
            <h2 className={styles.bandTitle}>Group travel, <em>the way it should be</em></h2>
          </div>
          <div className={styles.promises}>
            {PROMISES.map(({ icon: Icon, title, text }) => (
              <div key={title} className={styles.promise}>
                <Icon size={26} strokeWidth={1.5} />
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Who it's for ---------- */}
      <section className={`container ${styles.section}`}>
        <div className={styles.split}>
          <div className={styles.splitCopy}>
            <p className={styles.eyebrow}>Built for groups</p>
            <h2 className={styles.title}>From boardrooms <em>to baraats</em></h2>
            <p className={styles.splitText}>
              Whether you&apos;re moving a team of 40 or a family of 12, you get the same verified buses, the same fixed
              fares and a proper GST invoice at the end.
            </p>
            <Link href="/buses" className="btn btn-primary btn-lg">Find your bus <ArrowRight size={18} /></Link>
          </div>
          <div className={styles.audiences}>
            {AUDIENCES.map(({ icon: Icon, title, text }) => (
              <div key={title} className={styles.audience}>
                <span className={styles.audienceIcon}><Icon size={20} strokeWidth={1.7} /></span>
                <div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Owners ---------- */}
      <section className={`container ${styles.sectionLast}`}>
        <div className={styles.partner}>
          <div className={styles.partnerImage} aria-hidden="true">
            <BusPhoto type="sleeper-coach" sizes="(max-width: 900px) 100vw, 560px" />
          </div>
          <div className={styles.partnerCopy}>
            <p className={`${styles.eyebrow} ${styles.eyebrowLight}`}>For bus owners</p>
            <h2>Own buses or <em>tempo travellers?</em></h2>
            <p>
              List your fleet once and get paid bookings from companies, schools and families at the rates you set.
            </p>
            <ul className={styles.partnerPoints}>
              <li><Check size={16} /> Paid bookings are confirmed for you, with nothing to accept</li>
              <li><Check size={16} /> Block the dates you&apos;re busy on your calendar</li>
              <li><Check size={16} /> Paid out automatically after every trip</li>
            </ul>
            <div className={styles.partnerActions}>
              <Link href="/become-a-partner" className="btn btn-white btn-lg">List your bus</Link>
              <Link href="/login?role=operator" className="btn btn-ghost btn-lg">Owner sign in</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
