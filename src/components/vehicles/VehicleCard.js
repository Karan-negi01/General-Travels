import Link from "next/link";
import { Bus, Users, MapPin, ShieldCheck } from "lucide-react";
import { getVehicleType } from "@/lib/constants/vehicles";
import { formatINR } from "@/lib/format";
import AmenityList from "./AmenityList";
import styles from "./VehicleCard.module.css";

export default function VehicleCard({ vehicle, highlight = [] }) {
  const type = getVehicleType(vehicle.type);
  return (
    <article className={styles.card}>
      <div className={styles.media} aria-hidden="true">
        <Bus size={40} strokeWidth={1.4} />
        <span className={styles.typeTag}>{type?.label}</span>
      </div>
      <div className={styles.body}>
        <div className={styles.head}>
          <h3 className={styles.title}>
            <Link href={`/buses/${vehicle.id}`}>{vehicle.title}</Link>
          </h3>
          <p className={styles.meta}>
            <span><Users size={14} /> {vehicle.seats} seats</span>
            <span>{vehicle.ac ? "AC" : "Non-AC"}</span>
            <span><MapPin size={14} /> {vehicle.baseCity}</span>
            {vehicle.operator.verified && (
              <span className={styles.verified}><ShieldCheck size={14} /> Verified</span>
            )}
          </p>
        </div>
        <AmenityList ids={vehicle.amenities} limit={6} highlight={highlight} />
      </div>
      <div className={styles.aside}>
        <p className={styles.price}>
          {formatINR(vehicle.ratePerKm)}
          <span>/km</span>
        </p>
        <p className={styles.priceNote}>Min {vehicle.minKmPerDay} km/day</p>
        <Link href={`/buses/${vehicle.id}`} className="btn btn-outline btn-sm">View details</Link>
        <Link href={`/enquiry/new?vehicle=${vehicle.id}`} className="btn btn-primary btn-sm">Get quotes</Link>
      </div>
    </article>
  );
}
