// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import type { User } from "firebase/auth";
import { AuthContext, type AuthContextValue } from "@/components/auth/auth-provider";
import { LibraryCatalog } from "@/components/preview/library/library-catalog";
import { ComponentPlayground } from "@/components/preview/library/playground";
import { LIBRARY_ITEMS } from "@/components/preview/library/catalog";
import { useMatchuStore } from "@/lib/store";

let host: HTMLDivElement;
let root: Root;
const originalGetContext = HTMLCanvasElement.prototype.getContext;
beforeEach(() => {
  HTMLCanvasElement.prototype.getContext = () => null;
  window.history.replaceState({}, "", "/result");
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })));
  useMatchuStore.setState({ locale: "ko" });
  host = document.createElement("div"); document.body.append(host); root = createRoot(host);
});
afterEach(() => { act(() => root.unmount()); host.remove(); HTMLCanvasElement.prototype.getContext = originalGetContext; vi.unstubAllGlobals(); });
function authValue(signedIn: boolean): AuthContextValue {
  const user = signedIn ? { uid: "tester" } as User : null;
  return { user, profile: null, loading: false, signIn: async () => user ?? ({ uid: "tester" } as User), signOut: async () => undefined };
}
function mount(id?: typeof LIBRARY_ITEMS[number][0], signedIn = true) {
  const child = id ? createElement(ComponentPlayground, { id, ko: true }) : createElement(LibraryCatalog);
  act(() => root.render(createElement(AuthContext.Provider, { value: authValue(signedIn) }, child)));
}
function inputOption(name: string): HTMLInputElement {
  return Array.from(document.body.querySelectorAll<HTMLLabelElement>(".lk-controls label")).find(label => label.querySelector("span")?.textContent === name)!.querySelector("input")!;
}
function selectOption(name: string, value: string) {
  const select = Array.from(document.body.querySelectorAll<HTMLLabelElement>(".lk-controls label")).find(label => label.querySelector("span")?.textContent === name)!.querySelector("select")!;
  act(() => { select.value = value; select.dispatchEvent(new Event("change", { bubbles: true })); });
}
function fill(input: HTMLInputElement, value: string) {
  act(() => { Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(input, value); input.dispatchEvent(new Event("input", { bubbles: true })); });
}
function click(selector: string) { act(() => document.body.querySelector<HTMLButtonElement>(selector)!.click()); }


describe("fresh fold button gallery", () => {
  it("keeps empty categories and their subtype tabs visible with counts", () => {
    mount();
    expect(document.querySelectorAll('.lk-filter-tabs:not(.lk-filter-subtabs) [role=tab]')).toHaveLength(9);
    click('[id$="-category-inputs"]');
    expect(Array.from(document.querySelectorAll('.lk-filter-subtabs [role=tab]'), el => el.textContent)).toEqual(['All0', 'Input0', 'Textarea0', 'OTP0', 'Label0']);
    click('[id$="-type-textarea"]');
    expect(document.querySelector('[id$="-type-textarea"]')?.getAttribute('aria-selected')).toBe('true');
    expect(document.querySelectorAll('.lk-example:not([hidden])')).toHaveLength(0);
    expect(document.querySelector('.lk-empty')?.textContent).toContain('아직 등록된');
    click('[id$="-category-buttons"]');
    expect(Array.from(document.querySelectorAll('.lk-filter-subtabs [role=tab]'), el => el.textContent)).toEqual(['All1', 'Button1', 'Icon Button0']);
    click('[id$="-type-button"]');
    expect(document.querySelectorAll('.lk-example:not([hidden])')).toHaveLength(1);
    click('[id$="-type-icon-button"]');
    expect(document.querySelectorAll('.lk-example:not([hidden])')).toHaveLength(0);
  });
  it("registers only the new component and opens its modal", () => {
    mount();
    expect(LIBRARY_ITEMS.map(item => item[0])).toEqual(["fold-button", "slime-toggle", "glass-drop", "image-reveal"]);
    expect(document.querySelectorAll('.lk-example')).toHaveLength(4);
    expect(document.querySelector('.lk-card-name')?.textContent).toBe('스티커 필링 버튼');
    expect(document.querySelector('.lk-detail-link')?.textContent).toBe('</> Edit & Use');
    expect(document.querySelector('.lk-card-footer')).toBeNull();
    click('.lk-configured button');
    expect(document.querySelector('.lk-detail-modal')).toBeNull();
    click('.lk-detail-link');
    expect(window.location.hash).toBe('#ui-kit/fold-button');
    expect(document.querySelector('[role=dialog]')).not.toBeNull();
    expect(document.querySelectorAll('.lk-code-tabs [role=tab]')).toHaveLength(2);
  });
  it("normalizes removed component URLs", () => {
    window.history.replaceState({}, '', '/result#ui-kit/button'); mount();
    expect(window.location.hash).toBe('#ui-kit');
    expect(document.querySelector('.lk-controls')).toBeNull();
  });
  it("synchronizes settings with both code formats and resets", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
    mount('fold-button');
    fill(inputOption('label'), 'Take it'); selectOption('size', 'large');
    click('[aria-label="secondary-700"]'); click('.lk-option-toggle input');
    const copied = async () => {
      writeText.mockClear();
      await act(async () => document.querySelector<HTMLButtonElement>('.lk-copy-code')!.click());
      return String(writeText.mock.calls.at(-1)?.[0]);
    };
    expect(await copied()).toContain('Take it'); expect(await copied()).toContain('23px');
    expect(document.querySelector<HTMLButtonElement>('.lk-configured button')!.disabled).toBe(true);
    click('.lk-code-tabs button:first-child');
    const html = await copied();
    expect(html).toContain('<style>'); expect(html).toContain('Take it'); expect(html).toContain(' disabled');
    expect(document.querySelector(".lk-code-panel")!.textContent).not.toContain("Take it");
    click('.lk-reset');
    expect(inputOption('label').value).toBe('Peel off');
    expect(document.querySelector<HTMLButtonElement>('.lk-configured button')!.disabled).toBe(false);
  });
  it("replays peeling after animation cleanup and respects reduced motion", () => {
    mount('fold-button'); const button = document.querySelector<HTMLButtonElement>('.lk-configured button')!;
    act(() => button.click()); expect(button.classList.contains('is-peeling')).toBe(true);
    act(() => root.render(createElement(AuthContext.Provider, { value: authValue(true) }, createElement(ComponentPlayground, { key: 'fresh', id: 'fold-button', ko: true }))));
    const freshButton = document.querySelector<HTMLButtonElement>('.lk-configured button')!;
    vi.stubGlobal('matchMedia', () => ({ matches: true }));
    act(() => freshButton.click()); expect(freshButton.classList.contains('is-peeling')).toBe(false);
  });
  it("shows component source before sign-in and copies only after login", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
    mount("fold-button", false);
    expect(document.querySelector(".lk-code-panel canvas")).not.toBeNull();
    expect(document.querySelector(".lk-code-panel")!.textContent).not.toContain("export default function FoldButton");
    await act(async () => document.querySelector<HTMLButtonElement>(".lk-copy-code")!.click());
    expect(String(writeText.mock.calls.at(-1)?.[0])).toContain("export default function FoldButton");
  });
  it("copies the current combined HTML source", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { configurable:true, value:{ writeText } });
    mount('fold-button'); click('.lk-code-tabs button:first-child');
    await act(async () => document.querySelector<HTMLButtonElement>('.lk-copy-code')!.click());
    expect(String(writeText.mock.calls.at(-1)?.[0])).toContain("<style>");
    expect(document.querySelector(".lk-code-panel")!.textContent).not.toContain("<style>");
  });
  it("moves the white slime thumb between primary and gray", () => {
    mount("slime-toggle");
    const button = document.querySelector<HTMLButtonElement>("[role=switch]")!;
    const css = document.querySelector("style")!.textContent!;
    expect(button.getAttribute("aria-checked")).toBe("true");
    expect(button.getAttribute("aria-label")).toBe("슬라임 토글");
    expect(css).toContain("background: #ffffff");
    expect(css).toContain("background: #c6c6cc");
    expect(css).toContain("coa-slime-on");
    expect(css).toContain("--slime-ms: 500ms");
    expect(button.hasAttribute("disabled")).toBe(false);
    selectOption("duration", "100ms");
    expect(document.querySelector("style")!.textContent).toContain("--slime-ms: 100ms");
    selectOption("duration", "900ms");
    expect(document.querySelector("style")!.textContent).toContain("--slime-ms: 900ms");
    click("[role=switch]");
    expect(button.getAttribute("aria-checked")).toBe("false");
    click("[role=switch]");
    expect(button.getAttribute("aria-checked")).toBe("true");
  });
  it("glows the whole glass word and trails a separate liquid drop", () => {
    mount("glass-drop");
    const root = document.querySelector<HTMLElement>("[data-glass]")!;
    const css = document.querySelector("style")!.textContent!;
    expect(root.tagName).toBe("BUTTON");
    expect(root.querySelector("b")!.textContent).toBe("Raindrop");
    expect(css).toContain("color: transparent");
    expect(css).toContain("backdrop-filter");
    expect(css).toContain("pointer-events: none");
    expect(css).toContain("scale(0.94)");
    expect(css).not.toContain("mask-image");
    act(() => root.dispatchEvent(new MouseEvent("pointerenter", { bubbles: true, clientX: 48, clientY: 36 })));
    expect(root.classList.contains("is-hot")).toBe(true);
    expect(root.querySelector<HTMLElement>("[data-drop]")!.style.transform).toContain("translate3d");
    act(() => root.dispatchEvent(new MouseEvent("pointerdown", { bubbles: true, clientX: 48, clientY: 36 })));
    expect(root.classList.contains("is-pressed")).toBe(true);
    expect(root.classList.contains("is-absorbing")).toBe(true);
    const drop = root.querySelector<HTMLElement>("[data-drop]")!;
    expect(drop.style.borderRadius).toBe("50%");
    expect(drop.style.transform).toMatch(/scale\(([0-9.]+), \1\)/);
    expect(drop.style.transform).toContain("rotate(0.000rad)");
    act(() => root.dispatchEvent(new MouseEvent("pointerup", { bubbles: true })));
    expect(root.classList.contains("is-pressed")).toBe(false);
    act(() => root.dispatchEvent(new MouseEvent("pointerleave", { bubbles: true })));
    expect(root.classList.contains("is-hot")).toBe(true);
  });
  it("flips image cells away from the top left and keeps the uploaded fit", () => {
    mount("image-reveal");
    const frame = document.querySelector<HTMLElement>("[data-fit]")!;
    expect(frame.querySelector("p")!.textContent).toBe("Reveal New Arrival");
    expect(frame.querySelectorAll("[data-cell]")).toHaveLength(24);
    expect(frame.getAttribute("data-fit")).toBe("fill");
    expect(frame.style.getPropertyValue("--cols")).toBe("6");
    expect(frame.style.getPropertyValue("--rows")).toBe("4");
    const css = document.querySelector("style")!.textContent!;
    expect(css).toContain("rotateX(-76deg)");
    expect(css).toContain("background-size: 100% 100%");
    expect(css).toContain("var(--reveal-ink");
    expect(document.querySelector(".lk-variant-option legend")!.textContent).toBe("글자색");
    expect(document.querySelector(".lk-controls")!.firstElementChild).toBe(document.querySelector(".lk-variant-option"));
    expect(frame.style.getPropertyValue("--reveal-ink")).toBe("#64748b");
    expect(frame.querySelector<HTMLElement>("[data-cell]")!.style.getPropertyValue("--i")).toBe("3");
    expect(css.match(/transition-delay: calc\(var\(--i\) \* var\(--reveal-step\)\)/g)).toHaveLength(2);
    selectOption("fit", "cover");
    expect(document.querySelector("[data-fit]")!.getAttribute("data-fit")).toBe("cover");
    fill(inputOption("columns"), "3");
    fill(inputOption("rows"), "2");
    const next = document.querySelector<HTMLElement>("[data-fit]")!;
    expect(next.querySelectorAll("[data-cell]")).toHaveLength(6);
    expect(next.style.getPropertyValue("--cols")).toBe("3");
    expect(next.querySelector<HTMLElement>("[data-cell]")!.style.getPropertyValue("--x")).toBe("0");
    expect(next.querySelectorAll<HTMLElement>("[data-cell]")[3]!.style.getPropertyValue("--y")).toBe("1");
    expect(next.querySelectorAll<HTMLElement>("[data-cell]")[3]!.style.getPropertyValue("--i")).toBe("0");
    expect(document.querySelectorAll(".lk-direction button")).toHaveLength(9);
    click('.lk-direction button[data-direction="e"]');
    const directed = document.querySelector<HTMLElement>("[data-fit]")!;
    expect(directed.querySelector<HTMLElement>("[data-cell]")!.style.getPropertyValue("--i")).toBe("0");
    expect(directed.querySelectorAll<HTMLElement>("[data-cell]")[2]!.style.getPropertyValue("--i")).toBe("2");
    click('.lk-direction button[data-direction="center"]');
    expect(document.querySelector<HTMLElement>("[data-cell]")!.style.getPropertyValue("--i")).toBe("1");
    click('.lk-direction button[data-direction="nw"]');
    expect(document.querySelectorAll<HTMLElement>("[data-cell]")[4]!.style.getPropertyValue("--i")).toBe("1");
    click('[aria-label="accent-500"]');
    expect(document.querySelector<HTMLElement>("[data-fit]")!.style.getPropertyValue("--reveal-ink")).toBe("#64748b");
  });
});
