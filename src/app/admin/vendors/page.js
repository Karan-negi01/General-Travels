import { getAllVendors } from "@/lib/data/queries";
import { setVendorStatus } from "@/lib/actions/admin";
import { formatDate } from "@/lib/format";
import PageHeader from "@/components/ui/PageHeader";
import Badge from "@/components/ui/Badge";
import ReviewActions from "@/components/ui/ReviewActions";

export const metadata = { title: "Vendors" };

const DOCS = { gst: "GST", pan: "PAN", businessProof: "Business proof" };

export default async function AdminVendorsPage() {
  const vendors = await getAllVendors();
  return (
    <>
      <PageHeader title="Vendors" description="Verify documents before a vendor can receive trip requests." />
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Vendor</th>
              <th>Contact</th>
              <th>Documents</th>
              <th>Vehicles</th>
              <th>Onboarding</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {vendors.map((v) => (
              <tr key={v.id}>
                <td>
                  <strong>{v.name}</strong>
                  <div className="hint">{v.city} · joined {formatDate(v.createdAt)}</div>
                </td>
                <td>
                  {v.contactName}
                  <div className="hint">{v.phone}</div>
                </td>
                <td>
                  {Object.entries(DOCS).map(([key, label]) => (
                    <div key={key} className="hint">{v.documents?.[key] ? "✓" : "✗"} {label}</div>
                  ))}
                </td>
                <td>{v.vehicleCount}</td>
                <td style={{ textTransform: "capitalize" }}>{v.onboarding}</td>
                <td><Badge status={v.status} /></td>
                <td><ReviewActions id={v.id} status={v.status} action={setVendorStatus} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
