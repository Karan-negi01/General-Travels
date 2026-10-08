import Link from "next/link";
import { Users, Bus, UserCheck, ArrowRight } from "lucide-react";
import { getViewer, ROLE_HOME } from "@/lib/auth";
import { demoLogin } from "@/lib/actions/auth";
import { safeNext } from "@/lib/validation";
import { DEMO_MODE } from "@/lib/demo";
import AuthSplit from "@/components/layout/AuthSplit";
import { CustomerLogin, OperatorLogin, AdminLogin } from "@/components/forms/LoginForms";
import styles from "./login.module.css";

export const metadata = { title: "Sign in" };

const ROLES = [
  { id: "customer", icon: Users, label: "Traveller", text: "Book buses and manage your trips." },
  { id: "operator", icon: Bus, label: "Bus operator", text: "Manage your fleet and booking requests." },
  { id: "admin", icon: UserCheck, label: "Admin", text: "Approve operators, buses and oversee bookings." },
];

const DEMO = [
  { account: "customer", label: "Traveller", who: "Priya Sharma · has bookings" },
  { account: "operator", label: "Operator (approved)", who: "General Travels Fleet · 3 buses" },
  { account: "operator-pending", label: "Operator (under review)", who: "Pink City Tours · waiting for admin" },
  { account: "admin", label: "Admin", who: "Approval queues" },
];

export default async function LoginPage({ searchParams }) {
  const params = await searchParams;
  const role = ROLES.some((r) => r.id === params.role) ? params.role : "customer";
  const next = safeNext(params.next, "");
  const viewer = await getViewer();
  const current = ROLES.find((r) => r.id === role);

  const aside = (
    <>
      <p className="eyebrow">Welcome to General Travels</p>
      <h1>Sign in as a <em>{current.label.toLowerCase()}</em></h1>
      <p>One platform, three roles. Pick yours.</p>
      <div className={styles.roles}>
        {ROLES.map(({ id, icon: Icon, label, text }) => (
          <Link key={id} href={`/login?role=${id}${next ? `&next=${encodeURIComponent(next)}` : ""}`} className={`${styles.role} ${id === role ? styles.active : ""}`} aria-current={id === role ? "page" : undefined}>
            <Icon size={20} />
            <span>
              <strong>{label}</strong>
              <small>{text}</small>
            </span>
          </Link>
        ))}
      </div>
    </>
  );

  return (
    <AuthSplit aside={aside}>
      <div className={styles.formWrap}>
        {viewer && (
          <p className="alert alert-info">
            You&apos;re signed in as <strong>{viewer.name}</strong> ({viewer.role}).{" "}
            <Link href={ROLE_HOME[viewer.role]}><u>Go to your dashboard</u></Link>
          </p>
        )}

        <h2 className={styles.formTitle}>{current.label} sign in</h2>
        {role === "customer" && <CustomerLogin next={next} />}
        {role === "operator" && (
          <>
            <OperatorLogin next={next} />
            <p className={styles.alt}>
              New bus owner? <Link href="/become-a-partner">Register your business <ArrowRight size={14} /></Link>
            </p>
          </>
        )}
        {role === "admin" && <AdminLogin next={next} />}

        {DEMO_MODE && (
          <div className={styles.demo}>
            <p className={styles.demoTitle}>Demo access <span>demo only</span></p>
            <div className={styles.demoGrid}>
              {DEMO.map((d) => (
                <form key={d.account} action={demoLogin}>
                  <input type="hidden" name="account" value={d.account} />
                  <button className={styles.demoButton}>
                    <strong>{d.label}</strong>
                    <small>{d.who}</small>
                  </button>
                </form>
              ))}
            </div>
          </div>
        )}
      </div>
    </AuthSplit>
  );
}
