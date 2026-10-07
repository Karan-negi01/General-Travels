"use server";

import { revalidatePath } from "next/cache";
import { updateDb } from "@/lib/data/store";
import { requireAdmin } from "@/lib/auth";
import { str } from "@/lib/validation";

const REVIEW_STATUSES = ["approved", "rejected", "pending"];

export async function setVendorStatus(formData) {
  await requireAdmin();
  const id = str(formData, "id");
  const status = str(formData, "status");
  if (!REVIEW_STATUSES.includes(status)) throw new Error("Invalid status");

  await updateDb((db) => {
    const vendor = db.vendors.find((v) => v.id === id);
    if (!vendor) throw new Error("Vendor not found");
    vendor.status = status;
    vendor.reviewedAt = new Date().toISOString();
  });

  revalidatePath("/admin", "layout");
  revalidatePath("/buses");
}

export async function setVehicleStatus(formData) {
  await requireAdmin();
  const id = str(formData, "id");
  const status = str(formData, "status");
  if (!REVIEW_STATUSES.includes(status)) throw new Error("Invalid status");

  await updateDb((db) => {
    const vehicle = db.vehicles.find((v) => v.id === id);
    if (!vehicle) throw new Error("Vehicle not found");
    vehicle.status = status;
    vehicle.reviewedAt = new Date().toISOString();
  });

  revalidatePath("/admin", "layout");
  revalidatePath("/vendor", "layout");
  revalidatePath("/buses");
}
