import { describe, expect, it } from "vitest";
import { countDistinctPaletteGroups, extractUniqueSpacePalettes } from "@/lib/palette-groups";
import { PALETTE_CONCEPTS } from "@/lib/palette";

describe("palette groups", () => {
  it("shows every remaining concept in one list", () => {
    const unique = extractUniqueSpacePalettes("#e23b32");
    expect(unique).toHaveLength(22);
    expect(countDistinctPaletteGroups("#e23b32")).toBe(22);
    expect(PALETTE_CONCEPTS.map((concept) => concept.id)).not.toContain("muted-calm");
    expect(PALETTE_CONCEPTS.map((concept) => concept.id)).not.toContain("earthy");
  });
});
