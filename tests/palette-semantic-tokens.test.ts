import { describe, expect, it } from "vitest";
import { DEFAULT_INPUT, generateColorSystem } from "@/lib/color-engine";
import {
  contrastRatio,
  derivePaletteTokens,
  paletteTokensToCssVariables,
} from "@/lib/palette-semantic-tokens";
import { generateSelectedPalette } from "@/lib/space-palettes";

function luminance(hex: string) {
  const value = hex.replace("#", "");
  const channel = (part: string) => {
    const n = parseInt(part, 16) / 255;
    return n <= 0.04045 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4;
  };
  return (
    0.2126 * channel(value.slice(0, 2)) +
    0.7152 * channel(value.slice(2, 4)) +
    0.0722 * channel(value.slice(4, 6))
  );
}

describe("derivePaletteTokens", () => {
  it("orders border strength from subtle to strong", () => {
    const core = generateSelectedPalette("#f15c5c", "generic-gradient");
    const tokens = derivePaletteTokens(core);
    expect(luminance(tokens.border.subtle)).toBeGreaterThan(luminance(tokens.border.default));
    expect(luminance(tokens.border.default)).toBeGreaterThan(luminance(tokens.border.strong));
  });

  it("picks readable on-colors for filled surfaces", () => {
    const tokens = derivePaletteTokens(generateSelectedPalette("#f15c5c", "generic-gradient"));
    expect(contrastRatio(tokens.core.onPrimary, tokens.core.primary)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(tokens.text.primary, tokens.backgroundAndSurface.background)).toBeGreaterThanOrEqual(7);
  });

  it("is applied when a palette is selected in the color system", () => {
    const result = generateColorSystem({ ...DEFAULT_INPUT, hex: "#f15c5c" }, "matching");
    const vars = paletteTokensToCssVariables(result.derived);
    expect(vars["--color-primary-subtle"]).toMatch(/^#[0-9A-F]{6}$/);
    expect(vars["--color-interaction-hover"]).toMatch(/^#[0-9A-F]{6}$/);
    expect(result.derived.core.primary).toBe("#F15C5C");
  });

  it("changes derived tokens when the recipe changes but primary stays the same", () => {
    const hex = "#f15c5c";
    const polar = derivePaletteTokens(generateSelectedPalette(hex, "generic-gradient"));
    const sage = derivePaletteTokens(generateSelectedPalette(hex, "matching"));
    const gold = derivePaletteTokens(generateSelectedPalette(hex, "pin"));

    expect(polar.core.primary).toBe(sage.core.primary);
    expect(polar.interaction.neutralHover).not.toBe(sage.interaction.neutralHover);
    expect(polar.status.success).not.toBe(sage.status.success);
    expect(polar.core.primarySubtle).not.toBe(gold.core.primarySubtle);
    expect(polar.border.default).not.toBe(sage.border.default);
    expect(polar.backgroundAndSurface.subtleBackground).not.toBe(
      sage.backgroundAndSurface.subtleBackground,
    );
  });
});
