// Master list of amenities a vendor can tick when listing a vehicle.
// `id` is what gets stored on the vehicle; `icon` maps to a lucide-react icon
// (see src/components/vehicles/AmenityIcon.js).

export const AMENITY_CATEGORIES = [
  { id: "comfort", label: "Comfort" },
  { id: "connectivity", label: "Connectivity & Power" },
  { id: "food", label: "Food & Refreshments" },
  { id: "entertainment", label: "Entertainment" },
  { id: "safety", label: "Safety & Security" },
  { id: "accessibility", label: "Accessibility & Service" },
];

export const AMENITIES = [
  // Comfort
  { id: "ac", label: "Air conditioning", category: "comfort", icon: "Snowflake" },
  { id: "pushback-seats", label: "Pushback seats", category: "comfort", icon: "Armchair" },
  { id: "recliner-seats", label: "Recliner seats", category: "comfort", icon: "Sofa" },
  { id: "sleeper-berths", label: "Sleeper berths", category: "comfort", icon: "BedDouble" },
  { id: "blankets", label: "Blankets & pillows", category: "comfort", icon: "Layers" },
  { id: "extra-legroom", label: "Extra legroom", category: "comfort", icon: "MoveHorizontal" },
  { id: "reading-lights", label: "Reading lights", category: "comfort", icon: "Lamp" },
  { id: "curtains", label: "Window curtains", category: "comfort", icon: "PanelsTopLeft" },
  { id: "luggage-space", label: "Large luggage space", category: "comfort", icon: "Luggage" },
  { id: "washroom", label: "Onboard washroom", category: "comfort", icon: "Bath" },

  // Connectivity & power
  { id: "wifi", label: "Wi-Fi", category: "connectivity", icon: "Wifi" },
  { id: "charging-ports", label: "Charging ports (per seat)", category: "connectivity", icon: "PlugZap" },
  { id: "usb-ports", label: "USB ports", category: "connectivity", icon: "Usb" },
  { id: "power-backup", label: "Power backup / inverter", category: "connectivity", icon: "BatteryCharging" },

  // Food & refreshments
  { id: "water-bottles", label: "Water bottles", category: "food", icon: "GlassWater" },
  { id: "snacks", label: "Snacks", category: "food", icon: "Cookie" },
  { id: "meals", label: "Meals on request", category: "food", icon: "UtensilsCrossed" },
  { id: "refrigerator", label: "Mini fridge / cooler", category: "food", icon: "Refrigerator" },
  { id: "pantry", label: "Pantry", category: "food", icon: "CookingPot" },

  // Entertainment
  { id: "tv", label: "TV / LCD screens", category: "entertainment", icon: "Tv" },
  { id: "music-system", label: "Music system", category: "entertainment", icon: "Music" },
  { id: "pa-system", label: "Mic / PA system", category: "entertainment", icon: "Mic" },
  { id: "ambient-lighting", label: "Ambient lighting", category: "entertainment", icon: "Sparkles" },

  // Safety & security
  { id: "gps", label: "Live GPS tracking", category: "safety", icon: "MapPin" },
  { id: "cctv", label: "CCTV cameras", category: "safety", icon: "Cctv" },
  { id: "first-aid", label: "First-aid kit", category: "safety", icon: "Cross" },
  { id: "fire-extinguisher", label: "Fire extinguisher", category: "safety", icon: "FireExtinguisher" },
  { id: "emergency-exit", label: "Emergency exit", category: "safety", icon: "DoorOpen" },
  { id: "seat-belts", label: "Seat belts", category: "safety", icon: "ShieldCheck" },
  { id: "speed-governor", label: "Speed governor", category: "safety", icon: "Gauge" },

  // Accessibility & service
  { id: "wheelchair", label: "Wheelchair accessible", category: "accessibility", icon: "Accessibility" },
  { id: "attendant", label: "Onboard attendant", category: "accessibility", icon: "UserRound" },
  { id: "uniformed-driver", label: "Uniformed driver", category: "accessibility", icon: "IdCard" },
  { id: "sanitised", label: "Sanitised before trip", category: "accessibility", icon: "SprayCan" },
];

const byId = new Map(AMENITIES.map((a) => [a.id, a]));

export function getAmenity(id) {
  return byId.get(id);
}

export function isValidAmenity(id) {
  return byId.has(id);
}

export function amenitiesByCategory() {
  return AMENITY_CATEGORIES.map((cat) => ({
    ...cat,
    items: AMENITIES.filter((a) => a.category === cat.id),
  }));
}
