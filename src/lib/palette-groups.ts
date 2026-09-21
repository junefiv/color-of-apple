import { parseToOklch } from "@/lib/color-engine/color-utils";
import type { SpacePalette, SpacePaletteId } from "@/lib/space-palettes";
import { DEFAULT_PALETTE_ID, extractSpacePalettes, paletteSwatches } from "@/lib/space-palettes";

function colorRoleFingerprint(hex: string) {
  const { l, c, h } = parseToOklch(hex);

  if (c < 0.03) {
    if (l > 0.9) return "paper";
    if (l < 0.25) return "ink";
    return `neutral-${Math.round(l * 10)}`;
  }

  const hue = Math.round((h ?? 0) / 30) % 12;
  const light = Math.round(l * 8) / 8;
  const chroma = Math.round(c * 20) / 20;
  return `h${hue}-l${light}-c${chroma}`;
}

/** Perceptually similar swatch bars share the same composition key. */
export function paletteCompositionKey(palette: SpacePalette) {
  return paletteSwatches(palette)
    .map((color) => colorRoleFingerprint(color))
    .join("|");
}

export function mergeSimilarPalettes(palettes: SpacePalette[]) {
  const groups = new Map<string, SpacePalette>();
  for (const palette of palettes) {
    const key = paletteCompositionKey(palette);
    if (!groups.has(key)) {
      groups.set(key, palette);
    }
  }
  return Array.from(groups.values());
}

export function countDistinctPaletteGroups(hex: string) {
  return mergeSimilarPalettes(extractSpacePalettes(hex)).length;
}

export function extractUniqueSpacePalettes(hex: string) {
  return mergeSimilarPalettes(extractSpacePalettes(hex));
}

export function resolvePaletteRepresentativeId(hex: string, id?: string): SpacePaletteId {
  const palettes = extractSpacePalettes(hex);
  const byId = palettes.find((palette) => palette.id === id);
  const target = byId ?? palettes[0];
  if (!target) return DEFAULT_PALETTE_ID;

  const key = paletteCompositionKey(target);
  const representative =
    mergeSimilarPalettes(palettes).find((palette) => paletteCompositionKey(palette) === key) ??
    target;
  return representative.id;
}
