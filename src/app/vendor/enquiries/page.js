import { getCurrentVendorId } from "@/lib/auth";
import { getMatchingEnquiries } from "@/lib/data/queries";
import { getVehicleType, labelFor, TRIP_TYPES, CUSTOMER_TYPES } from "@/lib/constants/vehicles";
import { formatDateRange, formatINR } from "@/lib/format";
import PageHeader from "@/components/ui/PageHeader";
import AmenityList from "@/components/vehicles/AmenityList";
import QuoteForm from "@/components/forms/QuoteForm";
import Badge from "@/components/ui/Badge";
import styles from "./page.module.css";

export const metadata = { title: "Trip requests" };

export default async function VendorEnquiriesPage() {
  const enquiries = await getMatchingEnquiries(await getCurrentVendorId());

  return (
    <>
      <PageHeader
        title="Trip requests"
        description="Open requests that at least one of your approved vehicles can serve. Customer contact details are shared once they accept your quote."
      />
      {enquiries.length === 0 && <div className="card muted">No matching trip requests right now.</div>}
      <div className="stack">
        {enquiries.map((e) => (
          <article key={e.id} className="card">
            <div className={styles.head}>
              <div>
                <h2 className={styles.route}>
                  {e.pickupCity}{e.dropCity && <> → {e.dropCity}</>}
                </h2>
                <p className="muted">
                  {labelFor(TRIP_TYPES, e.tripType)} · {formatDateRange(e.startDate, e.endDate)} · {e.passengers} passengers ·{" "}
                  {e.vehicleType ? getVehicleType(e.vehicleType)?.label : "Any vehicle"}
                </p>
              </div>
              <div className={styles.badges}>
                <Badge tone="neutral">{labelFor(CUSTOMER_TYPES, e.customerType)}</Badge>
                {e.myQuote ? <Badge tone="success">Quoted {formatINR(e.myQuote.amount)}</Badge> : <Badge tone="warning">New</Badge>}
              </div>
            </div>
            {e.requiredAmenities.length > 0 && (
              <div className={styles.req}>
                <p className="hint">Must have</p>
                <AmenityList ids={e.requiredAmenities} />
              </div>
            )}
            {e.notes && <p className={styles.notes}>“{e.notes}”</p>}
            <QuoteForm enquiryId={e.id} vehicles={e.eligibleVehicles} existing={e.myQuote} />
          </article>
        ))}
      </div>
    </>
  );
}
