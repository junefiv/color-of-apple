import { describe, expect, it } from "vitest";
import { contrastRatio, hueDistance, oklchPerceptualDistance, parseToOklch } from "@/lib/color-engine/color-utils";
import { generatePalette, paletteTokensToCssVariables, secondaryRoleCssVariables } from "@/lib/palette";

describe("categorical palette", () => {
  it("generates muted bg/fg pairs with primary as the first icon color", () => {
    const primary = "#518CC1";
    const { tokens } = generatePalette(primary, "near-harmony");
    const categorical = tokens.system.categorical;
    expect(categorical).toHaveLength(8);
    expect(categorical[0].foreground.toLowerCase()).toBe(primary.toLowerCase());
    for (const swatch of categorical) {
      expect(contrastRatio(swatch.foreground, swatch.background)).toBeGreaterThanOrEqual(3);
      expect(parseToOklch(swatch.background).c).toBeLessThan(0.06);
    }
  });

  it("keeps category hues distinguishable from one another", () => {
    const { tokens } = generatePalette("#518CC1", "near-harmony");
    const colors = tokens.system.categorical.slice(0, 4).map(s => parseToOklch(s.foreground));
    for (let i = 0; i < colors.length; i++) {
      for (let j = i + 1; j < colors.length; j++) {
        expect(oklchPerceptualDistance(colors[i], colors[j])).toBeGreaterThan(0.12);
        expect(hueDistance(colors[i].h, colors[j].h)).toBeGreaterThan(25);
      }
    }
  });

  it("exposes secondary semantic role CSS variables separate from categorical", () => {
    const { tokens } = generatePalette("#518CC1");
    const secondary = secondaryRoleCssVariables(tokens);
    const cat = tokens.system.categorical[1].foreground;
    expect(secondary["--color-secondary-default"]).toBe(tokens.core.secondary);
    expect(secondary["--color-secondary-subtle"]).toBe(tokens.system.actions.secondary.selected);
    expect(cat).not.toBe(secondary["--color-secondary-default"]);
  });

  it("exposes role-based data viz and categorical CSS variables", () => {
    const { tokens } = generatePalette("#518CC1");
    const vars = paletteTokensToCssVariables(tokens);
    expect(vars["--color-categorical-0-bg"]).toBe(tokens.system.categorical[0].background);
    expect(vars["--color-data-category-1"]).toBe(tokens.system.categorical[0].foreground);
    expect(vars["--color-data-category-4"]).toBe(tokens.system.categorical[3].foreground);
    expect(vars["--color-data-primary"]).toBe(tokens.core.primary);
    expect(vars["--color-data-secondary"]).toBe(tokens.core.secondary);
    expect(vars["--color-chart-primary"]).toBe(tokens.core.primary);
    expect(vars["--color-progress-default"]).toBe(tokens.core.primary);
    expect(vars["--color-progress-track"]).toBe(tokens.system.primitives.neutral[100]);
    expect(vars["--color-data-sequential-5"]).toBe(tokens.system.primitives.primary[500]);
    expect(vars["--color-chart-1"]).toBeUndefined();
  });
});
