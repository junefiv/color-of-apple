import { describe, expect, it } from "vitest";
import { DEFAULT_INPUT, generateColorSystem } from "@/lib/color-engine";
import { contrastRatio, derivePaletteTokens, paletteTokensToCssVariables } from "@/lib/palette-semantic-tokens";
import { generatePaletteTokens } from "@/lib/palette";

describe("derivePaletteTokens", () => {
  it("orders border strength from subtle to strong", () => {
    const tokens = derivePaletteTokens("#f15c5c", "balance");
    expect(contrastRatio(tokens.text.primary, tokens.border.subtle)).toBeGreaterThan(
      contrastRatio(tokens.text.primary, tokens.border.strong),
    );
  });

  it("picks readable on-colors for filled surfaces", () => {
    const tokens = derivePaletteTokens("#f15c5c", "balance");
    expect(tokens.core.onPrimary).toMatch(/^#[0-9a-f]{6}$/);
    expect(contrastRatio(tokens.text.primary, tokens.backgroundAndSurface.background)).toBeGreaterThanOrEqual(4.5);
  });

  it("is applied when a palette is selected in the color system", () => {
    const result = generateColorSystem({ ...DEFAULT_INPUT, hex: "#f15c5c" }, "balance");
    const vars = paletteTokensToCssVariables(result.derived.light);
    expect(vars["--color-primary-subtle"]).toMatch(/^#[0-9A-Fa-f]{6}$/);
    expect(vars["--color-interaction-hover"]).toMatch(/^#[0-9A-Fa-f]{6}$/);
    expect(result.derived.light.core.primary).toBe("#f15c5c");
  });

  it("changes derived tokens when the concept changes but primary stays the same", () => {
    const hex = "#f15c5c";
    const balance = generatePaletteTokens(hex, "balance");
    const natural = generatePaletteTokens(hex, "natural");
    const editorial = generatePaletteTokens(hex, "editorial");

    expect(balance.core.primary).toBe(natural.core.primary);
    expect(balance.interaction.neutralHover).not.toBe(natural.interaction.neutralHover);
    expect(balance.status.success).not.toBe(natural.status.success);
    expect(balance.core.primarySubtle).not.toBe(editorial.core.primarySubtle);
    expect(balance.border.default).not.toBe(natural.border.default);
    expect(balance.backgroundAndSurface.subtleBackground).not.toBe(
      natural.backgroundAndSurface.subtleBackground,
    );
  });
});
