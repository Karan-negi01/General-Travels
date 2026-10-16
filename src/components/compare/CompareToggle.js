"use client";

import { GitCompareArrows } from "lucide-react";
import { useCompare, MAX_COMPARE } from "./compareStore";
import styles from "./Compare.module.css";

export default function CompareToggle({ busId }) {
  const { ids, toggle } = useCompare();
  const selected = ids.includes(busId);
  const full = !selected && ids.length >= MAX_COMPARE;
  return (
    <label className={`${styles.toggle} ${selected ? styles.on : ""}`} title={full ? `You can compare up to ${MAX_COMPARE} buses` : undefined}>
      <input type="checkbox" checked={selected} disabled={full} onChange={() => toggle(busId)} />
      <GitCompareArrows size={14} /> {selected ? "Added to compare" : "Compare"}
    </label>
  );
}
