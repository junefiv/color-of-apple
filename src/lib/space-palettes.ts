import { formatHex, interpolate } from "culori";
import { generateColorScale } from "@/lib/color-engine/scales";
import { parseToOklch, readableOnColor, shiftLightness } from "@/lib/color-engine/color-utils";
import type { OklchColor } from "@/lib/color-engine/types";
import {
  DEFAULT_PALETTE_ID,
  PALETTE_CONCEPTS,
  generatePalette,
  generatePaletteTokens,
  resolvePaletteId,
  type PaletteConceptId,
  type PaletteTokens,
} from "@/lib/palette";

export { DEFAULT_PALETTE_ID, resolvePaletteId };
export type SpacePaletteId = PaletteConceptId;

export type SpacePalette = {
  id: PaletteConceptId;
  colors: [string, string, string, string];
  background: string;
  text: string;
  accessible: boolean;
};

export type PaletteChip = {
  hex: string;
  color: OklchColor;
};

export type PaletteRoles = {
  primary: string;
  primaryAction: string;
  onPrimary: string;
  secondary: PaletteChip;
  onSecondary: string;
  accent: PaletteChip;
  onAccent: string;
  surface: string;
  surfaceRaised: string;
  surfaceSunken: string;
  surfaceSelected: string;
  background: string;
  backgroundSubtle: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  textDisabled: string;
  borderSubtle: string;
  borderDefault: string;
  borderStrong: string;
  chips: string[];
};

function asChip(hex: string): PaletteChip {
  return { hex, color: parseToOklch(hex) };
}

function paletteFromTokens(id: PaletteConceptId, tokens: PaletteTokens, accessible: boolean): SpacePalette {
  return {
    id,
    colors: [tokens.core.primary, tokens.core.secondary, tokens.core.accent, tokens.backgroundAndSurface.background],
    background: tokens.backgroundAndSurface.background,
    text: tokens.text.primary,
    accessible,
  };
}

export function extractSpacePalettes(hex: string): SpacePalette[] {
  return PALETTE_CONCEPTS.map((concept) => {
    const generated = generatePalette(hex, concept.id);
    return paletteFromTokens(generated.id, generated.tokens, generated.accessible);
  });
}

export function getSpacePalette(hex: string, id?: string) {
  const generated = generatePalette(hex, id);
  return paletteFromTokens(generated.id, generated.tokens, generated.accessible);
}

export function generateSelectedPalette(hex: string, paletteId?: string) {
  const tokens = generatePaletteTokens(hex, paletteId);
  return {
    primary: tokens.core.primary,
    secondary: tokens.core.secondary,
    accent: tokens.core.accent,
    background: tokens.backgroundAndSurface.background,
    surface: tokens.core.surface,
    primaryText: tokens.text.primary,
  };
}

export function deriveSelectedPaletteTokens(hex: string, paletteId?: string, mode: "light" | "dark" = "light") {
  return generatePaletteTokens(hex, paletteId, mode);
}

export function paletteSwatches(palette: SpacePalette) {
  return [palette.colors[0], palette.colors[1], palette.colors[2], palette.background, palette.text];
}

export function themePaper(hex: string, mode: "light" | "dark") {
  if (mode === "light") return hex;
  const color = parseToOklch(hex);
  return shiftLightness(hex, -(color.l - 0.16));
}

export function themeInk(hex: string, mode: "light" | "dark") {
  if (mode === "light") return hex;
  const color = parseToOklch(hex);
  return shiftLightness(hex, 0.93 - color.l);
}

export function paletteRoles(hex: string, paletteId?: string): PaletteRoles {
  const generated = generatePalette(hex, paletteId);
  const tokens = generated.tokens;
  return {
    primary: tokens.core.primary,
    primaryAction: tokens.core.primary,
    onPrimary: tokens.core.onPrimary,
    secondary: asChip(tokens.core.secondary),
    onSecondary: tokens.core.onSecondary,
    accent: asChip(tokens.core.accent),
    onAccent: tokens.core.onAccent,
    surface: tokens.core.surface,
    surfaceRaised: tokens.backgroundAndSurface.raisedSurface,
    surfaceSunken: tokens.backgroundAndSurface.subtleBackground,
    surfaceSelected: tokens.interaction.primarySelected,
    background: tokens.backgroundAndSurface.background,
    backgroundSubtle: tokens.backgroundAndSurface.subtleBackground,
    text: tokens.text.primary,
    textSecondary: tokens.text.secondary,
    textTertiary: tokens.text.tertiary,
    textDisabled: tokens.text.disabled,
    borderSubtle: tokens.border.subtle,
    borderDefault: tokens.border.default,
    borderStrong: tokens.border.strong,
    chips: [
      tokens.core.primary,
      tokens.core.secondary,
      tokens.core.accent,
      tokens.core.primarySubtle,
    ],
  };
}

export function paletteChartStops(chips: string[]): Record<string, string> {
  const stops = chips.length > 0 ? chips : ["#808080"];
  return {
    "1": stops[0],
    "2": stops[1] ?? stops[0],
    "3": stops[2] ?? stops[1] ?? stops[0],
    "4": stops[3] ?? stops[2] ?? stops[0],
    "5": stops[3] ?? stops[2] ?? stops[0],
  };
}

export function palettePreviewVars(colors: string[]) {
  const primary = colors[0];
  const primaryColor = parseToOklch(primary);
  const primaryScale = generateColorScale({
    hue: primaryColor.h,
    chroma: primaryColor.c,
    sourceColor: primaryColor,
    sourceHex: primary,
  });
  primaryScale.scale[500] = primary;
  const secondary = colors[1] ?? shiftLightness(primary, 0.2);
  const accent = colors[2] ?? colors[1] ?? primary;
  return {
    "--color-primary-default": primaryScale.scale[500],
    "--color-primary-hover": primaryScale.scale[600],
    "--color-primary-pressed": primaryScale.scale[700],
    "--color-primary-on": readableOnColor(primaryScale.scale[500], 4.5),
    "--color-primary-subtle": shiftLightness(primary, 0.32),
    "--color-primary-text": primary,
    "--color-primary-border": primary,
    "--color-secondary-default": secondary,
    "--color-secondary-on": readableOnColor(secondary, 4.5),
    "--color-accent-default": accent,
    "--color-accent-on": readableOnColor(accent, 4.5),
  } as Record<string, string>;
}

export function paletteGradient(colors: string[]) {
  return `linear-gradient(to right, ${colors.join(", ")})`;
}

export function washBarGradient(colors: string[]) {
  const stops = colors.length > 0 ? colors : ["#ffffff"];
  const interp = interpolate(stops.length > 1 ? stops : [stops[0], stops[0]], "oklab");
  const count = Math.max(12, stops.length * 4);
  const samples = Array.from({ length: count }, (_, index) => {
    const t = index / (count - 1);
    const sample = interp(t);
    const hex = sample ? formatHex(sample) : null;
    return hex ?? stops[0];
  });
  return `linear-gradient(to right in oklab, ${samples.join(", ")})`;
}

export { resolvePaletteId as recipeFor };
