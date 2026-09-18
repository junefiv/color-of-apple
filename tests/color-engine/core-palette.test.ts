import { describe, expect, it } from "vitest";
import {
  contrastRatio,
  generateCorePalette,
  parseToOklch,
} from "@/lib/color-engine";
import { hueDistance } from "@/lib/color-engine/color-utils";
import { PALETTE_RECIPES } from "@/lib/space-palettes";

const navy = generateCorePalette("#2d2dca", PALETTE_RECIPES["generic-gradient"]);

describe("generateCorePalette", () => {
  it("keeps structural colors quiet and readable", () => {
    const background = parseToOklch(navy.background);
    const surface = parseToOklch(navy.surface);
    const text = parseToOklch(navy.textPrimary);

    expect(background.l).toBeGreaterThan(0.96);
    expect(background.c).toBeLessThanOrEqual(0.02);
    expect(surface.l).toBeLessThan(background.l);
    expect(surface.c).toBeLessThanOrEqual(0.025);
    expect(hueDistance(surface.h, background.h)).toBeLessThan(12);
    expect(text.l).toBeLessThan(0.28);
    expect(text.c).toBeLessThanOrEqual(0.025);
    expect(contrastRatio(navy.textPrimary, navy.background)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(navy.textPrimary, navy.surface)).toBeGreaterThanOrEqual(4.5);
  });

  it("preserves the selected primary and derives an actionable fill", () => {
    expect(navy.primary).toBe("#2d2dca");
    expect(contrastRatio(navy.primaryAction, navy.background)).toBeGreaterThanOrEqual(3);
    expect(contrastRatio(navy.onPrimary, navy.primaryAction)).toBeGreaterThanOrEqual(4.5);
  });

  it("keeps secondary softer than primary and accent distinct", () => {
    const primary = parseToOklch(navy.primary);
    const secondary = parseToOklch(navy.secondary);
    const accent = parseToOklch(navy.accent);
    expect(secondary.c).toBeLessThanOrEqual(primary.c + 0.01);
    expect(Math.abs(accent.h - primary.h) > 25 || Math.abs(accent.l - primary.l) >= 0.1).toBe(true);
  });

  it("does not paint surface with an expression color", () => {
    const surface = parseToOklch(navy.surface);
    const secondary = parseToOklch(navy.secondary);
    expect(surface.c).toBeLessThan(secondary.c * 0.4);
  });
});
