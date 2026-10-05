import { describe, expect, it } from "vitest";
import { contrastRatio, parseToOklch } from "@/lib/color-engine/color-utils";
import { extractOnColor, generatePaletteTokens, getAdaptiveThreshold } from "@/lib/palette";

describe("extractOnColor", () => {
  it.each(["#ff015c", "#ff0000", "#ff0060", "#ff00aa"])(
    "keeps white ink on vivid reds and pinks (%s)",
    (background) => {
      expect(extractOnColor(background).hex).toBe("#ffffff");
      const tokens = generatePaletteTokens(background, "balance");
      expect(tokens.core.primary).toBe(background);
      expect(tokens.core.onPrimary).toBe("#ffffff");
    },
  );
  it.each(["#cc0000", "#0000ff", "#8000ff", "#b000bb"])(
    "prefers readable light ink on saturated picker colors (%s)",
    (background) => {
      const result = extractOnColor(background);
      expect(result.mode).toBe("light");
      expect(contrastRatio(result.hex, background)).toBeGreaterThanOrEqual(4.5);
    },
  );

  it.each(["#ffff00", "#00ff00", "#00ffff", "#ffaaaa"])(
    "uses dark ink when white cannot be read (%s)",
    (background) => {
      const result = extractOnColor(background);
      expect(result.mode).toBe("dark");
      expect(contrastRatio(result.hex, background)).toBeGreaterThanOrEqual(4.5);
    },
  );
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

  it("keeps white ink on vivid magenta", () => {
    const result = extractOnColor("#d43cc1");
    expect(result.hex).toBe("#ffffff");
    expect(contrastRatio(result.hex, "#d43cc1")).toBeGreaterThanOrEqual(3);
  });

  it("keeps white ink on vivid cobalt", () => {
    const result = extractOnColor("#3c8aff");
    expect(result.hex).toBe("#ffffff");
    expect(contrastRatio(result.hex, "#3c8aff")).toBeGreaterThanOrEqual(3);
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
