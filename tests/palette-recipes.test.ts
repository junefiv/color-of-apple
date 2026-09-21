import { describe, expect, it } from "vitest";
import { contrastRatio, generateCorePalette, parseToOklch } from "@/lib/color-engine";
import { hueDistance } from "@/lib/color-engine/color-utils";
import { PALETTE_RECIPES } from "@/lib/palette-recipes";

describe("palette recipes", () => {
  it("keeps Sage Pair secondary in the sage range", () => {
    const core = generateCorePalette("#f15c5c", PALETTE_RECIPES.matching);
    expect(hueDistance(parseToOklch(core.secondary).h, 135)).toBeLessThan(8);
  });

  it("uses secondary hue for Ink & Wine foundation", () => {
    const core = generateCorePalette("#ff6b35", PALETTE_RECIPES.classy);
    expect(hueDistance(parseToOklch(core.background).h, parseToOklch(core.secondary).h)).toBeLessThan(25);
    expect(hueDistance(parseToOklch(core.textPrimary).h, parseToOklch(core.secondary).h)).toBeLessThan(25);
  });

  it("splits Warm Cool foundation between primary paper and secondary ink", () => {
    const core = generateCorePalette("#ff7a1a", PALETTE_RECIPES.squash);
    expect(hueDistance(parseToOklch(core.background).h, parseToOklch(core.primary).h)).toBeLessThan(20);
    expect(hueDistance(parseToOklch(core.textPrimary).h, parseToOklch(core.secondary).h)).toBeLessThan(20);
  });

  it("passes on-color and text contrast for every recipe", () => {
    for (const recipe of Object.values(PALETTE_RECIPES)) {
      const core = generateCorePalette("#2d2dca", recipe);
      expect(contrastRatio(core.onPrimary, core.primary)).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(core.onSecondary, core.secondary)).toBeGreaterThanOrEqual(3);
      expect(contrastRatio(core.textPrimary, core.background)).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(core.textPrimary, core.surface)).toBeGreaterThanOrEqual(4.5);
      expect(parseToOklch(core.background).c).toBeLessThan(0.025);
    }
  });
});
