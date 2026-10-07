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

// Picking the same city for "from" and "to" makes it a local (within city) hire.
export const TRIP_TYPES = [
  { id: "round-trip", label: "Round trip" },
  { id: "one-way", label: "One way" },
];

export function labelFor(list, id) {
  return list.find((item) => item.id === id)?.label ?? id;
}
