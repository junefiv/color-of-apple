import type { Locale } from "@/lib/copy";
import { getPaletteConcept, resolvePaletteId } from "@/lib/palette";

export function paletteName(id: string, locale: Locale = "en") {
  const concept = getPaletteConcept(id);
  return concept.name;
}

export { resolvePaletteId };
