import Link from "next/link";
import { getSettings } from "@/lib/data/queries";
import OperatorSignupForm from "@/components/forms/OperatorSignupForm";
import AuthSplit from "@/components/layout/AuthSplit";
import Stepper from "@/components/ui/Stepper";
import styles from "./partner.module.css";

export const metadata = {
  title: "List your bus",
};

const STEPS = [
  { title: "Personal and company details", text: "Name, Aadhaar, PAN, GSTIN and office address. Takes two minutes.", state: "current" },
  { title: "One-time verification", text: "Our team verifies you as the owner. This happens only once.", state: "todo" },
  { title: "Add your drivers and buses", text: "Driver licences, bus photos, RC, PUC, insurance, permit, fitness and proof of ownership.", state: "todo" },
  { title: "Each bus and driver is approved, then goes live", text: "If anything is rejected you see the reason, fix it and re-apply.", state: "todo" },
  { title: "Get booked and paid", text: "Travellers pay online at your rates and the booking is confirmed instantly. You're paid after every trip.", state: "todo" },
];

export default async function BecomePartnerPage() {
  const settings = await getSettings();
  const aside = (
    <>
      <p className="eyebrow">For bus &amp; tempo traveller owners</p>
      <h1>Grow your fleet&apos;s bookings, <em>on your terms.</em></h1>
      <p>You set the per-km rate. Travellers see a fixed fare, pay online and the booking is confirmed. Mark the dates your bus isn&apos;t free and it won&apos;t be booked.</p>
      <div className={styles.steps}>
        <Stepper steps={STEPS} />
      </div>
    </>
  );

  return (
    <AuthSplit aside={aside}>
      <div className="stack">
        <h2 className={styles.title}>Register your business</h2>
        <p className="muted">
          Already registered? <Link href="/login?role=operator" className={styles.link}>Sign in to the operator portal</Link>
        </p>
        <OperatorSignupForm commissionRate={settings.defaultCommissionRate} />
      </div>
    </AuthSplit>
  );
}
