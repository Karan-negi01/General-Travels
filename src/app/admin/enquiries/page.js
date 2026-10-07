import Link from "next/link";
import { getAllEnquiries } from "@/lib/data/queries";
import { labelFor, CUSTOMER_TYPES } from "@/lib/constants/vehicles";
import { formatDateRange } from "@/lib/format";
import PageHeader from "@/components/ui/PageHeader";
import Badge from "@/components/ui/Badge";

export const metadata = { title: "Enquiries" };

export default async function AdminEnquiriesPage() {
  const enquiries = await getAllEnquiries();
  return (
    <>
      <PageHeader title="Enquiries" description="Every customer requirement and how many quotes it has received." />
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Route</th>
              <th>Dates</th>
              <th>Pax</th>
              <th>Customer</th>
              <th>Quotes</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {enquiries.map((e) => (
              <tr key={e.id}>
                <td>
                  <Link href={`/enquiry/${e.id}`} style={{ color: "var(--brand-600)", fontWeight: 600 }}>
                    {e.pickupCity}{e.dropCity && ` → ${e.dropCity}`}
                  </Link>
                </td>
                <td>{formatDateRange(e.startDate, e.endDate)}</td>
                <td>{e.passengers}</td>
                <td>
                  {e.customerName}
                  <div className="hint">{e.organisation || labelFor(CUSTOMER_TYPES, e.customerType)} · {e.phone}</div>
                </td>
                <td>{e.quoteCount}</td>
                <td><Badge status={e.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
