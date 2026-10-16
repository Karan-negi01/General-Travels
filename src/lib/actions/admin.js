"use server";

import { revalidatePath } from "next/cache";
import { updateDb } from "@/lib/data/store";
import { requireAdmin } from "@/lib/auth";
import { str } from "@/lib/validation";

const DECISIONS = ["approved", "rejected"];

function revalidateAll() {
  revalidatePath("/admin", "layout");
  revalidatePath("/operator", "layout");
  revalidatePath("/buses", "layout");
  revalidatePath("/");
}

// Every rejection or suspension carries a reason the owner sees on their
// dashboard, so they can correct it and re-apply.
function readDecision(formData) {
  const status = str(formData, "status");
  const reason = str(formData, "reason").slice(0, 500);
  if (!DECISIONS.includes(status)) return { error: "Invalid decision." };
  if (status === "rejected" && !reason) return { error: "Write the reason so the owner knows what to fix." };
  return { status, reason };
}

function applyDecision(record, { status, reason }) {
  record.status = status;
  record.rejectionReason = status === "rejected" ? reason : null;
  record.reviewedAt = new Date().toISOString();
}

async function decide(formData, find) {
  await requireAdmin();
  const decision = readDecision(formData);
  if (decision.error) return { error: decision.error };
  const result = await updateDb((db) => {
    const found = find(db, str(formData, "id"), decision);
    if (found.error) return found;
    applyDecision(found.record, decision);
    return { ok: true };
  });
  if (result.ok) revalidateAll();
  return result;
}

// One-time verification of a bus owner (personal and company details).
export async function setOperatorStatus(prevState, formData) {
  return decide(formData, (db, id) => {
    const record = db.operators.find((o) => o.id === id);
    return record ? { record } : { error: "Operator not found." };
  });
}

// Each driver is verified on their own (licence, PSV badge, Aadhaar).
export async function setDriverStatus(prevState, formData) {
  return decide(formData, (db, id) => {
    const record = db.drivers.find((d) => d.id === id);
    return record ? { record } : { error: "Driver not found." };
  });
}

// Each bus is approved separately, only once its operator is approved.
export async function setBusStatus(prevState, formData) {
  return decide(formData, (db, id, { status }) => {
    const record = db.buses.find((b) => b.id === id);
    if (!record) return { error: "Bus not found." };
    const operator = db.operators.find((o) => o.id === record.operatorId);
    if (status === "approved" && operator?.status !== "approved") return { error: "Approve the operator before approving their buses." };
    return { record };
  });
}

// ---------- Commission ----------

function readRate(formData) {
  const raw = str(formData, "rate");
  if (raw === "") return { rate: null };
  const rate = Number(raw);
  if (!Number.isFinite(rate) || rate < 0 || rate > 50) return { error: "Enter a rate between 0 and 50%." };
  return { rate: Math.round(rate * 10) / 10 };
}

export async function setDefaultCommission(prevState, formData) {
  await requireAdmin();
  const { rate, error } = readRate(formData);
  if (error || rate === null) return { error: error ?? "Enter the default rate." };
  await updateDb((db) => {
    db.settings.defaultCommissionRate = rate;
  });
  revalidateAll();
  return { ok: true };
}

// A blank rate puts the owner back on the default. Applies to new bookings only;
// existing bookings keep the commission they were made with.
export async function setOperatorCommission(prevState, formData) {
  await requireAdmin();
  const { rate, error } = readRate(formData);
  if (error) return { error };
  const result = await updateDb((db) => {
    const operator = db.operators.find((o) => o.id === str(formData, "id"));
    if (!operator) return { error: "Operator not found." };
    operator.commissionRate = rate;
    return { ok: true };
  });
  if (result.ok) revalidateAll();
  return result;
}
