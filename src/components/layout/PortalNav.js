"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./PortalShell.module.css";

export default function PortalNav({ items }) {
  const pathname = usePathname();
  return (
    <nav className={styles.nav}>
      {items.map((item) => {
        // Exact match for the portal root, prefix match for sections.
        const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
        return (
          <Link key={item.href} href={item.href} className={active ? styles.active : undefined} aria-current={active ? "page" : undefined}>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
