"use client";

import Link from "next/link";
import { GitCompareArrows, X } from "lucide-react";
import { useCompare, MAX_COMPARE } from "./compareStore";
import styles from "./Compare.module.css";

// Sticky bar on the results page. `query` carries the trip so fares follow along.
export default function CompareBar({ query = "" }) {
  const { ids, clear } = useCompare();
  if (ids.length === 0) return null;
  const href = `/compare?ids=${ids.join(",")}${query ? `&${query}` : ""}`;
  return (
    <div className={styles.bar} role="region" aria-label="Compare buses">
      <p>
        <GitCompareArrows size={16} /> <strong>{ids.length}</strong> of {MAX_COMPARE} buses selected
      </p>
      <div className={styles.barActions}>
        <button type="button" className="btn btn-ghost btn-sm" onClick={clear}><X size={14} /> Clear</button>
        {ids.length >= 2 ? (
          <Link href={href} className="btn btn-primary btn-sm">Compare side by side</Link>
        ) : (
          <span className="hint">Pick one more to compare</span>
        )}
      </div>
    </div>
  );
}
