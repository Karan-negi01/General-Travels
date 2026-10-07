import Link from "next/link";
import { searchVehicles } from "@/lib/data/queries";
import { CITIES, VEHICLE_TYPES } from "@/lib/constants/vehicles";
import { isValidAmenity } from "@/lib/constants/amenities";
import AmenityPicker from "@/components/vehicles/AmenityPicker";
import VehicleCard from "@/components/vehicles/VehicleCard";
import styles from "./page.module.css";

export const metadata = {
  title: "Browse buses & tempo travellers",
};

function toArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

export default async function BusesPage({ searchParams }) {
  const params = await searchParams;
  const criteria = {
    city: CITIES.includes(params.city) ? params.city : undefined,
    passengers: Number(params.passengers) > 0 ? Number(params.passengers) : undefined,
    type: VEHICLE_TYPES.some((t) => t.id === params.type) ? params.type : undefined,
    ac: params.ac === "on",
    amenities: toArray(params.amenities).filter(isValidAmenity),
  };
  const vehicles = await searchVehicles(criteria);

  const enquiryQuery = new URLSearchParams();
  if (criteria.city) enquiryQuery.set("city", criteria.city);
  if (criteria.passengers) enquiryQuery.set("passengers", criteria.passengers);
  if (criteria.type) enquiryQuery.set("type", criteria.type);
  criteria.amenities.forEach((a) => enquiryQuery.append("amenities", a));

  return (
    <div className={`container ${styles.layout}`}>
      <aside className={styles.filters}>
        <form action="/buses" className="stack">
          <div className={styles.filterHead}>
            <h2>Filters</h2>
            <Link href="/buses" className={styles.reset}>Reset</Link>
          </div>
          <div className="field">
            <label htmlFor="f-city">Pickup city</label>
            <select id="f-city" name="city" className="select" defaultValue={criteria.city ?? ""}>
              <option value="">Any city</option>
              {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="field">
            <label htmlFor="f-pax">Passengers</label>
            <input id="f-pax" name="passengers" type="number" min="1" className="input" defaultValue={criteria.passengers ?? ""} />
          </div>
          <div className="field">
            <label htmlFor="f-type">Vehicle type</label>
            <select id="f-type" name="type" className="select" defaultValue={criteria.type ?? ""}>
              <option value="">Any vehicle</option>
              {VEHICLE_TYPES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
            </select>
          </div>
          <label className="check">
            <input type="checkbox" name="ac" defaultChecked={criteria.ac} /> AC only
          </label>
          <div>
            <p className="label">Amenities</p>
            <AmenityPicker selected={criteria.amenities} compact />
          </div>
          <button type="submit" className={`btn btn-secondary ${styles.apply}`}>Apply filters</button>
        </form>
      </aside>

      <section className={styles.results}>
        <div className={styles.resultsHead}>
          <div>
            <h1>{vehicles.length} vehicle{vehicles.length === 1 ? "" : "s"} available</h1>
            <p className="muted">Prices are indicative per-km rates. Final price comes as a quote for your exact trip.</p>
          </div>
          <Link href={`/enquiry/new?${enquiryQuery}`} className="btn btn-primary">Get quotes for this trip</Link>
        </div>

        {vehicles.length === 0 ? (
          <div className={`card ${styles.empty}`}>
            <h2>No listed vehicle matches yet</h2>
            <p className="muted">Post your requirement anyway. Our team and partner operators will send you quotes.</p>
            <Link href={`/enquiry/new?${enquiryQuery}`} className="btn btn-primary">Post requirement</Link>
          </div>
        ) : (
          <div className="stack">
            {vehicles.map((v) => (
              <VehicleCard key={v.id} vehicle={v} highlight={criteria.amenities} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
