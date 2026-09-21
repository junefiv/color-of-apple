import { formatHex, interpolate } from "culori";
import { generateCorePalette } from "@/lib/color-engine/core-palette";
import { generateColorScale } from "@/lib/color-engine/scales";
import {
  mixOklab,
  parseToOklch,
  readableOnColor,
  shiftLightness,
  toHex,
} from "@/lib/color-engine/color-utils";
import type { OklchColor } from "@/lib/color-engine/types";
import { PALETTE_RECIPES, type PaletteRecipe, type SpacePaletteId } from "@/lib/palette-recipes";
import {
  derivePaletteTokens,
  type CorePalette as SemanticCorePalette,
} from "@/lib/palette-semantic-tokens";

export { PALETTE_RECIPES, type PaletteRecipe, type SpacePaletteId } from "@/lib/palette-recipes";

export const DEFAULT_PALETTE_ID = "generic-gradient";

const SPACE_PALETTE_IDS = Object.keys(PALETTE_RECIPES) as SpacePaletteId[];

export type SpacePalette = {
  id: SpacePaletteId;
  colors: [string, string, string, string];
  background: string;
  text: string;
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

function recipeFor(id?: string): { id: SpacePaletteId; recipe: PaletteRecipe } {
  if (id && id in PALETTE_RECIPES) {
    return { id: id as SpacePaletteId, recipe: PALETTE_RECIPES[id as SpacePaletteId] };
  }
  return { id: DEFAULT_PALETTE_ID, recipe: PALETTE_RECIPES[DEFAULT_PALETTE_ID] };
}

function paletteFromCore(id: SpacePaletteId, hex: string): SpacePalette {
  const core = generateCorePalette(hex, PALETTE_RECIPES[id]);
  return {
    id,
    colors: [core.primary, core.secondary, core.accent, core.surface],
    background: core.background,
    text: core.textPrimary,
  };
}

export function extractSpacePalettes(hex: string): SpacePalette[] {
  return SPACE_PALETTE_IDS.map((id) => paletteFromCore(id, hex));
}

export function getSpacePalette(hex: string, id: string) {
  const resolved = recipeFor(id);
  return paletteFromCore(resolved.id, hex);
}

export function generateSelectedPalette(hex: string, paletteId?: string): SemanticCorePalette {
  const { recipe } = recipeFor(paletteId);
  const core = generateCorePalette(hex, recipe);
  return {
    primary: core.primary,
    secondary: core.secondary,
    accent: core.accent,
    background: core.background,
    surface: core.surface,
    primaryText: core.textPrimary,
  };
}

export function deriveSelectedPaletteTokens(hex: string, paletteId?: string) {
  return derivePaletteTokens(generateSelectedPalette(hex, paletteId));
}

export function paletteSwatches(palette: SpacePalette) {
  return [...palette.colors, palette.background, palette.text];
}

export function themePaper(hex: string, mode: "light" | "dark") {
  if (mode === "light") return hex;
  const color = parseToOklch(hex);
  return toHex({
    ...color,
    l: Math.min(0.18, color.l * 0.16 + 0.07),
    c: Math.min(color.c, 0.03),
  });
}

export function themeInk(hex: string, mode: "light" | "dark") {
  if (mode === "light") return hex;
  const color = parseToOklch(hex);
  return toHex({
    ...color,
    l: Math.max(0.88, 0.94 - color.c * 0.4),
    c: Math.min(color.c, 0.035),
  });
}

export function paletteRoles(hex: string, paletteId?: string): PaletteRoles {
  const { recipe } = recipeFor(paletteId);
  const core = generateCorePalette(hex, recipe);
  const chartFourth = mixOklab(core.secondary, core.accent, 0.45);

  return {
    primary: core.primary,
    primaryAction: core.primaryAction,
    onPrimary: core.onPrimary,
    secondary: asChip(core.secondary),
    onSecondary: core.onSecondary,
    accent: asChip(core.accent),
    onAccent: core.onAccent,
    surface: core.surface,
    surfaceRaised: core.surfaceRaised,
    surfaceSunken: core.surfaceSunken,
    surfaceSelected: core.surfaceSelected,
    background: core.background,
    backgroundSubtle: core.backgroundSubtle,
    text: core.textPrimary,
    textSecondary: core.textSecondary,
    textTertiary: core.textTertiary,
    textDisabled: core.textDisabled,
    borderSubtle: core.borderSubtle,
    borderDefault: core.borderDefault,
    borderStrong: core.borderStrong,
    chips: [core.primary, core.secondary, core.accent, chartFourth],
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
    ...Object.fromEntries(
      Object.entries(paletteChartStops(colors)).map(([slot, value]) => [
        `--color-chart-${slot}`,
        value,
      ]),
    ),
    "--color-interaction-selected": shiftLightness(primary, 0.34),
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
