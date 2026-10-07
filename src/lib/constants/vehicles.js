// Vehicle categories on the platform. General Travels rents whole vehicles
// (charter model) — customers never book individual seats.

export const VEHICLE_TYPES = [
  { id: "tempo-traveller", label: "Tempo Traveller", seatRange: [9, 26] },
  { id: "luxury-van", label: "Luxury Van (Urbania / similar)", seatRange: [10, 17] },
  { id: "mini-bus", label: "Mini Bus", seatRange: [20, 32] },
  { id: "bus", label: "Bus (35–50 seater)", seatRange: [33, 50] },
  { id: "luxury-coach", label: "Luxury Coach (Volvo / Scania)", seatRange: [35, 55] },
  { id: "sleeper-coach", label: "Sleeper Coach", seatRange: [30, 45] },
];

const byId = new Map(VEHICLE_TYPES.map((t) => [t.id, t]));

export function getVehicleType(id) {
  return byId.get(id);
}

export const CITIES = [
  "Delhi",
  "Gurugram",
  "Noida",
  "Chandigarh",
  "Jaipur",
  "Agra",
  "Dehradun",
  "Shimla",
  "Manali",
  "Lucknow",
  "Mumbai",
  "Pune",
  "Bengaluru",
  "Hyderabad",
  "Chennai",
  "Kolkata",
  "Ahmedabad",
];

export const TRIP_TYPES = [
  { id: "one-way", label: "One way" },
  { id: "round-trip", label: "Round trip" },
  { id: "local", label: "Local / within city" },
  { id: "multi-day", label: "Multi-day tour" },
];

export const CUSTOMER_TYPES = [
  { id: "corporate", label: "Corporate" },
  { id: "government", label: "Government / Ministry" },
  { id: "institution", label: "School / Hospital / Institution" },
  { id: "event", label: "Event / Wedding" },
  { id: "individual", label: "Individual / Family" },
];

export function labelFor(list, id) {
  return list.find((item) => item.id === id)?.label ?? id;
}
