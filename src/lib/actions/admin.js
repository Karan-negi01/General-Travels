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

// One-time verification of a bus owner (documents, GST/PAN, a call).
export async function setOperatorStatus(formData) {
  await requireAdmin();
  const id = str(formData, "id");
  const status = str(formData, "status");
  if (!DECISIONS.includes(status)) throw new Error("Invalid status");

  await updateDb((db) => {
    const operator = db.operators.find((o) => o.id === id);
    if (!operator) throw new Error("Operator not found");
    operator.status = status;
    operator.reviewedAt = new Date().toISOString();
  });
  revalidateAll();
}

// Each bus is approved separately — only once its operator is approved.
export async function setBusStatus(formData) {
  await requireAdmin();
  const id = str(formData, "id");
  const status = str(formData, "status");
  if (!DECISIONS.includes(status)) throw new Error("Invalid status");

  await updateDb((db) => {
    const bus = db.buses.find((b) => b.id === id);
    if (!bus) throw new Error("Bus not found");
    const operator = db.operators.find((o) => o.id === bus.operatorId);
    if (status === "approved" && operator?.status !== "approved") {
      throw new Error("Approve the operator before approving their buses");
    }
    bus.status = status;
    bus.reviewedAt = new Date().toISOString();
  });
  revalidateAll();
}
