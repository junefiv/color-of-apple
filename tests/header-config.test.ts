import { describe, expect, it } from "vitest";
import { applyHeaderPreset, defaultHeader, headerColorVars, headerPresets, subItem, validHeaderConfig, withHeaderDefaults } from "../src/lib/header-config";
import { baseLayout, newLayoutNode, validLayoutDocument } from "../src/lib/page-layout";

describe("header config", () => {
  it("accepts the default and every preset", () => {
    expect(validHeaderConfig(defaultHeader())).toBe(true);
    for (const preset of headerPresets) expect(validHeaderConfig(applyHeaderPreset(defaultHeader(), preset))).toBe(true);
  });
  it("keeps the user's logo and menu copy when a preset is applied", () => {
    const own = { ...defaultHeader(), logoText: "Apple", items: [{ label: "샵", children: [subItem("신상")] }] };
    const next = applyHeaderPreset(own, headerPresets[0]);
    expect(next.logoText).toBe("Apple");
    expect(next.items).toEqual(own.items);
    expect(next.submenu).toBe("all");
  });
  it("rejects unknown options and oversized menus", () => {
    expect(validHeaderConfig({ ...defaultHeader(), submenu: "carousel" })).toBe(false);
    expect(validHeaderConfig({ ...defaultHeader(), items: Array.from({ length: 9 }, () => ({ label: "a", children: [] })) })).toBe(false);
  });
  it("paints from palette tokens and keeps the accent legible on tinted or dark bars", () => {
    expect(headerColorVars(defaultHeader())["--hd-accent"]).toBe("var(--color-primary-default)");
    expect(headerColorVars({ ...defaultHeader(), surface: "primary" })["--hd-accent"]).toBe("var(--color-primary-on,#fff)");
    expect(headerColorVars({ ...defaultHeader(), surface: "transparent" })["--hd-accent-on"]).toBe("var(--color-text-primary,#303039)");
  });
  it("stores header settings only on header nodes", () => {
    const header = newLayoutNode("header");
    expect(validLayoutDocument({ version: 1, menu: "overlay", nodes: [header] })).toBe(true);
    const frame = { id: "f", name: "f", kind: "frame", desktop: { ...baseLayout }, mobile: {}, children: [], header: defaultHeader() };
    expect(validLayoutDocument({ version: 1, menu: "overlay", nodes: [frame] })).toBe(false);
  });
  it("opens headers saved with plain-string submenus and fills the new options", () => {
    const old = { ...defaultHeader(), items: [{ label: "샵", children: ["신상", "세일"] }] } as Record<string, unknown>;
    for (const key of ["subStyle", "motion", "dim", "placement", "promo", "promoTitle", "promoText", "promoCta", "promoImage"]) delete old[key];
    expect(validHeaderConfig(old)).toBe(true);
    const next = withHeaderDefaults(old as never);
    expect(next.items[0].children[1]).toEqual(subItem("세일"));
    expect(next).toMatchObject({ placement: "top", subStyle: "text", motion: "fade", dim: false });
  });
  it("checks rich submenu entries and keeps a dragged placement across presets", () => {
    const rich = { ...defaultHeader(), submenu: "mega" as const, items: [{ label: "샵", children: [subItem("신상", { icon: "gift", badge: "NEW", items: ["상의", "하의"] })] }] };
    expect(validHeaderConfig(rich)).toBe(true);
    expect(validHeaderConfig({ ...rich, items: [{ label: "샵", children: [subItem("신상", { icon: "rocket" as never })] }] })).toBe(false);
    expect(validHeaderConfig({ ...rich, placement: "bottom" })).toBe(false);
    const sideBar = { ...defaultHeader(), placement: "left" as const };
    expect(applyHeaderPreset(sideBar, headerPresets[0]).placement).toBe("left");
    expect(applyHeaderPreset(defaultHeader(), headerPresets.find(p => p.key === "side")!).placement).toBe("left");
  });
});
