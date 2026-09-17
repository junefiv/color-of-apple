import {
  clampChroma,
  converter,
  formatHex,
  formatHex8,
  interpolate,
  parse,
  wcagContrast,
} from "culori";
import { LIGHTNESS_STEPS } from "./constants";
import type { OklchColor, PrimaryStep } from "./types";

const toOklch = converter("oklch");

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function rotateHue(hue: number, amount: number) {
  return (hue + amount + 360) % 360;
}

export function hueDistance(a: number, b: number) {
  const diff = Math.abs(a - b) % 360;
  return diff > 180 ? 360 - diff : diff;
}

export function expandHex(value: string) {
  const hex = value.trim();
  if (/^#[0-9a-f]{3}$/i.test(hex)) {
    const [, r, g, b] = hex;
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }
  if (/^#[0-9a-f]{6}$/i.test(hex)) {
    return hex.toLowerCase();
  }
  return null;
}

export function parseToOklch(input: string): OklchColor {
  const trimmed = input.trim();
  if (!trimmed) {
    throw new Error("EMPTY_COLOR");
  }

  const parsed = parse(trimmed);
  if (!parsed) {
    throw new Error("INVALID_COLOR");
  }
  if (parsed.mode === "rgb" && parsed.alpha !== undefined && parsed.alpha < 1) {
    throw new Error("TRANSPARENT_COLOR");
  }
  if (parsed.alpha !== undefined && parsed.alpha < 1) {
    throw new Error("TRANSPARENT_COLOR");
  }

  const oklch = toOklch(parsed);
  if (!oklch || oklch.l === undefined) {
    throw new Error("INVALID_COLOR");
  }

  return {
    mode: "oklch",
    l: oklch.l,
    c: oklch.c ?? 0,
    h: oklch.h ?? 0,
  };
}

export function toHex(color: string | OklchColor): string {
  const fitted = fitToSrgb(typeof color === "string" ? parseToOklch(color) : color);
  const hex = formatHex(fitted);
  if (!hex) {
    throw new Error("HEX_CONVERT_FAILED");
  }
  return hex.toLowerCase();
}

export function toHex8(color: OklchColor, alpha: number): string {
  const fitted = fitToSrgb(color);
  const hex = formatHex8({ ...fitted, alpha: clamp(alpha, 0, 1) });
  if (!hex) {
    throw new Error("HEX_CONVERT_FAILED");
  }
  return hex.toLowerCase();
}

export function fitToSrgb(color: OklchColor): OklchColor {
  const clamped = clampChroma(color, "oklch");
  return {
    mode: "oklch",
    l: clamp(clamped.l ?? color.l, 0, 1),
    c: Math.max(0, clamped.c ?? 0),
    h: clamped.h ?? color.h,
  };
}

export function mixOklab(
  a: string | OklchColor,
  b: string | OklchColor,
  amount: number,
): string {
  const mix = interpolate([a, b], "oklab");
  const mixed = mix(clamp(amount, 0, 1));
  const oklch = toOklch(mixed);
  if (!oklch || oklch.l === undefined) {
    throw new Error("MIX_FAILED");
  }
  return toHex({
    mode: "oklch",
    l: oklch.l,
    c: oklch.c ?? 0,
    h: oklch.h ?? 0,
  });
}

export function shiftLightness(hex: string, delta: number): string {
  const color = parseToOklch(hex);
  color.l = clamp(color.l + delta, 0.02, 0.99);
  return toHex(color);
}

export function setLightness(hex: string, lightness: number): string {
  const color = parseToOklch(hex);
  color.l = clamp(lightness, 0.02, 0.99);
  return toHex(color);
}

export function setChroma(hex: string, chroma: number): string {
  const color = parseToOklch(hex);
  color.c = Math.max(0, chroma);
  return toHex(color);
}

export function contrastRatio(a: string, b: string) {
  return Number(wcagContrast(a, b).toFixed(2));
}

export function findClosestStep(inputLightness: number): PrimaryStep {
  return Number(
    (Object.entries(LIGHTNESS_STEPS) as Array<[string, number]>).sort(
      (left, right) =>
        Math.abs(left[1] - inputLightness) - Math.abs(right[1] - inputLightness),
    )[0][0],
  ) as PrimaryStep;
}

export function chooseOnColor(background: string) {
  const darkText = "#111111";
  const lightText = "#ffffff";
  const darkContrast = contrastRatio(background, darkText);
  const lightContrast = contrastRatio(background, lightText);
  return darkContrast >= lightContrast ? darkText : lightText;
}

export function preserveSourceHex(input: string, fallback: OklchColor) {
  return expandHex(input) ?? toHex(fallback);
}
