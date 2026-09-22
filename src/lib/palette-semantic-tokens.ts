import { generatePaletteTokens } from "@/lib/palette";
import type { PaletteTokens } from "@/lib/palette";

export type { PaletteTokens };
export { applyPaletteTokens, paletteTokensToCssVariables } from "@/lib/palette";
export { contrastRatio } from "@/lib/color-engine/color-utils";

export type CorePalette = {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  primaryText: string;
};

export function derivePaletteTokens(input: CorePalette | string, conceptId?: string): PaletteTokens {
  if (typeof input === "string") {
    return generatePaletteTokens(input, conceptId);
  }
  return generatePaletteTokens(input.primary, conceptId);
}
