import { describe, expect, it } from "vitest";
import {
  DEFAULT_INPUT,
  contrastRatio,
  generateColorSystem,
  filledScaleStates,
  readableOnColor,
  resolveSurfaceInk,
} from "@/lib/color-engine";

describe("contrast", () => {
  it("knows the black-on-white boundary", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBe(21);
  });

  it("prefers light text on vivid mid-light primaries", () => {
    const pair = resolveSurfaceInk("#f15c5c", 4.5);
    expect(pair.on).toBe("#ffffff");
    expect(contrastRatio(pair.on, pair.background)).toBeGreaterThanOrEqual(4.5);
  });

  it("maps coral primary buttons to white ink in the color system", () => {
    const result = generateColorSystem({ ...DEFAULT_INPUT, hex: "#f15c5c" });
    expect(result.semantic.light.primary.default).toBe("#f15c5c");
    expect(
      contrastRatio(
        result.semantic.light.primary.onPrimary,
        result.semantic.light.primary.default,
      ),
    ).toBeGreaterThanOrEqual(4.5);
  });

  it("uses directional primary hover from on-primary ink", () => {
    const result = generateColorSystem({ ...DEFAULT_INPUT, hex: "#f15c5c" });
    const scale = result.primitive.primary;
    const states = filledScaleStates(scale, result.primitive.neutral, 500);
    expect(result.semantic.light.primary.default).toBe(scale[500]);
    expect(result.semantic.light.primary.hover).toBe(states.hover);
    expect(result.semantic.light.primary.pressed).toBe(states.pressed);
    expect(result.semantic.light.primary.onPrimary).toBe(states.on);
  });

  it("uses lighter hover steps when on-primary is dark", () => {
    const result = generateColorSystem({ ...DEFAULT_INPUT, hex: "#ffeb3b" });
    const { primary: scale, neutral } = result.primitive;
    const states = filledScaleStates(scale, neutral, 500);
    expect(states.on).toBe(neutral[1000]);
    expect(states.hover).toBe(scale[400]);
    expect(states.pressed).toBe(scale[300]);
  });

  it("keeps dark text on near-white primaries", () => {
    const on = readableOnColor("#f7f7f7", 4.5);
    expect(on === "#111111" || on === "#161619").toBe(true);
  });

  it("auto-fixes contrast pairs for a vivid orange", () => {
    const result = generateColorSystem(DEFAULT_INPUT);
    expect(result.accessibility.light.failCount).toBe(0);
    expect(result.accessibility.dark.failCount).toBe(0);
    expect(
      contrastRatio(
        result.semantic.light.primary.onPrimary,
        result.semantic.light.primary.default,
      ),
    ).toBeGreaterThanOrEqual(4.5);
  });

  it("handles near-white and near-black primaries", () => {
    const pale = generateColorSystem({ ...DEFAULT_INPUT, hex: "#f7f7f7" });
    const ink = generateColorSystem({ ...DEFAULT_INPUT, hex: "#111111" });
    expect(pale.accessibility.light.failCount).toBe(0);
    expect(ink.accessibility.light.failCount).toBe(0);
    expect(pale.meta.sourceHex).toBe("#f7f7f7");
    expect(ink.meta.sourceHex).toBe("#111111");
    expect(pale.semantic.light.primary.default).toBe("#f7f7f7");
    expect(
      contrastRatio(
        pale.semantic.light.primary.onPrimary,
        pale.semantic.light.primary.default,
      ),
    ).toBeGreaterThanOrEqual(4.5);
  });

  it("does not invert dark from light", () => {
    const result = generateColorSystem(DEFAULT_INPUT);
    expect(result.semantic.dark.surface.raised).not.toBe(
      result.semantic.light.surface.raised,
    );
    expect(result.semantic.dark.background.canvas).not.toBe(
      result.semantic.light.background.canvas,
    );
  });
});
