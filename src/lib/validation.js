// Small form helpers shared by server actions. Swap for zod if the forms grow.

export function str(formData, key) {
  return String(formData.get(key) ?? "").trim();
}

export function int(formData, key) {
  const n = Number.parseInt(str(formData, key), 10);
  return Number.isFinite(n) ? n : null;
}

export function list(formData, key) {
  return formData.getAll(key).map(String).filter(Boolean);
}

export function required(errors, values, keys) {
  for (const key of keys) {
    if (values[key] === "" || values[key] === null || values[key] === undefined) {
      errors[key] = "Required";
    }
  }
}

export const PHONE_RE = /^\+?[0-9\s-]{10,15}$/;
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
