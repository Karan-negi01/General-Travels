import Image from "next/image";
import { photoFor } from "@/lib/constants/photos";

// Fills its nearest positioned parent (give the parent position: relative and a size).
// Shows a stock photo for the vehicle type until operators upload their own.
export default function BusPhoto({ type, photo = photoFor(type), sizes = "(max-width: 760px) 100vw, 400px", priority = false }) {
  return (
    <Image
      src={photo.src}
      alt={photo.alt}
      fill
      sizes={sizes}
      priority={priority}
      style={{ objectFit: "cover" }}
    />
  );
}
