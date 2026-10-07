"use client";

import { useActionState } from "react";
import Link from "next/link";
import { createBus } from "@/lib/actions/operator";
import { CITIES, VEHICLE_TYPES } from "@/lib/constants/vehicles";
import AmenityPicker from "@/components/vehicles/AmenityPicker";
import Field from "@/components/ui/Field";
import styles from "./Form.module.css";

const DOCS = [
  { id: "rc", label: "Registration certificate (RC)" },
  { id: "insurance", label: "Insurance" },
  { id: "permit", label: "Tourist / contract carriage permit" },
  { id: "fitness", label: "Fitness certificate" },
];

function Section({ num, title, children }) {
  return (
    <section className={styles.section}>
      <div className={styles.sectionHead}>
        <span className={styles.sectionNum}>{num}</span>
        <h2 className={styles.sectionTitle}>{title}</h2>
      </div>
      {children}
    </section>
  );
}

export default function BusForm() {
  const [state, formAction, pending] = useActionState(createBus, { values: { ac: true } });
  const v = state?.values ?? {};
  const e = state?.errors ?? {};

  return (
    <form action={formAction} className={styles.form} noValidate>
      {state?.formError && <p className="alert alert-error" role="alert">{state.formError}</p>}
      {Object.keys(e).length > 0 && <p className="alert alert-error" role="alert">Please fix the highlighted fields.</p>}

      <Section num="01" title="The vehicle">
        <Field label="Listing name" htmlFor="title" error={e.title} hint="What travellers see, e.g. “Volvo 9600 Multi-axle”">
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
          <Field label="Registration number" htmlFor="registrationNumber" error={e.registrationNumber} hint="Shared with travellers only after you confirm a booking">
            <input id="registrationNumber" name="registrationNumber" className="input" placeholder="DL01 AB 1234" style={{ textTransform: "uppercase" }} defaultValue={v.registrationNumber ?? ""} />
          </Field>
        </div>
        <label className="check">
          <input type="checkbox" name="ac" defaultChecked={v.ac} /> Air-conditioned
        </label>
      </Section>

      <Section num="02" title="Where it picks up">
        <Field label="Base city" htmlFor="baseCity" error={e.baseCity}>
          <select id="baseCity" name="baseCity" className="select" defaultValue={v.baseCity ?? ""} style={{ maxWidth: 320 }}>
            <option value="" disabled>Select city</option>
            {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>
        <div>
          <p className="label">Also picks up from</p>
          <div className={styles.cityGrid}>
            {CITIES.map((c) => (
              <label key={c} className="check">
                <input type="checkbox" name="serviceCities" value={c} defaultChecked={v.serviceCities?.includes(c)} /> {c}
              </label>
            ))}
          </div>
        </div>
      </Section>

      <Section num="03" title="Your rates">
        <p className="hint">Travellers see one fixed fare: (route km, or minimum km × days, whichever is more) × rate + driver allowance × days + 5% GST.</p>
        <div className="form-grid">
          <Field label="Rate per km (₹)" htmlFor="ratePerKm" error={e.ratePerKm}>
            <input id="ratePerKm" name="ratePerKm" type="number" min="1" className="input" defaultValue={v.ratePerKm ?? ""} />
          </Field>
          <Field label="Minimum km per day" htmlFor="minKmPerDay" error={e.minKmPerDay}>
            <input id="minKmPerDay" name="minKmPerDay" type="number" min="0" className="input" defaultValue={v.minKmPerDay ?? 250} />
          </Field>
          <Field label="Driver allowance per day (₹)" htmlFor="driverAllowancePerDay" error={e.driverAllowancePerDay}>
            <input id="driverAllowancePerDay" name="driverAllowancePerDay" type="number" min="0" className="input" defaultValue={v.driverAllowancePerDay ?? ""} />
          </Field>
        </div>
      </Section>

      <Section num="04" title="Amenities">
        {e.amenities && <p className="field-error">{e.amenities}</p>}
        <AmenityPicker selected={v.amenities ?? []} />
      </Section>

      <Section num="05" title="Documents">
        <p className="hint">Tick the documents you have ready. Our team collects copies during review. Online upload is coming soon.</p>
        <div className={styles.docGrid}>
          {DOCS.map((d) => (
            <label key={d.id} className={styles.doc}>
              <input type="checkbox" name={`doc_${d.id}`} defaultChecked={v.documents?.[d.id]} /> {d.label}
            </label>
          ))}
        </div>
      </Section>

      <div className={styles.footer}>
        <Link href="/operator/buses" className="btn btn-outline">Cancel</Link>
        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending ? "Submitting…" : "Submit bus for approval"}
        </button>
      </div>
    </form>
  );
}
