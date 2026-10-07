"use client";

import { useActionState } from "react";
import { registerOperator } from "@/lib/actions/operator";
import { CITIES } from "@/lib/constants/vehicles";
import Field from "@/components/ui/Field";

export default function OperatorSignupForm() {
  const [state, formAction, pending] = useActionState(registerOperator, {});
  const v = state?.values ?? {};
  const e = state?.errors ?? {};

  return (
    <form action={formAction} className="stack" noValidate>
      {Object.keys(e).length > 0 && <p className="alert alert-error" role="alert">Please fix the highlighted fields.</p>}
      <div className="form-grid">
        <Field label="Business name" htmlFor="businessName" error={e.businessName}>
          <input id="businessName" name="businessName" className="input" placeholder="e.g. Sharma Tours & Travels" defaultValue={v.businessName ?? ""} />
        </Field>
        <Field label="Owner name" htmlFor="ownerName" error={e.ownerName}>
          <input id="ownerName" name="ownerName" className="input" autoComplete="name" defaultValue={v.ownerName ?? ""} />
        </Field>
        <Field label="Mobile number" htmlFor="phone" error={e.phone} hint="You'll sign in with this number">
          <input id="phone" name="phone" type="tel" className="input" placeholder="98100 00000" autoComplete="tel" defaultValue={v.phone ?? ""} />
        </Field>
        <Field label="Email (optional)" htmlFor="email" error={e.email}>
          <input id="email" name="email" type="email" className="input" autoComplete="email" defaultValue={v.email ?? ""} />
        </Field>
        <Field label="Base city" htmlFor="city" error={e.city}>
          <select id="city" name="city" className="select" defaultValue={v.city ?? ""}>
            <option value="" disabled>Select city</option>
            {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="Buses you own" htmlFor="fleetSize">
          <input id="fleetSize" name="fleetSize" type="number" min="1" className="input" defaultValue={v.fleetSize ?? ""} />
        </Field>
        <Field label="PAN" htmlFor="panNumber" error={e.panNumber}>
          <input id="panNumber" name="panNumber" className="input" placeholder="ABCDE1234F" style={{ textTransform: "uppercase" }} defaultValue={v.panNumber ?? ""} />
        </Field>
        <Field label="GSTIN (if registered)" htmlFor="gstNumber" error={e.gstNumber}>
          <input id="gstNumber" name="gstNumber" className="input" placeholder="07ABCDE1234F1Z5" style={{ textTransform: "uppercase" }} defaultValue={v.gstNumber ?? ""} />
        </Field>
      </div>
      <button type="submit" className="btn btn-primary btn-lg" disabled={pending}>
        {pending ? "Creating account…" : "Create operator account"}
      </button>
      <p className="hint">
        Your account is reviewed once by our team (usually within one working day). You can add your buses straight away. They go live as soon as they&apos;re approved.
      </p>
    </form>
  );
}
