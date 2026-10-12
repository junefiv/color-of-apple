import { LIBRARY_ITEMS, type LibraryItemId } from "@/components/preview/library/catalog";
import { emptyUiKitStats } from "@/lib/ui-kit/stats";
import { bumpUiKitStat, cachedUiKitStats } from "@/lib/ui-kit/stats-store";

export const runtime = "nodejs";

function isItemId(value: unknown): value is LibraryItemId {
  return LIBRARY_ITEMS.some(([id]) => id === value);
}

export async function GET() {
  try {
    const stats = await cachedUiKitStats();
    return Response.json({ stats }, { headers: { "Cache-Control": "public, max-age=0, s-maxage=60, stale-while-revalidate=60" } });
  } catch (error) {
    console.error("UI kit stats read failed", error instanceof Error ? error.message : "unknown");
    return Response.json({ stats: emptyUiKitStats() }, { headers: { "Cache-Control": "private, no-store" } });
  }
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "invalid" }, { status: 400 });
  }
  const id = body && typeof body === "object" ? (body as { id?: unknown }).id : null;
  const kind = body && typeof body === "object" ? (body as { kind?: unknown }).kind : null;
  if (!isItemId(id) || (kind !== "view" && kind !== "copy")) return Response.json({ error: "invalid" }, { status: 400 });
  try {
    await bumpUiKitStat(id, kind);
    return Response.json({ ok: true });
  } catch (error) {
    console.error("UI kit stats write failed", error instanceof Error ? error.message : "unknown");
    return Response.json({ error: "unavailable" }, { status: 503 });
  }
}
