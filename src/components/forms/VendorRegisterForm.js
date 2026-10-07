"use client";

import { useActionState } from "react";
import { registerVendor } from "@/lib/actions/vendor";
import { CITIES } from "@/lib/constants/vehicles";
import Field from "@/components/ui/Field";

export default function VendorRegisterForm() {
  const [state, formAction, pending] = useActionState(registerVendor, {});
  const v = state?.values ?? {};
  const e = state?.errors ?? {};

  if (state?.success) {
    return (
      <div className="alert alert-success">
        Thanks! Our partner team will call you within one working day to verify your documents and help list your
        vehicles.
      </div>
    );
  }

  return (
    <form action={formAction} className="stack" noValidate>
      <Field label="Business name" htmlFor="name" error={e.name}>
        <input id="name" name="name" className="input" defaultValue={v.name ?? ""} />
      </Field>
      <Field label="Contact person" htmlFor="contactName" error={e.contactName}>
        <input id="contactName" name="contactName" className="input" autoComplete="name" defaultValue={v.contactName ?? ""} />
      </Field>
      <div className="form-grid">
        <Field label="Mobile number" htmlFor="phone" error={e.phone}>
          <input id="phone" name="phone" type="tel" className="input" placeholder="+91" defaultValue={v.phone ?? ""} />
        </Field>
        <Field label="Email (optional)" htmlFor="email" error={e.email}>
          <input id="email" name="email" type="email" className="input" defaultValue={v.email ?? ""} />
        </Field>
        <Field label="Base city" htmlFor="city" error={e.city}>
          <select id="city" name="city" className="select" defaultValue={v.city ?? ""}>
            <option value="" disabled>Select city</option>
            {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="Number of vehicles" htmlFor="fleetSize">
          <input id="fleetSize" name="fleetSize" type="number" min="1" className="input" defaultValue={v.fleetSize ?? ""} />
        </Field>
      </div>
      <button type="submit" className="btn btn-primary" disabled={pending}>
        {pending ? "Submitting…" : "Register as partner"}
      </button>
      <p className="hint">Prefer a call? Our team can register you over the phone. Just leave your number above.</p>
    </form>
  );
}
