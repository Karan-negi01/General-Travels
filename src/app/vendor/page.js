import Link from "next/link";
import { getCurrentVendorId } from "@/lib/auth";
import { getVendor, getVendorVehicles, getMatchingEnquiries } from "@/lib/data/queries";
import PageHeader from "@/components/ui/PageHeader";
import StatCard from "@/components/ui/StatCard";
import Badge from "@/components/ui/Badge";

export default async function VendorDashboard() {
  const vendorId = await getCurrentVendorId();
  const [vendor, vehicles, enquiries] = await Promise.all([
    getVendor(vendorId),
    getVendorVehicles(vendorId),
    getMatchingEnquiries(vendorId),
  ]);
  const pendingVehicles = vehicles.filter((v) => v.status === "pending").length;
  const awaitingQuote = enquiries.filter((e) => !e.myQuote).length;

  return (
    <>
      <PageHeader
        title={`Welcome, ${vendor.contactName}`}
        description="New trip requests that match your vehicles appear here."
        actions={<Link href="/vendor/vehicles/new" className="btn btn-primary">Add vehicle</Link>}
      />
      {vendor.status !== "approved" && (
        <p className="alert alert-info" style={{ marginBottom: "var(--space-5)" }}>
          Account status: <Badge status={vendor.status} />. You&apos;ll start receiving trip requests once our team
          verifies your documents.
        </p>
      )}
      <div className="form-grid">
        <StatCard label="New trip requests" value={awaitingQuote} note={awaitingQuote ? "Awaiting your quote" : null} href="/vendor/enquiries" />
        <StatCard label="Quotes sent" value={enquiries.filter((e) => e.myQuote).length} href="/vendor/enquiries" />
        <StatCard label="Vehicles listed" value={vehicles.length} note={pendingVehicles ? `${pendingVehicles} under review` : null} href="/vendor/vehicles" />
      </div>
    </>
  );
}
