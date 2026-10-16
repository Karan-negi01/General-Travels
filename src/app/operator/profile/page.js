import { ShieldX } from "lucide-react";
import { requireOperator } from "@/lib/auth";
import { getOperatorSummary } from "@/lib/data/queries";
import { formatDate } from "@/lib/format";
import PageHeader from "@/components/ui/PageHeader";
import OperatorSignupForm from "@/components/forms/OperatorSignupForm";
import styles from "../operator.module.css";

export const metadata = { title: "Profile" };

export default async function OperatorProfilePage({ searchParams }) {
  const [viewer, params] = await Promise.all([requireOperator("/operator/profile"), searchParams]);
  const operator = viewer.record;
  const s = await getOperatorSummary(operator.id);

  return (
    <>
      <PageHeader
        title="Profile"
        description={`Commission: ${s.commissionRate}% of the fare before GST, deducted automatically from each booking. Terms accepted on ${formatDate(operator.termsAcceptedAt)}.`}
      />
      {params.saved === "1" && <p className="alert alert-success" style={{ marginBottom: 24 }}>Changes saved.</p>}
      {params.saved === "resubmitted" && <p className="alert alert-success" style={{ marginBottom: 24 }}>Details saved and sent to our team for verification.</p>}
      {operator.status === "rejected" && (
        <div className={`${styles.banner} ${styles.bannerError}`}>
          <ShieldX size={20} />
          <p><strong>Your account wasn&apos;t approved.</strong> Reason: {operator.rejectionReason ?? "not given"}. Correct your details below and submit them again.</p>
        </div>
      )}
      <OperatorSignupForm operator={operator} />
    </>
  );
}
