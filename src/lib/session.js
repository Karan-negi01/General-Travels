import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

// Signed cookie session: base64url(JSON payload) + "." + HMAC-SHA256 signature.
// Holds only { role, id, exp }; everything else is looked up from the store.

const COOKIE = "gt_session";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

function secret() {
  const value = process.env.SESSION_SECRET;
  if (value) return value;
  if (process.env.NODE_ENV === "production") throw new Error("SESSION_SECRET must be set in production");
  return "dev-only-session-secret";
}

function sign(payload) {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

export async function readSession() {
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!raw) return null;
  const [payload, signature] = raw.split(".");
  if (!payload || !signature) return null;

  const expected = Buffer.from(sign(payload));
  const actual = Buffer.from(signature);
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null;

  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return session.exp > Date.now() ? session : null;
  } catch {
    return null;
  }
}

// Server Functions only (cookies can't be set while rendering).
export async function writeSession({ role, id }) {
  const payload = Buffer.from(JSON.stringify({ role, id, exp: Date.now() + MAX_AGE * 1000 })).toString("base64url");
  (await cookies()).set(COOKIE, `${payload}.${sign(payload)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function clearSession() {
  (await cookies()).delete(COOKIE);
}
