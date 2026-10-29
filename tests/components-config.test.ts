import { describe, expect, it } from "vitest";
import { applyCardsPreset, cardsPresets, defaultCards, validCardsConfig } from "../src/lib/cards-config";
import { applyCtaPreset, ctaPresets, defaultCta, validCtaConfig } from "../src/lib/cta-config";
import { applyFloatingPreset, defaultFloating, floatingPresets, validFloatingConfig } from "../src/lib/floating-config";
import { applyFooterPreset, defaultFooter, footerPresets, validFooterConfig } from "../src/lib/footer-config";
import { baseLayout, migrateLayoutDocument, newLayoutNode, pageOf, validLayoutDocument } from "../src/lib/page-layout";
import { surfaceVars } from "../src/lib/section-surface";

describe("page components", () => {
  it("accepts every default and preset", () => {
    expect(validFooterConfig(defaultFooter())).toBe(true);
    for (const p of footerPresets) expect(validFooterConfig(applyFooterPreset(defaultFooter(), p))).toBe(true);
    expect(validCardsConfig(defaultCards())).toBe(true);
    for (const p of cardsPresets) expect(validCardsConfig(applyCardsPreset(defaultCards(), p))).toBe(true);
    expect(validCtaConfig(defaultCta())).toBe(true);
    for (const p of ctaPresets) expect(validCtaConfig(applyCtaPreset(defaultCta(), p))).toBe(true);
    expect(validFloatingConfig(defaultFloating())).toBe(true);
    for (const p of floatingPresets) expect(validFloatingConfig(applyFloatingPreset(defaultFloating(), p))).toBe(true);
  });
  it("keeps the user's own copy and cards when a preset reshapes the layout", () => {
    const cards = { ...defaultCards(), title: "우리 소식", items: [{ ...defaultCards().items[0], title: "첫 카드" }] };
    expect(applyCardsPreset(cards, cardsPresets[1])).toMatchObject({ title: "우리 소식", variant: "slider", items: [{ title: "첫 카드" }] });
    const footer = { ...defaultFooter(), logoText: "사과", info: "우리 회사" };
    expect(applyFooterPreset(footer, footerPresets[5])).toMatchObject({ logoText: "사과", info: "우리 회사", layout: "minimal" });
    expect(applyCtaPreset({ ...defaultCta(), title: "지금 신청" }, ctaPresets[5])).toMatchObject({ title: "지금 신청", countdown: true });
  });
  it("rejects unknown options and oversized lists", () => {
    expect(validCardsConfig({ ...defaultCards(), variant: "masonry" })).toBe(false);
    expect(validCardsConfig({ ...defaultCards(), items: [] })).toBe(false);
    expect(validCardsConfig({ ...defaultCards(), columns: 7 })).toBe(false);
    expect(validFooterConfig({ ...defaultFooter(), legal: Array(9).fill("링크") })).toBe(false);
    expect(validCtaConfig({ ...defaultCta(), image: "https://example.com/a.png" })).toBe(false);
    expect(validFloatingConfig({ ...defaultFloating(), mobileKind: "drawer" })).toBe(false);
  });
  it("stores each component's settings only on its own kind", () => {
    const nodes = (["cards", "cta", "footer", "floating"] as const).map(kind => newLayoutNode(kind));
    expect(validLayoutDocument({ version: 1, menu: "overlay", nodes })).toBe(true);
    const frame = { id: "f", name: "f", kind: "frame", desktop: { ...baseLayout }, mobile: {}, children: [], footer: defaultFooter() };
    expect(validLayoutDocument({ version: 1, menu: "overlay", nodes: [frame] })).toBe(false);
  });
  it("lets the column side panel carry its own copy and logo", () => {
    const page = { ...pageOf({ version: 1, menu: "overlay", nodes: [] }), mode: "column" as const, asideTitle: "가볍게", asideImage: "data:image/png;base64,iVBORw0KGgo=" };
    expect(validLayoutDocument({ version: 1, menu: "overlay", nodes: [], page })).toBe(true);
    expect(validLayoutDocument({ version: 1, menu: "overlay", nodes: [], page: { ...page, asideAlign: "right" } })).toBe(false);
  });
  it("inverts the button accent on dark surfaces", () => {
    expect(surfaceVars("sc", "surface")["--sc-accent"]).toBe("var(--color-primary-default)");
    expect(surfaceVars("sc", "inverse")["--sc-accent"]).toBe("var(--color-text-inverse,#fff)");
    expect(surfaceVars("ct", "primary", "accent")["--ct-accent-on"]).toBe("var(--color-primary-default,#303039)");
  });
  it("moves spacing saved on cards, CTAs and footers onto the layer padding", () => {
    const cta = newLayoutNode("cta"), cards = newLayoutNode("cards");
    expect(cta.desktop.padding).toEqual([96, 64, 96, 64]);
    expect(cta.mobile.padding).toEqual([64, 20, 64, 20]);
    const old = (n: typeof cta, extra: Record<string, unknown>) => ({ ...n, desktop: { ...n.desktop, padding: [0, 0, 0, 0] as [number, number, number, number] }, mobile: {}, ...extra });
    const doc = { version: 1 as const, menu: "overlay" as const, nodes: [old(cta, { cta: { ...defaultCta(), size: "large" } }), old(cards, { cards: { ...defaultCards(), padding: 40 } })] };
    expect(validLayoutDocument(doc)).toBe(true);
    const [movedCta, movedCards] = migrateLayoutDocument(doc).nodes;
    expect(movedCta.desktop.padding).toEqual([160, 64, 160, 64]);
    expect(movedCta.mobile.padding).toEqual([106, 20, 106, 20]);
    expect("size" in movedCta.cta!).toBe(false);
    expect(movedCards.desktop.padding).toEqual([40, 64, 40, 64]);
    expect("padding" in movedCards.cards!).toBe(false);
    expect(migrateLayoutDocument({ ...doc, nodes: [cta] }).nodes[0]).toEqual(cta);
  });

});
