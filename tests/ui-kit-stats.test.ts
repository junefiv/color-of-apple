import { describe, expect, it } from "vitest";
import { statsFromDocs } from "@/lib/ui-kit/stats";

describe("ui kit stats", () => {
  it("keeps known components and ignores stray documents", () => {
    const stats = statsFromDocs([
      { id: "fold-button", viewCount: 4.9, copyCount: 2 },
      { id: "missing", viewCount: 9, copyCount: 9 },
      { id: "fold-button-copy", viewCount: "3", copyCount: -1 },
    ]);
    expect(stats["fold-button"]).toEqual({ viewCount: 4, copyCount: 2 });
    expect(stats).not.toHaveProperty("missing");
  });
});
