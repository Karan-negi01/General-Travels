import { CITIES, VEHICLE_TYPES } from "@/lib/constants/vehicles";
import styles from "./SearchBar.module.css";

// Plain GET form → /buses?city=..&passengers=..&type=..  (no JS needed)
export default function SearchBar({ defaults = {} }) {
  return (
    <form action="/buses" className={styles.bar}>
      <div className="field">
        <label htmlFor="sb-city">Pickup city</label>
        <select id="sb-city" name="city" className="select" defaultValue={defaults.city ?? ""}>
          <option value="">Any city</option>
          {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div className="field">
        <label htmlFor="sb-pax">Passengers</label>
        <input id="sb-pax" name="passengers" type="number" min="1" max="500" className="input" placeholder="e.g. 25" defaultValue={defaults.passengers ?? ""} />
      </div>
      <div className="field">
        <label htmlFor="sb-type">Vehicle type</label>
        <select id="sb-type" name="type" className="select" defaultValue={defaults.type ?? ""}>
          <option value="">Any vehicle</option>
          {VEHICLE_TYPES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
        </select>
      </div>
      <button type="submit" className="btn btn-primary">Search vehicles</button>
    </form>
  );
}
