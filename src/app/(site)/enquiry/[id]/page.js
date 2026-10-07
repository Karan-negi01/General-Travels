import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, Phone, Mail } from "lucide-react";
import { getEnquiryWithQuotes } from "@/lib/data/queries";
import { acceptQuote } from "@/lib/actions/enquiry";
import { getVehicleType, labelFor, TRIP_TYPES } from "@/lib/constants/vehicles";
import { QUOTE_INCLUSIONS } from "@/lib/constants/quotes";
import { formatINR, formatDateRange } from "@/lib/format";
import AmenityList from "@/components/vehicles/AmenityList";
import Badge from "@/components/ui/Badge";
import styles from "./page.module.css";

export const metadata = {
  title: "Your enquiry",
  robots: { index: false },
};

export default async function EnquiryPage({ params, searchParams }) {
  const { id } = await params;
  const { created } = await searchParams;
  const data = await getEnquiryWithQuotes(id);
  if (!data) notFound();
  const { enquiry, quotes } = data;
  const isOpen = enquiry.status === "open";

  return (
    <div className={`container ${styles.page}`}>
      {created && (
        <p className="alert alert-success">
          Requirement received. Matching operators have been notified. Keep this page link to check your quotes.
        </p>
      )}

      <section className={`card ${styles.summary}`}>
        <div className={styles.summaryHead}>
          <div>
            <p className="hint">Enquiry {enquiry.id}</p>
            <h1 className={styles.route}>
              {enquiry.pickupCity}
              {enquiry.dropCity && <> → {enquiry.dropCity}</>}
            </h1>
          </div>
          <Badge status={enquiry.status} />
        </div>
        <dl className={styles.facts}>
          <div><dt>Trip</dt><dd>{labelFor(TRIP_TYPES, enquiry.tripType)}</dd></div>
          <div><dt>Dates</dt><dd>{formatDateRange(enquiry.startDate, enquiry.endDate)}</dd></div>
          <div><dt>Passengers</dt><dd>{enquiry.passengers}</dd></div>
          <div><dt>Vehicle</dt><dd>{enquiry.vehicleType ? getVehicleType(enquiry.vehicleType)?.label : "Any"}</dd></div>
        </dl>
        {enquiry.requiredAmenities.length > 0 && <AmenityList ids={enquiry.requiredAmenities} />}
      </section>

      <h2 className={styles.h2}>
        {quotes.length} quote{quotes.length === 1 ? "" : "s"} received
      </h2>

      {quotes.length === 0 && (
        <div className="card muted">
          No quotes yet. Operators usually respond within a few hours. Refresh this page to check again.
        </div>
      )}

      <div className="stack">
        {quotes.map((q, i) => (
          <article key={q.id} className={`card ${styles.quote} ${q.status === "accepted" ? styles.accepted : ""}`}>
            <div className={styles.quoteMain}>
              <div className={styles.quoteHead}>
                <h3>{q.vehicle?.title ?? "Vehicle"}</h3>
                {i === 0 && isOpen && quotes.length > 1 && <Badge tone="brand">Lowest price</Badge>}
                {q.status !== "submitted" && <Badge status={q.status} />}
              </div>
              <p className="muted">
                {q.vehicle?.seats} seats · {q.vehicle?.ac ? "AC" : "Non-AC"} · {q.vehicle?.operator.label}
              </p>
              {q.vehicle && <AmenityList ids={q.vehicle.amenities} limit={8} highlight={enquiry.requiredAmenities} />}
              {q.includes.length > 0 && (
                <p className={styles.includes}>
                  Includes: {q.includes.map((id) => labelFor(QUOTE_INCLUSIONS, id)).join(", ")}
                </p>
              )}
              {q.notes && <p className={styles.notes}>“{q.notes}”</p>}

              {q.vendorContact && (
                <div className={styles.contact}>
                  <p><CheckCircle2 size={16} /> Booking confirmed with <strong>{q.vendorContact.name}</strong></p>
                  <p><Phone size={14} /> {q.vendorContact.contactName}, {q.vendorContact.phone}</p>
                  <p><Mail size={14} /> {q.vendorContact.email}</p>
                </div>
              )}
            </div>
            <div className={styles.quoteAside}>
              <p className={styles.amount}>{formatINR(q.amount)}</p>
              <p className="hint">Total trip price</p>
              {isOpen && (
                <form action={acceptQuote}>
                  <input type="hidden" name="quoteId" value={q.id} />
                  <input type="hidden" name="enquiryId" value={enquiry.id} />
                  <button type="submit" className="btn btn-primary">Accept quote</button>
                </form>
              )}
            </div>
          </article>
        ))}
      </div>

      <p className={styles.footerLink}>
        <Link href="/buses">← Browse more vehicles</Link>
      </p>
    </div>
  );
}
