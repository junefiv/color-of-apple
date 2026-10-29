import { describe, expect, it } from "vitest";
import { applyHeroPreset, defaultHero, heroColorVars, heroHeight, heroPresets, validHeroConfig, withHeroDefaults } from "../src/lib/hero-config";
import { validImageData } from "../src/lib/image-data";
import { defaultHeader, validHeaderConfig } from "../src/lib/header-config";
import { baseLayout, moveLayoutNode, newLayoutNode, validLayoutDocument } from "../src/lib/page-layout";

describe("hero config", () => {
  it("accepts the default and every preset", () => {
    expect(validHeroConfig(defaultHero())).toBe(true);
    for (const preset of heroPresets) expect(validHeroConfig(applyHeroPreset(defaultHero(), preset))).toBe(true);
  });
  it("keeps the user's copy when a preset is applied", () => {
    const own = { ...defaultHero(), title: "사과의 색", primary: "시작하기", accent: "secondary" as const };
    const next = applyHeroPreset(own, heroPresets.find(p => p.key === "brand")!);
    expect(next).toMatchObject({ title: "사과의 색", primary: "시작하기", accent: "secondary", layout: "color", surface: "primary" });
  });
  it("rejects unknown options, transparent surfaces, bad slide counts and long copy", () => {
    expect(validHeroConfig({ ...defaultHero(), layout: "carousel" })).toBe(false);
    expect(validHeroConfig({ ...defaultHero(), surface: "transparent" })).toBe(false);
    expect(validHeroConfig({ ...defaultHero(), slides: 0 })).toBe(false);
    expect(validHeroConfig({ ...defaultHero(), slides: 2.5 })).toBe(false);
    expect(validHeroConfig({ ...defaultHero(), title: "가".repeat(81) })).toBe(false);
  });
  it("sizes against each device's first view", () => {
    expect(heroHeight(defaultHero(), false, 1024)).toBe(1024);
    expect(heroHeight({ ...defaultHero(), mobileHeight: "medium" }, true, 667)).toBe(400);
    expect(heroHeight({ ...defaultHero(), height: "band" }, false, 1024)).toBe(320);
  });
  it("reads light over media and inverts the button on dark surfaces", () => {
    expect(heroColorVars(defaultHero())["--hr-fg"]).toBe("var(--color-text-inverse,#fff)");
    expect(heroColorVars(defaultHero())["--hr-accent"]).toBe("var(--color-text-inverse,#fff)");
    expect(heroColorVars(defaultHero())["--hr-accent-on"]).toBe("var(--color-text-primary,#303039)");
    const brand = heroColorVars({ ...defaultHero(), layout: "color", surface: "primary" });
    expect(brand["--hr-accent"]).toBe("var(--color-primary-on,#fff)");
    expect(brand["--hr-accent-on"]).toBe("var(--color-primary-default,#303039)");
    expect(heroColorVars({ ...defaultHero(), layout: "text", surface: "subtle", accent: "accent" })["--hr-accent"]).toBe("var(--color-accent-default)");
  });
  it("stores hero settings only on hero nodes and never nests frames inside", () => {
    const hero = newLayoutNode("hero");
    expect(validLayoutDocument({ version: 1, menu: "overlay", nodes: [hero] })).toBe(true);
    const frame = { id: "f", name: "f", kind: "frame", desktop: { ...baseLayout }, mobile: {}, children: [], hero: defaultHero() };
    expect(validLayoutDocument({ version: 1, menu: "overlay", nodes: [frame] })).toBe(false);
    const loose = newLayoutNode("frame");
    const tree = [hero, loose];
    expect(moveLayoutNode(tree, loose.id, hero.id)).toBe(tree);
  });
  it("loads heroes saved before button design existed and fills the defaults", () => {
    const { buttonRadius, buttonColor, buttonStyle, ...old } = defaultHero();
    expect([buttonRadius, buttonColor, buttonStyle]).toEqual([40, "auto", "solid"]);
    expect(validHeroConfig(old)).toBe(true);
    expect(withHeroDefaults(old)).toEqual(defaultHero());
    expect(validHeroConfig({ ...defaultHero(), buttonRadius: 41 })).toBe(false);
    expect(validHeroConfig({ ...defaultHero(), buttonColor: "gold" })).toBe(false);
  });
  it("pins the button to a palette role and exposes its radius", () => {
    const vars = heroColorVars({ ...defaultHero(), buttonColor: "accent", buttonRadius: 6 });
    expect(vars["--hr-accent"]).toBe("var(--color-accent-default)");
    expect(vars["--hr-accent-on"]).toBe("var(--color-accent-on,#fff)");
    expect(vars["--hr-radius"]).toBe("6px");
    expect(applyHeroPreset({ ...defaultHero(), buttonRadius: 0, buttonStyle: "outline" }, heroPresets[0])).toMatchObject({ buttonRadius: 0, buttonStyle: "outline" });
  });
  it("stores dropped images only as bounded inline image data", () => {
    const png = "data:image/png;base64,iVBORw0KGgo=";
    expect(validImageData("")).toBe(true);
    expect(validImageData(png)).toBe(true);
    expect(validImageData("https://example.com/a.png")).toBe(false);
    expect(validImageData("data:text/html;base64,PGI+")).toBe(false);
    expect(validImageData(`data:image/png;base64,${"A".repeat(3_000_000)}`)).toBe(false);
    expect(validHeroConfig({ ...defaultHero(), image: png, imageFit: "contain" })).toBe(true);
    expect(validHeroConfig({ ...defaultHero(), imageFit: "stretch" })).toBe(false);
    expect(validHeaderConfig({ ...defaultHeader(), logo: "slot", logoImage: png })).toBe(true);
    expect(validHeaderConfig({ ...defaultHeader(), logoImage: "javascript:alert(1)" })).toBe(false);
  });
  it("uses the dragged px height when the hero height is custom", () => {
    const hero = { ...defaultHero(), height: "custom" as const, heightPx: 640, mobileHeight: "custom" as const, mobileHeightPx: 360 };
    expect(heroHeight(hero, false, 1024)).toBe(640);
    expect(heroHeight(hero, true, 667)).toBe(360);
    expect(validHeroConfig(hero)).toBe(true);
    expect(validHeroConfig({ ...hero, heightPx: 100 })).toBe(false);
  });
});
