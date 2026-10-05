import { describe, expect, it } from "vitest";
import { undoToken } from "@/lib/token-undo";

describe("per-token undo", () => {
  it("walks one token backward without changing other tokens or their history", () => {
    const history: Array<Record<string, string>> = [{}, { primary: "red" }, { primary: "red", accent: "blue" }];
    const first = undoToken("primary", { primary: "pink", accent: "blue" }, history)!;
    expect(first.overrides).toEqual({ primary: "red", accent: "blue" });
    const second = undoToken("primary", first.overrides, first.history)!;
    expect(second.overrides).toEqual({ accent: "blue" });
    expect(undoToken("primary", second.overrides, second.history)).toBeNull();
    expect(undoToken("accent", second.overrides, second.history)!.overrides).toEqual({});
  });

  it("does nothing when the selected token has no edits", () => {
    expect(undoToken("surface", { primary: "red" }, [{}])).toBeNull();
  });
});
