import Link from "next/link";
import styles from "./Logo.module.css";

export default function Logo({ href = "/", tone = "light" }) {
  return (
    <Link href={href} className={`${styles.logo} ${styles[tone]}`}>
      <span className={styles.mark} aria-hidden="true">GT</span>
      <span className={styles.word}>
        General <em>Travels</em>
      </span>
    </Link>
  );
}
