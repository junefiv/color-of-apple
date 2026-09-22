import {
  PALETTE_CONCEPTS,
  resolvePaletteId,
  type PaletteConceptId,
} from "@/lib/palette";
import { extractSpacePalettes, type SpacePalette } from "@/lib/space-palettes";

export function extractUniqueSpacePalettes(hex: string) {
  return extractSpacePalettes(hex);
}

export function countDistinctPaletteGroups(_hex?: string) {
  return PALETTE_CONCEPTS.length;
}

export function resolvePaletteRepresentativeId(_hex: string, id?: string): PaletteConceptId {
  return resolvePaletteId(id);
}

export function mergeSimilarPalettes(palettes: SpacePalette[]) {
  return palettes;
}

export function paletteCompositionKey(palette: SpacePalette) {
  return palette.id;
}
