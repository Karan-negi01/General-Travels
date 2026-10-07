import PortalShell from "@/components/layout/PortalShell";
import { getCurrentVendorId } from "@/lib/auth";
import { getVendor } from "@/lib/data/queries";

export const metadata = {
  title: { default: "Vendor portal", template: "%s · Vendor portal" },
  robots: { index: false },
};

const NAV = [
  { href: "/vendor", label: "Dashboard", exact: true },
  { href: "/vendor/enquiries", label: "Trip requests" },
  { href: "/vendor/vehicles", label: "My vehicles" },
];

export default async function VendorLayout({ children }) {
  const vendor = await getVendor(await getCurrentVendorId());
  return (
    <PortalShell title="Vendor portal" subtitle={vendor?.name} nav={NAV}>
      {children}
    </PortalShell>
  );
}
