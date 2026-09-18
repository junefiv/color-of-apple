import { describe, expect, it } from "vitest";
import { DEFAULT_INPUT, generateColorSystem } from "@/lib/color-engine";

describe("gamut and moods", () => {
  it("stays in hex for a high-chroma input", () => {
    const result = generateColorSystem({ ...DEFAULT_INPUT, hex: "#00ffaa", mood: "vivid" });
    for (const hex of Object.values(result.primitive.primary)) {
      expect(hex).toMatch(/^#[0-9a-f]{6}$/);
    }
  });

  it("changes chroma across moods", () => {
    const balanced = generateColorSystem({ ...DEFAULT_INPUT, mood: "balanced" });
    const vivid = generateColorSystem({ ...DEFAULT_INPUT, mood: "vivid" });
    const calm = generateColorSystem({ ...DEFAULT_INPUT, mood: "calm" });
    expect(vivid.semantic.light.primary.subtle).not.toBe(
      calm.semantic.light.primary.subtle,
    );
    expect(balanced.meta.coreTokenCount).toBe(33);
  });
});
