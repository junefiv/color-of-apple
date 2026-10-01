import {
  clamp,
  hueDistance,
  oklchPerceptualDistance,
  parseToOklch,
  toHex,
} from "@/lib/color-engine/color-utils";
import type { OklchColor, ThemeMode } from "@/lib/color-engine/types";
import { colorAt, ensureReadable, fitCandidate } from "./adaptive";
import type { BrandCharacter } from "./adaptive";
export type CategoricalSwatch = { background: string; foreground: string };

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const CANDIDATE_HUE_STEP = 5;

function categoryForegroundOklch(
  primary: OklchColor,
  hue: number,
  character: BrandCharacter,
  mode: ThemeMode,
  isPrimarySlot: boolean,
): OklchColor {
  const vivid = character.vividness;
  const fgL = clamp(
    mode === "light" ? lerp(0.52, 0.68, vivid) : lerp(0.74, 0.82, vivid),
    mode === "light" ? 0.52 : 0.68,
    mode === "light" ? 0.68 : 0.88,
  );
  const fgC = clamp(lerp(0.085, 0.14, vivid), 0.08, 0.15);
  const c = isPrimarySlot ? primary.c : fgC;
  return colorAt(fgL, clamp(c, 0.08, 0.15), hue);
}

function categoryBackgroundOklch(
  hue: number,
  character: BrandCharacter,
  mode: ThemeMode,
): OklchColor {
  const vivid = character.vividness;
  const bgL =
    mode === "light"
      ? lerp(0.965, 0.938, (1 - character.brightness) * 0.35)
      : lerp(0.26, 0.2, character.brightness * 0.4);
  const bgC = lerp(0.02, 0.038, vivid);
  return colorAt(bgL, bgC, hue);
}

function swatchFromOklch(
  foreground: OklchColor,
  background: OklchColor,
  foregroundHex?: string,
): CategoricalSwatch {
  const backgroundHex = toHex(fitCandidate(background));
  const foregroundResolved = foregroundHex ?? toHex(fitCandidate(foreground));
  return {
    background: backgroundHex,
    foreground: ensureReadable(foregroundResolved, [backgroundHex], 3),
  };
}

function greedyCategoryHues(primary: OklchColor, count: number): number[] {
  if (count <= 1) {
    return [primary.h];
  }

  const candidates: number[] = [];
  for (let h = 0; h < 360; h += CANDIDATE_HUE_STEP) {
    candidates.push(h);
  }

  const selected: number[] = [primary.h];
  const selectedColors: OklchColor[] = [primary];

  while (selected.length < count) {
    let bestHue = candidates[0];
    let bestScore = -1;

    for (const hue of candidates) {
      if (selected.some(h => hueDistance(hue, h) < CANDIDATE_HUE_STEP * 0.5)) {
        continue;
      }
      const candidate = colorAt(primary.l, clamp(primary.c, 0.08, 0.15), hue);
      const score = Math.min(
        ...selectedColors.map(existing => oklchPerceptualDistance(candidate, existing)),
      );
      if (score > bestScore) {
        bestScore = score;
        bestHue = hue;
      }
    }

    selected.push(bestHue);
    selectedColors.push(colorAt(primary.l, clamp(primary.c, 0.08, 0.15), bestHue));
  }

  return selected;
}

export function generateCategoricalPalette(
  primaryHex: string,
  character: BrandCharacter,
  count = 8,
  mode: ThemeMode = "light",
): CategoricalSwatch[] {
  const primary = parseToOklch(primaryHex);
  const n = clamp(count, 1, 8);
  const hues = greedyCategoryHues(primary, n);

  return hues.map((hue, index) => {
    const isPrimarySlot = index === 0;
    const foreground =
      isPrimarySlot
        ? primaryHex
        : toHex(
            fitCandidate(categoryForegroundOklch(primary, hue, character, mode, false)),
          );
    const background = toHex(
      fitCandidate(categoryBackgroundOklch(hue, character, mode)),
    );
    const fgOklch = isPrimarySlot ? primary : parseToOklch(foreground);
    const bgOklch = parseToOklch(background);
    return swatchFromOklch(fgOklch, bgOklch, isPrimarySlot ? primaryHex : undefined);
  });
}

export function categoricalToCssVariables(
  swatches: CategoricalSwatch[],
): Record<string, string> {
  const vars: Record<string, string> = {};
  swatches.forEach((swatch, index) => {
    vars[`--color-categorical-${index}-bg`] = swatch.background;
    vars[`--color-categorical-${index}-fg`] = swatch.foreground;
    vars[`--color-data-category-${index + 1}`] = swatch.foreground;
  });
  return vars;
}
