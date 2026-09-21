import { describe, expect, it } from "vitest";
import {
  countDistinctPaletteGroups,
  extractUniqueSpacePalettes,
  mergeSimilarPalettes,
  paletteCompositionKey,
} from "@/lib/palette-groups";
import { extractSpacePalettes } from "@/lib/space-palettes";

describe("palette groups", () => {
  it("keeps named recipes distinct when their generated colors differ", () => {
    const palettes = extractSpacePalettes("#e23b32");
    const threedom = palettes.find((palette) => palette.id === "threedom");
    const highlight = palettes.find((palette) => palette.id === "highlight");
    expect(threedom).toBeDefined();
    expect(highlight).toBeDefined();
    expect(paletteCompositionKey(threedom!)).not.toBe(paletteCompositionKey(highlight!));

    const unique = extractUniqueSpacePalettes("#e23b32");
    expect(unique.length).toBeGreaterThan(8);
    expect(countDistinctPaletteGroups("#e23b32")).toBe(unique.length);
  });

  it("keeps visibly different palettes separate", () => {
    const palettes = extractSpacePalettes("#2d2dca");
    const unique = mergeSimilarPalettes(palettes);
    expect(unique.length).toBeGreaterThan(8);
    expect(unique.length).toBeLessThan(palettes.length);
  });
});
