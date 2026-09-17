import { parseToOklch } from "@/lib/color-engine";
import { prefersReducedMotion } from "@/lib/match-reveal";

export type BleedOrigin =
  | "center"
  | "top"
  | "bottom"
  | "side-left"
  | "side-right"
  | "diag-tl"
  | "diag-tr";

export function bleedOriginFromHex(hex: string): BleedOrigin {
  try {
    const { h } = parseToOklch(hex);
    const hue = ((h ?? 0) % 360 + 360) % 360;
    if (hue < 51) return "side-left";
    if (hue < 102) return "top";
    if (hue < 154) return "center";
    if (hue < 205) return "diag-tl";
    if (hue < 257) return "bottom";
    if (hue < 308) return "side-right";
    return "diag-tr";
  } catch {
    return "center";
  }
}

export { prefersReducedMotion };
