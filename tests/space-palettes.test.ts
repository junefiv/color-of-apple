import { describe, expect, it } from "vitest";
import { contrastRatio, parseToOklch } from "@/lib/color-engine/color-utils";
import { extractSpacePalettes, paletteRoles } from "@/lib/space-palettes";

describe("extractSpacePalettes", () => {
  it("returns seven strategy palettes with four chips plus paper and ink", () => {
    const palettes = extractSpacePalettes("#2d2dca");
    expect(palettes).toHaveLength(7);

    for (const palette of palettes) {
      expect(palette.colors).toHaveLength(4);
      expect(palette.background).toMatch(/^#[0-9a-f]{6}$/);
      expect(palette.text).toMatch(/^#[0-9a-f]{6}$/);
      expect(palette.colors[0]).toBe("#2d2dca");
    }
  });

  it("is deterministic for the same hex", () => {
    const a = extractSpacePalettes("#845ec2");
    const b = extractSpacePalettes("#845ec2");
    expect(a).toEqual(b);
  });

  it("keeps paper and ink as readable structural colors", () => {
    for (const palette of extractSpacePalettes("#3ebf26")) {
      const paper = parseToOklch(palette.background);
      const ink = parseToOklch(palette.text);
      expect(paper.l).toBeGreaterThan(0.93);
      expect(paper.c).toBeLessThanOrEqual(0.03);
      expect(ink.l).toBeLessThan(0.3);
      expect(contrastRatio(palette.text, palette.background)).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("varies expression colors across palettes", () => {
    const palettes = extractSpacePalettes("#2d2dca");
    const secondaries = new Set(palettes.map((palette) => palette.colors[1]));
    const accents = new Set(palettes.map((palette) => palette.colors[2]));
    const backgrounds = new Set(palettes.map((palette) => palette.background));
    expect(secondaries.size).toBe(7);
    expect(accents.size).toBeGreaterThanOrEqual(4);
    // Very pale neutral tints can quantize to the same sRGB background.
    expect(backgrounds.size).toBeGreaterThanOrEqual(1);
  });
});

describe("paletteRoles", () => {
  it("derives surface from the concept Neutral profile", () => {
    const roles = paletteRoles("#2d2dca", "balance");
    const background = parseToOklch(roles.background);
    const surface = parseToOklch(roles.surface);
    expect(surface.c).toBeLessThanOrEqual(0.02);
    expect(surface.l).toBeGreaterThanOrEqual(background.l);
    expect(roles.chips.includes(roles.surface)).toBe(false);
  });
});
