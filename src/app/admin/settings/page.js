import { requireAdmin } from "@/lib/auth";
import { getAdminOverview, getAllOperators } from "@/lib/data/queries";
import { setDefaultCommission } from "@/lib/actions/admin";
import { formatINR } from "@/lib/format";
import PageHeader from "@/components/ui/PageHeader";
import StatCard from "@/components/ui/StatCard";
import CommissionForm from "@/components/forms/CommissionForm";
import styles from "../admin.module.css";

export const metadata = { title: "Commission" };

export default async function CommissionSettingsPage() {
  await requireAdmin("/admin/settings");
  const [o, operators] = await Promise.all([getAdminOverview(), getAllOperators()]);
  const custom = operators.filter((op) => op.commissionRate != null);

  return (
    <>
      <PageHeader
        title="Commission"
        description="General Travels earns a commission from the bus owner on every booking: a percentage of the fare before GST, deducted automatically from the traveller's payment. A new rate applies to new bookings only."
      />
      <div className={styles.stats}>
        <StatCard label="Default rate" value={`${o.defaultCommissionRate}%`} />
        <StatCard label="Commission earned" value={formatINR(o.bookings.commission)} href="/admin/bookings" />
        <StatCard label="Owners on a custom rate" value={custom.length} href="/admin/operators" />
        <StatCard label="Paid bookings" value={o.bookings.total} href="/admin/bookings" />
      </div>

      <section className={styles.queue} style={{ marginTop: 32 }}>
        <div className={styles.queueHead}>
          <div>
            <p className={styles.queueStep}>All owners without a custom rate</p>
            <h2>Default commission rate</h2>
          </div>
        </div>
        <CommissionForm action={setDefaultCommission} rate={o.defaultCommissionRate} />
        <p className="hint" style={{ marginTop: 12 }}>New owners accept this rate when they register. Set a different rate for one owner on the Operators page.</p>
      </section>

      {custom.length > 0 && (
        <section className={styles.queue} style={{ marginTop: 24 }}>
          <div className={styles.queueHead}><h2>Custom rates</h2></div>
          {custom.map((op) => (
            <div key={op.id} className={styles.item}>
              <p className={styles.itemTitle}>{op.businessName}</p>
              <p className={styles.strong}>{op.commissionRate}%</p>
            </div>
          ))}
        </section>
      )}
    </>
  );
}
