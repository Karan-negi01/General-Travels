import "server-only";

import { connection } from "next/server";

// PoC auth stub. Every server action and portal page calls these helpers, so
// real auth (e.g. Auth.js / Clerk with phone-OTP for vendors) can be dropped in
// here without touching the rest of the app.

const DEMO_VENDOR_ID = "ven_general";

export async function getCurrentVendorId() {
  // Portal pages depend on who is logged in, so render them per request.
  // (Reading the session cookie will do this automatically once auth exists.)
  await connection();
  // TODO: read from the session once auth is implemented.
  return DEMO_VENDOR_ID;
}

export async function requireAdmin() {
  await connection();
  // TODO: verify the session user has the admin role; throw otherwise.
  return { id: "admin_demo", role: "admin" };
}
