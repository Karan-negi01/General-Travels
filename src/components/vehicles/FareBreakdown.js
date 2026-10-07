import { formatINR, formatNumber } from "@/lib/format";
import styles from "./FareBreakdown.module.css";

// Line-by-line fare so customers can see exactly how the fixed price is built.
export default function FareBreakdown({ fare, compact = false }) {
  const usesMinimum = fare.billableKm > fare.tripKm;
  return (
    <dl className={`${styles.list} ${compact ? styles.compact : ""}`}>
      <div>
        <dt>
          {formatNumber(fare.billableKm)} km × {formatINR(fare.ratePerKm)}
          <small>
            {usesMinimum
              ? `Minimum ${formatNumber(fare.minimumKm)} km for ${fare.days} day${fare.days > 1 ? "s" : ""}${fare.tripKm ? ` (route ≈ ${formatNumber(fare.tripKm)} km)` : ""}`
              : `Route ≈ ${formatNumber(fare.tripKm)} km`}
          </small>
        </dt>
        <dd>{formatINR(fare.kmCharge)}</dd>
      </div>
      <div>
        <dt>
          Driver allowance
          <small>{formatINR(fare.driverAllowancePerDay)} × {fare.days} day{fare.days > 1 ? "s" : ""}</small>
        </dt>
        <dd>{formatINR(fare.driverAllowance)}</dd>
      </div>
      <div>
        <dt>GST (5%)</dt>
        <dd>{formatINR(fare.gst)}</dd>
      </div>
      <div className={styles.total}>
        <dt>Total fare</dt>
        <dd>{formatINR(fare.total)}</dd>
      </div>
      <p className={styles.note}>Tolls, parking and state permits are paid at actuals during the trip.</p>
    </dl>
  );
}
