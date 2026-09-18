import { formatHex, interpolate } from "culori";
import { generateCorePalette, type PaletteRecipe } from "@/lib/color-engine/core-palette";
import {
  chooseOnColor,
  mixOklab,
  parseToOklch,
  shiftLightness,
  toHex,
} from "@/lib/color-engine/color-utils";
import type { OklchColor } from "@/lib/color-engine/types";

export const DEFAULT_PALETTE_ID = "generic-gradient";

export type SpacePaletteId =
  | "generic-gradient"
  | "matching-gradient"
  | "spot"
  | "twisted-spot"
  | "classy"
  | "cube"
  | "switch"
  | "small-switch"
  | "skip-gradient"
  | "natural"
  | "matching"
  | "squash"
  | "grey-friends"
  | "dotting"
  | "skip-shade"
  | "threedom"
  | "highlight"
  | "neighbor"
  | "discreet"
  | "dust"
  | "collective"
  | "friend"
  | "pin"
  | "shades"
  | "random-shades";

export const PALETTE_RECIPES: Record<SpacePaletteId, PaletteRecipe> = {
  "generic-gradient": { harmony: "analogous", mood: "clean", hueDirection: 1, backgroundTint: "brand" },
  "matching-gradient": { harmony: "analogous", mood: "soft", hueDirection: -1, backgroundTint: "cool" },
  spot: { harmony: "monochrome", mood: "clean", hueDirection: 1, backgroundTint: "neutral" },
  "twisted-spot": { harmony: "complementary", mood: "soft", hueDirection: 1, backgroundTint: "cool" },
  classy: { harmony: "analogous", mood: "muted", hueDirection: -1, backgroundTint: "warm" },
  cube: { harmony: "splitComplementary", mood: "highContrast", hueDirection: 1, backgroundTint: "neutral" },
  switch: { harmony: "complementary", mood: "vivid", hueDirection: 1, backgroundTint: "brand" },
  "small-switch": { harmony: "complementary", mood: "clean", hueDirection: -1, backgroundTint: "cool" },
  "skip-gradient": { harmony: "complementary", mood: "muted", hueDirection: 1, backgroundTint: "complement" },
  natural: { harmony: "analogous", mood: "muted", hueDirection: 1, backgroundTint: "warm" },
  matching: { harmony: "splitComplementary", mood: "soft", hueDirection: -1, backgroundTint: "neutral" },
  squash: { harmony: "splitComplementary", mood: "soft", hueDirection: 1, backgroundTint: "warm" },
  "grey-friends": { harmony: "monochrome", mood: "muted", hueDirection: 1, backgroundTint: "neutral" },
  dotting: { harmony: "splitComplementary", mood: "vivid", hueDirection: -1, backgroundTint: "brand" },
  "skip-shade": { harmony: "complementary", mood: "clean", hueDirection: 1, backgroundTint: "cool" },
  threedom: { harmony: "triadic", mood: "vivid", hueDirection: 1, backgroundTint: "neutral" },
  highlight: { harmony: "triadic", mood: "highContrast", hueDirection: 1, backgroundTint: "warm" },
  neighbor: { harmony: "analogous", mood: "clean", hueDirection: -1, backgroundTint: "brand" },
  discreet: { harmony: "monochrome", mood: "soft", hueDirection: 1, backgroundTint: "neutral" },
  dust: { harmony: "analogous", mood: "muted", hueDirection: -1, backgroundTint: "warm" },
  collective: { harmony: "splitComplementary", mood: "muted", hueDirection: 1, backgroundTint: "cool" },
  friend: { harmony: "analogous", mood: "soft", hueDirection: 1, backgroundTint: "brand" },
  pin: { harmony: "splitComplementary", mood: "highContrast", hueDirection: -1, backgroundTint: "warm" },
  shades: { harmony: "monochrome", mood: "clean", hueDirection: -1, backgroundTint: "brand" },
  "random-shades": { harmony: "triadic", mood: "muted", hueDirection: -1, backgroundTint: "complement" },
};

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
  background: string;
  text: string;
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
    background: core.background,
    text: core.textPrimary,
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
  const secondary = colors[1] ?? shiftLightness(primary, 0.2);
  const accent = colors[2] ?? colors[1] ?? primary;
  return {
    "--color-primary-default": primary,
    "--color-primary-hover": shiftLightness(primary, 0.04),
    "--color-primary-pressed": shiftLightness(primary, -0.04),
    "--color-primary-on": chooseOnColor(primary),
    "--color-primary-subtle": shiftLightness(primary, 0.32),
    "--color-primary-text": primary,
    "--color-primary-border": primary,
    "--color-secondary-default": secondary,
    "--color-secondary-on": chooseOnColor(secondary),
    "--color-accent-default": accent,
    "--color-accent-on": chooseOnColor(accent),
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
