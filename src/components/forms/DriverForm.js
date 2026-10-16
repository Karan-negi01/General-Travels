"use client";

import { useActionState } from "react";
import Link from "next/link";
import { FileCheck2 } from "lucide-react";
import { saveDriver } from "@/lib/actions/operator";
import Field from "@/components/ui/Field";
import styles from "./Form.module.css";

// Adds a driver, or edits one (`driver` given). Saving sends the driver to admin review.
export default function DriverForm({ driver }) {
  const [state, formAction, pending] = useActionState(saveDriver, {});
  const v = state?.values ?? driver ?? {};
  const e = state?.errors ?? {};

  return (
    <form action={formAction} className={styles.form} noValidate>
      {driver && <input type="hidden" name="driverId" value={driver.id} />}
      {state?.formError && <p className="alert alert-error" role="alert">{state.formError}</p>}
      {Object.keys(e).length > 0 && <p className="alert alert-error" role="alert">Please fix the highlighted fields. Files need to be picked again after an error.</p>}

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <span className={styles.sectionNum}>01</span>
          <h2 className={styles.sectionTitle}>Driver details</h2>
        </div>
        <div className="form-grid">
          <Field label="Full name" htmlFor="name" error={e.name}>
            <input id="name" name="name" className="input" defaultValue={v.name ?? ""} />
          </Field>
          <Field label="Mobile number" htmlFor="phone" error={e.phone} hint="Shared with travellers after they pay">
            <input id="phone" name="phone" type="tel" className="input" placeholder="98100 00000" defaultValue={v.phone ?? ""} />
          </Field>
          <Field label="Aadhaar number" htmlFor="aadhaarNumber" error={e.aadhaarNumber}>
            <input id="aadhaarNumber" name="aadhaarNumber" inputMode="numeric" className="input" placeholder="1234 5678 9012" defaultValue={v.aadhaarNumber ?? ""} />
          </Field>
          <Field label="Years of experience" htmlFor="experienceYears" error={e.experienceYears}>
            <input id="experienceYears" name="experienceYears" type="number" min="0" max="60" className="input" defaultValue={v.experienceYears ?? ""} />
          </Field>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <span className={styles.sectionNum}>02</span>
          <h2 className={styles.sectionTitle}>Licence</h2>
        </div>
        <div className="form-grid">
          <Field label="Driving licence number" htmlFor="licenceNumber" error={e.licenceNumber}>
            <input id="licenceNumber" name="licenceNumber" className="input" placeholder="DL-0420110012345" style={{ textTransform: "uppercase" }} defaultValue={v.licenceNumber ?? ""} />
          </Field>
          <Field label="Licence valid until" htmlFor="licenceExpiry" error={e.licenceExpiry}>
            <input id="licenceExpiry" name="licenceExpiry" type="date" className="input" defaultValue={v.licenceExpiry ?? ""} />
          </Field>
          <Field label="PSV badge number (if any)" htmlFor="psvBadge" error={e.psvBadge}>
            <input id="psvBadge" name="psvBadge" className="input" style={{ textTransform: "uppercase" }} defaultValue={v.psvBadge ?? ""} />
          </Field>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <span className={styles.sectionNum}>03</span>
          <h2 className={styles.sectionTitle}>Photo and licence copy</h2>
        </div>
        <div className={styles.docUploads}>
          <Field label="Driver photo" htmlFor="photo" error={e.photo} hint="A clear face photo. JPG, PNG or WebP, up to 5 MB.">
            {driver?.photo && <a href={`/files/${driver.photo}`} target="_blank" rel="noreferrer" className={styles.uploaded}><FileCheck2 size={14} /> Uploaded · view</a>}
            <input id="photo" name="photo" type="file" accept="image/jpeg,image/png,image/webp" className="input" />
          </Field>
          <Field label="Driving licence (both sides)" htmlFor="licenceFile" error={e.licenceFile} hint="PDF, JPG or PNG, up to 5 MB.">
            {driver?.licenceFile && <a href={`/files/${driver.licenceFile}`} target="_blank" rel="noreferrer" className={styles.uploaded}><FileCheck2 size={14} /> Uploaded · view</a>}
            <input id="licenceFile" name="licenceFile" type="file" accept="application/pdf,image/jpeg,image/png,image/webp" className="input" />
          </Field>
        </div>
      </section>

      <div className={styles.footer}>
        <Link href="/operator/drivers" className="btn btn-outline">Cancel</Link>
        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending ? "Uploading…" : driver ? "Save and submit for review" : "Submit driver for review"}
        </button>
      </div>
    </form>
  );
}
