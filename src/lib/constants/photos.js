// Stock photos per vehicle type, shown until operators upload photos of their
// own buses. All are from Wikimedia Commons under free licences, stored in
// public/images/buses. Most licences require crediting the author, which
// /photo-credits does.

export const VEHICLE_PHOTOS = {
  "tempo-traveller": {
    src: "/images/buses/tempo-traveller.jpg",
    alt: "White Force Traveller tempo traveller, side view",
    author: "OnkelFordTaunus",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
    source: "https://commons.wikimedia.org/wiki/File:ForceTravellerside.JPG",
  },
  "luxury-van": {
    src: "/images/buses/luxury-van.jpg",
    alt: "White Force Traveller luxury van",
    author: "वंपायर, edited by Mr.choppers",
    license: "CC BY-SA 2.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/2.0",
    source: "https://commons.wikimedia.org/wiki/File:Force_Traveller_Luxury.jpg",
  },
  "mini-bus": {
    src: "/images/buses/mini-bus.jpg",
    alt: "Force Traveller 26-seater mini bus in Agra",
    author: "Biswarup Ganguly",
    license: "CC BY 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by/3.0",
    source: "https://commons.wikimedia.org/wiki/File:Force_Motors_-_Traveller_26_-_Agra_2014-05-14_4222.JPG",
  },
  bus: {
    src: "/images/buses/bus.jpg",
    alt: "Blue and white Volvo B7R air-conditioned bus",
    author: "Rsrikanth05",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
    source: "https://commons.wikimedia.org/wiki/File:MSRTC-Shivneri-Volvo-B7R.jpg",
  },
  "luxury-coach": {
    src: "/images/buses/luxury-coach.jpg",
    alt: "White Volvo 9400 multi-axle luxury coach",
    author: "KeralianEditor",
    license: "CC0",
    licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/",
    source: "https://commons.wikimedia.org/wiki/File:Volvo_9400_B11R_Airavat_Club_Class.jpg",
  },
  "sleeper-coach": {
    src: "/images/buses/sleeper-coach.jpg",
    alt: "Air-conditioned sleeper coach",
    author: "Shagil Muzhappilangad",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
    source: "https://commons.wikimedia.org/wiki/File:New_sleeper_bus_of_KSRTC.jpeg",
  },
};

export const HERO_PHOTO = {
  src: "/images/buses/hero.jpg",
  alt: "White Volvo 9400 luxury coach on the road",
  author: "Medhansh Raturi",
  license: "CC BY 4.0",
  licenseUrl: "https://creativecommons.org/licenses/by/4.0",
  source: "https://commons.wikimedia.org/wiki/File:Volvo_9400.jpg",
};

export function photoFor(type) {
  return VEHICLE_PHOTOS[type] ?? VEHICLE_PHOTOS.bus;
}
