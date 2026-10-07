import styles from "./AuthSplit.module.css";

// Two-column page: a dark navy story panel beside a form card.
export default function AuthSplit({ aside, children }) {
  return (
    <div className={`container ${styles.wrap}`}>
      <div className={styles.split}>
        <div className={styles.aside}>{aside}</div>
        <div className={styles.form}>{children}</div>
      </div>
    </div>
  );
}
