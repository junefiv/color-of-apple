// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { LibraryCatalog } from "@/components/preview/library/library-catalog";
import { WebComponentsCatalog } from "@/components/preview/web/components-catalog";
import { ComponentPlayground } from "@/components/preview/library/playground";
import { COMPONENT_GROUPS, LIBRARY_ITEMS } from "@/components/preview/library/catalog";
import { COMPONENT_SETTINGS, defaultOptions, updateOptions } from "@/components/preview/library/settings";
import { useMatchuStore } from "@/lib/store";

let host: HTMLDivElement;
let root: Root;
beforeEach(() => {
  window.history.replaceState({}, "", "/result");
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })));
  useMatchuStore.setState({ locale: "ko" });
  host = document.createElement("div"); document.body.append(host); root = createRoot(host);
});
afterEach(() => { act(() => root.unmount()); host.remove(); vi.unstubAllGlobals(); });
function mount(id?: typeof LIBRARY_ITEMS[number][0]) {
  act(() => root.render(id ? createElement(ComponentPlayground, { id, ko: true }) : createElement(LibraryCatalog)));
}
function inputOption(name: string): HTMLInputElement {
  return Array.from(host.querySelectorAll<HTMLLabelElement>(".lk-controls label")).find(label => label.querySelector("span")?.textContent === name)!.querySelector("input")!;
}
function selectOption(name: string, value: string) {
  const select = Array.from(host.querySelectorAll<HTMLLabelElement>(".lk-controls label")).find(label => label.querySelector("span")?.textContent === name)!.querySelector("select")!;
  act(() => { select.value = value; select.dispatchEvent(new Event("change", { bubbles: true })); });
}
function fill(input: HTMLInputElement, value: string) {
  act(() => { Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(input, value); input.dispatchEvent(new Event("input", { bubbles: true })); });
}
function click(selector: string) { act(() => host.querySelector<HTMLButtonElement>(selector)!.click()); }

describe("Jelly-compatible library catalog", () => {
  it("classifies every component exactly once outside All", () => {
    const classified = COMPONENT_GROUPS.filter(group => group.id !== "all").flatMap(group => [...group.items]);
    expect(classified).toHaveLength(35);
    expect(new Set(classified)).toEqual(new Set(LIBRARY_ITEMS.map(([id]) => id)));
  });
  it("filters by group and component type while preserving filters after a detail visit", async () => {
    mount();
    expect(host.querySelectorAll('.lk-filter-tabs:not(.lk-filter-subtabs) [role="tab"]')).toHaveLength(9);
    expect(host.querySelector(".lk-filter-subtabs")).toBeNull();
    click('[id$="-category-inputs"]');
    expect(host.querySelectorAll(".lk-example:not([hidden])")).toHaveLength(4);
    expect(Array.from(host.querySelectorAll('.lk-filter-subtabs [role="tab"]'), node => node.textContent)).toEqual(["All", "Input", "Textarea", "OTP", "Label"]);
    click('[id$="-type-textarea"]');
    expect(host.querySelector(".lk-example:not([hidden])")?.getAttribute("data-component")).toBe("textarea");
    click('[data-component="textarea"] .lk-detail-link');
    await act(async () => {
      const popped = new Promise<void>(resolve => window.addEventListener("popstate", () => resolve(), { once: true }));
      host.querySelector<HTMLButtonElement>('.lk-back')!.click();
      await popped;
    });
    expect(host.querySelector('[id$="-type-textarea"]')?.getAttribute("aria-selected")).toBe("true");
    expect(host.querySelectorAll(".lk-example:not([hidden])")).toHaveLength(1);
    click('[id$="-category-buttons"]');
    expect(host.querySelector('[id$="-type-all"]')?.getAttribute("aria-selected")).toBe("true");
    expect(host.querySelectorAll(".lk-example:not([hidden])")).toHaveLength(2);
    click('[id$="-category-all"]');
    expect(host.querySelectorAll(".lk-example:not([hidden])")).toHaveLength(35);
  });
  it("supports keyboard sub-tabs and combines category filters with search", () => {
    mount(); click('[id$="-category-inputs"]');
    const all = host.querySelector<HTMLButtonElement>('[id$="-type-all"]')!;
    act(() => all.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true })));
    expect(host.querySelector('[id$="-type-input"]')?.getAttribute("aria-selected")).toBe("true");
    expect(document.activeElement).toBe(host.querySelector('[id$="-type-input"]'));
    click('[id$="-type-all"]');
    fill(host.querySelector<HTMLInputElement>(".lk-catalog-search input")!, "otp");
    expect(host.querySelectorAll(".lk-example:not([hidden])")).toHaveLength(1);
    expect(host.querySelector(".lk-example:not([hidden])")?.getAttribute("data-component")).toBe("otp");
  });
  it("provides the 35 requested standalone components in one catalog", () => {
    mount();
    expect(host.querySelectorAll(".lk-example")).toHaveLength(35);
    const playground = host.querySelector<HTMLElement>(".lk-playground")!;
    expect(playground.firstElementChild?.classList.contains("lk-preview-panel")).toBe(true);
    expect(playground.dataset.compact).toBe("true");
    expect(playground.querySelector(".lk-controls .lk-reset, .lk-controls-heading")).toBeNull();
    expect(playground.querySelector(".lk-controls, .lk-preview-panel .lk-reset")).toBeNull();
    expect(new Set(LIBRARY_ITEMS.map(([id]) => id)).size).toBe(35);
    for (const [id] of LIBRARY_ITEMS) expect(host.querySelector(`[data-component="${id}"] .lk-configured`)!.children.length).toBeGreaterThan(0);
    for (const id of ["theme", "cart", "calendar", "avatar", "data-table", "hero", "navbar"]) expect(host.querySelector(`[data-component="${id}"]`)).toBeNull();
    for (const id of ["checkbox", "radio", "switch", "badge", "chip", "range", "slider"]) expect(host.querySelector(`[data-component="${id}"]`)).not.toBeNull();
  });
  it("uses component-specific Jelly settings without global density or invented variants", () => {
    expect(defaultOptions("button")).toMatchObject({ shape: "pill", size: "medium", variant: "primary-500", disabled: false, block: false });
    expect(defaultOptions("icon-button").shape).toBe("square");
    expect(defaultOptions("slider").value).toBe(50);
    expect(defaultOptions("range")).toMatchObject({ low: 20, high: 75, min: 0, max: 100, step: 1 });
    expect(defaultOptions("pagination")).toMatchObject({ total: 12, page: 3, size: "small" });
    expect(defaultOptions("tooltip").placement).toBe("top");
    for (const settings of Object.values(COMPONENT_SETTINGS)) expect(settings.some(setting => setting.key === "density")).toBe(false);
  });
  it("keeps search results accurate without resetting mounted settings", () => {
    mount();
    const search = host.querySelector<HTMLInputElement>(".lk-catalog-search input")!;
    fill(search, "range");
    expect(host.querySelectorAll(".lk-example:not([hidden])")).toHaveLength(1);
    expect(host.querySelector(".lk-example:not([hidden])")?.getAttribute("data-component")).toBe("range");
    fill(search, "not-a-component"); expect(host.querySelector(".lk-empty[role=status]")?.textContent).toContain("일치하는");
  });
  it("applies button shape, variant, disabled and reset", () => {
    mount("button");
    selectOption("shape", "square"); click('.lk-variant-swatches [aria-label="secondary-100"]');
    expect(host.querySelector(".lk-configured")?.getAttribute("data-shape")).toBe("square");
    expect(host.querySelector(".lk-configured")?.getAttribute("data-variant")).toBe("secondary-100");
    expect(host.querySelector<HTMLElement>(".lk-configured")!.style.getPropertyValue("--lk-primary")).toContain("--color-secondary-100");
    expect(host.querySelector<HTMLElement>(".lk-configured")!.style.getPropertyValue("--lk-on")).toContain("--color-secondary-100-on");
    expect(host.querySelectorAll(".lk-variant-swatches button")).toHaveLength(40);
    expect(host.querySelectorAll(".lk-variant-option small, .lk-variant-option output")).toHaveLength(0);
    expect(Array.from(host.querySelectorAll(".lk-variant-family-label"), node => node.textContent)).toEqual(["Primary", "Secondary", "Accent", "Neutral"]);
    expect(host.querySelector(".lk-variant-option > legend")?.textContent).toBe("Variant");
    expect(host.querySelector(".lk-other-settings .lk-variant-option")).toBeNull();
    expect(host.querySelectorAll('.lk-variant-swatches button svg')).toHaveLength(1);
    expect(host.querySelector('.lk-variant-swatches [aria-label="secondary-100"] svg')).not.toBeNull();
    expect(host.querySelector('.lk-variant-swatches [aria-label="primary-500"] svg')).toBeNull();
    act(() => inputOption("disabled").click()); expect(host.querySelector<HTMLButtonElement>(".lk-main-button")!.disabled).toBe(true);
    click('.lk-reset[aria-label="설정 초기화"]'); expect(host.querySelector<HTMLButtonElement>(".lk-main-button")!.disabled).toBe(false);
    expect(host.querySelector(".lk-configured")?.getAttribute("data-shape")).toBe("pill");
  });
  it("clears indeterminate on a checkbox interaction and synchronizes settings", () => {
    mount("checkbox"); act(() => inputOption("indeterminate").click());
    const checkbox = host.querySelector<HTMLInputElement>('.lk-configured input[type="checkbox"]')!;
    expect(checkbox.indeterminate).toBe(true);
    act(() => checkbox.click()); expect(checkbox.indeterminate).toBe(false); expect(inputOption("indeterminate").checked).toBe(false); expect(inputOption("checked").checked).toBe(true);
  });
  it("applies input value, placeholder and readonly to the actual input", () => {
    mount("input"); fill(inputOption("value"), "June"); fill(inputOption("placeholder"), "Email");
    act(() => inputOption("readonly").click());
    const input = host.querySelector<HTMLInputElement>(".lk-configured input")!;
    expect(input.value).toBe("June"); expect(input.placeholder).toBe("Email"); expect(input.readOnly).toBe(true);
  });
  it("supports variable OTP length, sequential typing, paste, and backspace", () => {
    mount("otp"); fill(inputOption("length"), "4");
    const inputs = Array.from(host.querySelectorAll<HTMLInputElement>(".lk-otp input")); expect(inputs).toHaveLength(4);
    fill(inputs[0], "1"); expect(document.activeElement).toBe(inputs[1]);
    act(() => { const event = new Event("paste", { bubbles: true, cancelable: true }); Object.defineProperty(event, "clipboardData", { value: { getData: () => "a9876" } }); inputs[0].dispatchEvent(event); });
    expect(inputs.map(input => input.value).join("")).toBe("9876");
    fill(inputs[3], ""); act(() => inputs[3].dispatchEvent(new KeyboardEvent("keydown", { key: "Backspace", bubbles: true })));
    expect(inputs[2].value).toBe(""); expect(document.activeElement).toBe(inputs[2]);
  });
  it("keeps range bounds ordered and clamps when limits change", () => {
    expect(updateOptions("range", defaultOptions("range"), "low", 90)).toMatchObject({ low: 90, high: 90 });
    expect(updateOptions("range", defaultOptions("range"), "max", 10)).toMatchObject({ low: 10, high: 10 });
    expect(updateOptions("slider", defaultOptions("slider"), "min", 120)).toMatchObject({ min: 120, max: 121, value: 120 });
    mount("range"); expect(host.querySelectorAll('.lk-configured input[type="range"]')).toHaveLength(2);
  });
  it("updates segmented value by keyboard and direct interaction", () => {
    mount("segmented"); const buttons = host.querySelectorAll<HTMLButtonElement>('[role="radio"]');
    expect(buttons[2].getAttribute("aria-checked")).toBe("true");
    act(() => buttons[2].dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true })));
    expect(buttons[0].getAttribute("aria-checked")).toBe("true"); expect(document.activeElement).toBe(buttons[0]);
  });
  it("supports selection and removal independently on Chip", () => {
    mount("chip"); act(() => inputOption("selectable").click()); act(() => inputOption("removable").click());
    click('.lk-chip button[aria-pressed]'); expect(inputOption("selected").checked).toBe(true);
    click('[aria-label="Remove Apple"]'); expect(host.querySelector(".lk-chip")).toBeNull();
  });
  it("resizes both axes with accessible keyboard separators", () => {
    mount("resizable"); selectOption("direction", "both");
    const handles = host.querySelectorAll<HTMLElement>('[role="separator"]'); expect(handles).toHaveLength(2);
    act(() => handles[0].dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true })));
    expect(handles[0].getAttribute("aria-valuenow")).toBe("52"); expect(handles[1].getAttribute("aria-valuenow")).toBe("50");
  });
  it("limits pagination to total and avoids rendering every page", () => {
    mount("pagination"); fill(inputOption("total"), "10000");
    expect(host.querySelectorAll(".lk-pagination button").length).toBeLessThanOrEqual(9);
    fill(inputOption("total"), "2"); expect(inputOption("page").value).toBe("2");
    expect(host.querySelector<HTMLButtonElement>('[aria-label="Next page"]')!.disabled).toBe(true);
  });
  it("changes selected tabs and updates the settings value", () => {
    mount("tabs"); act(() => host.querySelectorAll<HTMLButtonElement>('[role="tab"]')[1].click());
    expect(host.querySelector('[role="tabpanel"]')?.textContent).toContain("Three recent changes");
  });
  it("reuses the Notifications switch for boolean settings", () => {
    mount();
    click('[data-component="switch"] .lk-detail-link');
    const switches = host.querySelectorAll<HTMLInputElement>('.lk-controls input[role="switch"]');
    expect(switches).toHaveLength(2);
    for (const input of switches) {
      expect(input.classList.contains("lk-switch")).toBe(true);
      expect(input.dataset.size).toBe("medium");
    }
    const reference = host.querySelector<HTMLInputElement>('[data-component="switch"] .lk-configured input')!;
    expect(reference.classList.contains("lk-switch")).toBe(true);
    expect(reference.dataset.size).toBe("medium");
  });
  it("removes catalog-wide concepts and scopes effects to individual components", () => {
    act(() => root.render(createElement(WebComponentsCatalog)));
    expect(host.querySelector(".ui-library-tabs")).toBeNull();
    expect(host.querySelector(".library-kit:not(.lk-component-scope)")?.hasAttribute("data-library")).toBe(false);
    expect(host.querySelector('[data-component="button"] .lk-component-scope')?.getAttribute("data-library")).toBe("cushion");
    expect(host.querySelector('[data-component="input"] .lk-component-scope')?.getAttribute("data-library")).toBe("ink");
    expect(host.querySelector('[data-component="switch"] .lk-component-scope')?.hasAttribute("data-library")).toBe(false);
  });
  it("keeps preview interactions separate from details and preserves configuration on return", async () => {
    mount();
    const historyLength = window.history.length;
    click('[data-component="switch"] .lk-preview-stage');
    click('[data-component="switch"] .lk-card-footer > span');
    expect(window.history.length).toBe(historyLength);
    expect(window.location.hash).toBe("#ui-kit");
    click('[data-component="switch"] .lk-configured input');
    expect(host.querySelector(".lk-controls")).toBeNull();
    click('[data-component="switch"] .lk-detail-link');
    expect(host.querySelectorAll(".lk-example:not([hidden])")).toHaveLength(1);
    expect(inputOption("checked").checked).toBe(true);
    click('.lk-variant-swatches [aria-label="neutral-900"]');
    selectOption("size", "large");
    await act(async () => {
      const popped = new Promise<void>(resolve => window.addEventListener("popstate", () => resolve(), { once: true }));
      host.querySelector<HTMLButtonElement>('.lk-back')!.click();
      await popped;
    });
    expect(host.querySelectorAll(".lk-example:not([hidden])")).toHaveLength(35);
    expect(host.querySelector(".lk-controls")).toBeNull();
    expect(host.querySelector('[data-component="switch"] .lk-configured')?.getAttribute("data-variant")).toBe("neutral-900");
    click('[data-component="switch"] .lk-preview-stage');
    expect(host.querySelector(".lk-controls")).toBeNull();
    click('[data-component="switch"] .lk-detail-link');
    expect(host.querySelector('[data-component="switch"] .lk-configured')?.getAttribute("data-size")).toBe("large");
  });
  it("restores details from URL and handles browser back and forward", async () => {
    window.history.replaceState({ existing: "preserved" }, "", "/result?d=example#ui-kit");
    mount();
    click('[data-component="button"] .lk-detail-link');
    expect(window.location.hash).toBe("#ui-kit/button");
    expect(window.location.search).toBe("?d=example");
    expect(window.history.state.existing).toBe("preserved");
    for (const [method, detail] of [["back", false], ["forward", true]] as const) {
      await act(async () => {
        const popped = new Promise<void>(resolve => window.addEventListener("popstate", () => resolve(), { once: true }));
        window.history[method]();
        await popped;
      });
      expect(Boolean(host.querySelector(".lk-controls"))).toBe(detail);
    }
  });
  it("opens a direct detail link and returns to the catalog without leaving the page", () => {
    window.history.replaceState({}, "", "/result#ui-kit/switch");
    mount();
    expect(host.querySelector('[data-component="switch"]')?.getAttribute("data-expanded")).toBe("true");
    click('.lk-back');
    expect(window.location.hash).toBe("#ui-kit");
    expect(host.querySelector(".lk-controls")).toBeNull();
  });
});
