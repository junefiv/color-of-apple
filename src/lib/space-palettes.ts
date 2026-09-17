import { formatHex, interpolate } from "culori";
import {
  chooseOnColor,
  contrastRatio,
  mixOklab,
  parseToOklch,
  rotateHue,
  shiftLightness,
  toHex,
} from "@/lib/color-engine/color-utils";
import type { OklchColor } from "@/lib/color-engine/types";

export const DEFAULT_PALETTE_ID = "generic-gradient";

const GOLDEN_END = "#f9f871";
const DEEP_END = "#2f4858";

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

export type SpacePalette = {
  id: SpacePaletteId;
  colors: [string, string, string, string];
  background: string;
  text: string;
};

type OklchSeed = ReturnType<typeof parseToOklch>;

function normalize(hex: string) {
  return toHex(parseToOklch(hex));
}

function chip(seed: OklchSeed, hueShift: number, lightness: number, chroma: number) {
  return toHex({
    mode: "oklch",
    h: rotateHue(seed.h, hueShift),
    l: lightness,
    c: chroma,
  });
}

function lerpStops(start: string, end: string, steps: number) {
  const interp = interpolate([start, end], "oklch");
  return Array.from({ length: steps }, (_, index) => {
    const t = steps === 1 ? 0 : index / (steps - 1);
    const sample = interp(t);
    const hex = sample ? formatHex(sample) : null;
    return hex ? normalize(hex) : start;
  });
}

function hashSeed(hex: string) {
  const body = hex.replace("#", "");
  let hash = 2166136261;
  for (let i = 0; i < body.length; i++) {
    hash ^= body.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function genericEnd(seed: OklchSeed) {
  return seed.l < 0.44 ? DEEP_END : GOLDEN_END;
}

function matchingEnd(seed: OklchSeed) {
  const coolBand = seed.h >= 185 && seed.h <= 265;
  return chip(seed, coolBand ? 78 : -96, coolBand ? 0.52 : 0.6, 0.17);
}

function shadeRow(seed: OklchSeed, count: number) {
  return Array.from({ length: count }, (_, index) => {
    const t = index / Math.max(1, count - 1);
    return chip(seed, t * 8, Math.min(0.93, seed.l + t * 0.28), Math.min(0.2, seed.c + t * 0.04));
  });
}

function randomShadeRow(source: string, seed: OklchSeed): [string, string, string, string] {
  const hash = hashSeed(source);
  const pick = (slot: number, min: number, max: number) => {
    const unit = ((hash >>> (slot * 5)) & 31) / 31;
    return min + (max - min) * unit;
  };
  return [
    source,
    chip(seed, pick(1, 40, 70), pick(2, 0.7, 0.86), pick(3, 0.1, 0.16)),
    chip(seed, pick(4, 160, 210), pick(5, 0.2, 0.32), pick(6, 0.12, 0.2)),
    chip(seed, pick(7, -110, -70), pick(8, 0.78, 0.92), pick(9, 0.07, 0.12)),
  ];
}

function asFour(colors: string[]): [string, string, string, string] {
  return [colors[0], colors[1], colors[2], colors[3]];
}

function fitInk(background: string, ink: string) {
  const bg = parseToOklch(background);
  const color = parseToOklch(ink);
  const towardDark = bg.l > 0.55;
  let next = ink;
  for (let i = 0; i < 40; i += 1) {
    if (contrastRatio(next, background) >= 4.5) return next;
    color.l = towardDark ? Math.max(0.08, color.l - 0.02) : Math.min(0.96, color.l + 0.02);
    next = toHex(color);
  }
  return next;
}

function absChip(hue: number, lightness: number, chroma: number) {
  return toHex({
    mode: "oklch",
    h: hue,
    l: lightness,
    c: chroma,
  });
}

const PAPER = {
  snow: [255, 0.992, 0.002],
  chalk: [90, 0.988, 0],
  porcelain: [95, 0.984, 0.004],
  ivory: [85, 0.978, 0.008],
  cream: [78, 0.972, 0.01],
  stone: [80, 0.968, 0.006],
  mist: [240, 0.98, 0.005],
  fog: [230, 0.974, 0.007],
  slate: [250, 0.97, 0.008],
  parchment: [72, 0.975, 0.011],
} as const;

const INK = {
  soot: [0, 0.14, 0],
  graphite: [250, 0.16, 0.01],
  charcoal: [80, 0.17, 0.012],
  espresso: [60, 0.15, 0.016],
  ink: [255, 0.15, 0.018],
} as const;

function paperAndInk(paper: readonly [number, number, number], ink: readonly [number, number, number]) {
  const background = absChip(paper[0], paper[1], paper[2]);
  return {
    background,
    text: fitInk(background, absChip(ink[0], ink[1], ink[2])),
  };
}

export function extractSpacePalettes(hex: string): SpacePalette[] {
  const source = normalize(hex);
  const seed = parseToOklch(source);
  const chroma = Math.min(0.22, Math.max(0.08, seed.c));

  const make = (
    id: SpacePaletteId,
    colors: [string, string, string, string],
    paper: readonly [number, number, number],
    ink: readonly [number, number, number],
  ): SpacePalette => ({
    id,
    colors,
    ...paperAndInk(paper, ink),
  });

  return [
    make("generic-gradient", asFour(lerpStops(source, genericEnd(seed), 4)), PAPER.ivory, INK.charcoal),
    make("matching-gradient", asFour(lerpStops(source, matchingEnd(seed), 4)), PAPER.mist, INK.graphite),
    make(
      "spot",
      [source, chip(seed, 18, 0.64, 0.05), chip(seed, 8, 0.95, 0.02), chip(seed, -42, 0.7, chroma + 0.02)],
      PAPER.snow,
      INK.soot,
    ),
    make(
      "twisted-spot",
      [source, chip(seed, 136, 0.71, 0.13), chip(seed, 148, 0.91, 0.06), chip(seed, 142, 0.38, 0.08)],
      PAPER.fog,
      INK.graphite,
    ),
    make(
      "classy",
      [source, chip(seed, -12, 0.34, 0.025), chip(seed, -92, 0.4, 0.18), chip(seed, -78, 0.58, 0.2)],
      PAPER.parchment,
      INK.espresso,
    ),
    make(
      "cube",
      [source, chip(seed, 78, 0.68, 0.07), chip(seed, -118, 0.24, 0.045), chip(seed, 48, 0.5, 0.12)],
      PAPER.stone,
      INK.charcoal,
    ),
    make(
      "switch",
      [source, chip(seed, 42, 0.86, 0.12), chip(seed, 168, 0.66, 0.14), chip(seed, 210, 0.18, 0.03)],
      PAPER.porcelain,
      INK.soot,
    ),
    make(
      "small-switch",
      [source, chip(seed, 196, 0.93, 0.025), chip(seed, 188, 0.48, 0.1), chip(seed, 200, 0.28, 0.08)],
      PAPER.snow,
      INK.ink,
    ),
    make(
      "skip-gradient",
      [source, chip(seed, 180, 0.82, 0.11), chip(seed, 176, 0.6, 0.15), chip(seed, 172, 0.36, 0.1)],
      PAPER.slate,
      INK.graphite,
    ),
    make(
      "natural",
      [source, chip(seed, 36, 0.62, 0.045), chip(seed, 52, 0.94, 0.018), chip(seed, 28, 0.2, 0.035)],
      PAPER.cream,
      INK.espresso,
    ),
    make(
      "matching",
      [source, chip(seed, 8, 0.3, 0.02), chip(seed, 152, 0.36, 0.1), chip(seed, 146, 0.6, 0.12)],
      PAPER.chalk,
      INK.soot,
    ),
    make(
      "squash",
      [source, chip(seed, -56, 0.48, 0.16), chip(seed, 104, 0.46, 0.13), chip(seed, 28, 0.72, 0.08)],
      PAPER.ivory,
      INK.charcoal,
    ),
    make(
      "grey-friends",
      [source, chip(seed, 4, 0.28, 0.018), chip(seed, -6, 0.8, 0.016), chip(seed, 10, 0.52, 0.02)],
      PAPER.chalk,
      INK.soot,
    ),
    make(
      "dotting",
      [
        source,
        chip(seed, -22, 0.76, 0.03),
        chip(seed, -98, 0.48, 0.19),
        mixOklab(chip(seed, -88, 0.64, 0.16), chip(seed, -16, 0.74, 0.04), 0.4),
      ],
      PAPER.porcelain,
      INK.espresso,
    ),
    make("skip-shade", asFour(lerpStops(source, chip(seed, 214, 0.78, 0.13), 4)), PAPER.mist, INK.ink),
    make(
      "threedom",
      [source, chip(seed, 120, 0.52, 0.14), chip(seed, 240, 0.44, 0.13), chip(seed, 60, 0.62, 0.1)],
      PAPER.snow,
      INK.soot,
    ),
    make(
      "highlight",
      [source, chip(seed, 32, 0.8, 0.16), chip(seed, 68, 0.96, 0.03), chip(seed, -158, 0.17, 0.04)],
      PAPER.cream,
      INK.charcoal,
    ),
    make(
      "neighbor",
      [source, chip(seed, -26, 0.38, 0.09), chip(seed, 16, 0.54, 0.1), chip(seed, 22, 0.82, 0.04)],
      PAPER.stone,
      INK.graphite,
    ),
    make(
      "discreet",
      [source, chip(seed, -8, 0.68, 0.032), chip(seed, 2, 0.93, 0.012), chip(seed, -38, 0.22, 0.028)],
      PAPER.chalk,
      INK.soot,
    ),
    make(
      "dust",
      [source, chip(seed, -34, 0.36, 0.028), chip(seed, -40, 0.76, 0.026), chip(seed, -64, 0.6, 0.17)],
      PAPER.parchment,
      INK.espresso,
    ),
    make(
      "collective",
      [source, chip(seed, -36, 0.48, 0.2), chip(seed, 64, 0.44, 0.18), chip(seed, 160, 0.56, 0.1)],
      PAPER.fog,
      INK.charcoal,
    ),
    make(
      "friend",
      [source, chip(seed, 48, 0.82, 0.13), chip(seed, 124, 0.7, 0.12), chip(seed, 138, 0.32, 0.09)],
      PAPER.ivory,
      INK.graphite,
    ),
    make(
      "pin",
      [source, chip(seed, 26, 0.74, 0.11), chip(seed, 198, 0.19, 0.025), chip(seed, -72, 0.72, 0.14)],
      PAPER.porcelain,
      INK.soot,
    ),
    make("shades", asFour([source, ...shadeRow(seed, 4).slice(1)]), PAPER.cream, INK.charcoal),
    make("random-shades", randomShadeRow(source, seed), PAPER.stone, INK.espresso),
  ];
}

export function getSpacePalette(hex: string, id: string) {
  return extractSpacePalettes(hex).find((palette) => palette.id === id) ?? extractSpacePalettes(hex)[0];
}

export type PaletteChip = {
  hex: string;
  color: OklchColor;
};

export type PaletteRoles = {
  primary: string;
  secondary: PaletteChip;
  accent: PaletteChip;
  companion: PaletteChip;
  background: string;
  text: string;
  chips: string[];
};

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
  const palette = getSpacePalette(hex, paletteId ?? DEFAULT_PALETTE_ID);
  const [primary, secondary, accent, companion] = palette.colors.map((value) => ({
    hex: value,
    color: parseToOklch(value),
  }));

  return {
    primary: primary.hex,
    secondary,
    accent,
    companion,
    background: palette.background,
    text: palette.text,
    chips: palette.colors,
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
