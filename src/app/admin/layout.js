import PortalShell from "@/components/layout/PortalShell";
import { requireAdmin } from "@/lib/auth";
import { getAdminOverview } from "@/lib/data/queries";

export const metadata = {
  title: { default: "Admin", template: "%s · Admin" },
  robots: { index: false },
};

export default async function AdminLayout({ children }) {
  await requireAdmin("/admin");
  const o = await getAdminOverview();

  const nav = [
    { href: "/admin", label: "Overview", icon: "dashboard", exact: true },
    { href: "/admin/operators", label: "Operators", icon: "operators", count: o.operators.pending },
    { href: "/admin/buses", label: "Buses", icon: "bus", count: o.buses.pending },
    { href: "/admin/bookings", label: "Bookings", icon: "bookings" },
  ];

  return (
    <PortalShell role="Admin console" title="General Travels HQ" subtitle="Approvals & oversight" nav={nav}>
      {children}
    </PortalShell>
  );
}
