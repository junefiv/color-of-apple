import { describe, expect, it } from "vitest";
import { DEFAULT_INPUT, generateColorSystem } from "@/lib/color-engine";
import { applyTokenSnapshot, createTokenSnapshot, diffTokenSnapshots } from "@/lib/project-tokens";

describe("saved project token snapshots", () => {
  it("keeps saved token hex values when a generated result changes", () => {
    const original = generateColorSystem({ ...DEFAULT_INPUT, hex: "#E5484D" });
    const snapshot = createTokenSnapshot(original, { "primary.default": "#123456" });
    const regenerated = generateColorSystem({ ...DEFAULT_INPUT, hex: "#2277EE" });
    const restored = applyTokenSnapshot(regenerated, snapshot);

    expect(restored.semantic.light.primary.default).toBe("#123456");
    expect(createTokenSnapshot(restored)).toEqual(snapshot);
  });

  it("records only tokens that changed in a committed edit", () => {
    const before = { "primary.default": "#111111", "text.primary": "#222222" };
    const after = { ...before, "primary.default": "#333333" };
    const history = diffTokenSnapshots(before, after, "2026-09-30T00:00:00.000Z");

    expect(history).toEqual([{
      token: "primary.default",
      before: "#111111",
      after: "#333333",
      changedAt: "2026-09-30T00:00:00.000Z",
    }]);
  });
});
