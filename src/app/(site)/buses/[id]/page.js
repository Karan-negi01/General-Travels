import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Users, Snowflake, Calendar, MapPin, ShieldCheck, CalendarX, LogIn } from "lucide-react";
import { getPublicBus } from "@/lib/data/queries";
import { getViewer } from "@/lib/auth";
import { parseTrip, tripToParams } from "@/lib/pricing";
import { getVehicleType } from "@/lib/constants/vehicles";
import { amenitiesByCategory } from "@/lib/constants/amenities";
import { formatINR, formatDateRange } from "@/lib/format";
import AmenityIcon from "@/components/vehicles/AmenityIcon";
import BusPhoto from "@/components/vehicles/BusPhoto";
import FareBreakdown from "@/components/vehicles/FareBreakdown";
import TripSearch from "@/components/forms/TripSearch";
import BookingForm from "@/components/forms/BookingForm";
import styles from "./detail.module.css";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const bus = await getPublicBus(id);
  return { title: bus ? bus.title : "Bus not found" };
}

export default async function BusPage({ params, searchParams }) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const { trip, complete } = parseTrip(query);
  const [bus, viewer] = await Promise.all([getPublicBus(id, complete ? trip : null), getViewer()]);
  if (!bus) notFound();

  const type = getVehicleType(bus.type);
  const groups = amenitiesByCategory()
    .map((g) => ({ ...g, items: g.items.filter((a) => bus.amenities.includes(a.id)) }))
    .filter((g) => g.items.length > 0);

  const tripParams = Object.fromEntries(tripToParams(trip));
  const here = `/buses/${bus.id}?${tripToParams(trip)}`;
  const tooMany = complete && trip.passengers > bus.seats;
  const wrongCity = complete && !bus.serviceCities.includes(trip.from);

  let panel;
  if (!complete) {
    panel = (
      <>
        <p className={styles.panelLabel}>Starting from</p>
        <p className={styles.rate}>{formatINR(bus.ratePerKm)}<span> / km</span></p>
        <p className="hint">Min {bus.minKmPerDay} km/day · Driver {formatINR(bus.driverAllowancePerDay)}/day · + GST</p>
        <hr className={styles.rule} />
        <p className={styles.panelTitle}>Get your exact fare</p>
        <TripSearch trip={trip} action={`/buses/${bus.id}`} layout="stack" submitLabel="Check fare & availability" />
      </>
    );
  } else {
    const route = trip.from === trip.to ? `Local in ${trip.from}` : `${trip.from} → ${trip.to}`;
    panel = (
      <>
        <div className={styles.tripSummary}>
          <div>
            <p className={styles.panelTitle}>{route}</p>
            <p className="hint">
              {formatDateRange(trip.startDate, trip.endDate)} · {trip.tripType === "round-trip" ? "Round trip" : "One way"}
              {trip.passengers ? ` · ${trip.passengers} pax` : ""}
            </p>
          </div>
          <details className={styles.change}>
            <summary>Change</summary>
            <TripSearch trip={trip} action={`/buses/${bus.id}`} layout="stack" submitLabel="Update fare" />
          </details>
        </div>
        <hr className={styles.rule} />
        {wrongCity ? (
          <p className="alert alert-warning">This bus doesn&apos;t pick up from {trip.from}. It serves {bus.serviceCities.join(", ")}.</p>
        ) : tooMany ? (
          <p className="alert alert-warning">This bus seats {bus.seats}. <Link href={`/buses?${tripToParams(trip)}`}><u>See bigger buses</u></Link></p>
        ) : !bus.available ? (
          <p className={`alert alert-error ${styles.unavailable}`}><CalendarX size={16} /> Already booked on these dates. Try other dates or <Link href={`/buses?${tripToParams(trip)}`}><u>another bus</u></Link>.</p>
        ) : (
          <>
            <FareBreakdown fare={bus.fare} />
            <hr className={styles.rule} />
            {viewer?.role === "customer" ? (
              <BookingForm busId={bus.id} tripParams={tripParams} total={formatINR(bus.fare.total)} />
            ) : (
              <div className="stack">
                <Link href={`/login?role=customer&next=${encodeURIComponent(here)}`} className="btn btn-primary btn-lg btn-block">
                  <LogIn size={18} /> Sign in to book
                </Link>
                <p className="hint" style={{ textAlign: "center" }}>
                  {viewer ? "You're signed in as an operator/admin. Sign in with a traveller account to book." : "Just your mobile number. New travellers get an account instantly."}
                </p>
              </div>
            )}
          </>
        )}
      </>
    );
  }

  return (
    <div className={`container ${styles.page}`}>
      <Link href={complete ? `/buses?${tripToParams(trip)}` : "/buses"} className={styles.back}>
        <ArrowLeft size={16} /> All buses
      </Link>

      <div className={styles.layout}>
        <div className={styles.main}>
          <div className={styles.gallery}>
            <BusPhoto type={bus.type} sizes="(max-width: 1000px) 100vw, 760px" priority />
          </div>

          <div>
            <p className="eyebrow">{type?.label}</p>
            <h1 className={styles.title}>{bus.title}</h1>
            <ul className={styles.facts}>
              <li><Users size={16} /> {bus.seats} seats</li>
              <li><Snowflake size={16} /> {bus.ac ? "Air-conditioned" : "Non-AC"}</li>
              <li><Calendar size={16} /> {bus.modelYear} model</li>
              <li><MapPin size={16} /> Based in {bus.baseCity}</li>
              <li className={styles.verified}><ShieldCheck size={16} /> {bus.operator.label}</li>
            </ul>
          </div>

          <section className={styles.block}>
            <h2 className={styles.h2}>Amenities</h2>
            <div className={styles.amenityGroups}>
              {groups.map((g) => (
                <div key={g.id}>
                  <h3 className={styles.groupTitle}>{g.label}</h3>
                  <ul className={styles.amenityList}>
                    {g.items.map((a) => (
                      <li key={a.id}><AmenityIcon id={a.id} size={18} /> {a.label}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          <section className={styles.block}>
            <h2 className={styles.h2}>Pickup cities</h2>
            <ul className={styles.cities}>
              {bus.serviceCities.map((c) => <li key={c}>{c}</li>)}
            </ul>
          </section>

          <section className={styles.block}>
            <h2 className={styles.h2}>How booking works</h2>
            <ol className={styles.howList}>
              <li><strong>Book at the fixed fare.</strong> No payment is taken now.</li>
              <li><strong>The operator confirms</strong> the bus for your dates, usually within a few hours.</li>
              <li><strong>Details are shared.</strong> You get the operator&apos;s contact and the vehicle number, and they get your pickup details.</li>
            </ol>
          </section>
        </div>

        <aside className={styles.panel}>{panel}</aside>
      </div>
    </div>
  );
}
