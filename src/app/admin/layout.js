import PortalShell from "@/components/layout/PortalShell";
import { requireAdmin } from "@/lib/auth";

export const metadata = {
  title: { default: "Admin", template: "%s · Admin" },
  robots: { index: false },
};

const NAV = [
  { href: "/admin", label: "Overview", exact: true },
  { href: "/admin/vendors", label: "Vendors" },
  { href: "/admin/vehicles", label: "Vehicle listings" },
  { href: "/admin/enquiries", label: "Enquiries" },
];

export default async function AdminLayout({ children }) {
  await requireAdmin();
  return (
    <PortalShell title="Admin" subtitle="General Travels HQ" nav={NAV}>
      {children}
    </PortalShell>
  );
}
