import { getAmenity } from "@/lib/constants/amenities";
import AmenityIcon from "./AmenityIcon";
import styles from "./AmenityList.module.css";

// Compact chips. `limit` shows the first N plus a "+X more" chip.
export default function AmenityList({ ids, limit, highlight = [] }) {
  const shown = limit ? ids.slice(0, limit) : ids;
  const hidden = ids.length - shown.length;
  return (
    <ul className={styles.list}>
      {shown.map((id) => {
        const amenity = getAmenity(id);
        if (!amenity) return null;
        return (
          <li key={id} className={`${styles.chip} ${highlight.includes(id) ? styles.match : ""}`}>
            <AmenityIcon id={id} size={14} />
            {amenity.label}
          </li>
        );
      })}
      {hidden > 0 && <li className={`${styles.chip} ${styles.more}`}>+{hidden} more</li>}
    </ul>
  );
}
