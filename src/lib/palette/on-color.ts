import { contrastRatio, parseToOklch, toHex } from "@/lib/color-engine/color-utils";
import type { OklchColor } from "@/lib/color-engine/types";

const ACHROMATIC_CHROMA = 0.015;

export type OnColorMode = "light" | "dark";

export interface OnColorToken {
  mode: OnColorMode;
  hex: string;
  oklch: OklchColor;
}

/** @deprecated On-color selection now uses rendered contrast, not hue thresholds. */
export function getAdaptiveThreshold(hue: number) {
  if (hue >= 80 && hue <= 150) return 0.52;
  // OKLCH magenta often lands past 330 (e.g. #D43CC1 ≈ 334°).
  if (hue >= 250 && hue <= 340) return 0.68;
  return 0.6;
}

export function extractOnColor(background: string): OnColorToken {
  const bg = parseToOklch(background);
  const isAchromatic = bg.c < ACHROMATIC_CHROMA;
  const hue = bg.h || 0;
  // Prefer light ink whenever the rendered background supports readable text.
  // Saturated colors at the top-right of an HSV picker can still be dark.
  const whiteContrast = contrastRatio("#ffffff", background);
  const prefersWhite = bg.c >= 0.12 && (hue < 40 || hue >= 250);
  const minimum = prefersWhite ? 3 : 4.5;
  const shouldUseDarkText = whiteContrast < minimum;

  let oklch: OklchColor = shouldUseDarkText
    ? {
        mode: "oklch",
        l: 0.15,
        c: isAchromatic ? 0 : Math.min(bg.c * 0.3, 0.045),
        h: isAchromatic ? 0 : hue,
      }
    : {
        mode: "oklch",
        l: 0.98,
        c: isAchromatic ? 0 : 0.015,
        h: isAchromatic ? 0 : hue,
      };

  let hex = toHex(oklch);
  if (!shouldUseDarkText && (whiteContrast < 4.5 || contrastRatio(hex, background) < minimum)) {
    // A tint can lose contrast near the boundary; keep the light polarity.
    hex = "#ffffff";
    oklch = parseToOklch(hex);
  }
  if (contrastRatio(hex, background) < minimum) {
    oklch = { ...oklch, l: shouldUseDarkText ? 0.98 : 0.15, c: isAchromatic ? 0 : 0.015 };
    hex = toHex(oklch);
    if (contrastRatio(hex, background) < minimum) {
      hex = contrastRatio("#000000", background) >= contrastRatio("#ffffff", background) ? "#000000" : "#ffffff";
      oklch = parseToOklch(hex);
    }
  }
  return {
    mode: oklch.l < 0.5 ? "dark" : "light",
    hex,
    oklch,
  };
}

export function getOnColor(background: string) {
  return extractOnColor(background).hex;
}
