import "server-only";

import { redirect } from "next/navigation";
import { readSession } from "./session";
import { readDb } from "./data/store";

// Three roles use the platform:
//   customer — searches and books buses            → /bookings
//   operator — bus owner who lists buses            → /operator
//   admin    — General Travels team that approves   → /admin
//
// Every portal page and every server action calls one of the require* helpers.
// Layouts alone don't protect pages, so pages check too.

export const ROLE_HOME = {
  customer: "/bookings",
  operator: "/operator",
  admin: "/admin",
};

export const ADMIN_USER = { id: "admin", name: "General Travels Admin" };

// The signed-in user, or null. `record` is the customer/operator document.
export async function getViewer() {
  const session = await readSession();
  if (!session) return null;

  if (session.role === "admin") return { role: "admin", id: ADMIN_USER.id, name: ADMIN_USER.name };

  const db = await readDb();
  if (session.role === "customer") {
    const customer = db.customers.find((c) => c.id === session.id);
    return customer ? { role: "customer", id: customer.id, name: customer.name, record: customer } : null;
  }
  if (session.role === "operator") {
    const operator = db.operators.find((o) => o.id === session.id);
    return operator ? { role: "operator", id: operator.id, name: operator.ownerName, record: operator } : null;
  }
  return null;
}

async function requireRole(role, next) {
  const viewer = await getViewer();
  if (viewer?.role === role) return viewer;
  const params = new URLSearchParams({ role });
  if (next) params.set("next", next);
  redirect(`/login?${params}`);
}

export function requireCustomer(next) {
  return requireRole("customer", next);
}

export function requireOperator(next) {
  return requireRole("operator", next);
}

export function requireAdmin(next) {
  return requireRole("admin", next);
}
