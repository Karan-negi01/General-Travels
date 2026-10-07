import Link from "next/link";
import { notFound } from "next/navigation";
import { Bus, Users, MapPin, Calendar, ShieldCheck, Snowflake } from "lucide-react";
import { getPublicVehicle } from "@/lib/data/queries";
import { getVehicleType } from "@/lib/constants/vehicles";
import { amenitiesByCategory } from "@/lib/constants/amenities";
import { formatINR } from "@/lib/format";
import AmenityIcon from "@/components/vehicles/AmenityIcon";
import styles from "./page.module.css";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const vehicle = await getPublicVehicle(id);
  return { title: vehicle ? vehicle.title : "Vehicle not found" };
}

export default async function VehiclePage({ params }) {
  const { id } = await params;
  const vehicle = await getPublicVehicle(id);
  if (!vehicle) notFound();

  const type = getVehicleType(vehicle.type);
  const groups = amenitiesByCategory()
    .map((g) => ({ ...g, items: g.items.filter((a) => vehicle.amenities.includes(a.id)) }))
    .filter((g) => g.items.length > 0);

  return (
    <div className={`container ${styles.page}`}>
      <Link href="/buses" className={styles.back}>← All vehicles</Link>

      <div className={styles.layout}>
        <div className="stack">
          <div className={styles.gallery} aria-hidden="true">
            <Bus size={72} strokeWidth={1.2} />
            <span>Photos coming soon</span>
          </div>

          <div>
            <p className={styles.type}>{type?.label}</p>
            <h1 className={styles.title}>{vehicle.title}</h1>
            <ul className={styles.facts}>
              <li><Users size={16} /> {vehicle.seats} seats</li>
              <li><Snowflake size={16} /> {vehicle.ac ? "Air-conditioned" : "Non-AC"}</li>
              <li><Calendar size={16} /> {vehicle.modelYear} model</li>
              <li><MapPin size={16} /> Based in {vehicle.baseCity}</li>
              {vehicle.operator.verified && <li className={styles.verified}><ShieldCheck size={16} /> Verified operator</li>}
            </ul>
          </div>

          <section className="card">
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

          <section className="card">
            <h2 className={styles.h2}>Serves these cities</h2>
            <p className="muted">{vehicle.serviceCities.join(" · ")}</p>
          </section>
        </div>

        <aside className={`card ${styles.priceCard}`}>
          <p className="muted">Indicative rate</p>
          <p className={styles.price}>{formatINR(vehicle.ratePerKm)}<span> / km</span></p>
          <dl className={styles.terms}>
            <div><dt>Minimum per day</dt><dd>{vehicle.minKmPerDay} km</dd></div>
            <div><dt>Driver allowance</dt><dd>{formatINR(vehicle.driverAllowancePerDay)} / day</dd></div>
          </dl>
          <Link href={`/enquiry/new?vehicle=${vehicle.id}`} className="btn btn-primary">Request a quote</Link>
          <p className="hint">
            Share your route and dates. You&apos;ll get a firm quote from this operator and similar vehicles, all booked
            through General Travels.
          </p>
        </aside>
      </div>
    </div>
  );
}
