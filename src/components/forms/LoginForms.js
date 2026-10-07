"use client";

import { useActionState } from "react";
import { loginCustomer, loginOperator, loginAdmin } from "@/lib/actions/auth";
import Field from "@/components/ui/Field";

export function CustomerLogin({ next }) {
  const [state, formAction, pending] = useActionState(loginCustomer, {});
  const v = state?.values ?? {};
  const e = state?.errors ?? {};
  return (
    <form action={formAction} className="stack" noValidate>
      <input type="hidden" name="next" value={next ?? ""} />
      <Field label="Mobile number" htmlFor="phone" error={e.phone}>
        <input id="phone" name="phone" type="tel" className="input" placeholder="98100 00000" autoComplete="tel" defaultValue={v.phone ?? ""} />
      </Field>
      {state?.newAccount && (
        <>
          <Field label="Your name" htmlFor="name" error={e.name}>
            <input id="name" name="name" className="input" autoComplete="name" autoFocus />
          </Field>
          <Field label="Email (optional, for invoices)" htmlFor="email" error={e.email}>
            <input id="email" name="email" type="email" className="input" autoComplete="email" />
          </Field>
        </>
      )}
      <button type="submit" className="btn btn-primary btn-lg" disabled={pending}>
        {pending ? "Please wait…" : state?.newAccount ? "Create account & continue" : "Continue"}
      </button>
      <p className="hint">New here? Enter your number and we&apos;ll create your account. OTP verification is added before launch.</p>
    </form>
  );
}

export function OperatorLogin({ next }) {
  const [state, formAction, pending] = useActionState(loginOperator, {});
  const e = state?.errors ?? {};
  return (
    <form action={formAction} className="stack" noValidate>
      <input type="hidden" name="next" value={next ?? ""} />
      <Field label="Registered mobile number" htmlFor="op-phone" error={e.phone}>
        <input id="op-phone" name="phone" type="tel" className="input" placeholder="98100 00000" autoComplete="tel" defaultValue={state?.values?.phone ?? ""} />
      </Field>
      <button type="submit" className="btn btn-primary btn-lg" disabled={pending}>
        {pending ? "Signing in…" : "Sign in to operator portal"}
      </button>
    </form>
  );
}

export function AdminLogin({ next }) {
  const [state, formAction, pending] = useActionState(loginAdmin, {});
  const e = state?.errors ?? {};
  return (
    <form action={formAction} className="stack" noValidate>
      <input type="hidden" name="next" value={next ?? ""} />
      <Field label="Admin password" htmlFor="password" error={e.password}>
        <input id="password" name="password" type="password" className="input" autoComplete="current-password" />
      </Field>
      <button type="submit" className="btn btn-secondary btn-lg" disabled={pending}>
        {pending ? "Signing in…" : "Sign in to admin console"}
      </button>
    </form>
  );
}
