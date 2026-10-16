"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireOperator } from "@/lib/auth";
import { writeSession } from "@/lib/session";
import { readDb, updateDb, newId, hasFile, checkUpload, saveUpload } from "@/lib/data/store";
import { balanceDue } from "@/lib/payments";
import { isValidAmenity } from "@/lib/constants/amenities";
import { CITIES, SEATING, BUS_DOCUMENTS, getVehicleType } from "@/lib/constants/vehicles";
import { todayISO } from "@/lib/format";
import { str, int, list, required, normalizePhone, PHONE_RE, EMAIL_RE, DATE_RE } from "@/lib/validation";

const GST_RE = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][0-9A-Z]Z[0-9A-Z]$/;
const PAN_RE = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
const AADHAAR_RE = /^[0-9]{12}$/;
const MAX_PHOTOS = 6;

function revalidatePortals() {
  revalidatePath("/operator", "layout");
  revalidatePath("/admin", "layout");
  revalidatePath("/buses", "layout");
}

// ---------- Owner account ----------

function readOwner(formData) {
  return {
    businessName: str(formData, "businessName"),
    ownerName: str(formData, "ownerName"),
    email: str(formData, "email"),
    address: str(formData, "address").slice(0, 300),
    city: str(formData, "city"),
    fleetSize: int(formData, "fleetSize"),
    gstNumber: str(formData, "gstNumber").toUpperCase(),
    panNumber: str(formData, "panNumber").toUpperCase(),
    aadhaarNumber: str(formData, "aadhaarNumber").replace(/\s/g, ""),
  };
}

function checkOwner(values, errors) {
  required(errors, values, ["businessName", "ownerName", "address", "city", "panNumber", "aadhaarNumber"]);
  if (values.email && !EMAIL_RE.test(values.email)) errors.email = "Enter a valid email";
  if (values.city && !CITIES.includes(values.city)) errors.city = "Choose a city from the list";
  if (values.gstNumber && !GST_RE.test(values.gstNumber)) errors.gstNumber = "Enter a valid 15-character GSTIN";
  if (values.panNumber && !PAN_RE.test(values.panNumber)) errors.panNumber = "Enter a valid PAN (e.g. ABCDE1234F)";
  if (values.aadhaarNumber && !AADHAAR_RE.test(values.aadhaarNumber)) errors.aadhaarNumber = "Enter the 12-digit Aadhaar number";
}

// Step 1 for a bus owner: personal and company details. The account starts
// "pending" until the General Travels team verifies it (once).
export async function registerOperator(prevState, formData) {
  const values = { ...readOwner(formData), phone: str(formData, "phone") };
  const errors = {};
  checkOwner(values, errors);
  if (!values.phone) errors.phone = "Required";
  else if (!PHONE_RE.test(values.phone)) errors.phone = "Enter a valid 10-digit mobile number";
  if (formData.get("acceptTerms") !== "on") errors.acceptTerms = "Accept the commission terms to continue";
  if (Object.keys(errors).length) return { errors, values };

  const phone = normalizePhone(values.phone);
  const id = await updateDb((db) => {
    if (db.operators.some((o) => o.phone === phone)) return null;
    const now = new Date().toISOString();
    const operator = { id: newId("op"), ...values, phone, commissionRate: null, termsAcceptedAt: now, status: "pending", createdAt: now };
    db.operators.push(operator);
    return operator.id;
  });
  if (!id) return { values, errors: { phone: "An operator account already uses this number. Sign in instead." } };

  await writeSession({ role: "operator", id });
  revalidatePath("/admin", "layout");
  redirect("/operator?welcome=1");
}

// Approved owners can update their contact details at any time. While the
// account is pending or rejected they can correct everything and (re-)apply.
export async function updateOperatorProfile(prevState, formData) {
  const viewer = await requireOperator();
  const locked = viewer.record.status === "approved";
  const values = readOwner(formData);
  if (locked) {
    for (const key of ["businessName", "ownerName", "city", "gstNumber", "panNumber", "aadhaarNumber"]) values[key] = viewer.record[key];
  }
  const errors = {};
  checkOwner(values, errors);
  if (Object.keys(errors).length) return { errors, values };

  await updateDb((db) => {
    const operator = db.operators.find((o) => o.id === viewer.id);
    Object.assign(operator, values);
    if (!locked) {
      operator.status = "pending";
      operator.rejectionReason = null;
      operator.resubmittedAt = new Date().toISOString();
    }
  });
  revalidatePortals();
  redirect(`/operator/profile?saved=${locked ? "1" : "resubmitted"}`);
}

// ---------- Buses ----------

function readBus(formData) {
  return {
    title: str(formData, "title"),
    type: str(formData, "type"),
    seating: str(formData, "seating"),
    seats: int(formData, "seats"),
    ac: formData.get("ac") === "on",
    modelYear: int(formData, "modelYear"),
    registrationNumber: str(formData, "registrationNumber").toUpperCase(),
    driverId: str(formData, "driverId"),
    baseCity: str(formData, "baseCity"),
    serviceCities: list(formData, "serviceCities").filter((c) => CITIES.includes(c)),
    ratePerKm: int(formData, "ratePerKm"),
    minKmPerDay: int(formData, "minKmPerDay"),
    driverAllowancePerDay: int(formData, "driverAllowancePerDay"),
    amenities: list(formData, "amenities").filter(isValidAmenity),
  };
}

function checkBus(values, errors, ownDriverIds) {
  required(errors, values, ["title", "type", "seating", "seats", "registrationNumber", "driverId", "baseCity", "ratePerKm", "minKmPerDay", "driverAllowancePerDay"]);
  const type = getVehicleType(values.type);
  if (values.type && !type) errors.type = "Invalid vehicle type";
  if (values.seating && !SEATING.some((s) => s.id === values.seating)) errors.seating = "Choose seater, semi-sleeper or sleeper";
  if (type && values.seats && (values.seats < type.seatRange[0] || values.seats > type.seatRange[1])) {
    errors.seats = `${type.label} usually has ${type.seatRange[0]}–${type.seatRange[1]} seats`;
  }
  const year = new Date().getFullYear();
  if (values.modelYear && (values.modelYear < 1995 || values.modelYear > year + 1)) errors.modelYear = "Invalid year";
  if (values.driverId && !ownDriverIds.includes(values.driverId)) errors.driverId = "Choose one of your drivers";
  if (values.baseCity && !CITIES.includes(values.baseCity)) errors.baseCity = "Choose a city from the list";
  if (values.ratePerKm !== null && values.ratePerKm <= 0) errors.ratePerKm = "Must be positive";
  if (values.minKmPerDay !== null && values.minKmPerDay < 0) errors.minKmPerDay = "Can't be negative";
  if (values.driverAllowancePerDay !== null && values.driverAllowancePerDay < 0) errors.driverAllowancePerDay = "Can't be negative";
  if (values.amenities.length === 0) errors.amenities = "Select at least one amenity";
}

// Checks the picked files; returns { photos: File[], docs: { id: File } }.
function readBusFiles(formData, errors) {
  const photos = formData.getAll("photos").filter(hasFile);
  if (photos.length > MAX_PHOTOS) errors.photos = `Up to ${MAX_PHOTOS} photos`;
  for (const photo of photos) {
    const problem = checkUpload(photo, "photo");
    if (problem) errors.photos = problem;
  }
  const docs = {};
  for (const doc of BUS_DOCUMENTS) {
    const file = formData.get(`doc_${doc.id}`);
    if (!hasFile(file)) continue;
    const problem = checkUpload(file, "document");
    if (problem) errors[`doc_${doc.id}`] = problem;
    else docs[doc.id] = file;
  }
  return { photos, docs };
}

// Adds a bus, or saves changes to one. Either way the bus goes (back) to the
// review queue: admin checks every listing and its documents before it's live.
export async function saveBus(prevState, formData) {
  const viewer = await requireOperator();
  if (viewer.record.status === "rejected") return { formError: "Your operator account isn't approved yet. Correct your details on your profile and re-apply first." };

  const busId = str(formData, "busId");
  const values = readBus(formData);
  const removePhotos = list(formData, "removePhotos");
  const errors = {};

  const db = await readDb();
  checkBus(values, errors, db.drivers.filter((d) => d.operatorId === viewer.id).map((d) => d.id));
  const existing = busId ? db.buses.find((b) => b.id === busId && b.operatorId === viewer.id) ?? null : null;
  if (busId && !existing) return { formError: "Bus not found." };

  const files = readBusFiles(formData, errors);
  const keptPhotos = (existing?.photos ?? []).filter((id) => !removePhotos.includes(id));
  if (keptPhotos.length + files.photos.length === 0) errors.photos = "Add at least one photo of the bus";
  if (keptPhotos.length + files.photos.length > MAX_PHOTOS) errors.photos = `Up to ${MAX_PHOTOS} photos`;
  for (const doc of BUS_DOCUMENTS) {
    if (!existing?.documents?.[doc.id] && !files.docs[doc.id] && !errors[`doc_${doc.id}`]) errors[`doc_${doc.id}`] = "Upload this document";
  }
  if (Object.keys(errors).length) return { errors, values: { ...values, photos: existing?.photos, documents: existing?.documents } };

  // The base city is always a pickup city.
  if (!values.serviceCities.includes(values.baseCity)) values.serviceCities.unshift(values.baseCity);

  // Write the files first, then record everything in one update.
  const newPhotos = await Promise.all(files.photos.map((f) => saveUpload(f, { operatorId: viewer.id, kind: "photo" })));
  const newDocs = Object.fromEntries(
    await Promise.all(Object.entries(files.docs).map(async ([id, f]) => [id, await saveUpload(f, { operatorId: viewer.id, kind: "document" })]))
  );

  await updateDb((db) => {
    db.files.push(...newPhotos, ...Object.values(newDocs));
    const documents = { ...(existing?.documents ?? {}) };
    for (const [id, record] of Object.entries(newDocs)) documents[id] = record.id;
    const photos = [...keptPhotos, ...newPhotos.map((p) => p.id)];
    const now = new Date().toISOString();

    if (existing) {
      const bus = db.buses.find((b) => b.id === existing.id);
      Object.assign(bus, values, { photos, documents, status: "pending", rejectionReason: null, resubmittedAt: now });
    } else {
      db.buses.push({ id: newId("bus"), operatorId: viewer.id, ...values, photos, documents, blockedDates: [], status: "pending", createdAt: now });
    }
  });

  revalidatePortals();
  redirect(`/operator/buses?${existing ? "updated" : "added"}=1`);
}

// ---------- Drivers ----------
// The owner provides the drivers. Admin verifies each driver's licence and ID,
// and a bus is live only while its assigned driver is approved.

export async function saveDriver(prevState, formData) {
  const viewer = await requireOperator();
  const driverId = str(formData, "driverId");
  const values = {
    name: str(formData, "name"),
    phone: str(formData, "phone"),
    licenceNumber: str(formData, "licenceNumber").toUpperCase(),
    licenceExpiry: str(formData, "licenceExpiry"),
    psvBadge: str(formData, "psvBadge").toUpperCase(),
    aadhaarNumber: str(formData, "aadhaarNumber").replace(/\s/g, ""),
    experienceYears: int(formData, "experienceYears"),
  };

  const errors = {};
  required(errors, values, ["name", "phone", "licenceNumber", "licenceExpiry", "aadhaarNumber", "experienceYears"]);
  if (values.phone && !PHONE_RE.test(values.phone)) errors.phone = "Enter a valid 10-digit mobile number";
  if (values.licenceExpiry && (!DATE_RE.test(values.licenceExpiry) || values.licenceExpiry <= todayISO())) errors.licenceExpiry = "The licence must be valid (expiry in the future)";
  if (values.aadhaarNumber && !AADHAAR_RE.test(values.aadhaarNumber)) errors.aadhaarNumber = "Enter the 12-digit Aadhaar number";
  if (values.experienceYears !== null && (values.experienceYears < 0 || values.experienceYears > 60)) errors.experienceYears = "Enter years of experience";

  const photo = formData.get("photo");
  const licence = formData.get("licenceFile");
  if (hasFile(photo)) errors.photo = checkUpload(photo, "photo") ?? undefined;
  if (hasFile(licence)) errors.licenceFile = checkUpload(licence, "document") ?? undefined;
  for (const key of ["photo", "licenceFile"]) if (!errors[key]) delete errors[key];

  const existing = driverId ? (await readDb()).drivers.find((d) => d.id === driverId && d.operatorId === viewer.id) ?? null : null;
  if (driverId && !existing) return { formError: "Driver not found." };
  if (!existing?.photo && !hasFile(photo) && !errors.photo) errors.photo = "Add a clear photo of the driver";
  if (!existing?.licenceFile && !hasFile(licence) && !errors.licenceFile) errors.licenceFile = "Upload the driving licence";
  if (Object.keys(errors).length) return { errors, values };

  const photoRecord = hasFile(photo) ? await saveUpload(photo, { operatorId: viewer.id, kind: "driver-photo" }) : null;
  const licenceRecord = hasFile(licence) ? await saveUpload(licence, { operatorId: viewer.id, kind: "document" }) : null;
  values.phone = normalizePhone(values.phone);

  await updateDb((db) => {
    db.files.push(...[photoRecord, licenceRecord].filter(Boolean));
    const now = new Date().toISOString();
    const fileFields = {
      ...(photoRecord && { photo: photoRecord.id }),
      ...(licenceRecord && { licenceFile: licenceRecord.id }),
    };
    if (existing) {
      const driver = db.drivers.find((d) => d.id === existing.id);
      Object.assign(driver, values, fileFields, { status: "pending", rejectionReason: null, resubmittedAt: now });
    } else {
      db.drivers.push({ id: newId("drv"), operatorId: viewer.id, ...values, photo: null, licenceFile: null, ...fileFields, status: "pending", createdAt: now });
    }
  });

  revalidatePortals();
  redirect(`/operator/drivers?${existing ? "updated" : "added"}=1`);
}

// ---------- Availability ----------
// Owners mark dates when a bus can't be booked: an offline booking from their
// office, servicing, anything. Blocked buses don't appear in search for those dates.

export async function blockDates(prevState, formData) {
  const viewer = await requireOperator();
  const busId = str(formData, "busId");
  const start = str(formData, "start");
  const end = str(formData, "end") || start;
  const reason = str(formData, "reason").slice(0, 80) || "Not available";

  if (!DATE_RE.test(start) || !DATE_RE.test(end)) return { error: "Choose the dates to block." };
  if (end < start) return { error: "The end date is before the start date." };
  if (end < todayISO()) return { error: "Those dates are in the past." };

  const result = await updateDb((db) => {
    const bus = db.buses.find((b) => b.id === busId && b.operatorId === viewer.id);
    if (!bus) return { error: "Bus not found." };
    const clash = db.bookings.find(
      (b) => b.busId === bus.id && b.status === "confirmed" && b.startDate <= end && start <= b.endDate
    );
    if (clash) return { error: `Booking ${clash.ref} is already confirmed on these dates. Contact General Travels support if you can't run that trip.` };
    bus.blockedDates = [...(bus.blockedDates ?? []), { id: newId("blk"), start, end, reason }].sort((a, b) => a.start.localeCompare(b.start));
    return { ok: true };
  });
  if (result.error) return result;

  revalidatePortals();
  return { ok: true };
}

export async function unblockDates(formData) {
  const viewer = await requireOperator();
  const busId = str(formData, "busId");
  const blockId = str(formData, "blockId");
  await updateDb((db) => {
    const bus = db.buses.find((b) => b.id === busId && b.operatorId === viewer.id);
    if (!bus) throw new Error("Bus not found");
    bus.blockedDates = (bus.blockedDates ?? []).filter((d) => d.id !== blockId);
  });
  revalidatePortals();
}

// ---------- Trips ----------
// No accept/decline step: paid bookings are confirmed automatically. After the
// trip the owner marks it completed and is paid out (simulated in the demo).

export async function completeTrip(formData) {
  const viewer = await requireOperator();
  const id = str(formData, "id");

  await updateDb((db) => {
    const booking = db.bookings.find((b) => b.id === id && b.operatorId === viewer.id);
    if (!booking) throw new Error("Booking not found");
    if (booking.status !== "confirmed") throw new Error("Only confirmed trips can be completed");
    if (booking.startDate > todayISO()) throw new Error("The trip hasn't started yet");
    if (balanceDue(booking) > 0) throw new Error("The traveller hasn't paid the balance yet");
    const now = new Date().toISOString();
    booking.status = "completed";
    booking.completedAt = now;
    // DEMO: a real payout would go through Razorpay Route to the owner's account.
    booking.payout = { amount: booking.ownerPayout, status: "paid", paidAt: now, demo: true };
  });

  revalidatePath("/operator", "layout");
  revalidatePath("/bookings", "layout");
  revalidatePath("/admin", "layout");
}
