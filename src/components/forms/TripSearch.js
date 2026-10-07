import { Search } from "lucide-react";
import { CITIES, TRIP_TYPES } from "@/lib/constants/vehicles";
import { todayISO } from "@/lib/format";
import styles from "./TripSearch.module.css";

// Plain GET form (no JS needed). `layout="bar"` for the hero, "stack" for side panels.
// Field names match parseTrip() in lib/pricing.js.
export default function TripSearch({ trip = {}, action = "/buses", layout = "bar", submitLabel = "Search buses", hidden = {} }) {
  const today = todayISO();
  return (
    <form action={action} className={`${styles.form} ${styles[layout]}`}>
      {Object.entries(hidden).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
      <fieldset className={styles.tripType}>
        <legend className="sr-only">Trip type</legend>
        {TRIP_TYPES.map((t) => (
          <label key={t.id}>
            <input type="radio" name="tripType" value={t.id} defaultChecked={(trip.tripType ?? "round-trip") === t.id} />
            <span>{t.label}</span>
          </label>
        ))}
      </fieldset>

      <div className={styles.fields}>
        <div className="field">
          <label htmlFor={`${layout}-from`}>From</label>
          <select id={`${layout}-from`} name="from" className="select" defaultValue={trip.from ?? ""} required>
            <option value="" disabled>Pickup city</option>
            {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor={`${layout}-to`}>To</label>
          <select id={`${layout}-to`} name="to" className="select" defaultValue={trip.to && trip.to !== trip.from ? trip.to : ""}>
            <option value="">Local (same city)</option>
            {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor={`${layout}-start`}>Departure</label>
          <input id={`${layout}-start`} name="start" type="date" className="input" min={today} defaultValue={trip.startDate ?? ""} required />
        </div>
        <div className="field">
          <label htmlFor={`${layout}-end`}>Return / last day</label>
          <input id={`${layout}-end`} name="end" type="date" className="input" min={today} defaultValue={trip.endDate && trip.endDate !== trip.startDate ? trip.endDate : ""} />
        </div>
        <div className="field">
          <label htmlFor={`${layout}-pax`}>Passengers</label>
          <input id={`${layout}-pax`} name="passengers" type="number" min="1" max="60" className="input" placeholder="e.g. 20" defaultValue={trip.passengers ?? ""} />
        </div>
        <button type="submit" className={`btn btn-primary ${styles.submit}`}>
          <Search size={16} /> {submitLabel}
        </button>
      </div>
    </form>
  );
}
