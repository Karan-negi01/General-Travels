import Link from "next/link";
import styles from "./SiteFooter.module.css";

export default function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <div>
          <p className={styles.brand}>General Travels</p>
          <p className={styles.tag}>Charter buses &amp; tempo travellers from verified operators. Serving India for 15+ years.</p>
        </div>
        <nav className={styles.links} aria-label="Footer">
          <Link href="/buses">Browse vehicles</Link>
          <Link href="/enquiry/new">Request a quote</Link>
          <Link href="/become-a-partner">List your fleet</Link>
          <Link href="/admin">Admin</Link>
        </nav>
      </div>
    </footer>
  );
}
