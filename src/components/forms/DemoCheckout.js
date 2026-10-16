"use client";

import { useActionState, useState } from "react";
import { ShieldCheck, Smartphone, CreditCard, Landmark, FlaskConical } from "lucide-react";
import { payBooking, payBalance } from "@/lib/actions/booking";
import { PAYMENT_METHODS } from "@/lib/payments";
import { formatINR } from "@/lib/format";
import styles from "./DemoCheckout.module.css";

const METHOD_ICONS = { upi: Smartphone, card: CreditCard, netbanking: Landmark };

// DEMO checkout styled after Razorpay's. No money moves: the server records a
// simulated payment. See src/lib/payments.js for what changes to go live.
// `options` = [{ id, label, amount }]; with a single option there's no choice to make.
export default function DemoCheckout({ bookingId, options, balanceOnly = false }) {
  const [state, formAction, pending] = useActionState(balanceOnly ? payBalance : payBooking, {});
  const [option, setOption] = useState(options[options.length - 1].id);
  const [method, setMethod] = useState("upi");
  const amount = options.find((o) => o.id === option)?.amount ?? options[0].amount;

  return (
    <form action={formAction} className={styles.checkout}>
      <input type="hidden" name="id" value={bookingId} />
      <input type="hidden" name="method" value={method} />
      {!balanceOnly && <input type="hidden" name="option" value={option} />}

      <div className={styles.demo}>
        <FlaskConical size={15} /> Demo payment. No money is charged.
      </div>

      {state?.error && <p className="alert alert-error" role="alert">{state.error}</p>}

      {options.length > 1 && (
        <fieldset className={styles.group}>
          <legend>How much to pay now</legend>
          {options.map((o) => (
            <label key={o.id} className={`${styles.choice} ${option === o.id ? styles.selected : ""}`}>
              <input type="radio" name="option-choice" value={o.id} checked={option === o.id} onChange={() => setOption(o.id)} />
              <span>
                <strong>{o.label}</strong>
                {o.note && <small>{o.note}</small>}
              </span>
              <span className={styles.amount}>{formatINR(o.amount)}</span>
            </label>
          ))}
        </fieldset>
      )}

      <fieldset className={styles.group}>
        <legend>Pay with</legend>
        <div className={styles.methods}>
          {PAYMENT_METHODS.map((m) => {
            const Icon = METHOD_ICONS[m.id];
            return (
              <label key={m.id} className={`${styles.method} ${method === m.id ? styles.selected : ""}`}>
                <input type="radio" name="method-choice" value={m.id} checked={method === m.id} onChange={() => setMethod(m.id)} />
                <Icon size={18} /> {m.label}
              </label>
            );
          })}
        </div>
        {method === "upi" && <input className="input" placeholder="yourname@upi (demo, any value)" aria-label="UPI ID" />}
        {method === "card" && <input className="input" placeholder="4111 1111 1111 1111 (demo card)" aria-label="Card number" inputMode="numeric" />}
        {method === "netbanking" && (
          <select className="select" aria-label="Bank" defaultValue="">
            <option value="" disabled>Choose your bank (demo)</option>
            <option>State Bank of India</option>
            <option>HDFC Bank</option>
            <option>ICICI Bank</option>
            <option>Axis Bank</option>
          </select>
        )}
      </fieldset>

      <button className="btn btn-primary btn-lg btn-block" disabled={pending}>
        {pending ? "Processing payment…" : `Pay ${formatINR(amount)}`}
      </button>
      <p className={styles.secure}><ShieldCheck size={14} /> Payments by Razorpay · UPI, cards and net banking</p>
    </form>
  );
}
