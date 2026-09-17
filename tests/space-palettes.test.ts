import { describe, expect, it } from "vitest";
import { hueDistance, parseToOklch } from "@/lib/color-engine/color-utils";
import { extractSpacePalettes } from "@/lib/space-palettes";

describe("extractSpacePalettes", () => {
  it("returns named palettes with four chips plus paper and ink", () => {
    const palettes = extractSpacePalettes("#2d2dca");
    expect(palettes.length).toBe(25);

    for (const palette of palettes) {
      expect(palette.colors).toHaveLength(4);
      expect(palette.background).toMatch(/^#[0-9a-f]{6}$/);
      expect(palette.text).toMatch(/^#[0-9a-f]{6}$/);
      const unique = new Set(palette.colors);
      expect(unique.size).toBe(palette.colors.length);
    }

    const generic = palettes.find((p) => p.id === "generic-gradient")!;
    expect(generic.colors[0]).toBe("#2d2dca");
    expect(generic.colors.at(-1)).toMatch(/^#[0-9a-f]{6}$/);

    const spot = palettes.find((p) => p.id === "spot")!;
    expect(spot.colors[0]).toBe("#2d2dca");
    expect(spot.colors[3]).not.toBe(spot.colors[1]);
  });

  it("is deterministic for the same hex", () => {
    const a = extractSpacePalettes("#845ec2");
    const b = extractSpacePalettes("#845ec2");
    expect(a).toEqual(b);
  });

  it("keeps paper and ink off the primary hue", () => {
    const seed = parseToOklch("#3ebf26");
    for (const palette of extractSpacePalettes("#3ebf26")) {
      const paper = parseToOklch(palette.background);
      const ink = parseToOklch(palette.text);
      expect(paper.l).toBeGreaterThan(0.95);
      expect(paper.c).toBeLessThan(0.015);
      expect(ink.l).toBeLessThan(0.25);
      expect(ink.c).toBeLessThan(0.03);
      if (paper.c > 0.004) {
        expect(hueDistance(paper.h, seed.h)).toBeGreaterThan(40);
      }
    }
  });

  it("keeps companion chips from repeating across palettes", () => {
    const palettes = extractSpacePalettes("#2d2dca");
    const counts = new Map<string, number>();
    for (const palette of palettes) {
      for (const color of palette.colors.slice(1)) {
        counts.set(color, (counts.get(color) ?? 0) + 1);
      }
    }
    const reused = [...counts.values()].filter((count) => count > 1);
    expect(reused).toHaveLength(0);
  });
});
