import { describe, expect, it } from "vitest";
import { applyLayoutPreset, baseLayout, isPageOnly, layoutFlow, migrateLayoutDocument, moveLayoutNode, newLayoutNode, pageOf, parentOf, resolveLayout, validLayoutDocument, type LayoutNode } from "../src/lib/page-layout";
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
  it("accepts page width modes and bleed flags, and defaults older documents to full width", () => {
    const doc = { version: 1 as const, menu: "overlay" as const, nodes: [{ ...node("a"), bleed: true }] };
    expect(validLayoutDocument(doc)).toBe(true);
    expect(pageOf(doc).mode).toBe("full");
    expect(validLayoutDocument({ ...doc, page: { mode: "column", maxWidth: 480, backdrop: "subtle", aside: true } })).toBe(true);
    expect(validLayoutDocument({ ...doc, page: { mode: "column", maxWidth: 200, backdrop: "subtle", aside: true } })).toBe(false);
    expect(validLayoutDocument({ ...doc, page: { mode: "boxed", maxWidth: 1200, backdrop: "subtle", aside: false } })).toBe(false);
    expect(validLayoutDocument({ ...doc, nodes: [{ ...node("a"), bleed: "yes" }] })).toBe(false);
  });
  it("keeps a desktop swipe row as a row on mobile and lets mobile opt into swipe alone", () => {
    const strip = node("s"); strip.desktop.swipe = true;
    expect(resolveLayout(strip, true).direction).toBe("row");
    const plain = node("p"); plain.mobile.swipe = true;
    expect(resolveLayout(plain, false).swipe).toBeUndefined();
    expect(layoutFlow(resolveLayout(plain, true), 667)).toMatchObject({ display: "flex", flexDirection: "row", overflowX: "auto" });
  });
  it("maps screen height and reverse order onto the flow styles", () => {
    expect(layoutFlow({ ...baseLayout, screen: true, height: 200 }, 1024).minHeight).toBe(1024);
    expect(layoutFlow({ ...baseLayout, direction: "row", reverse: true }, 1024).flexDirection).toBe("row-reverse");
  });
  it("accepts layouts saved without the newer flags and rejects malformed ones", () => {
    expect(validLayoutDocument({ version: 1, menu: "overlay", nodes: [node("a")] })).toBe(true);
    expect(validLayoutDocument({ version: 1, menu: "overlay", nodes: [{ ...node("a"), mobile: { swipe: "yes" } }] })).toBe(false);
  });
  it("builds layouts as rows or grids of empty cells", () => {
    const two = applyLayoutPreset(newLayoutNode("section"), "two");
    expect(two.desktop.direction).toBe("row");
    expect(two.children.map(c => c.kind)).toEqual(["frame", "frame"]);
    const grid = applyLayoutPreset(newLayoutNode("section"), "grid");
    expect([grid.desktop.direction, grid.desktop.columns, grid.children.length]).toEqual(["grid", 2, 4]);
    expect(applyLayoutPreset(newLayoutNode("section"), "band").children).toEqual([]);
    expect(validLayoutDocument({ version: 1, menu: "overlay", nodes: [two, grid] })).toBe(true);
  });
  it("lets content components into cells but keeps page-level layers out", () => {
    const layout = applyLayoutPreset(newLayoutNode("section"), "two"), cell = layout.children[0].id;
    const cards = newLayoutNode("cards"), header = newLayoutNode("header"), inner = newLayoutNode("section");
    const into = moveLayoutNode([layout, cards], cards.id, cell);
    expect(parentOf(into, cards.id)).toBe(cell);
    expect(parentOf(moveLayoutNode([layout, header], header.id, cell), header.id)).toBeNull();
    expect(parentOf(moveLayoutNode([layout, inner], inner.id, cell), inner.id)).toBeNull();
    // Nothing goes inside a component.
    expect(parentOf(moveLayoutNode([cards, header], header.id, cards.id), header.id)).toBeNull();
    expect([isPageOnly("footer"), isPageOnly("floating"), isPageOnly("hero"), isPageOnly("frame")]).toEqual([true, true, false, false]);
  });
  it("renames layers that still carry the old section and frame names", () => {
    const old = { ...newLayoutNode("section"), name: "섹션", children: [{ ...newLayoutNode("frame"), name: "빈 프레임" }] };
    const kept = { ...newLayoutNode("section"), name: "메인 비주얼" };
    const [renamed, untouched] = migrateLayoutDocument({ version: 1, menu: "overlay", nodes: [old, kept] }).nodes;
    expect([renamed.name, renamed.children[0].name, untouched.name]).toEqual(["레이아웃", "칸", "메인 비주얼"]);
  });
});
