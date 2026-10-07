import Link from "next/link";
import { getCurrentVendorId } from "@/lib/auth";
import { getVendorVehicles } from "@/lib/data/queries";
import { getVehicleType } from "@/lib/constants/vehicles";
import { formatINR } from "@/lib/format";
import PageHeader from "@/components/ui/PageHeader";
import Badge from "@/components/ui/Badge";

export const metadata = { title: "My vehicles" };

export default async function VendorVehiclesPage({ searchParams }) {
  const { added } = await searchParams;
  const vehicles = await getVendorVehicles(await getCurrentVendorId());

  return (
    <>
      <PageHeader
        title="My vehicles"
        description="New listings are reviewed by General Travels before customers can see them."
        actions={<Link href="/vendor/vehicles/new" className="btn btn-primary">Add vehicle</Link>}
      />
      {added && <p className="alert alert-success" style={{ marginBottom: "var(--space-4)" }}>Vehicle submitted for review.</p>}
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Vehicle</th>
              <th>Type</th>
              <th>Seats</th>
              <th>Rate</th>
              <th>Amenities</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map((v) => (
              <tr key={v.id}>
                <td>
                  <strong>{v.title}</strong>
                  <div className="hint">{v.registrationNumber} · {v.baseCity}</div>
                </td>
                <td>{getVehicleType(v.type)?.label}</td>
                <td>{v.seats}</td>
                <td>{formatINR(v.ratePerKm)}/km</td>
                <td>{v.amenities.length}</td>
                <td><Badge status={v.status} /></td>
              </tr>
            ))}
            {vehicles.length === 0 && (
              <tr><td colSpan={6} className="muted">No vehicles yet. Add your first one.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
