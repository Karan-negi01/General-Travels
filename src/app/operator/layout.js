import PortalShell from "@/components/layout/PortalShell";
import { requireOperator } from "@/lib/auth";
import { getOperatorBookings } from "@/lib/data/queries";
import { STATUS_LABEL } from "@/lib/constants/status";

export const metadata = {
  title: { default: "Operator portal", template: "%s · Operator portal" },
  robots: { index: false },
};

export default async function OperatorLayout({ children }) {
  const viewer = await requireOperator("/operator");
  const bookings = await getOperatorBookings(viewer.id);
  const requests = bookings.filter((b) => b.status === "pending").length;

  const nav = [
    { href: "/operator", label: "Dashboard", icon: "dashboard", exact: true },
    { href: "/operator/bookings", label: "Bookings", icon: "bookings", count: requests },
    { href: "/operator/buses", label: "My buses", icon: "bus" },
  ];

  return (
    <PortalShell
      role="Bus operator"
      title={viewer.record.businessName}
      subtitle={`Account: ${STATUS_LABEL.review[viewer.record.status]}`}
      nav={nav}
    >
      {children}
    </PortalShell>
  );
}
