"use client";

import { useActionState } from "react";
import { createEnquiry } from "@/lib/actions/enquiry";
import { CITIES, VEHICLE_TYPES, TRIP_TYPES, CUSTOMER_TYPES } from "@/lib/constants/vehicles";
import AmenityPicker from "@/components/vehicles/AmenityPicker";
import Field from "@/components/ui/Field";
import styles from "./FormLayout.module.css";

export default function EnquiryForm({ initialValues = {} }) {
  const [state, formAction, pending] = useActionState(createEnquiry, { values: initialValues });
  const v = state?.values ?? {};
  const e = state?.errors ?? {};
  const today = new Date().toISOString().slice(0, 10);

  return (
    <form action={formAction} className={styles.form} noValidate>
      {Object.keys(e).length > 0 && (
        <p className="alert alert-error" role="alert">Please fix the highlighted fields.</p>
      )}

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>1. Trip details</h2>
        <div className="form-grid">
          <Field label="Trip type" htmlFor="tripType" error={e.tripType}>
            <select id="tripType" name="tripType" className="select" defaultValue={v.tripType ?? "round-trip"}>
              {TRIP_TYPES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
            </select>
          </Field>
          <Field label="Pickup city" htmlFor="pickupCity" error={e.pickupCity}>
            <select id="pickupCity" name="pickupCity" className="select" defaultValue={v.pickupCity ?? ""}>
              <option value="" disabled>Select city</option>
              {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Destination" htmlFor="dropCity" error={e.dropCity} hint="Leave blank for local trips">
            <input id="dropCity" name="dropCity" className="input" placeholder="e.g. Jaipur" defaultValue={v.dropCity ?? ""} />
          </Field>
          <Field label="Start date" htmlFor="startDate" error={e.startDate}>
            <input id="startDate" name="startDate" type="date" min={today} className="input" defaultValue={v.startDate ?? ""} />
          </Field>
          <Field label="End date" htmlFor="endDate" error={e.endDate}>
            <input id="endDate" name="endDate" type="date" min={today} className="input" defaultValue={v.endDate ?? ""} />
          </Field>
          <Field label="Passengers" htmlFor="passengers" error={e.passengers}>
            <input id="passengers" name="passengers" type="number" min="1" max="500" className="input" defaultValue={v.passengers ?? ""} />
          </Field>
          <Field label="Preferred vehicle" htmlFor="vehicleType" error={e.vehicleType}>
            <select id="vehicleType" name="vehicleType" className="select" defaultValue={v.vehicleType ?? ""}>
              <option value="">No preference</option>
              {VEHICLE_TYPES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
            </select>
          </Field>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>2. Must-have amenities</h2>
        <p className="hint">Only operators whose vehicles have all of these will be asked to quote.</p>
        <AmenityPicker selected={v.requiredAmenities ?? []} />
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>3. Your details</h2>
        <div className="form-grid">
          <Field label="You are booking for" htmlFor="customerType" error={e.customerType}>
            <select id="customerType" name="customerType" className="select" defaultValue={v.customerType ?? ""}>
              <option value="" disabled>Select</option>
              {CUSTOMER_TYPES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
            </select>
          </Field>
          <Field label="Full name" htmlFor="customerName" error={e.customerName}>
            <input id="customerName" name="customerName" className="input" autoComplete="name" defaultValue={v.customerName ?? ""} />
          </Field>
          <Field label="Organisation (optional)" htmlFor="organisation">
            <input id="organisation" name="organisation" className="input" autoComplete="organization" defaultValue={v.organisation ?? ""} />
          </Field>
          <Field label="Mobile number" htmlFor="phone" error={e.phone}>
            <input id="phone" name="phone" type="tel" className="input" autoComplete="tel" placeholder="+91" defaultValue={v.phone ?? ""} />
          </Field>
          <Field label="Email (optional)" htmlFor="email" error={e.email}>
            <input id="email" name="email" type="email" className="input" autoComplete="email" defaultValue={v.email ?? ""} />
          </Field>
        </div>
        <Field label="Anything else operators should know?" htmlFor="notes">
          <textarea id="notes" name="notes" className="textarea" placeholder="Pickup points, stops, luggage, timing…" defaultValue={v.notes ?? ""} />
        </Field>
      </section>

      <div className={styles.footer}>
        <p className="hint">Your phone number and email are only shared with the operator whose quote you accept.</p>
        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending ? "Submitting…" : "Get quotes"}
        </button>
      </div>
    </form>
  );
}
