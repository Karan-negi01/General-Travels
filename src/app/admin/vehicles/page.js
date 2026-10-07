import { getAllVehicles } from "@/lib/data/queries";
import { setVehicleStatus } from "@/lib/actions/admin";
import { getVehicleType } from "@/lib/constants/vehicles";
import { formatINR } from "@/lib/format";
import PageHeader from "@/components/ui/PageHeader";
import Badge from "@/components/ui/Badge";
import ReviewActions from "@/components/ui/ReviewActions";
import AmenityList from "@/components/vehicles/AmenityList";

export const metadata = { title: "Vehicle listings" };

const DOCS = { rc: "RC", insurance: "Insurance", permit: "Permit", fitness: "Fitness" };

export default async function AdminVehiclesPage() {
  const vehicles = await getAllVehicles();
  return (
    <>
      <PageHeader
        title="Vehicle listings"
        description="Check photos and documents. Make sure no phone numbers or branding appear in listings, so bookings stay on the platform."
      />
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Vehicle</th>
              <th>Vendor</th>
              <th>Amenities</th>
              <th>Documents</th>
              <th>Rate</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map((v) => (
              <tr key={v.id}>
                <td>
                  <strong>{v.title}</strong>
                  <div className="hint">
                    {getVehicleType(v.type)?.label} · {v.seats} seats · {v.registrationNumber}
                  </div>
                </td>
                <td>{v.vendorName}</td>
                <td style={{ minWidth: 220 }}><AmenityList ids={v.amenities} limit={3} /></td>
                <td>
                  {Object.entries(DOCS).map(([key, label]) => (
                    <div key={key} className="hint">{v.documents?.[key] ? "✓" : "✗"} {label}</div>
                  ))}
                </td>
                <td>{formatINR(v.ratePerKm)}/km</td>
                <td><Badge status={v.status} /></td>
                <td><ReviewActions id={v.id} status={v.status} action={setVehicleStatus} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
