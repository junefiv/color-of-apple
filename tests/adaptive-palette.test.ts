import { describe, expect, it } from "vitest";
import { converter } from "culori";
import { PALETTE_CONCEPTS, generatePalette, resolvePaletteId } from "@/lib/palette";
import { accentHeadroom, accentTargets, analyzePrimary, circularMeanHue, colorAt, evaluatePalettePair, fitCandidate, generateAccentCandidates, generateBrandPalette, inSrgb, occupiedHueCluster, primitiveScale, SCALE_STEPS, STATUS_HUES } from "@/lib/palette/adaptive";
import { contrastRatio, hueDistance, parseToOklch } from "@/lib/color-engine/color-utils";
import { DEFAULT_INPUT, generateColorSystem, previewComponentVars } from "@/lib/color-engine";
import { exportCss } from "@/lib/export/css";

const INPUTS = ["#015cfc", "#fd4d0b", "#ff0000", "#00ff00", "#ffff00", "#d43cc1", "#000000", "#ffffff", "#888888", "#f5e8dc", "#102030"];
describe("adaptive UI color system", () => {
  it("handles the circular hue seam and fades gray hue influence to zero", () => {
    expect(hueDistance(circularMeanHue(350, 10), 0)).toBeLessThan(3);
    const p = colorAt(0.6, 0.18, 350), gray = colorAt(0.8, 0, 120);
    expect(occupiedHueCluster(p, gray)).toBeCloseTo(p.h, 8);
    expect(occupiedHueCluster(p, { ...gray, h: 280 })).toBeCloseTo(p.h, 8);
    expect(accentHeadroom(p, gray)).toBeGreaterThan(accentHeadroom(p, { ...gray, c: 0.18 }));
  });
  it("covers the whole hue wheel and evaluates every retained S/A combination", () => {
    const p = parseToOklch("#015cfc"), brand = generateBrandPalette(p, "near-harmony");
    expect(new Set(brand.accentCandidates.map(a => a.requestedHue)).size).toBe(60);
    const top = [...brand.secondaryCandidates].sort((a, b) => b.preScore! - a.preScore!).slice(0, 8);
    let maximum = -Infinity;
    for (const s of top) for (const a of generateAccentCandidates(p, s.color, "near-harmony")) maximum = Math.max(maximum, evaluatePalettePair(p, s, a, "near-harmony").score);
    expect(brand.selectedPair.score).toBeCloseTo(maximum, 12);
  });
  it("can choose a different secondary after considering its accent", () => {
    let jointChoiceChanged = false;
    for (const h of [0, 60, 120, 180, 240, 300]) {
      const brand = generateBrandPalette(colorAt(0.62, 0.15, h), "near-harmony");
      const initial = [...brand.secondaryCandidates].sort((a, b) => b.preScore! - a.preScore!)[0];
      jointChoiceChanged ||= initial.hex !== brand.secondary.hex;
    }
    expect(jointChoiceChanged).toBe(true);
  });
  it("uses the remaining triadic axis, and gives soft/neutralized different chroma roles", () => {
    const p = colorAt(0.62, 0.15, 260);
    const pick = (s: number) => generateAccentCandidates(p, colorAt(0.76, 0.05, s), "triadic").sort((a, b) => b.score - a.score)[0].color.h;
    expect(hueDistance(pick(20), 140)).toBeLessThan(20);
    expect(hueDistance(pick(140), 20)).toBeLessThan(20);
    const s = colorAt(0.76, 0.05, 220);
    expect(accentTargets(p, s, "soft-harmony").c).toBeLessThan(accentTargets(p, s, "near-harmony").c);
    expect(accentTargets(p, s, "neutralized").c).toBeGreaterThan(accentTargets(p, s, "near-harmony").c);
  });
  it("rejects inherited names when resolving saved strategy IDs", () => {
    for (const id of ["constructor", "__proto__", "toString"]) expect(resolvePaletteId(id)).toBe("soft-harmony");
  });
  it("classifies lightness, chroma, hue zones and normalized strength", () => {
    expect(analyzePrimary(colorAt(0.3, 0.04, 25))).toMatchObject({ brightness: "Dark", saturation: "Muted", hueZone: "Red", temperature: "Warm" });
    expect(analyzePrimary(colorAt(0.8, 0.12, 90))).toMatchObject({ brightness: "Light", saturation: "Normal", hueZone: "Yellow" });
    const vivid = analyzePrimary(colorAt(0.62, 0.24, 265));
    expect(vivid.saturation).toBe("Vivid"); expect(vivid.strength).toBeGreaterThan(0.8);
    expect(vivid.hueFactor).toBeGreaterThan(analyzePrimary(colorAt(0.62, 0.24, 90)).hueFactor);
  });
  it("fits high chroma to sRGB without moving lightness or hue", () => {
    const seed = colorAt(0.7, 0.4, 260), fitted = fitCandidate(seed);
    expect(inSrgb(fitted)).toBe(true); expect(fitted.c).toBeLessThan(seed.c);
    expect(fitted.l).toBe(seed.l); expect(fitted.h).toBe(seed.h);
  });
  it("pins every source at its natural step and keeps primitive lightness monotonic", () => {
    for (const hex of INPUTS) {
      const { scale, anchorStep } = primitiveScale(hex);
      expect(scale[anchorStep]).toBe(hex);
      const l = SCALE_STEPS.map(step => parseToOklch(scale[step]).l);
      for (let i = 1; i < l.length; i++) expect(l[i]).toBeLessThanOrEqual(l[i - 1] + 0.003);
    }
    expect(primitiveScale("#ffffff").anchorStep).toBe(50);
    expect(primitiveScale("#000000").anchorStep).toBe(950);
  });
  it("evaluates 30 secondary candidates and 4320 pairs, with adaptive secondary chroma", () => {
    const vivid = generatePalette("#015cfc", "near-harmony").tokens.system;
    const muted = generatePalette("#8090a0", "near-harmony").tokens.system;
    for (const system of [vivid, muted]) {
      expect(system.diagnostics.secondary).toHaveLength(30);
      expect(system.diagnostics.accent).toHaveLength(540);
      expect(system.diagnostics.pairs).toHaveLength(8);
      expect(system.diagnostics.evaluatedPairCount).toBe(4320);
      const ranked = [...system.diagnostics.pairs].sort((a, b) => b.score - a.score);
      expect(system.actions.secondary.default).toBe(ranked[0].secondary);
      expect(system.actions.accent.default).toBe(ranked[0].accent);
      expect(system.diagnostics.selectedPair).toEqual(ranked[0]);
    }
    const ratio = (system: typeof vivid) => parseToOklch(system.actions.secondary.default).c / system.analysis.color.c;
    expect(ratio(vivid)).toBeLessThan(ratio(muted));
  });
  it("changes the split accent side when secondary moves to the opposite side", () => {
    const p = colorAt(0.62, 0.1, 260);
    const pick = (h: number) => generateAccentCandidates(p, colorAt(0.75, 0.05, h), "split-contrast").sort((a, b) => b.score - a.score)[0].color;
    expect(pick(220).h).not.toBe(pick(300).h);
    for (const h of [220, 300]) expect(hueDistance(pick(h).h, h)).toBeGreaterThan(140);
  });
  it("keeps tokens in gamut and validates rendered pairs in both modes", () => {
    const rgb = converter("rgb");
    for (const hex of INPUTS) for (const concept of PALETTE_CONCEPTS) for (const mode of ["light", "dark"] as const) {
      const palette = generatePalette(hex, concept.id, mode), t = palette.tokens, sys = t.system;
      expect(t.core.primary).toBe(hex); expect(palette.accessible).toBe(true);
      for (const scale of Object.values(sys.primitives)) for (const value of Object.values(scale)) {
        const c = rgb(value)!; expect([c.r, c.g, c.b].every(v => v !== undefined && v >= 0 && v <= 1)).toBe(true);
      }
      for (const action of [...Object.values(sys.actions), ...Object.values(sys.statuses)]) {
        expect(contrastRatio(action.on, action.default)).toBeGreaterThanOrEqual(4.5);
        expect(contrastRatio(action.onHover, action.hover)).toBeGreaterThanOrEqual(4.5);
        expect(contrastRatio(action.onPressed, action.pressed)).toBeGreaterThanOrEqual(4.5);
        expect(contrastRatio(action.selectedText, action.selected)).toBeGreaterThanOrEqual(4.5);
        expect(contrastRatio(action.focus, t.core.surface)).toBeGreaterThanOrEqual(3);
        expect(parseToOklch(action.disabled).c).toBeLessThan(0.006);
      }
      for (const role of ["success", "warning", "danger", "info"] as const) {
        const status = sys.statuses[role], hue = parseToOklch(status.default).h;
        expect(Math.min(...STATUS_HUES[role].map(h => hueDistance(h, hue)))).toBeLessThan(2);
        expect(contrastRatio(status.text, status.surface)).toBeGreaterThanOrEqual(4.5);
        expect(contrastRatio(status.text, status.surfaceStrong)).toBeGreaterThanOrEqual(4.5);
      }
    }
  }, 30000);
  it("brightens already dark actions and darkens normal actions", () => {
    for (const hex of ["#102030", "#015cfc"]) {
      const t = generatePalette(hex).tokens.system.actions.primary;
      const l = [t.default, t.hover, t.pressed].map(v => parseToOklch(v).l);
      if (l[0] < 0.35) expect(l[2]).toBeGreaterThan(l[1]); else expect(l[2]).toBeLessThan(l[1]);
    }
  });
  it("uses generated states in component previews and exports", () => {
    const result = generateColorSystem({ ...DEFAULT_INPUT, hex: "#f5e8dc" }, "soft-harmony");
    const vars = previewComponentVars(result.primitive, result.semantic.light);
    expect(vars["--btn-primary-bg-default"]).toBe("#f5e8dc");
    expect(vars["--btn-primary-bg-hover"]).toBe(result.derived.light.system.actions.primary.hover);
    const css = exportCss(result);
    expect(css).toContain("--action-primary-on-hover:");
    expect(css).toContain("--color-success-surface-strong:");
    expect(css).toContain("--color-selected-background:");
  });
});
