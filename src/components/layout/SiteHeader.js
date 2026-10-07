import Link from "next/link";
import { Bus } from "lucide-react";
import styles from "./SiteHeader.module.css";

export default function SiteHeader() {
  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        <Link href="/" className={styles.logo}>
          <span className={styles.logoMark}><Bus size={18} /></span>
          General Travels
        </Link>
        <nav className={styles.nav} aria-label="Main">
          <Link href="/buses">Browse vehicles</Link>
          <Link href="/become-a-partner">For operators</Link>
          <Link href="/vendor" className={styles.portal}>Vendor portal</Link>
          <Link href="/enquiry/new" className="btn btn-primary btn-sm">Get quotes</Link>
        </nav>
      </div>
    </header>
  );
}
