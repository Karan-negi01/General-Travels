"use client";

import { useActionState } from "react";
import Link from "next/link";
import { createVehicle } from "@/lib/actions/vendor";
import { CITIES, VEHICLE_TYPES } from "@/lib/constants/vehicles";
import AmenityPicker from "@/components/vehicles/AmenityPicker";
import Field from "@/components/ui/Field";
import styles from "./FormLayout.module.css";

export default function VehicleForm() {
  const [state, formAction, pending] = useActionState(createVehicle, { values: { ac: true } });
  const v = state?.values ?? {};
  const e = state?.errors ?? {};

  return (
    <form action={formAction} className={styles.form} noValidate>
      {Object.keys(e).length > 0 && (
        <p className="alert alert-error" role="alert">Please fix the highlighted fields.</p>
      )}

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Vehicle details</h2>
        <Field label="Listing title" htmlFor="title" error={e.title} hint="e.g. Volvo 9600 45-seater luxury coach">
          <input id="title" name="title" className="input" defaultValue={v.title ?? ""} />
        </Field>
        <div className="form-grid">
          <Field label="Vehicle type" htmlFor="type" error={e.type}>
            <select id="type" name="type" className="select" defaultValue={v.type ?? ""}>
              <option value="" disabled>Select type</option>
              {VEHICLE_TYPES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
            </select>
          </Field>
          <Field label="Seats" htmlFor="seats" error={e.seats}>
            <input id="seats" name="seats" type="number" min="4" max="60" className="input" defaultValue={v.seats ?? ""} />
          </Field>
          <Field label="Model year" htmlFor="modelYear" error={e.modelYear}>
            <input id="modelYear" name="modelYear" type="number" className="input" placeholder="2023" defaultValue={v.modelYear ?? ""} />
          </Field>
          <Field label="Registration number" htmlFor="registrationNumber" error={e.registrationNumber} hint="Only visible to General Travels">
            <input id="registrationNumber" name="registrationNumber" className="input" placeholder="DL01 AB 1234" defaultValue={v.registrationNumber ?? ""} />
          </Field>
        </div>
        <label className="check">
          <input type="checkbox" name="ac" defaultChecked={v.ac} /> Air-conditioned
        </label>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Where it operates</h2>
        <Field label="Base city" htmlFor="baseCity" error={e.baseCity}>
          <select id="baseCity" name="baseCity" className="select" defaultValue={v.baseCity ?? ""}>
            <option value="" disabled>Select city</option>
            {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>
        <div>
          <p className="label">Also available for pickups in</p>
          <div className={styles.cityGrid}>
            {CITIES.map((c) => (
              <label key={c} className="check">
                <input type="checkbox" name="serviceCities" value={c} defaultChecked={v.serviceCities?.includes(c)} /> {c}
              </label>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Amenities</h2>
        {e.amenities && <p className="field-error">{e.amenities}</p>}
        <AmenityPicker selected={v.amenities ?? []} />
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Indicative pricing</h2>
        <p className="hint">Shown to customers as a starting rate. You&apos;ll still send a final quote for each trip.</p>
        <div className="form-grid">
          <Field label="Rate per km (₹)" htmlFor="ratePerKm" error={e.ratePerKm}>
            <input id="ratePerKm" name="ratePerKm" type="number" min="1" className="input" defaultValue={v.ratePerKm ?? ""} />
          </Field>
          <Field label="Minimum km per day" htmlFor="minKmPerDay">
            <input id="minKmPerDay" name="minKmPerDay" type="number" min="0" className="input" defaultValue={v.minKmPerDay ?? 250} />
          </Field>
          <Field label="Driver allowance per day (₹)" htmlFor="driverAllowancePerDay">
            <input id="driverAllowancePerDay" name="driverAllowancePerDay" type="number" min="0" className="input" defaultValue={v.driverAllowancePerDay ?? ""} />
          </Field>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Photos &amp; documents</h2>
        <p className="alert alert-info">
          Photo and document upload (RC, insurance, permit, fitness certificate) arrives in Phase 1. For now our team
          will collect these during verification.
        </p>
      </section>

      <div className={styles.footer}>
        <Link href="/vendor/vehicles" className="btn btn-outline">Cancel</Link>
        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending ? "Submitting…" : "Submit for review"}
        </button>
      </div>
    </form>
  );
}
