import PortalShell from "@/components/layout/PortalShell";
import { requireOperator } from "@/lib/auth";
import { getOperatorSummary } from "@/lib/data/queries";
import { STATUS_LABEL } from "@/lib/constants/status";

export const metadata = {
  title: { default: "Operator portal", template: "%s · Operator portal" },
  robots: { index: false },
};

export default async function OperatorLayout({ children }) {
  const viewer = await requireOperator("/operator");
  const s = await getOperatorSummary(viewer.id);
  const needsFix = s.rejectedBuses + s.drivers.filter((d) => d.status === "rejected").length;

  const nav = [
    { href: "/operator", label: "Dashboard", icon: "dashboard", exact: true },
    { href: "/operator/bookings", label: "Trips", icon: "bookings", count: s.toComplete.length },
    { href: "/operator/buses", label: "My buses", icon: "bus", count: s.rejectedBuses },
    { href: "/operator/drivers", label: "Drivers", icon: "drivers", count: needsFix - s.rejectedBuses },
    { href: "/operator/availability", label: "Availability", icon: "calendar" },
    { href: "/operator/earnings", label: "Earnings", icon: "earnings" },
    { href: "/operator/profile", label: "Profile", icon: "profile", count: viewer.record.status === "rejected" ? 1 : 0 },
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
