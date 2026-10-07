import Link from "next/link";
import { ArrowUpRight, LogOut } from "lucide-react";
import { logout } from "@/lib/actions/auth";
import Logo from "./Logo";
import PortalNav from "./PortalNav";
import styles from "./Portal.module.css";

// Sidebar layout shared by the operator portal and the admin console.
export default function PortalShell({ role, title, subtitle, nav, children }) {
  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <Logo />
        <div className={styles.identity}>
          <span className={styles.role}>{role}</span>
          <p className={styles.name}>{title}</p>
          {subtitle && <p className={styles.sub}>{subtitle}</p>}
        </div>
        <PortalNav items={nav} />
        <div className={styles.foot}>
          <Link href="/" className={styles.footLink}>View website <ArrowUpRight size={14} /></Link>
          <form action={logout}>
            <button className={styles.footLink}><LogOut size={14} /> Sign out</button>
          </form>
        </div>
      </aside>
      <main className={styles.main}>{children}</main>
    </div>
  );
}
