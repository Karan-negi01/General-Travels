import { VEHICLE_PHOTOS, HERO_PHOTO } from "@/lib/constants/photos";
import { VEHICLE_TYPES } from "@/lib/constants/vehicles";

export const metadata = { title: "Photo credits" };

const ROWS = [
  { label: "Home page", photo: HERO_PHOTO },
  ...VEHICLE_TYPES.map((t) => ({ label: t.label, photo: VEHICLE_PHOTOS[t.id] })),
];

export default function PhotoCreditsPage() {
  return (
    <div className="container" style={{ paddingTop: 48, maxWidth: 860 }}>
      <p className="eyebrow">Credits</p>
      <h1 style={{ margin: "12px 0" }}>Photo credits</h1>
      <p className="muted" style={{ marginBottom: 24 }}>
        Vehicle photos are representative and come from Wikimedia Commons under the licences below. Each bus&apos;s own
        photos will replace them once operators upload them.
      </p>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Used for</th>
              <th>Photo</th>
              <th>Author</th>
              <th>Licence</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map(({ label, photo }) => (
              <tr key={label}>
                <td>{label}</td>
                <td><a href={photo.source} target="_blank" rel="noreferrer"><u>{photo.alt}</u></a></td>
                <td>{photo.author}</td>
                <td><a href={photo.licenseUrl} target="_blank" rel="noreferrer"><u>{photo.license}</u></a></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
