import { describe, expect, it } from "vitest";
import { contrastRatio, generateCorePalette, parseToOklch } from "@/lib/color-engine";
import { hueDistance } from "@/lib/color-engine/color-utils";

const navy = generateCorePalette("#2d2dca", "balance");

describe("generateCorePalette", () => {
  it("keeps structural colors quiet and readable", () => {
    const background = parseToOklch(navy.background);
    const surface = parseToOklch(navy.surface);
    const text = parseToOklch(navy.textPrimary);

    expect(background.l).toBeGreaterThan(0.95);
    expect(background.c).toBeLessThanOrEqual(0.03);
    expect(surface.l).toBeGreaterThanOrEqual(background.l);
    expect(text.l).toBeLessThan(0.28);
    expect(contrastRatio(navy.textPrimary, navy.background)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(navy.textPrimary, navy.surface)).toBeGreaterThanOrEqual(4.5);
  });

  it("preserves the selected primary and derives an actionable fill", () => {
    expect(navy.primary).toBe("#2d2dca");
    expect(contrastRatio(navy.primaryAction, navy.background)).toBeGreaterThanOrEqual(3);
    expect(contrastRatio(navy.onPrimary, navy.primaryAction)).toBeGreaterThanOrEqual(4.5);
  });

  it("keeps accent distinct from primary", () => {
    const primary = parseToOklch(navy.primary);
    const accent = parseToOklch(navy.accent);
    expect(hueDistance(accent.h, primary.h) > 18 || Math.abs(accent.l - primary.l) >= 0.1).toBe(true);
  });

  it("does not paint surface with an expression color", () => {
    const surface = parseToOklch(navy.surface);
    const secondary = parseToOklch(navy.secondary);
    expect(surface.c).toBeLessThan(Math.max(secondary.c * 0.5, 0.02));
  });

  it("uses the concept's Neutral hue for Balance", () => {
    expect(hueDistance(parseToOklch(navy.background).h, parseToOklch(navy.primary).h)).toBeLessThan(40);
  });
});
