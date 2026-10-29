import { describe, expect, it } from "vitest";
import { applyBlockPreset, sectionOf, setImage, validBlock, withBlockDefaults } from "../src/lib/block-schema";
import { BLOCK_KINDS, blockPadding, blockSpecs, specOf } from "../src/lib/blocks";
import { newLayoutNode, validLayoutDocument } from "../src/lib/page-layout";

describe("schema blocks", () => {
  it("lists every block kind once and gives in-flow blocks starting padding", () => {
    expect(blockSpecs.map(s => s.kind).sort()).toEqual([...BLOCK_KINDS].sort());
    for (const spec of blockSpecs) if (spec.place === "flow") expect(blockPadding[spec.kind], spec.kind).toBeDefined();
  });
  it("accepts every default and every preset", () => {
    for (const spec of blockSpecs) {
      expect(validBlock(spec, spec.defaults()), spec.kind).toBe(true);
      for (const preset of spec.presets) expect(validBlock(spec, applyBlockPreset(spec, spec.defaults(), preset)), `${spec.kind}/${preset.key}`).toBe(true);
    }
  });
  it("keeps the user's own copy and lists when a preset reshapes the block", () => {
    const faq = specOf("faq")!;
    const own = { ...faq.defaults(), title: "궁금한 점", items: [{ q: "배송은?", a: "2일" }] };
    const next = applyBlockPreset(faq, own, faq.presets.find(p => p.key === "cards")!);
    expect(next).toMatchObject({ title: "궁금한 점", items: [{ q: "배송은?" }], style: "card" });
    const steps = specOf("steps")!;
    // A preset that names its own copy (the history timeline) still sets it.
    expect(applyBlockPreset(steps, steps.defaults(), steps.presets.find(p => p.key === "years")!).title).toBe("걸어온 길");
  });
  it("rejects unknown options, long copy, non-image data and oversized lists", () => {
    const split = specOf("split")!, popup = specOf("popup")!, form = specOf("form")!;
    expect(validBlock(split, { ...split.defaults(), ratio: "5:1" })).toBe(false);
    expect(validBlock(popup, { ...popup.defaults(), title: "가".repeat(61) })).toBe(false);
    expect(validBlock(popup, { ...popup.defaults(), image: "https://example.com/a.png" })).toBe(false);
    expect(validBlock(form, { ...form.defaults(), fields: Array.from({ length: 13 }, () => form.defaults().fields as never) })).toBe(false);
    expect(validBlock(split, { ...split.defaults(), rows: [{ title: 3 }] })).toBe(false);
  });
  it("fills keys added later from the defaults", () => {
    const tabs = specOf("tabs")!;
    const { radius: _radius, ...old } = tabs.defaults();
    expect(validBlock(tabs, old)).toBe(true);
    expect(withBlockDefaults(tabs, old).radius).toBe(_radius);
  });
  it("stores block settings only on that block's layer", () => {
    const nodes = blockSpecs.map(spec => newLayoutNode(spec.kind as never));
    expect(validLayoutDocument({ version: 1, menu: "overlay", nodes })).toBe(true);
    const wrong = { ...newLayoutNode("faq"), block: { ...specOf("faq")!.defaults(), style: "masonry" } };
    expect(validLayoutDocument({ version: 1, menu: "overlay", nodes: [wrong] })).toBe(false);
    const frame = { ...newLayoutNode("frame"), block: {} };
    expect(validLayoutDocument({ version: 1, menu: "overlay", nodes: [frame] })).toBe(false);
  });
  it("routes clicked parts to their settings section and writes dropped images by path", () => {
    const split = specOf("split")!;
    expect(sectionOf(split, "rows:2")).toBe("rows");
    expect(sectionOf(split, "radius")).toBe("style");
    const png = "data:image/png;base64,iVBORw0KGgo=";
    const next = setImage(split.defaults(), "rows:1:image", png);
    expect((next.rows as { image: string }[])[1].image).toBe(png);
    expect(setImage(specOf("video")!.defaults(), "poster", png).poster).toBe(png);
  });
});
