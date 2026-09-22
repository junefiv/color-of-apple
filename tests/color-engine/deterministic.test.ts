import { describe, expect, it } from "vitest";
import { DEFAULT_INPUT, generateColorSystem } from "@/lib/color-engine";
import { extractSpacePalettes } from "@/lib/space-palettes";

function stable(value: unknown) {
  return JSON.stringify(value);
}

describe("generateColorSystem", () => {
  it("returns the same result for the same input", () => {
    const first = generateColorSystem(DEFAULT_INPUT);
    const second = generateColorSystem(DEFAULT_INPUT);
    expect(stable(first)).toBe(stable(second));
  });

  it("keeps the source hex on primary 500", () => {
    const result = generateColorSystem(DEFAULT_INPUT);
    expect(result.primitive.primary[500]).toBe("#ff6b35");
    expect(result.meta.anchorStep).toBe(500);
    expect(result.meta.sourceHex).toBe("#ff6b35");
  });

  it("emits light and dark semantic tokens and a version", () => {
    const result = generateColorSystem(DEFAULT_INPUT);
    expect(result.meta.engineVersion).toBe("1.0.0");
    expect(result.semantic.light.primary.default).toMatch(/^#/);
    expect(result.semantic.dark.background.canvas).toMatch(/^#/);
    expect(result.semantic.light.background.canvas).not.toBe(
      result.semantic.dark.background.canvas,
    );
  });

  it("rejects transparent colors", () => {
    expect(() =>
      generateColorSystem({ ...DEFAULT_INPUT, hex: "rgba(255,0,0,0.2)" }),
    ).toThrow(/TRANSPARENT/);
  });

  it("rejects invalid colors", () => {
    expect(() => generateColorSystem({ ...DEFAULT_INPUT, hex: "not-a-color" })).toThrow(
      /INVALID/,
    );
  });

  it("changes supporting tokens when the selected palette changes", () => {
    const polar = generateColorSystem({ ...DEFAULT_INPUT, hex: "#2d2dca" }, "balance");
    const sage = generateColorSystem({ ...DEFAULT_INPUT, hex: "#2d2dca" }, "natural");
    expect(polar.semantic.light.primary.default).toBe("#2d2dca");
    expect(sage.semantic.light.primary.default).toBe("#2d2dca");
    expect(polar.semantic.light.secondary.default).not.toBe(
      sage.semantic.light.secondary.default,
    );
    expect(polar.semantic.light.accent.default).not.toBe(sage.semantic.light.accent.default);
  });

  it("maps generated roles into tokens", () => {
    for (const palette of extractSpacePalettes("#2d2dca")) {
      const result = generateColorSystem({ ...DEFAULT_INPUT, hex: "#2d2dca" }, palette.id);
      expect(result.semantic.light.background.canvas).toBe(palette.background);
      expect(result.semantic.light.text.primary).toBe(palette.text);
      expect(result.semantic.light.background.canvas).toBe(palette.colors[3]);
      expect(result.semantic.light.chart["1"]).toBe(palette.colors[0]);
      expect(result.semantic.light.chart["2"]).toBe(palette.colors[1]);
      expect(result.semantic.light.chart["3"]).toBe(palette.colors[2]);
    }
  });
});
