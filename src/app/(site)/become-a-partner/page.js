import Link from "next/link";
import OperatorSignupForm from "@/components/forms/OperatorSignupForm";
import AuthSplit from "@/components/layout/AuthSplit";
import Stepper from "@/components/ui/Stepper";
import styles from "./partner.module.css";

export const metadata = {
  title: "List your bus",
};

const STEPS = [
  { title: "Create your operator account", text: "Business details, PAN and GSTIN. Takes two minutes.", state: "current" },
  { title: "One-time verification", text: "Our team checks your documents and gives you a call. This happens only once.", state: "todo" },
  { title: "Add each bus", text: "Seats, amenities, pickup cities and your per-km rate.", state: "todo" },
  { title: "Each bus is approved, then goes live", text: "We check RC, insurance, permit and fitness for every vehicle.", state: "todo" },
  { title: "Accept bookings", text: "Customers book at your rates. You confirm, then drive.", state: "todo" },
];

export default function BecomePartnerPage() {
  const aside = (
    <>
      <p className="eyebrow">For bus &amp; tempo traveller owners</p>
      <h1>Grow your fleet&apos;s bookings, <em>on your terms.</em></h1>
      <p>You set the per-km rate. Customers see a fixed fare and book. You confirm the trips you want.</p>
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
        <OperatorSignupForm />
      </div>
    </AuthSplit>
  );
}
