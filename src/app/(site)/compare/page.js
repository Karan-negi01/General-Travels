import Link from "next/link";
import { Check, Minus, ArrowLeft } from "lucide-react";
import { getBusesForCompare } from "@/lib/data/queries";
import { parseTrip, tripToParams } from "@/lib/pricing";
import { getVehicleType, labelFor, SEATING } from "@/lib/constants/vehicles";
import { AMENITIES } from "@/lib/constants/amenities";
import { formatINR, formatNumber, formatDateRange } from "@/lib/format";
import BusPhoto from "@/components/vehicles/BusPhoto";
import EmptyState from "@/components/ui/EmptyState";
import RemoveFromCompare from "@/components/compare/RemoveFromCompare";
import styles from "./compare.module.css";

export const metadata = { title: "Compare buses" };

export default async function ComparePage({ searchParams }) {
  const params = await searchParams;
  const ids = String(params.ids ?? "").split(",").filter(Boolean);
  const { trip, complete } = parseTrip(params);
  const buses = await getBusesForCompare(ids, complete ? trip : null);
  const tripQuery = complete ? tripToParams(trip).toString() : "";
  const back = `/buses${tripQuery ? `?${tripQuery}` : ""}`;

  if (buses.length === 0) {
    return (
      <div className={`container ${styles.page}`}>
        <EmptyState title="Nothing to compare yet" text="Tick “Compare” on up to 5 buses in the search results to see them side by side.">
          <Link href={back} className="btn btn-primary">Find buses</Link>
        </EmptyState>
      </div>
    );
  }

  // Only amenities at least one of these buses has, in the master list's order.
  const amenities = AMENITIES.filter((a) => buses.some((b) => b.amenities.includes(a.id)));
  const cheapest = complete ? Math.min(...buses.filter((b) => b.available).map((b) => b.fare.total)) : null;
  const without = (id) => {
    const rest = buses.map((b) => b.id).filter((x) => x !== id);
    return `/compare?ids=${rest.join(",")}${tripQuery ? `&${tripQuery}` : ""}`;
  };
  const yes = <Check size={16} className={styles.yes} aria-label="Yes" />;
  const no = <Minus size={16} className={styles.no} aria-label="No" />;

  const rows = [
    { label: "Vehicle type", cell: (b) => getVehicleType(b.type)?.label.split(" (")[0] },
    { label: "Seating", cell: (b) => labelFor(SEATING, b.seating) },
    { label: "Seats", cell: (b) => b.seats },
    { label: "Air-conditioned", cell: (b) => (b.ac ? yes : no) },
    { label: "Model year", cell: (b) => b.modelYear },
    { label: "Based in", cell: (b) => b.baseCity },
    { label: "Picks up from", cell: (b) => b.serviceCities.join(", ") },
    { label: "Rate per km", cell: (b) => formatINR(b.ratePerKm) },
    { label: "Minimum km per day", cell: (b) => formatNumber(b.minKmPerDay) },
    { label: "Driver allowance per day", cell: (b) => formatINR(b.driverAllowancePerDay) },
  ];

  return (
    <div className={`container ${styles.page}`}>
      <Link href={back} className={styles.back}><ArrowLeft size={16} /> Back to results</Link>
      <p className="eyebrow">Compare buses</p>
      <h1 className={styles.title}>{buses.length} buses side by side</h1>
      <p className="muted">
        {complete
          ? `${trip.from === trip.to ? `Local in ${trip.from}` : `${trip.from} → ${trip.to}`} · ${formatDateRange(trip.startDate, trip.endDate)}${trip.passengers ? ` · ${trip.passengers} passengers` : ""}. Fares include GST.`
          : "Add your route and dates in the search to see each bus's exact fare."}
      </p>

      <div className="table-wrap" style={{ marginTop: 24 }}>
        <table className={`table ${styles.table}`}>
          <thead>
            <tr>
              <th className={styles.rowHead} scope="col"><span className="sr-only">Detail</span></th>
              {buses.map((b) => (
                <th key={b.id} scope="col" className={styles.busHead}>
                  <div className={styles.photo}><BusPhoto type={b.type} src={b.photoUrls[0]} alt={b.title} sizes="220px" /></div>
                  <Link href={`/buses/${b.id}${tripQuery ? `?${tripQuery}` : ""}`} className={styles.busName}>{b.title}</Link>
                  <RemoveFromCompare busId={b.id} remainingHref={without(b.id)} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {complete && (
              <tr className={styles.fareRow}>
                <th scope="row">Total fare</th>
                {buses.map((b) => (
                  <td key={b.id}>
                    {b.available ? (
                      <>
                        <strong>{formatINR(b.fare.total)}</strong>
                        {b.fare.total === cheapest && buses.length > 1 && <span className={styles.best}>Lowest fare</span>}
                        <p className="hint">{formatNumber(b.fare.billableKm)} km · {b.fare.days} day{b.fare.days > 1 ? "s" : ""}</p>
                      </>
                    ) : (
                      <span className="hint">Not available on your dates</span>
                    )}
                  </td>
                ))}
              </tr>
            )}
            {rows.map((r) => (
              <tr key={r.label}>
                <th scope="row">{r.label}</th>
                {buses.map((b) => <td key={b.id}>{r.cell(b)}</td>)}
              </tr>
            ))}
            <tr className={styles.section}>
              <th scope="rowgroup" colSpan={buses.length + 1}>Amenities</th>
            </tr>
            {amenities.map((a) => (
              <tr key={a.id}>
                <th scope="row">{a.label}</th>
                {buses.map((b) => <td key={b.id}>{b.amenities.includes(a.id) ? yes : no}</td>)}
              </tr>
            ))}
            <tr>
              <th scope="row"><span className="sr-only">Book</span></th>
              {buses.map((b) => (
                <td key={b.id}>
                  <Link href={`/buses/${b.id}${tripQuery ? `?${tripQuery}` : ""}`} className="btn btn-primary btn-sm">
                    {complete && b.available ? "Book this bus" : "View bus"}
                  </Link>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
