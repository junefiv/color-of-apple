import {
  clamp,
  contrastRatio,
  parseToOklch,
  preserveSourceHex,
  rotateHue,
  toHex,
} from "./color-utils";
import { pickOnNeutral } from "./on-ink";
import type { ColorScale, NeutralStep, OklchColor } from "./types";
import type {
  ColorGenerationRule,
  ColorSource,
  ContrastLevel,
  FoundationRecipe,
  FoundationTemperature,
  PaletteRecipe,
} from "@/lib/palette-recipes";

export type { PaletteRecipe } from "@/lib/palette-recipes";
export type Harmony =
  | "monochrome"
  | "analogous"
  | "complementary"
  | "splitComplementary"
  | "triadic";
export type PaletteMood = "clean" | "soft" | "vivid" | "muted" | "highContrast";
export type HueDirection = 1 | -1;
export type BackgroundTint = "brand" | "warm" | "cool" | "neutral" | "complement";

export type CorePalette = {
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  textDisabled: string;
  background: string;
  backgroundSubtle: string;
  primary: string;
  primaryAction: string;
  onPrimary: string;
  secondary: string;
  onSecondary: string;
  accent: string;
  onAccent: string;
  surface: string;
  surfaceRaised: string;
  surfaceSunken: string;
  surfaceSelected: string;
  borderSubtle: string;
  borderDefault: string;
  borderStrong: string;
};

const NEUTRAL_ON: ColorScale<NeutralStep> = {
  0: "#ffffff",
  50: "#f7f7f8",
  100: "#efeff1",
  200: "#e2e2e6",
  300: "#cbcbd1",
  400: "#a4a4ad",
  500: "#74747f",
  600: "#565660",
  700: "#3b3b43",
  800: "#25252b",
  850: "#1c1c21",
  900: "#161619",
  950: "#111113",
  1000: "#000000",
};

const BG_TINT = { subtle: 0.55, soft: 1, visible: 1.4 } as const;
const TEXT_TINT = { subtle: 0.75, soft: 1 } as const;
const TEXT_L: Record<ContrastLevel, number> = { soft: 0.24, normal: 0.2, high: 0.14 };

function oklch(l: number, c: number, h: number): OklchColor {
  return { mode: "oklch", l, c, h };
}

function applyTemperature(hue: number, temperature: FoundationTemperature = "neutral") {
  if (temperature === "neutral") return hue;
  const target = temperature === "cool" ? 240 : 80;
  const delta = ((target - hue + 540) % 360) - 180;
  return rotateHue(hue, delta * 0.18);
}

export function createHarmonyHues(hue: number, harmony: Harmony, direction: HueDirection) {
  const dir = direction;
  switch (harmony) {
    case "monochrome":
      return { secondary: hue, accent: hue };
    case "analogous":
      return { secondary: rotateHue(hue, 30 * dir), accent: rotateHue(hue, -35 * dir) };
    case "complementary":
      return { secondary: rotateHue(hue, 180), accent: rotateHue(hue, 30 * dir) };
    case "splitComplementary":
      return { secondary: rotateHue(hue, 150 * dir), accent: rotateHue(hue, 210 * dir) };
    case "triadic":
      return { secondary: rotateHue(hue, 120 * dir), accent: rotateHue(hue, 240 * dir) };
  }
}

function generateRole(primary: OklchColor, rule: ColorGenerationRule): OklchColor {
  if (rule.mode === "same") {
    const lightness = rule.lightness ?? clamp(primary.l + 0.04, 0.28, 0.86);
    const separated =
      Math.abs(lightness - primary.l) < 0.12 && rule.chromaRatio >= 0.8
        ? clamp(primary.l - 0.14, 0.28, 0.7)
        : lightness;
    return oklch(separated, clamp(primary.c * rule.chromaRatio, 0.008, 0.28), primary.h);
  }
  if (rule.mode === "rotate") {
    return oklch(
      rule.lightness ?? clamp(primary.l + 0.03, 0.36, 0.8),
      clamp(primary.c * rule.chromaRatio, 0.02, 0.28),
      rotateHue(primary.h, rule.degrees),
    );
  }
  return oklch(
    rule.lightness ?? clamp(primary.l + 0.02, 0.32, 0.74),
    rule.chroma,
    rule.hue,
  );
}

function sourceOf(
  source: ColorSource,
  colors: { primary: OklchColor; secondary: OklchColor; accent: OklchColor },
) {
  return colors[source];
}

function foundationHex(base: OklchColor, lightness: number, chromaRatio: number, cap: number, tint: number) {
  return toHex(oklch(lightness, Math.min(base.c * chromaRatio * tint, cap), base.h));
}

function pushContrast(hex: string, against: string, minimum: number, towardDark: boolean) {
  const color = parseToOklch(hex);
  let next = { ...color };
  let out = hex;
  for (let i = 0; i < 48 && contrastRatio(out, against) < minimum; i += 1) {
    next.l = clamp(next.l + (towardDark ? -0.012 : 0.012), 0.08, 0.97);
    out = toHex(next);
  }
  return out;
}

function buildFoundation(
  recipe: FoundationRecipe,
  colors: { primary: OklchColor; secondary: OklchColor; accent: OklchColor },
) {
  const bgTint = BG_TINT[recipe.backgroundTint];
  const textTint = TEXT_TINT[recipe.textTint];
  const bgBase = {
    ...sourceOf(recipe.backgroundSource, colors),
    h: applyTemperature(sourceOf(recipe.backgroundSource, colors).h, recipe.temperature),
  };
  const textBase = {
    ...sourceOf(recipe.textSource, colors),
    h: applyTemperature(sourceOf(recipe.textSource, colors).h, recipe.temperature),
  };
  const borderBase = {
    ...sourceOf(recipe.borderSource ?? recipe.backgroundSource, colors),
    h: applyTemperature(sourceOf(recipe.borderSource ?? recipe.backgroundSource, colors).h, recipe.temperature),
  };

  const background = foundationHex(bgBase, 0.975, 0.08, 0.018, bgTint);
  const backgroundSubtle = foundationHex(bgBase, 0.955, 0.1, 0.022, bgTint);
  const surface = foundationHex(bgBase, 0.995, 0.03, 0.008, bgTint);
  const surfaceRaised = foundationHex(bgBase, 1, 0.02, 0.006, bgTint);
  const surfaceSunken = foundationHex(bgBase, 0.945, 0.1, 0.022, bgTint);
  const surfaceSelected = foundationHex(colors.primary, 0.93, 0.25, 0.05, 1);
  const borderSubtle = foundationHex(borderBase, 0.91, 0.08, 0.02, bgTint);
  const borderDefault = foundationHex(borderBase, 0.84, 0.12, 0.025, bgTint);
  const borderStrong = foundationHex(borderBase, 0.78, 0.12, 0.028, bgTint);

  const textL = TEXT_L[recipe.contrast];
  let textPrimary = foundationHex(textBase, textL, 0.15, 0.035, textTint);
  textPrimary = pushContrast(textPrimary, background, 4.5, true);
  textPrimary = pushContrast(textPrimary, surface, 4.5, true);
  const textSecondary = pushContrast(
    foundationHex(textBase, 0.42, 0.12, 0.03, textTint),
    background,
    4.5,
    true,
  );
  const textTertiary = foundationHex(textBase, 0.56, 0.08, 0.02, textTint);
  const textDisabled = foundationHex(textBase, 0.68, 0.05, 0.015, textTint);

  return {
    background,
    backgroundSubtle,
    surface,
    surfaceRaised,
    surfaceSunken,
    surfaceSelected,
    borderSubtle,
    borderDefault,
    borderStrong,
    textPrimary,
    textSecondary,
    textTertiary,
    textDisabled,
  };
}

function pairOn(hex: string) {
  return pickOnNeutral(hex, NEUTRAL_ON);
}

export function toDarkStructural(light: CorePalette) {
  const backgroundColor = parseToOklch(light.background);
  const textColor = parseToOklch(light.textPrimary);
  const background = toHex(oklch(0.145, Math.min(backgroundColor.c, 0.02), backgroundColor.h));
  const surface = toHex(oklch(0.195, Math.min(backgroundColor.c * 1.3, 0.028), backgroundColor.h));
  const textPrimary = toHex(oklch(0.93, Math.min(textColor.c, 0.025), textColor.h));
  return { background, surface, textPrimary };
}

export function generateCorePalette(primaryHex: string, recipe: PaletteRecipe): CorePalette {
  const seed = parseToOklch(primaryHex);
  const primary = oklch(
    seed.l,
    clamp(seed.c * (recipe.primaryChromaRatio ?? 1), 0.01, 0.4),
    seed.h,
  );
  const secondary = generateRole(primary, recipe.secondary);
  const accent = generateRole(primary, recipe.accent);
  const foundation = buildFoundation(recipe.foundation, { primary, secondary, accent });
  const primaryHexKept = preserveSourceHex(primaryHex, seed);

  return {
    ...foundation,
    primary: primaryHexKept,
    primaryAction: primaryHexKept,
    onPrimary: pairOn(primaryHexKept),
    secondary: toHex(secondary),
    onSecondary: pairOn(toHex(secondary)),
    accent: toHex(accent),
    onAccent: pairOn(toHex(accent)),
  };
}
