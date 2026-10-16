import { getViewer } from "@/lib/auth";
import { getFileForViewer } from "@/lib/data/queries";
import { readUpload } from "@/lib/data/store";

// Serves uploaded photos and documents. Documents are private: only the owner
// who uploaded them and the admin can open them.
export async function GET(request, { params }) {
  const { id } = await params;
  const file = await getFileForViewer(id, await getViewer());
  if (!file) return new Response("Not found", { status: 404 });

  const headers = {
    "Content-Type": file.mime,
    "Cache-Control": file.kind === "photo" ? "public, max-age=86400" : "private, no-store",
    "Content-Disposition": `inline; filename="${file.name.replace(/[^\w.\- ]/g, "_")}"`,
    "X-Content-Type-Options": "nosniff",
  };

  // Demo data has no real scans, so draw a labelled placeholder instead.
  if (file.seed) return new Response(placeholder(file.name), { headers: { ...headers, "Content-Type": "image/svg+xml" } });

  try {
    return new Response(await readUpload(file.id), { headers });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}

function placeholder(name) {
  const label = name.replace(/[<>&"]/g, "");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="420" viewBox="0 0 600 420"><rect width="600" height="420" fill="#f0f5fc"/><rect x="40" y="40" width="520" height="340" rx="16" fill="#fff" stroke="#ccd7e8"/><text x="300" y="200" font-family="sans-serif" font-size="28" font-weight="700" text-anchor="middle" fill="#13254a">${label}</text><text x="300" y="240" font-family="sans-serif" font-size="18" text-anchor="middle" fill="#5a6780">Sample document (demo data)</text></svg>`;
}
