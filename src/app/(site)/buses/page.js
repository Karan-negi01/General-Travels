import Link from "next/link";
import { ArrowRight, Info } from "lucide-react";
import { searchBuses } from "@/lib/data/queries";
import { parseTrip, tripToParams } from "@/lib/pricing";
import { VEHICLE_TYPES } from "@/lib/constants/vehicles";
import { isValidAmenity } from "@/lib/constants/amenities";
import { formatDateRange } from "@/lib/format";
import TripSearch from "@/components/forms/TripSearch";
import AmenityPicker from "@/components/vehicles/AmenityPicker";
import BusCard from "@/components/vehicles/BusCard";
import EmptyState from "@/components/ui/EmptyState";
import styles from "./results.module.css";

export const metadata = {
  title: "Find a bus",
};

function toArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

export default async function BusesPage({ searchParams }) {
  const params = await searchParams;
  const { trip, complete, errors } = parseTrip(params);
  const hasTripInput = Boolean(params.from || params.start);

  const criteria = {
    city: trip.from || undefined,
    passengers: trip.passengers || undefined,
    type: VEHICLE_TYPES.some((t) => t.id === params.type) ? params.type : undefined,
    ac: params.ac === "on",
    amenities: toArray(params.amenities).filter(isValidAmenity),
  };
  const buses = await searchBuses(criteria, complete ? trip : null);
  const available = buses.filter((b) => b.available).length;

  const tripQuery = complete ? tripToParams(trip).toString() : "";
  const route = trip.from === trip.to ? `Local in ${trip.from}` : `${trip.from} → ${trip.to}`;

  return (
    <>
      <section className={styles.band}>
        <div className="container">
          <p className="eyebrow">Book a bus</p>
          <h1 className={styles.title}>{complete ? route : "Where are you headed?"}</h1>
          {complete && (
            <p className={styles.subtitle}>
              {formatDateRange(trip.startDate, trip.endDate)} · {trip.tripType === "round-trip" ? "Round trip" : "One way"}
              {trip.passengers ? ` · ${trip.passengers} passengers` : ""}
            </p>
          )}
          <div className={styles.searchCard}>
            <TripSearch trip={trip} hidden={criteria.type ? { type: criteria.type } : {}} submitLabel="Update" />
          </div>
        </div>
      </section>

      <div className={`container ${styles.layout}`}>
        <aside className={styles.filters}>
          <form action="/buses" className="stack">
            {[...tripToParams(trip)].map(([name, value]) => (
              <input key={name} type="hidden" name={name} value={value} />
            ))}
            <div className={styles.filterHead}>
              <h2>Refine</h2>
              <Link href={`/buses${tripQuery ? `?${tripQuery}` : ""}`} className={styles.reset}>Clear</Link>
            </div>
            <div className="field">
              <label htmlFor="f-type">Vehicle type</label>
              <select id="f-type" name="type" className="select" defaultValue={criteria.type ?? ""}>
                <option value="">Any vehicle</option>
                {VEHICLE_TYPES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
              </select>
            </div>
            <label className="check">
              <input type="checkbox" name="ac" defaultChecked={criteria.ac} /> Air-conditioned only
            </label>
            <details className={styles.more} open={criteria.amenities.length > 0}>
              <summary>
                Must-have amenities{criteria.amenities.length > 0 && ` · ${criteria.amenities.length}`}
              </summary>
              <AmenityPicker selected={criteria.amenities} compact />
            </details>
            <button type="submit" className="btn btn-secondary">Apply</button>
          </form>
        </aside>

        <section className={styles.results}>
          {hasTripInput && !complete && (
            <p className="alert alert-error">{Object.values(errors)[0]}</p>
          )}
          {!complete && !hasTripInput && (
            <p className={`alert alert-info ${styles.hintBar}`}>
              <Info size={16} /> Add your route and dates above to see the exact fare and availability for each bus.
            </p>
          )}

          <div className={styles.resultsHead}>
            <p>
              <strong>{complete ? available : buses.length}</strong>{" "}
              {complete ? `bus${available === 1 ? "" : "es"} available` : `bus${buses.length === 1 ? "" : "es"} on General Travels`}
            </p>
            {complete && <p className="hint">Sorted by total fare · All fares include GST</p>}
          </div>

          {buses.length === 0 ? (
            <EmptyState
              title="No buses match yet"
              text="Try a different vehicle type, fewer must-have amenities, or a nearby pickup city."
            >
              <Link href="/buses" className="btn btn-outline">Clear all filters</Link>
            </EmptyState>
          ) : (
            <div className="stack">
              {buses.map((bus) => (
                <BusCard key={bus.id} bus={bus} query={tripQuery} highlight={criteria.amenities} />
              ))}
            </div>
          )}

          <p className={styles.partnerNote}>
            Own a bus? <Link href="/become-a-partner">List it on General Travels <ArrowRight size={14} /></Link>
          </p>
        </section>
      </div>
    </>
  );
}
