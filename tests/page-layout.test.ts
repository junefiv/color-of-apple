import { describe, expect, it } from "vitest";
import { baseLayout, moveLayoutNode, resolveLayout, validLayoutDocument, type LayoutNode } from "../src/lib/page-layout";
const node = (id: string, children: LayoutNode[] = []): LayoutNode => ({ id, name: id, kind: "frame", desktop: { ...baseLayout, direction: "row" }, mobile: {}, children });
describe("page layout", () => {
  it("inherits desktop spacing while stacking mobile children", () => {
    const n = node("a"); n.desktop.gap = 40; n.mobile.padding = [16, 12, 16, 12];
    expect(resolveLayout(n, true)).toMatchObject({ direction: "column", gap: 40, padding: [16, 12, 16, 12] });
    expect(resolveLayout(n, false).padding).toEqual([32, 32, 32, 32]);
  });
  it("moves a child between sections without duplication", () => {
    const moved = moveLayoutNode([node("a", [node("x")]), node("b", [node("y")])], "x", "b", "y");
    expect(moved[0].children).toHaveLength(0);
    expect(moved[1].children.map(n => n.id)).toEqual(["x", "y"]);
  });
  it("rejects dropping a frame into itself or descendants", () => {
    const tree = [node("a", [node("b")])];
    expect(moveLayoutNode(tree, "a", "b")).toBe(tree);
    expect(moveLayoutNode(tree, "a", "a")).toBe(tree);
  });
  it("reorders siblings after removing the source", () => {
    expect(moveLayoutNode([node("a"), node("b"), node("c")], "a", null, "c").map(n => n.id)).toEqual(["b", "a", "c"]);
  });
  it("validates stored layouts and rejects malformed overrides and duplicate ids", () => {
    expect(validLayoutDocument({ version: 1, menu: "overlay", nodes: [node("a")] })).toBe(true);
    expect(validLayoutDocument({ version: 1, menu: "overlay", nodes: [node("a"), node("a")] })).toBe(false);
    expect(validLayoutDocument({ version: 1, menu: "overlay", nodes: [{ ...node("a"), mobile: { gap: -10 } }] })).toBe(false);
  });
});
