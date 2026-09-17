import {
  mixOklab,
  parseToOklch,
  rotateHue,
  setChroma,
  setLightness,
  shiftLightness,
  toHex,
} from "@/lib/color-engine/color-utils";
import { chooseOnColor } from "@/lib/color-engine";

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

export type SpacePalette = {
  id: SpacePaletteId;
  name: string;
  colors: string[];
};

function hue(hex: string, amount: number) {
  const color = parseToOklch(hex);
  color.h = rotateHue(color.h, amount);
  return toHex(color);
}

function tone(hex: string, lightness: number, chroma?: number) {
  const next = setLightness(hex, lightness);
  return chroma === undefined ? next : setChroma(next, chroma);
}

function muted(hex: string, lightness: number) {
  return tone(hex, lightness, 0.028);
}

export function extractSpacePalettes(hex: string): SpacePalette[] {
  const source = toHex(parseToOklch(hex));
  const complement = hue(source, 180);
  const analog = hue(source, 32);
  const cool = hue(source, 48);
  const warm = hue(source, -42);
  const triadA = hue(source, 120);
  const triadB = hue(source, 240);

  return [
    {
      id: "generic-gradient",
      name: "Generic Gradient",
      colors: [source, hue(source, -28), hue(source, -52), hue(source, -78), hue(source, -108), hue(source, -138)].map(
        (item, index) => shiftLightness(item, index * 0.035),
      ),
    },
    {
      id: "matching-gradient",
      name: "Matching Gradient",
      colors: [source, cool, hue(cool, 18), hue(cool, 32), hue(cool, 46), hue(cool, 58)].map((item, index) =>
        setLightness(item, 0.48 + index * 0.03),
      ),
    },
    {
      id: "spot",
      name: "Spot Palette",
      colors: [source, tone(source, 0.72, 0.08), tone(source, 0.94, 0.04), setLightness(complement, 0.72)],
    },
    {
      id: "twisted-spot",
      name: "Twisted Spot Palette",
      colors: [source, setLightness(complement, 0.7), tone(complement, 0.92, 0.05), tone(complement, 0.42, 0.06)],
    },
    {
      id: "classy",
      name: "Classy Palette",
      colors: [source, muted(source, 0.28), muted(source, 0.72), hue(warm, -12), shiftLightness(warm, 0.18)],
    },
    {
      id: "cube",
      name: "Cube Palette",
      colors: [source, tone(cool, 0.48, 0.05), tone(warm, 0.82, 0.03)],
    },
    {
      id: "switch",
      name: "Switch Palette",
      colors: [source, tone(analog, 0.88, 0.08), setLightness(complement, 0.7), "#fefedf"],
    },
    {
      id: "small-switch",
      name: "Small Switch Palette",
      colors: [source, tone(cool, 0.93, 0.02), tone(cool, 0.52, 0.07)],
    },
    {
      id: "skip-gradient",
      name: "Skip Gradient",
      colors: [source, shiftLightness(complement, 0.28), setLightness(complement, 0.62), tone(complement, 0.42, 0.08)],
    },
    {
      id: "natural",
      name: "Natural Palette",
      colors: [source, muted(source, 0.62), tone(source, 0.96, 0.02), "#fefedf"],
    },
    {
      id: "matching",
      name: "Matching Palette",
      colors: [source, muted(source, 0.28), muted(source, 0.72), tone(complement, 0.42, 0.07), setLightness(complement, 0.66)],
    },
    {
      id: "squash",
      name: "Squash Palette",
      colors: [source, tone(warm, 0.48, 0.14), tone(cool, 0.52, 0.12)],
    },
    {
      id: "grey-friends",
      name: "Grey Friends",
      colors: [source, muted(source, 0.28), muted(source, 0.72)],
    },
    {
      id: "dotting",
      name: "Dotting Palette",
      colors: [source, muted(source, 0.7), hue(warm, -8), mixOklab(warm, muted(source, 0.7), 0.45)],
    },
    {
      id: "skip-shade",
      name: "Skip Shade Gradient",
      colors: [source, hue(cool, 20), hue(cool, 40), shiftLightness(complement, 0.26)],
    },
    {
      id: "threedom",
      name: "Threedom",
      colors: [source, setLightness(triadA, 0.5), setLightness(triadB, 0.46)],
    },
    {
      id: "highlight",
      name: "Highlight Palette",
      colors: [source, tone(analog, 0.78, 0.12), "#fefedf", tone(warm, 0.82, 0.03)],
    },
    {
      id: "neighbor",
      name: "Neighbor Palette",
      colors: [source, tone(cool, 0.36, 0.07), tone(cool, 0.56, 0.09), tone(cool, 0.8, 0.03)],
    },
    {
      id: "discreet",
      name: "Discreet Palette",
      colors: [source, muted(source, 0.62), tone(source, 0.96, 0.015), tone(warm, 0.82, 0.03)],
    },
    {
      id: "dust",
      name: "Dust Palette",
      colors: [source, muted(source, 0.28), muted(source, 0.72), shiftLightness(warm, 0.16)],
    },
    {
      id: "collective",
      name: "Collective",
      colors: [source, hue(source, -22), hue(source, -48)],
    },
    {
      id: "friend",
      name: "Friend palette",
      colors: [source, tone(analog, 0.76, 0.12), setLightness(complement, 0.7), tone(complement, 0.32, 0.07)],
    },
    {
      id: "pin",
      name: "Pin Palette",
      colors: [source, tone(analog, 0.78, 0.12), "#fefedf", setLightness(complement, 0.7)],
    },
    {
      id: "shades",
      name: "Shades",
      colors: [0, 0.08, 0.16, 0.24, 0.32].map((delta) => shiftLightness(source, delta)),
    },
    {
      id: "random-shades",
      name: "Random Shades",
      colors: [
        source,
        shiftLightness(source, 0.28),
        shiftLightness(source, -0.04),
        tone(source, 0.32, 0.12),
        tone(source, 0.28, 0.11),
      ],
    },
  ];
}

export function getSpacePalette(hex: string, id: string) {
  return extractSpacePalettes(hex).find((palette) => palette.id === id) ?? extractSpacePalettes(hex)[0];
}

export function palettePreviewVars(colors: string[]) {
  const primary = colors[0];
  const secondary = colors[1] ?? shiftLightness(primary, 0.2);
  const accent = colors[2] ?? colors[1] ?? primary;
  const extra = colors[3] ?? accent;
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
    "--color-chart-1": primary,
    "--color-chart-2": secondary,
    "--color-chart-3": accent,
    "--color-chart-4": extra,
    "--color-chart-5": colors[4] ?? extra,
    "--color-interaction-selected": shiftLightness(primary, 0.34),
  } as Record<string, string>;
}

export function paletteGradient(colors: string[]) {
  return `linear-gradient(to right, ${colors.join(", ")})`;
}
