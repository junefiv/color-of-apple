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
  it("defines seven adaptive strategies and migrates legacy IDs", () => {
    expect(PALETTE_CONCEPTS).toHaveLength(7);
    expect(DEFAULT_PALETTE_ID).toBe("soft-harmony");
    expect(resolvePaletteId("generic-gradient")).toBe("near-harmony");
    expect(resolvePaletteId("pin")).toBe("neutralized");
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
    // Pale neutrals may quantize to the same HEX; their character stays distinct.
    expect(balance.system.character).not.toEqual(clean.system.character);
    expect(balance.system.character).not.toEqual(vivid.system.character);
  });

  it("keeps Tonal secondary in the primary hue family", () => {
    const primary = parseToOklch(HEX);
    const secondary = parseToOklch(generatePaletteTokens(HEX, "tonal").core.secondary);
    expect(hueDistance(secondary.h, primary.h)).toBeLessThanOrEqual(9);
    expect(Math.abs(primary.l - secondary.l)).toBeGreaterThanOrEqual(0.145);
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
          expect(color.l).toBeGreaterThanOrEqual(0.945);
          expect(color.c).toBeLessThanOrEqual(0.025);
        }
      }
    }
  });
});
