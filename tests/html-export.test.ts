// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { buildHtmlDocument, cleanArtboard, selectorUses, usedClasses } from "../src/lib/html-export";

describe("html export", () => {
  it("keeps a rule only when every class it names is in the page", () => {
    const used = new Set(["hd", "hd-nav"]);
    expect(selectorUses(".hd .hd-nav>li", used)).toBe(true);
    expect(selectorUses(".hd .hd-drop", used)).toBe(false);
    expect(selectorUses(".hd-drop, .hd", used)).toBe(true);
    expect(selectorUses("button:not(.x)", used)).toBe(true);
    expect(selectorUses(":root", used)).toBe(true);
  });
  it("strips editor chrome, editing attributes and drop hints from a rendered artboard", () => {
    document.body.innerHTML = `<div class="lb-viewport" style="width:1440px;transform:scale(.4)"><div class="lb-layout-node is-selected" contenteditable="true">
      <div class="lb-node-label">카드</div><span class="bk-media"><svg></svg><small>이미지를 끌어다 놓으세요</small></span><h2>제목</h2><span class="lb-resize lb-resize-x"></span></div></div>`;
    const clean = cleanArtboard(document.querySelector(".lb-viewport")!);
    expect(clean.querySelector(".lb-node-label, .lb-resize, small")).toBeNull();
    expect(clean.querySelector(".bk-media svg")).not.toBeNull();
    expect(clean.querySelector("[contenteditable]")).toBeNull();
    expect(clean.querySelector(".is-selected")).toBeNull();
    expect(clean.style.transform).toBe("");
    expect(clean.textContent).toContain("제목");
    expect(usedClasses([clean]).has("matchu-preview")).toBe(true);
  });
  it("switches the PC and mobile renders at 768px and escapes the title", () => {
    const html = buildHtmlDocument({ title: "A <b>", vars: "--color-primary-default:#123456", css: ".x{color:red}", font: "system-ui", desktop: "<p>pc</p>", mobile: "<p>m</p>" });
    expect(html).toContain("<title>A &lt;b&gt;</title>");
    expect(html).toContain("@media (max-width: 767px){.coa-page.coa-desktop{display:none}");
    expect(html).toContain("--color-primary-default:#123456");
    const appOnly = buildHtmlDocument({ title: "앱", vars: "", css: "", font: "system-ui", mobile: "<p>m</p>" });
    expect(appOnly).not.toContain("coa-desktop");
  });
});
