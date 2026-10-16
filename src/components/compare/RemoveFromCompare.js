"use client";

import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { useCompare } from "./compareStore";

// Drops a bus from the comparison and reloads the page without it.
export default function RemoveFromCompare({ busId, remainingHref }) {
  const { ids, toggle } = useCompare();
  const router = useRouter();
  return (
    <button
      type="button"
      className="btn btn-outline btn-sm"
      onClick={() => {
        if (ids.includes(busId)) toggle(busId);
        router.replace(remainingHref);
      }}
    >
      <X size={14} /> Remove
    </button>
  );
}
