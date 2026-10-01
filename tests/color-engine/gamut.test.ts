import { describe, expect, it } from "vitest";
import { DEFAULT_INPUT, generateColorSystem } from "@/lib/color-engine";

describe("gamut and moods", () => {
  it("stays in hex for a high-chroma input", () => {
    const result = generateColorSystem({ ...DEFAULT_INPUT, hex: "#00ffaa", mood: "vivid" });
    for (const hex of Object.values(result.primitive.primary)) {
      expect(hex).toMatch(/^#[0-9a-f]{6}$/);
    }
  });

  it("changes supporting colors across concepts, not moods", () => {
    const balanced = generateColorSystem({ ...DEFAULT_INPUT, hex: "#ff6b35" }, "balance");
    const vivid = generateColorSystem({ ...DEFAULT_INPUT, hex: "#ff6b35" }, "vivid-pop");
    const clean = generateColorSystem({ ...DEFAULT_INPUT, hex: "#ff6b35" }, "clean");
    expect(vivid.semantic.light.primary.subtle).not.toBe(clean.semantic.light.primary.subtle);
    expect(vivid.semantic.light.secondary.default).not.toBe(
      balanced.semantic.light.secondary.default,
    );
    expect(balanced.meta.coreTokenCount).toBeGreaterThan(44);
  });
});
