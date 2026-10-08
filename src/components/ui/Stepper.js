import Link from "next/link";
import { Check } from "lucide-react";
import styles from "./Stepper.module.css";

// Vertical progress tracker. Each step: { title, text, state: "done" | "current" | "todo" | "blocked", action? }
export default function Stepper({ steps }) {
  return (
    <ol className={styles.steps}>
      {steps.map((step, i) => (
        <li key={step.title} className={`${styles.step} ${styles[step.state]}`}>
          <span className={styles.dot} aria-hidden="true">
            {step.state === "done" ? <Check size={14} strokeWidth={3} /> : i + 1}
          </span>
          <div className={styles.body}>
            <p className={styles.title}>{step.title}</p>
            <p className={styles.text}>{step.text}</p>
            {step.action && (
              <Link href={step.action.href} className="btn btn-primary btn-sm" style={{ marginTop: 10 }}>
                {step.action.label}
              </Link>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
