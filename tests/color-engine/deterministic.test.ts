import { describe, expect, it } from "vitest";
import { DEFAULT_INPUT, generateColorSystem } from "@/lib/color-engine";

function stable(value: unknown) {
  return JSON.stringify(value);
}

describe("generateColorSystem", () => {
  it("returns the same result for the same input", () => {
    const first = generateColorSystem(DEFAULT_INPUT);
    const second = generateColorSystem(DEFAULT_INPUT);
    expect(stable(first)).toBe(stable(second));
  });

  it("keeps the source hex on the closest primary step", () => {
    const result = generateColorSystem(DEFAULT_INPUT);
    expect(result.primitive.primary[result.meta.anchorStep]).toBe("#ff6b35");
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
});
