"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registerOperator, updateOperatorProfile } from "@/lib/actions/operator";
import { CITIES } from "@/lib/constants/vehicles";
import Field from "@/components/ui/Field";
import styles from "./Form.module.css";

// Personal and company details of a bus owner. Used to register, and later on
// the profile page to correct details and re-apply. `operator` = profile mode.
// Once the account is approved, identity fields are locked.
export default function OperatorSignupForm({ operator, commissionRate }) {
  const editing = Boolean(operator);
  const [state, formAction, pending] = useActionState(editing ? updateOperatorProfile : registerOperator, {});
  const v = state?.values ?? operator ?? {};
  const e = state?.errors ?? {};
  const locked = operator?.status === "approved";

  return (
    <form action={formAction} className={styles.form} noValidate>
      {Object.keys(e).length > 0 && <p className="alert alert-error" role="alert">Please fix the highlighted fields.</p>}

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <span className={styles.sectionNum}>01</span>
          <h2 className={styles.sectionTitle}>Personal details</h2>
        </div>
        <div className="form-grid">
          <Field label="Owner name" htmlFor="ownerName" error={e.ownerName}>
            <input id="ownerName" name="ownerName" className="input" autoComplete="name" defaultValue={v.ownerName ?? ""} readOnly={locked} />
          </Field>
          <Field label="Mobile number" htmlFor="phone" error={e.phone} hint={editing ? "Your sign-in number. Contact support to change it." : "You'll sign in with this number"}>
            <input id="phone" name="phone" type="tel" className="input" placeholder="98100 00000" autoComplete="tel" defaultValue={v.phone ?? ""} readOnly={editing} />
          </Field>
          <Field label="Email (optional)" htmlFor="email" error={e.email}>
            <input id="email" name="email" type="email" className="input" autoComplete="email" defaultValue={v.email ?? ""} />
          </Field>
          <Field label="Aadhaar number" htmlFor="aadhaarNumber" error={e.aadhaarNumber} hint="12 digits, used only for verification">
            <input id="aadhaarNumber" name="aadhaarNumber" inputMode="numeric" className="input" placeholder="1234 5678 9012" defaultValue={v.aadhaarNumber ?? ""} readOnly={locked} />
          </Field>
          <Field label="PAN" htmlFor="panNumber" error={e.panNumber}>
            <input id="panNumber" name="panNumber" className="input" placeholder="ABCDE1234F" style={{ textTransform: "uppercase" }} defaultValue={v.panNumber ?? ""} readOnly={locked} />
          </Field>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <span className={styles.sectionNum}>02</span>
          <h2 className={styles.sectionTitle}>Company details</h2>
        </div>
        <div className="form-grid">
          <Field label="Business name" htmlFor="businessName" error={e.businessName}>
            <input id="businessName" name="businessName" className="input" placeholder="e.g. Sharma Tours & Travels" defaultValue={v.businessName ?? ""} readOnly={locked} />
          </Field>
          <Field label="GSTIN (if registered)" htmlFor="gstNumber" error={e.gstNumber}>
            <input id="gstNumber" name="gstNumber" className="input" placeholder="07ABCDE1234F1Z5" style={{ textTransform: "uppercase" }} defaultValue={v.gstNumber ?? ""} readOnly={locked} />
          </Field>
          <Field label="Base city" htmlFor="city" error={e.city}>
            {locked ? (
              <input id="city" name="city" className="input" defaultValue={v.city} readOnly />
            ) : (
              <select id="city" name="city" className="select" defaultValue={v.city ?? ""}>
                <option value="" disabled>Select city</option>
                {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            )}
          </Field>
          <Field label="Buses you own" htmlFor="fleetSize">
            <input id="fleetSize" name="fleetSize" type="number" min="1" className="input" defaultValue={v.fleetSize ?? ""} />
          </Field>
        </div>
        <Field label="Office address" htmlFor="address" error={e.address}>
          <textarea id="address" name="address" className="textarea" rows={2} placeholder="Building, street, area, city, PIN" defaultValue={v.address ?? ""} />
        </Field>
        {locked && <p className="hint">Your account is verified, so your identity and company details are locked. Contact partner support to change them.</p>}
      </section>

      {!editing && (
        <label className="check" style={{ alignItems: "flex-start" }}>
          <input type="checkbox" name="acceptTerms" />
          <span>
            I accept the General Travels partner terms, including a commission of {commissionRate}% of the fare (before GST) on every booking of my buses, deducted automatically from each payment.
            {e.acceptTerms && <span className="field-error" style={{ display: "block" }}>{e.acceptTerms}</span>}
          </span>
        </label>
      )}

      <div className={styles.footer}>
        {editing && <Link href="/operator" className="btn btn-outline">Cancel</Link>}
        <button type="submit" className="btn btn-primary btn-lg" disabled={pending}>
          {pending ? "Saving…" : !editing ? "Submit for verification" : locked ? "Save changes" : "Save and submit for verification"}
        </button>
      </div>
      {!editing && (
        <p className="hint">
          Our team verifies your account once (usually within one working day). You can add your drivers and buses straight away. They go live as soon as they&apos;re approved.
        </p>
      )}
    </form>
  );
}
