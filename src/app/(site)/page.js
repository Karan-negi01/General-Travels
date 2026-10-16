import Link from "next/link";
import {
  ArrowRight,
  BadgeIndianRupee,
  ShieldCheck,
  ReceiptText,
  Search,
  CreditCard,
  IdCard,
  Users,
  Snowflake,
  Wallet,
  CalendarX2,
  BadgeCheck,
  MapPin,
  Star,
} from "lucide-react";
import TripSearch from "@/components/forms/TripSearch";
import BusPhoto from "@/components/vehicles/BusPhoto";
import { VEHICLE_TYPES, getVehicleType, labelFor, SEATING } from "@/lib/constants/vehicles";
import { searchBuses, getPlatformStats } from "@/lib/data/queries";
import { formatINR, todayISO } from "@/lib/format";
import styles from "./home.module.css";

const OFFERS = [
  { icon: Wallet, tone: "coral", title: "Pay just 25% to book", text: "Lock your bus with a 25% advance and pay the rest before the trip." },
  { icon: CalendarX2, tone: "teal", title: "Full refund before trip day", text: "Plans changed? Cancel online before the trip day and get everything back." },
  { icon: ReceiptText, tone: "violet", title: "GST invoice, every trip", text: "Proper invoices for companies, schools and government travel desks." },
];

const STEPS = [
  { icon: Search, title: "Search & compare", text: "Pick your route, dates and group size. Compare up to 5 buses side by side." },
  { icon: CreditCard, title: "Pay & it's confirmed", text: "One fixed fare with GST. Pay online and your bus is confirmed instantly." },
  { icon: IdCard, title: "Meet your driver", text: "Get the driver's name, photo and number right away. Every licence is verified." },
];

const WHY = [
  { icon: BadgeIndianRupee, title: "Fixed fares", text: "Rate per km, driver allowance and GST shown upfront. No haggling." },
  { icon: ShieldCheck, title: "Verified 3 ways", text: "Every owner, every bus and every driver is checked before going live." },
  { icon: BadgeCheck, title: "Real availability", text: "Owners keep their calendars updated, so what you see is really free." },
  { icon: Users, title: "Built for groups", text: "Offsites, weddings, school trips and family holidays, 9 to 55 seats." },
];

// Routes shown with a live "from" price for a one-day round trip a week out.
// Routes with no available bus are left out.
const ROUTES = [
  { from: "Delhi", to: "Agra", note: "Taj Mahal day trip", tone: "coral" },
  { from: "Delhi", to: "Jaipur", note: "The Pink City", tone: "rose" },
  { from: "Chandigarh", to: "Shimla", note: "Into the hills", tone: "teal" },
  { from: "Delhi", to: "Dehradun", note: "Gateway to Mussoorie", tone: "green" },
  { from: "Delhi", to: "Manali", note: "Mountain getaway", tone: "blue" },
  { from: "Delhi", to: "Lucknow", note: "City of Nawabs", tone: "violet" },
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
      return { ...r, price: buses.length ? Math.min(...buses.map((b) => b.fare.total)) : null, count: buses.length, href: `/buses?${query}` };
    })
  );
  return priced.filter((r) => r.price !== null);
}

export default async function HomePage() {
  const [featured, stats, routes] = await Promise.all([searchBuses(), getPlatformStats(), routesWithPrices()]);
  const cheapest = routes.toSorted((a, b) => a.price - b.price)[0];

  return (
    <>
      {/* ---------- Hero + search ---------- */}
      <section className={styles.hero}>
        <div className={`container ${styles.heroGrid}`}>
          <div className={styles.heroCopy}>
            <p className={styles.pill}><ShieldCheck size={15} /> {stats.buses} verified buses · {stats.cities} pickup cities</p>
            <h1 className={styles.heroTitle}>
              Book a bus for your <span>group trip</span>
            </h1>
            <p className={styles.heroText}>
              Tempo travellers, mini buses and luxury coaches with verified drivers. See the exact fare, pay online and
              you&apos;re confirmed in minutes.
            </p>
          </div>
          <div className={styles.heroArt} aria-hidden="true">
            <div className={styles.heroPhoto}>
              <BusPhoto type="luxury-van" sizes="(max-width: 900px) 0px, 520px" priority />
            </div>
            <div className={`${styles.float} ${styles.floatTop}`}>
              <span className={styles.floatIcon}><BadgeCheck size={18} /></span>
              <div>
                <strong>Driver verified</strong>
                <span>Licence &amp; ID checked</span>
              </div>
            </div>
            {cheapest && (
              <div className={`${styles.float} ${styles.floatBottom}`}>
                <span className={`${styles.floatIcon} ${styles.floatCoral}`}><MapPin size={18} /></span>
                <div>
                  <strong>{cheapest.from} → {cheapest.to}</strong>
                  <span>from {formatINR(cheapest.price)}, all-inclusive</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="container">
          <div className={styles.searchCard}>
            <TripSearch />
          </div>
        </div>
      </section>

      {/* ---------- Vehicle types ---------- */}
      <section className={`container ${styles.section}`}>
        <div className={styles.head}>
          <h2 className={styles.title}>What are you looking for?</h2>
          <Link href="/buses" className={styles.more}>See all buses <ArrowRight size={16} /></Link>
        </div>
        <div className={styles.types}>
          {VEHICLE_TYPES.map((t) => (
            <Link key={t.id} href={`/buses?type=${t.id}`} className={styles.type}>
              <span className={styles.typePhoto}><BusPhoto type={t.id} sizes="200px" /></span>
              <strong>{t.label.split(" (")[0]}</strong>
              <span>{t.seatRange[0]}–{t.seatRange[1]} seats</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ---------- Offers ---------- */}
      <section className={`container ${styles.sectionTight}`}>
        <div className={styles.offers}>
          {OFFERS.map(({ icon: Icon, tone, title, text }) => (
            <div key={title} className={`${styles.offer} ${styles[tone]}`}>
              <span className={styles.offerIcon}><Icon size={22} /></span>
              <div>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- Popular routes ---------- */}
      {routes.length > 0 && (
        <section className={`container ${styles.section}`}>
          <div className={styles.head}>
            <div>
              <h2 className={styles.title}>Popular routes</h2>
              <p className={styles.sub}>Lowest fare for a one-day round trip, GST included</p>
            </div>
          </div>
          <div className={styles.routes}>
            {routes.map((r) => (
              <Link key={`${r.from}-${r.to}`} href={r.href} className={`${styles.route} ${styles[r.tone]}`}>
                <span className={styles.routeNote}>{r.note}</span>
                <strong className={styles.routeName}>{r.from} <ArrowRight size={16} /> {r.to}</strong>
                <span className={styles.routeFoot}>
                  <span>from <b>{formatINR(r.price)}</b></span>
                  <span className={styles.routeCount}>{r.count} bus{r.count === 1 ? "" : "es"}</span>
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ---------- Featured buses ---------- */}
      {featured.length > 0 && (
        <section className={`container ${styles.section}`}>
          <div className={styles.head}>
            <div>
              <h2 className={styles.title}>Top picks for groups</h2>
              <p className={styles.sub}>Verified buses ready to book</p>
            </div>
            <Link href="/buses" className={styles.more}>View all <ArrowRight size={16} /></Link>
          </div>
          <div className={styles.featured}>
            {featured.slice(0, 4).map((bus) => (
              <Link key={bus.id} href={`/buses/${bus.id}`} className={styles.card}>
                <div className={styles.cardImage}>
                  <BusPhoto type={bus.type} src={bus.photoUrls[0]} alt={bus.title} sizes="(max-width: 760px) 100vw, 300px" />
                  <span className={styles.cardTag}><ShieldCheck size={13} /> Verified</span>
                </div>
                <div className={styles.cardBody}>
                  <p className={styles.cardType}>{getVehicleType(bus.type)?.label.split(" (")[0]}</p>
                  <h3>{bus.title}</h3>
                  <p className={styles.chips}>
                    <span><Users size={13} /> {bus.seats}</span>
                    <span><Snowflake size={13} /> {bus.ac ? "AC" : "Non-AC"}</span>
                    <span>{labelFor(SEATING, bus.seating)}</span>
                  </p>
                  <div className={styles.cardFoot}>
                    <span><b>{formatINR(bus.ratePerKm)}</b>/km</span>
                    <span className={styles.cardCity}><MapPin size={13} /> {bus.baseCity}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ---------- How it works ---------- */}
      <section className={`container ${styles.section}`}>
        <div className={styles.howBox}>
          <div className={styles.howHead}>
            <h2 className={styles.title}>Booked in 3 easy steps</h2>
            <p className={styles.sub}>No phone calls, no waiting for quotes.</p>
          </div>
          <ol className={styles.steps}>
            {STEPS.map(({ icon: Icon, title, text }, i) => (
              <li key={title} className={styles.step}>
                <span className={styles.stepIcon}><Icon size={22} /><b>{i + 1}</b></span>
                <h3>{title}</h3>
                <p>{text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ---------- Why us ---------- */}
      <section className={`container ${styles.section}`}>
        <div className={styles.head}>
          <h2 className={styles.title}>Why book with General Travels</h2>
        </div>
        <div className={styles.why}>
          {WHY.map(({ icon: Icon, title, text }) => (
            <div key={title} className={styles.whyItem}>
              <Icon size={26} strokeWidth={1.8} />
              <h3>{title}</h3>
              <p>{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- Owners ---------- */}
      <section className={`container ${styles.sectionLast}`}>
        <div className={styles.partner}>
          <div className={styles.partnerCopy}>
            <p className={styles.partnerKicker}><Star size={14} /> For bus owners</p>
            <h2>Own a bus or tempo traveller? Get more bookings.</h2>
            <p>List your fleet, set your own rates and get paid after every trip. Paid bookings are confirmed for you, and you block the dates you&apos;re busy.</p>
            <div className={styles.partnerActions}>
              <Link href="/become-a-partner" className="btn btn-white btn-lg">List your bus</Link>
              <Link href="/login?role=operator" className={styles.partnerLink}>Owner sign in <ArrowRight size={16} /></Link>
            </div>
          </div>
          <div className={styles.partnerPhoto} aria-hidden="true">
            <BusPhoto type="tempo-traveller" sizes="(max-width: 900px) 100vw, 480px" />
          </div>
        </div>
      </section>
    </>
  );
}
