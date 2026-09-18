import { describe, expect, it } from "vitest";
import { contrastRatio, parseToOklch } from "@/lib/color-engine/color-utils";
import { extractSpacePalettes, paletteRoles } from "@/lib/space-palettes";

describe("extractSpacePalettes", () => {
  it("returns named palettes with four chips plus paper and ink", () => {
    const palettes = extractSpacePalettes("#2d2dca");
    expect(palettes.length).toBe(25);

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
      const surface = parseToOklch(palette.colors[3]);
      expect(paper.l).toBeGreaterThan(0.95);
      expect(paper.c).toBeLessThanOrEqual(0.02);
      expect(surface.l).toBeLessThan(paper.l);
      expect(surface.c).toBeLessThanOrEqual(0.025);
      expect(ink.l).toBeLessThan(0.28);
      expect(ink.c).toBeLessThanOrEqual(0.03);
      expect(contrastRatio(palette.text, palette.background)).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("varies expression colors across palettes", () => {
    const palettes = extractSpacePalettes("#2d2dca");
    const secondaries = new Set(palettes.map((palette) => palette.colors[1]));
    const accents = new Set(palettes.map((palette) => palette.colors[2]));
    expect(secondaries.size).toBeGreaterThan(8);
    expect(accents.size).toBeGreaterThan(8);
  });
});

describe("paletteRoles", () => {
  it("derives surface from background instead of a chip", () => {
    const roles = paletteRoles("#2d2dca", "generic-gradient");
    const background = parseToOklch(roles.background);
    const surface = parseToOklch(roles.surface);
    expect(surface.c).toBeLessThanOrEqual(0.025);
    expect(surface.l).toBeLessThan(background.l);
    expect(roles.chips.includes(roles.surface)).toBe(false);
  });
});
