import Link from "next/link";
import { Bus } from "lucide-react";
import PortalNav from "./PortalNav";
import styles from "./PortalShell.module.css";

// Sidebar layout shared by the vendor portal and admin dashboard.
export default function PortalShell({ title, subtitle, nav, children }) {
  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <Link href="/" className={styles.logo}>
          <span className={styles.logoMark}><Bus size={16} /></span>
          General Travels
        </Link>
        <div className={styles.section}>
          <p className={styles.sectionTitle}>{title}</p>
          {subtitle && <p className={styles.sectionSub}>{subtitle}</p>}
        </div>
        <PortalNav items={nav} />
      </aside>
      <main className={styles.main}>{children}</main>
    </div>
  );
}
