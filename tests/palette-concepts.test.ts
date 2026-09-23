import { describe, expect, it } from "vitest";
import { contrastRatio, hueDistance, parseToOklch } from "@/lib/color-engine/color-utils";
import {
  DEFAULT_PALETTE_ID,
  PALETTE_CONCEPTS,
  generatePalette,
  generatePaletteTokens,
  resolvePaletteId,
} from "@/lib/palette";

const HEX = "#f15c5c";

describe("palette concepts", () => {
  it("defines 22 concepts with Balance as the default", () => {
    expect(PALETTE_CONCEPTS).toHaveLength(22);
    expect(DEFAULT_PALETTE_ID).toBe("balance");
    expect(resolvePaletteId("generic-gradient")).toBe("balance");
    expect(resolvePaletteId("pin")).toBe("editorial");
  });

  it("keeps Primary unchanged and produces readable on-colors", () => {
    for (const concept of PALETTE_CONCEPTS) {
      const { tokens } = generatePalette(HEX, concept.id);
      expect(tokens.core.primary).toBe("#f15c5c");
      expect(tokens.core.onPrimary).toMatch(/^#[0-9a-f]{6}$/);
      expect(contrastRatio(tokens.text.primary, tokens.backgroundAndSurface.background)).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(tokens.interaction.focusRing, tokens.backgroundAndSurface.background)).toBeGreaterThanOrEqual(3);
    }
  });

  it("changes Secondary, Accent, and surfaces across concepts for the same Primary", () => {
    const balance = generatePaletteTokens(HEX, "balance");
    const natural = generatePaletteTokens(HEX, "natural");
    const vivid = generatePaletteTokens(HEX, "vivid-pop");
    const clean = generatePaletteTokens(HEX, "clean");

    expect(balance.core.secondary).not.toBe(natural.core.secondary);
    expect(balance.core.accent).not.toBe(vivid.core.accent);
    expect(balance.backgroundAndSurface.background).not.toBe(clean.backgroundAndSurface.background);
    expect(balance.text.primary).not.toBe(vivid.text.primary);
  });

  it("moves Natural secondary toward green instead of replacing Primary", () => {
    const primary = parseToOklch(HEX);
    const secondary = parseToOklch(generatePaletteTokens(HEX, "natural").core.secondary);
    expect(hueDistance(secondary.h, 145)).toBeLessThan(hueDistance(primary.h, 145));
  });

  it("is deterministic and never random", () => {
    const first = generatePalette(HEX, "playful");
    const second = generatePalette(HEX, "playful");
    expect(first).toEqual(second);
  });

  it("keeps light surfaces within off-whites even for saturated brand colors", () => {
    for (const hex of ["#ff0000", "#00ff00", "#0000ff", "#ffff00", "#7c3aed", "#000000", "#ffffff"]) {
      for (const concept of PALETTE_CONCEPTS) {
        const { core, backgroundAndSurface } = generatePaletteTokens(hex, concept.id);
        for (const value of [core.surface, ...Object.values(backgroundAndSurface)]) {
          const color = parseToOklch(value);
          expect(color.l).toBeGreaterThanOrEqual(0.955);
          expect(color.c).toBeLessThanOrEqual(0.006);
        }
      }
    }
  });
});
