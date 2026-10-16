"use client";

import { useSyncExternalStore } from "react";

// Buses the traveller picked to compare (max 5). Kept in localStorage so the
// selection survives page changes; the page still works if storage is blocked.
export const MAX_COMPARE = 5;
const KEY = "gt-compare";
const listeners = new Set();
let memory = "";

function read() {
  try {
    return window.localStorage.getItem(KEY) ?? "";
  } catch {
    return memory;
  }
}

function write(ids) {
  const value = ids.join(",");
  memory = value;
  try {
    window.localStorage.setItem(KEY, value);
  } catch {
    // Storage blocked (private mode etc.): the in-memory copy still works.
  }
  listeners.forEach((fn) => fn());
}

function subscribe(fn) {
  listeners.add(fn);
  const onStorage = (e) => e.key === KEY && fn();
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(fn);
    window.removeEventListener("storage", onStorage);
  };
}

const toIds = (value) => (value ? value.split(",").filter(Boolean) : []);

export function useCompare() {
  const value = useSyncExternalStore(subscribe, read, () => "");
  const ids = toIds(value);
  return {
    ids,
    toggle(id) {
      const current = toIds(read());
      if (current.includes(id)) write(current.filter((x) => x !== id));
      else if (current.length < MAX_COMPARE) write([...current, id]);
    },
    clear() {
      write([]);
    },
  };
}
