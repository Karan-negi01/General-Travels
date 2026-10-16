import Image from "next/image";
import { photoFor } from "@/lib/constants/photos";

// Fills its nearest positioned parent (give the parent position: relative and a size).
// Shows the owner's uploaded photo (`src`), or a stock photo for the vehicle type.
export default function BusPhoto({ type, src, alt, photo = photoFor(type), sizes = "(max-width: 760px) 100vw, 400px", priority = false }) {
  return (
    <Image
      src={src ?? photo.src}
      alt={alt ?? photo.alt}
      fill
      sizes={sizes}
      priority={priority}
      // Uploaded photos are served by /files/[id], which already sets caching.
      unoptimized={Boolean(src)}
      style={{ objectFit: "cover" }}
    />
  );
}
