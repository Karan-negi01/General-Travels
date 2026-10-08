import Link from "next/link";
import { Users, Snowflake, ShieldCheck, CalendarX } from "lucide-react";
import { getVehicleType } from "@/lib/constants/vehicles";
import { formatINR, formatNumber } from "@/lib/format";
import AmenityList from "./AmenityList";
import BusPhoto from "./BusPhoto";
import styles from "./BusCard.module.css";

// `query` carries the customer's trip to the detail page so the fare follows along.
export default function BusCard({ bus, query = "", highlight = [] }) {
  const type = getVehicleType(bus.type);
  const href = `/buses/${bus.id}${query ? `?${query}` : ""}`;
  return (
    <div className={styles.wrap}>
      <article className={`${styles.card} ${bus.available ? "" : styles.unavailable}`}>
        <Link href={href} className={styles.media} tabIndex={-1} aria-hidden="true">
          <BusPhoto type={bus.type} sizes="(max-width: 520px) 100vw, 240px" />
          <span className={styles.typeTag}>{type?.label.split(" (")[0]}</span>
        </Link>

        <div className={styles.body}>
          <h3 className={styles.title}><Link href={href}>{bus.title}</Link></h3>
          <p className={styles.meta}>
            <span><Users size={14} /> {bus.seats} seats</span>
            <span><Snowflake size={14} /> {bus.ac ? "AC" : "Non-AC"}</span>
            <span>{bus.modelYear} model</span>
            <span className={styles.verified}><ShieldCheck size={14} /> {bus.operator.label}</span>
          </p>
          <AmenityList ids={bus.amenities} limit={5} highlight={highlight} />
        </div>

        <div className={styles.aside}>
          <div>
            {bus.fare ? (
              <>
                <p className={styles.priceLabel}>Total fare</p>
                <p className={styles.price}>{formatINR(bus.fare.total)}</p>
                <p className={styles.priceNote}>
                  {bus.fare.days} day{bus.fare.days > 1 ? "s" : ""} · {formatNumber(bus.fare.billableKm)} km · incl. GST
                </p>
              </>
            ) : (
              <>
                <p className={styles.priceLabel}>From</p>
                <p className={styles.price}>{formatINR(bus.ratePerKm)}<span>/km</span></p>
                <p className={styles.priceNote}>Enter your trip to see the exact fare</p>
              </>
            )}
          </div>
          {bus.available ? (
            <Link href={href} className="btn btn-primary btn-sm">{bus.fare ? "Book this bus" : "View & book"}</Link>
          ) : (
            <p className={styles.booked}><CalendarX size={14} /> Booked on your dates</p>
          )}
        </div>
      </article>
    </div>
  );
}
