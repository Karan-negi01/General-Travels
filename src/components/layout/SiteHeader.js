import Link from "next/link";
import { Menu, UserRound } from "lucide-react";
import { getViewer, ROLE_HOME } from "@/lib/auth";
import { logout } from "@/lib/actions/auth";
import Logo from "./Logo";
import styles from "./Header.module.css";

const ROLE_LINK_LABEL = {
  customer: "My bookings",
  operator: "Operator dashboard",
  admin: "Admin console",
};

const LINKS = [
  { href: "/buses", label: "Find a bus" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/become-a-partner", label: "List your bus" },
];

export default async function SiteHeader() {
  const viewer = await getViewer();

  const account = viewer ? (
    <>
      <Link href={ROLE_HOME[viewer.role]} className={styles.account}>
        <UserRound size={16} /> {ROLE_LINK_LABEL[viewer.role]}
      </Link>
      <form action={logout}>
        <button className={styles.textButton}>Sign out</button>
      </form>
    </>
  ) : (
    <>
      <Link href="/login" className={styles.link}>Sign in</Link>
      <Link href="/buses" className="btn btn-primary btn-sm">Book a bus</Link>
    </>
  );

  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        <Logo />
        <nav className={styles.nav} aria-label="Main">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className={styles.link}>{l.label}</Link>
          ))}
        </nav>
        <div className={styles.actions}>{account}</div>

        <details className={styles.mobile}>
          <summary aria-label="Menu"><Menu size={22} /></summary>
          <div className={styles.sheet}>
            {LINKS.map((l) => (
              <Link key={l.href} href={l.href}>{l.label}</Link>
            ))}
            <hr />
            {account}
          </div>
        </details>
      </div>
    </header>
  );
}
