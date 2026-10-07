import { amenitiesByCategory } from "@/lib/constants/amenities";
import AmenityIcon from "./AmenityIcon";
import styles from "./AmenityPicker.module.css";

// Grouped checkbox grid. Works in plain HTML forms (name="amenities", multiple values),
// so it's usable from server and client components alike.
export default function AmenityPicker({ name = "amenities", selected = [], compact = false }) {
  const groups = amenitiesByCategory();
  return (
    <div className={`${styles.groups} ${compact ? styles.compact : ""}`}>
      {groups.map((group) => (
        <fieldset key={group.id} className={styles.group}>
          <legend className={styles.legend}>{group.label}</legend>
          <div className={styles.options}>
            {group.items.map((a) => (
              <label key={a.id} className={styles.option}>
                <input type="checkbox" name={name} value={a.id} defaultChecked={selected.includes(a.id)} />
                <span className={styles.tile}>
                  <AmenityIcon id={a.id} size={16} />
                  {a.label}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      ))}
    </div>
  );
}
