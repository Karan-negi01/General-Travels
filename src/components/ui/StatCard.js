import Link from "next/link";
import styles from "./StatCard.module.css";

export default function StatCard({ label, value, note, href }) {
  const body = (
    <>
      <p className={styles.label}>{label}</p>
      <p className={styles.value}>{value}</p>
      {note && <p className={styles.note}>{note}</p>}
    </>
  );
  return href ? <Link href={href} className={`${styles.card} ${styles.link}`}>{body}</Link> : <div className={styles.card}>{body}</div>;
}
