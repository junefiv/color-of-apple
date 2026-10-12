import type { LibraryItemId } from "@/components/preview/library/catalog";
import { LIBRARY_ITEMS } from "@/components/preview/library/catalog";

export type UiKitCounts = { viewCount: number; copyCount: number };
export type UiKitStats = Record<LibraryItemId, UiKitCounts>;

export function emptyUiKitStats(): UiKitStats {
  return Object.fromEntries(LIBRARY_ITEMS.map(([id]) => [id, { viewCount: 0, copyCount: 0 }])) as UiKitStats;
}

export function readCount(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 ? Math.floor(value) : 0;
}

export function statsFromDocs(docs: Array<{ id: string; viewCount: unknown; copyCount: unknown }>): UiKitStats {
  const stats = emptyUiKitStats();
  for (const doc of docs) {
    if (!(doc.id in stats)) continue;
    stats[doc.id as LibraryItemId] = { viewCount: readCount(doc.viewCount), copyCount: readCount(doc.copyCount) };
  }
  return stats;
}
