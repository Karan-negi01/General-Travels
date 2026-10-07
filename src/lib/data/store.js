import "server-only";

import { promises as fs } from "node:fs";
import path from "node:path";
import { seed } from "./seed";

// PoC persistence: a single JSON file in `.data/db.json`.
// Every read/write in the app goes through this module, so swapping it for
// Postgres (e.g. via Prisma or Drizzle) later only touches `src/lib/data/*`.
//
// NOTE: this works for local development and a single-server demo only.
// Serverless hosts (Vercel) have a read-only filesystem — move to a real
// database before deploying.

const DB_DIR = path.join(process.cwd(), ".data");
const DB_FILE = path.join(DB_DIR, "db.json");

// Serialise writes so concurrent server actions don't clobber each other.
let writeQueue = Promise.resolve();

export async function readDb() {
  try {
    const raw = await fs.readFile(DB_FILE, "utf8");
    return JSON.parse(raw);
  } catch (err) {
    if (err.code !== "ENOENT") throw err;
    await fs.mkdir(DB_DIR, { recursive: true });
    await fs.writeFile(DB_FILE, JSON.stringify(seed, null, 2));
    return structuredClone(seed);
  }
}

// `mutator` receives the current db, mutates it in place, and may return a value.
export function updateDb(mutator) {
  const run = writeQueue.then(async () => {
    const db = await readDb();
    const result = await mutator(db);
    await fs.writeFile(DB_FILE, JSON.stringify(db, null, 2));
    return result;
  });
  writeQueue = run.catch(() => {});
  return run;
}

export function newId(prefix) {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}
