"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Bus, CalendarCheck, UserCheck } from "lucide-react";
import styles from "./Portal.module.css";

// Icons are referenced by name because server layouts can't pass components to a client component.
const ICONS = { dashboard: LayoutDashboard, bus: Bus, bookings: CalendarCheck, operators: UserCheck };

export default function PortalNav({ items }) {
  const pathname = usePathname();
  return (
    <nav className={styles.nav}>
      {items.map((item) => {
        // Exact match for the portal root, prefix match for sections.
        const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
        const Icon = ICONS[item.icon];
        return (
          <Link key={item.href} href={item.href} className={active ? styles.active : undefined} aria-current={active ? "page" : undefined}>
            {Icon && <Icon size={17} strokeWidth={1.8} />}
            <span>{item.label}</span>
            {item.count > 0 && <span className={styles.count}>{item.count}</span>}
          </Link>
        );
      })}
    </nav>
  );
}
