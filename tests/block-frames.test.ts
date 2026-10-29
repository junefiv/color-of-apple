import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { applyBlockPreset } from "../src/lib/block-schema";
import { blockSpecs } from "../src/lib/blocks";
import { BlockFrame } from "../src/components/builder/block-frames";

describe("block frames", () => {
  it("renders every block, preset and device without throwing and prints its copy", () => {
    for (const spec of blockSpecs) for (const config of [spec.defaults(), ...spec.presets.map(p => applyBlockPreset(spec, spec.defaults(), p))]) for (const mobile of [false, true]) {
      const html = renderToStaticMarkup(createElement(BlockFrame, { kind: spec.kind, config, mobile }));
      expect(html.length, spec.kind).toBeGreaterThan(80);
      const title = config.title;
      if (typeof title === "string" && title) expect(html, `${spec.kind} title`).toContain(title.replace(/&/g, "&amp;"));
    }
  });
  it("applies the button tone and radius from the style section", () => {
    const html = renderToStaticMarkup(createElement(BlockFrame, { kind: "newsletter", config: { ...blockSpecs.find(s => s.kind === "newsletter")!.defaults(), btnTone: "outline", btnRadius: 6 }, mobile: false }));
    expect(html).toContain("--bk-btn-radius:6px");
    expect(html).toContain("--bk-btn-ring");
  });
});
