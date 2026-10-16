"use client";

import { useActionState } from "react";
import Link from "next/link";
import { FileCheck2 } from "lucide-react";
import { saveBus } from "@/lib/actions/operator";
import { CITIES, VEHICLE_TYPES, SEATING, BUS_DOCUMENTS } from "@/lib/constants/vehicles";
import AmenityPicker from "@/components/vehicles/AmenityPicker";
import Field from "@/components/ui/Field";
import styles from "./Form.module.css";

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

// Adds a bus, or edits one (`bus` given). Saving sends it to admin review.
// `drivers` are the owner's drivers; every bus needs one assigned.
export default function BusForm({ bus, drivers }) {
  const [state, formAction, pending] = useActionState(saveBus, {});
  const v = state?.values ?? bus ?? { ac: true, seating: "seater" };
  const e = state?.errors ?? {};
  const photos = bus?.photos ?? [];
  const documents = bus?.documents ?? {};

  return (
    <form action={formAction} className={styles.form} noValidate>
      {bus && <input type="hidden" name="busId" value={bus.id} />}
      {state?.formError && <p className="alert alert-error" role="alert">{state.formError}</p>}
      {Object.keys(e).length > 0 && <p className="alert alert-error" role="alert">Please fix the highlighted fields. Files need to be picked again after an error.</p>}

      <Section num="01" title="The vehicle">
        <Field label="Listing name" htmlFor="title" error={e.title} hint="What travellers see, e.g. “Volvo 9600 Multi-axle”. No phone numbers or company names.">
          <input id="title" name="title" className="input" defaultValue={v.title ?? ""} />
        </Field>
        <div className="form-grid">
          <Field label="Vehicle type" htmlFor="type" error={e.type}>
            <select id="type" name="type" className="select" defaultValue={v.type ?? ""}>
              <option value="" disabled>Select type</option>
              {VEHICLE_TYPES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
            </select>
          </Field>
          <Field label="Seating" htmlFor="seating" error={e.seating}>
            <select id="seating" name="seating" className="select" defaultValue={v.seating ?? "seater"}>
              {SEATING.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </Field>
          <Field label="Seats" htmlFor="seats" error={e.seats}>
            <input id="seats" name="seats" type="number" min="4" max="60" className="input" defaultValue={v.seats ?? ""} />
          </Field>
          <Field label="Model year" htmlFor="modelYear" error={e.modelYear}>
            <input id="modelYear" name="modelYear" type="number" className="input" placeholder="2023" defaultValue={v.modelYear ?? ""} />
          </Field>
          <Field label="Registration number" htmlFor="registrationNumber" error={e.registrationNumber} hint="Shared with travellers only after they pay">
            <input id="registrationNumber" name="registrationNumber" className="input" placeholder="DL01 AB 1234" style={{ textTransform: "uppercase" }} defaultValue={v.registrationNumber ?? ""} />
          </Field>
        </div>
        <label className="check">
          <input type="checkbox" name="ac" defaultChecked={v.ac} /> Air-conditioned
        </label>
      </Section>

      <Section num="02" title="Photos">
        <p className="hint">Shown on the listing. Exterior, interior and seats work best. JPG, PNG or WebP, up to 5 MB each, 6 photos at most.</p>
        {photos.length > 0 && (
          <div className={styles.photoGrid}>
            {photos.map((id) => (
              <label key={id} className={styles.photo}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/files/${id}`} alt="Bus photo" />
                <span className="check"><input type="checkbox" name="removePhotos" value={id} /> Remove</span>
              </label>
            ))}
          </div>
        )}
        <Field label={photos.length ? "Add more photos" : "Bus photos"} htmlFor="photos" error={e.photos}>
          <input id="photos" name="photos" type="file" accept="image/jpeg,image/png,image/webp" multiple className="input" />
        </Field>
      </Section>

      <Section num="03" title="Documents">
        <p className="hint">Upload a clear scan or photo of each. Only the General Travels team sees them. PDF, JPG or PNG, up to 5 MB each.</p>
        <div className={styles.docUploads}>
          {BUS_DOCUMENTS.map((d) => (
            <Field key={d.id} label={d.label} htmlFor={`doc_${d.id}`} error={e[`doc_${d.id}`]}>
              {documents[d.id] && (
                <a href={`/files/${documents[d.id]}`} target="_blank" rel="noreferrer" className={styles.uploaded}>
                  <FileCheck2 size={14} /> Uploaded · view
                </a>
              )}
              <input id={`doc_${d.id}`} name={`doc_${d.id}`} type="file" accept="application/pdf,image/jpeg,image/png,image/webp" className="input" />
            </Field>
          ))}
        </div>
      </Section>

      <Section num="04" title="Driver">
        {drivers.length === 0 ? (
          <p className="alert alert-warning">
            Add a driver first. Every bus needs a verified driver before it goes live. <Link href="/operator/drivers/new"><u>Add a driver</u></Link>
          </p>
        ) : (
          <Field label="Assigned driver" htmlFor="driverId" error={e.driverId} hint="Travellers see the driver's name, photo and number after they pay.">
            <select id="driverId" name="driverId" className="select" defaultValue={v.driverId ?? ""} style={{ maxWidth: 420 }}>
              <option value="" disabled>Select driver</option>
              {drivers.map((d) => (
                <option key={d.id} value={d.id}>{d.name}{d.status !== "approved" ? ` (${d.status === "pending" ? "under review" : "rejected"})` : ""}</option>
              ))}
            </select>
          </Field>
        )}
      </Section>

      <Section num="05" title="Where it picks up">
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

      <Section num="06" title="Your rates">
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

      <Section num="07" title="Amenities">
        {e.amenities && <p className="field-error">{e.amenities}</p>}
        <AmenityPicker selected={v.amenities ?? []} />
      </Section>

      <div className={styles.footer}>
        <Link href="/operator/buses" className="btn btn-outline">Cancel</Link>
        <button type="submit" className="btn btn-primary" disabled={pending || drivers.length === 0}>
          {pending ? "Uploading…" : bus ? "Save and submit for review" : "Submit bus for approval"}
        </button>
      </div>
    </form>
  );
}
