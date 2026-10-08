import Link from "next/link";
import Logo from "./Logo";
import styles from "./Footer.module.css";

const COLUMNS = [
  {
    title: "Travellers",
    links: [
      { href: "/buses", label: "Find a bus" },
      { href: "/how-it-works", label: "How booking works" },
      { href: "/bookings", label: "My bookings" },
    ],
  },
  {
    title: "Bus operators",
    links: [
      { href: "/become-a-partner", label: "List your bus" },
      { href: "/login?role=operator", label: "Operator sign in" },
      { href: "/how-it-works#operators", label: "Approval process" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/how-it-works", label: "About the platform" },
      { href: "/login?role=admin", label: "Team sign in" },
      { href: "/photo-credits", label: "Photo credits" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.grid}`}>
        <div className={styles.brand}>
          <Logo />
          <p>Premium bus and coach hire across India. Every operator and every vehicle is verified by our team before it can be booked.</p>
        </div>
        {COLUMNS.map((col) => (
          <div key={col.title}>
            <p className={styles.colTitle}>{col.title}</p>
            <ul>
              {col.links.map((l) => (
                <li key={l.href + l.label}><Link href={l.href}>{l.label}</Link></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className={`container ${styles.bottom}`}>
        <span>© {new Date().getFullYear()} General Travels. All rights reserved.</span>
        <span>Fixed fares · Verified operators · GST invoices</span>
      </div>
    </footer>
  );
}
