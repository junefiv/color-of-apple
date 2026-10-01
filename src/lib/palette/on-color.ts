import { contrastRatio, parseToOklch, toHex } from "@/lib/color-engine/color-utils";
import type { OklchColor } from "@/lib/color-engine/types";

const ACHROMATIC_CHROMA = 0.015;

export type OnColorMode = "light" | "dark";

export interface OnColorToken {
  mode: OnColorMode;
  hex: string;
  oklch: OklchColor;
}

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
  const shouldUseDarkText = bg.l >= getAdaptiveThreshold(hue);

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
  if (contrastRatio(hex, background) < 4.5) {
    oklch = { ...oklch, l: shouldUseDarkText ? 0.98 : 0.15, c: isAchromatic ? 0 : 0.015 };
    hex = toHex(oklch);
    if (contrastRatio(hex, background) < 4.5) {
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
