"use server";

import { redirect } from "next/navigation";
import { writeSession, clearSession } from "@/lib/session";
import { ROLE_HOME } from "@/lib/auth";
import { DEMO_MODE } from "@/lib/demo";
import { readDb, updateDb, newId } from "@/lib/data/store";
import { str, required, normalizePhone, safeNext, PHONE_RE, EMAIL_RE } from "@/lib/validation";

// PoC sign-in: customers and operators sign in with their mobile number.
// TODO (MVP): send and verify an SMS OTP before writing the session.

export async function loginCustomer(prevState, formData) {
  const values = { name: str(formData, "name"), phone: str(formData, "phone"), email: str(formData, "email") };
  const errors = {};
  required(errors, values, ["phone"]);
  if (values.phone && !PHONE_RE.test(values.phone)) errors.phone = "Enter a valid 10-digit mobile number";
  if (values.email && !EMAIL_RE.test(values.email)) errors.email = "Enter a valid email";
  if (Object.keys(errors).length) return { errors, values };

  const phone = normalizePhone(values.phone);
  const result = await updateDb((db) => {
    const existing = db.customers.find((c) => c.phone === phone);
    if (existing) return { id: existing.id };
    // First visit: create the account. A name is needed for bookings.
    if (!values.name) return { needsName: true };
    const customer = { id: newId("cus"), name: values.name, phone, email: values.email, createdAt: new Date().toISOString() };
    db.customers.push(customer);
    return { id: customer.id };
  });

  if (result.needsName) {
    return { values, newAccount: true, errors: { name: "New here? Tell us your name to create your account." } };
  }
  await writeSession({ role: "customer", id: result.id });
  redirect(safeNext(str(formData, "next"), ROLE_HOME.customer));
}

export async function loginOperator(prevState, formData) {
  const values = { phone: str(formData, "phone") };
  if (!PHONE_RE.test(values.phone)) return { values, errors: { phone: "Enter a valid 10-digit mobile number" } };

  const db = await readDb();
  const operator = db.operators.find((o) => o.phone === normalizePhone(values.phone));
  if (!operator) {
    return { values, errors: { phone: "No operator account uses this number. Register as a partner first." } };
  }
  await writeSession({ role: "operator", id: operator.id });
  redirect(safeNext(str(formData, "next"), ROLE_HOME.operator));
}

export async function loginAdmin(prevState, formData) {
  const password = str(formData, "password");
  // Demo fallback so the demo works out of the box; production must set ADMIN_PASSWORD.
  const expected = process.env.ADMIN_PASSWORD || (DEMO_MODE ? "admin" : null);
  if (!expected || password !== expected) return { errors: { password: "Incorrect password" } };
  await writeSession({ role: "admin", id: "admin" });
  redirect(safeNext(str(formData, "next"), ROLE_HOME.admin));
}

// One-click demo accounts (demo mode only) so each role can be shown quickly.
const DEMO_ACCOUNTS = {
  customer: { role: "customer", id: "cus_priya" },
  operator: { role: "operator", id: "op_general" },
  "operator-pending": { role: "operator", id: "op_pinkcity" },
  admin: { role: "admin", id: "admin" },
};

export async function demoLogin(formData) {
  if (!DEMO_MODE) throw new Error("Demo sign-in is disabled");
  const account = DEMO_ACCOUNTS[str(formData, "account")];
  if (!account) throw new Error("Unknown demo account");
  await writeSession(account);
  redirect(ROLE_HOME[account.role]);
}

export async function logout() {
  await clearSession();
  redirect("/");
}
