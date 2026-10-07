import { STATUS_TONE, STATUS_LABEL } from "@/lib/constants/status";
import styles from "./Badge.module.css";

// `kind` picks friendly wording: "review" (operators/buses) or "booking".
export default function Badge({ children, tone, status, kind }) {
  const resolved = tone ?? STATUS_TONE[status] ?? "neutral";
  const label = children ?? STATUS_LABEL[kind]?.[status] ?? status;
  return <span className={`${styles.badge} ${styles[resolved]}`}>{label}</span>;
}
