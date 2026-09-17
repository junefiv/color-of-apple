import { describe, expect, it } from "vitest";
import {
  DEFAULT_INPUT,
  contrastRatio,
  generateColorSystem,
} from "@/lib/color-engine";

describe("contrast", () => {
  it("knows the black-on-white boundary", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBe(21);
  });

  it("auto-fixes contrast pairs for a vivid orange", () => {
    const result = generateColorSystem(DEFAULT_INPUT);
    expect(result.accessibility.light.failCount).toBe(0);
    expect(result.accessibility.dark.failCount).toBe(0);
    expect(
      contrastRatio(
        result.semantic.light.primary.onPrimary,
        result.semantic.light.primary.default,
      ),
    ).toBeGreaterThanOrEqual(4.5);
  });

  it("handles near-white and near-black primaries", () => {
    const pale = generateColorSystem({ ...DEFAULT_INPUT, hex: "#f7f7f7" });
    const ink = generateColorSystem({ ...DEFAULT_INPUT, hex: "#111111" });
    expect(pale.accessibility.light.failCount).toBe(0);
    expect(ink.accessibility.light.failCount).toBe(0);
    expect(pale.semantic.light.primary.default).not.toBe("#f7f7f7");
  });

  it("does not invert dark from light", () => {
    const result = generateColorSystem(DEFAULT_INPUT);
    expect(result.semantic.dark.primary.default).not.toBe(
      result.semantic.light.primary.default,
    );
    expect(result.semantic.dark.surface.raised).not.toBe(
      result.semantic.light.surface.raised,
    );
  });
});
