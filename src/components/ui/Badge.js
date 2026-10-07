import { STATUS_TONE } from "@/lib/constants/status";
import styles from "./Badge.module.css";

export default function Badge({ children, tone, status }) {
  const resolved = tone ?? STATUS_TONE[status] ?? "neutral";
  return <span className={`${styles.badge} ${styles[resolved]}`}>{children ?? status}</span>;
}
