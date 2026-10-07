import styles from "./EmptyState.module.css";

export default function EmptyState({ title, text, children }) {
  return (
    <div className={styles.empty}>
      <h2 className={styles.title}>{title}</h2>
      {text && <p className={styles.text}>{text}</p>}
      {children && <div className={styles.actions}>{children}</div>}
    </div>
  );
}
