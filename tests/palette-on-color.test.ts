import { describe, expect, it } from "vitest";
import { parseToOklch } from "@/lib/color-engine/color-utils";
import { extractOnColor, generatePaletteTokens, getAdaptiveThreshold } from "@/lib/palette";

describe("extractOnColor", () => {
  it("uses hue-adaptive thresholds", () => {
    expect(getAdaptiveThreshold(105)).toBe(0.52);
    expect(getAdaptiveThreshold(255)).toBe(0.68);
    expect(getAdaptiveThreshold(334)).toBe(0.68);
    expect(getAdaptiveThreshold(20)).toBe(0.6);
  });

  it("puts dark ink on white", () => {
    const result = extractOnColor("#ffffff");
    expect(result.mode).toBe("dark");
    expect(result.oklch.l).toBeCloseTo(0.15, 5);
    expect(result.oklch.c).toBe(0);
  });

  it("puts tinted light ink on magenta", () => {
    const result = extractOnColor("#d43cc1");
    expect(result.mode).toBe("light");
    expect(result.oklch.l).toBeCloseTo(0.98, 5);
    expect(result.oklch.c).toBeCloseTo(0.015, 5);
    expect(result.oklch.h).toBeCloseTo(parseToOklch("#d43cc1").h, 0);
  });

  it("puts tinted light ink on cobalt blue", () => {
    const result = extractOnColor("#3c8aff");
    expect(result.mode).toBe("light");
    expect(result.oklch.l).toBeCloseTo(0.98, 5);
    expect(result.oklch.c).toBeCloseTo(0.015, 5);
    expect(result.oklch.h).toBeCloseTo(parseToOklch("#3c8aff").h, 0);
  });

  it("puts tinted dark ink on vivid yellow", () => {
    const result = extractOnColor("#ffe500");
    expect(result.mode).toBe("dark");
    expect(result.oklch.l).toBeCloseTo(0.15, 5);
    expect(result.oklch.c).toBeGreaterThan(0);
    expect(result.oklch.c).toBeLessThanOrEqual(0.045);
    expect(result.oklch.h).toBeCloseTo(parseToOklch("#ffe500").h, 0);
  });

  it("wires the same on-color into generated palette tokens", () => {
    const tokens = generatePaletteTokens("#d43cc1", "balance");
    expect(tokens.core.onPrimary).toBe(extractOnColor("#d43cc1").hex);
    expect(tokens.core.onSecondary).toBe(extractOnColor(tokens.core.secondary).hex);
    expect(tokens.core.onAccent).toBe(extractOnColor(tokens.core.accent).hex);
  });
});
