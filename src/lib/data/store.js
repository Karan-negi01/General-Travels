import "server-only";

import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { seed, SCHEMA_VERSION } from "./seed";

// PoC persistence: a single JSON file in `.data/db.json`.
// Every read/write in the app goes through this module, so swapping it for
// Postgres (e.g. via Prisma or Drizzle) later only touches `src/lib/data/*`.
//
// NOTE: on Vercel the project folder is read-only, so the file lives in the
// writable temp folder instead. That is enough for a demo, but the data resets
// whenever Vercel starts a fresh server instance, and separate instances don't
// share it. Move to a real database before real users rely on it.

const DB_DIR = process.env.DATA_DIR || (process.env.VERCEL ? path.join(os.tmpdir(), "general-travels") : path.join(process.cwd(), ".data"));
const DB_FILE = path.join(DB_DIR, "db.json");

// Serialise writes so concurrent server actions don't clobber each other.
let writeQueue = Promise.resolve();

async function reset() {
  await fs.mkdir(DB_DIR, { recursive: true });
  await fs.writeFile(DB_FILE, JSON.stringify(seed, null, 2));
  return structuredClone(seed);
}

export async function readDb() {
  let db;
  try {
    db = JSON.parse(await fs.readFile(DB_FILE, "utf8"));
  } catch (err) {
    if (err.code !== "ENOENT") throw err;
    return reset();
  }
  // A file from an older data model is replaced with fresh demo data.
  return db.version === SCHEMA_VERSION ? db : reset();
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

// Short human-friendly booking reference, e.g. "GT-7K3QX".
export function newBookingRef() {
  return `GT-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
}

// ---------- Uploaded files (bus photos, documents, driver licences) ----------
// Bytes live next to the JSON file in `uploads/`; their metadata lives in `db.files`.
// Move both to object storage (S3 / Cloudflare R2) with the database.

const UPLOAD_DIR = path.join(DB_DIR, "uploads");

export const UPLOAD_RULES = {
  photo: { types: ["image/jpeg", "image/png", "image/webp"], maxBytes: 5 * 1024 * 1024, label: "JPG, PNG or WebP up to 5 MB" },
  document: { types: ["application/pdf", "image/jpeg", "image/png", "image/webp"], maxBytes: 5 * 1024 * 1024, label: "PDF, JPG or PNG up to 5 MB" },
};

// True when the form field holds a file the user actually picked.
export function hasFile(value) {
  return typeof value === "object" && value !== null && typeof value.arrayBuffer === "function" && value.size > 0;
}

// Returns an error message, or null when the file is acceptable.
export function checkUpload(file, kind) {
  const rule = UPLOAD_RULES[kind];
  if (!rule.types.includes(file.type)) return `Upload a ${rule.label}`;
  if (file.size > rule.maxBytes) return `File is too large (${rule.label})`;
  return null;
}

// Writes the bytes and returns the file record; the caller pushes it into `db.files`.
export async function saveUpload(file, { operatorId, kind }) {
  const id = newId("file");
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  await fs.writeFile(path.join(UPLOAD_DIR, id), Buffer.from(await file.arrayBuffer()));
  return { id, operatorId, kind, name: file.name.slice(0, 120), mime: file.type, size: file.size, createdAt: new Date().toISOString() };
}

export async function readUpload(id) {
  return fs.readFile(path.join(UPLOAD_DIR, path.basename(id)));
}
