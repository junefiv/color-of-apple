import { parseToOklch, rotateHue, toHex } from "./color-utils";
import type { OklchColor } from "./types";
import { generatePalette, resolvePaletteId } from "@/lib/palette";

export type Harmony =
  | "monochrome"
  | "analogous"
  | "complementary"
  | "splitComplementary"
  | "triadic";
export type PaletteMood = "clean" | "soft" | "vivid" | "muted" | "highContrast";
export type HueDirection = 1 | -1;
export type PaletteRecipe = string;

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

function oklch(l: number, c: number, h: number): OklchColor {
  return { mode: "oklch", l, c, h };
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

export function toDarkStructural<T extends Pick<CorePalette, "background" | "textPrimary">>(light: T) {
  const backgroundColor = parseToOklch(light.background);
  const textColor = parseToOklch(light.textPrimary);
  const background = toHex(oklch(0.145, Math.min(backgroundColor.c, 0.02), backgroundColor.h));
  const surface = toHex(oklch(0.195, Math.min(backgroundColor.c * 1.3, 0.028), backgroundColor.h));
  const textPrimary = toHex(oklch(0.93, Math.min(textColor.c, 0.025), textColor.h));
  return { background, surface, textPrimary };
}

export function generateCorePalette(primaryHex: string, recipe?: PaletteRecipe | { id?: string }): CorePalette {
  const id = resolvePaletteId(typeof recipe === "string" ? recipe : recipe?.id);
  const tokens = generatePalette(primaryHex, id).tokens;
  return {
    textPrimary: tokens.text.primary,
    textSecondary: tokens.text.secondary,
    textTertiary: tokens.text.tertiary,
    textDisabled: tokens.text.disabled,
    background: tokens.backgroundAndSurface.background,
    backgroundSubtle: tokens.backgroundAndSurface.subtleBackground,
    primary: tokens.core.primary,
    primaryAction: tokens.core.primary,
    onPrimary: tokens.core.onPrimary,
    secondary: tokens.core.secondary,
    onSecondary: tokens.core.onSecondary,
    accent: tokens.core.accent,
    onAccent: tokens.core.onAccent,
    surface: tokens.core.surface,
    surfaceRaised: tokens.backgroundAndSurface.raisedSurface,
    surfaceSunken: tokens.backgroundAndSurface.subtleBackground,
    surfaceSelected: tokens.interaction.primarySelected,
    borderSubtle: tokens.border.subtle,
    borderDefault: tokens.border.default,
    borderStrong: tokens.border.strong,
  };
}
