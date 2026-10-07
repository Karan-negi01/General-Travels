import { getAdminOverview } from "@/lib/data/queries";
import PageHeader from "@/components/ui/PageHeader";
import StatCard from "@/components/ui/StatCard";

export default async function AdminOverview() {
  const o = await getAdminOverview();
  return (
    <>
      <PageHeader title="Overview" description="Marketplace health at a glance." />
      <div className="form-grid">
        <StatCard label="Vendors" value={o.vendors.total} note={o.vendors.pending ? `${o.vendors.pending} awaiting verification` : null} href="/admin/vendors" />
        <StatCard label="Vehicle listings" value={o.vehicles.total} note={o.vehicles.pending ? `${o.vehicles.pending} awaiting review` : null} href="/admin/vehicles" />
        <StatCard label="Enquiries" value={o.enquiries.total} note={o.enquiries.open ? `${o.enquiries.open} open` : null} href="/admin/enquiries" />
        <StatCard label="Quotes submitted" value={o.quotes.total} />
      </div>
    </>
  );
}
