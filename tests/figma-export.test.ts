import { describe, expect, it } from "vitest";
import { DEFAULT_INPUT, generateColorSystem } from "@/lib/color-engine";
import { exportFigmaLight } from "@/lib/export";

describe("Figma DTCG export", () => {
  it("exports light semantic colors as Figma-importable sRGB tokens", () => {
    const result = generateColorSystem(DEFAULT_INPUT);
    const exported = JSON.parse(exportFigmaLight(result));
    const primary = exported.primary.default;

    expect(primary.$type).toBe("color");
    expect(primary.$value.colorSpace).toBe("srgb");
    expect(primary.$value.hex).toBe(result.semantic.light.primary.default.toUpperCase());
    expect(primary.$value.components).toHaveLength(3);
    expect(primary.$value.alpha).toBe(1);
  });

  it("preserves alpha from eight-digit overlay colors", () => {
    const result = generateColorSystem(DEFAULT_INPUT);
    const exported = JSON.parse(exportFigmaLight(result));

    expect(exported.overlay.scrim.$value.alpha).toBeLessThan(1);
    expect(exported.overlay.scrim.$value.hex).toMatch(/^#[0-9A-F]{6}$/);
  });
});
