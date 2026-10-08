// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { LibraryCatalog } from "@/components/preview/library/library-catalog";
import { CalendarDemo } from "@/components/preview/library/input-demos";
import { useMatchuStore } from "@/lib/store";

let host: HTMLDivElement;
let root: Root;
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  useMatchuStore.setState({ locale: "ko" });
  host = document.createElement("div"); document.body.append(host); root = createRoot(host);
});
afterEach(() => { act(() => root.unmount()); host.remove(); vi.unstubAllGlobals(); });
function mount(style: "cushion" | "ink") { act(() => root.render(createElement(LibraryCatalog, { style }))); }
function click(selector: string) { const button = host.querySelector<HTMLButtonElement>(selector)!; expect(button).not.toBeNull(); act(() => button.click()); }
function fill(input: HTMLInputElement, value: string) {
  act(() => { Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(input, value); input.dispatchEvent(new Event("input", { bubbles: true })); });
}

describe("interactive UI library previews", () => {
  it.each(["cushion", "ink"] as const)("renders every requested demo in %s without blank examples", style => {
    mount(style);
    const examples = Array.from(host.querySelectorAll(".lk-example"));
    expect(examples).toHaveLength(69);
    expect(new Set(examples.map(example => example.getAttribute("data-component"))).size).toBe(69);
    for (const example of examples) expect(example.querySelector(".lk-example-body")!.children.length).toBeGreaterThan(0);
  });
  it("groups related controls and removes obsolete standalone cards", () => {
    mount("cushion");
    for (const id of ["password", "search", "radio", "switch", "combobox", "upload", "badge", "avatar-group"]) expect(host.querySelector(`[data-component="${id}"]`)).toBeNull();
    expect(host.querySelectorAll('[data-component="input"] input')).toHaveLength(3);
    const choices = host.querySelector('[data-component="checkbox"]')!;
    expect(choices.querySelectorAll('input[type="radio"]')).toHaveLength(2);
    const checkbox = choices.querySelector<HTMLInputElement>('input[type="checkbox"]:not([role])')!;
    act(() => checkbox.click());
    expect(checkbox.checked).toBe(true);
    expect(choices.querySelector<HTMLInputElement>('[role="switch"]')!.checked).toBe(false);
    expect(host.querySelectorAll('[data-component="avatar"] .lk-avatar')).toHaveLength(5);
  });
  it.each(["cushion", "ink"] as const)("enters OTP digits sequentially, pastes and backspaces in %s", style => {
    mount(style);
    const inputs = Array.from(host.querySelectorAll<HTMLInputElement>('[data-component="otp"] input'));
    inputs[0].focus();
    for (let index = 0; index < 6; index++) {
      expect(inputs[index].value).toBe("");
      fill(inputs[index], String(index + 1));
      expect(document.activeElement).toBe(inputs[Math.min(index + 1, 5)]);
    }
    expect(inputs.map(input => input.value).join("")).toBe("123456");
    expect(host.querySelector('[data-component="otp"] output')?.textContent).toBe("입력 완료");
    fill(inputs[5], "");
    act(() => inputs[5].dispatchEvent(new KeyboardEvent("keydown", { key: "Backspace", bubbles: true })));
    expect(inputs[4].value).toBe("");
    expect(document.activeElement).toBe(inputs[4]);
    act(() => {
      const event = new Event("paste", { bubbles: true, cancelable: true });
      Object.defineProperty(event, "clipboardData", { value: { getData: () => "a987654" } });
      inputs[0].dispatchEvent(event);
    });
    expect(inputs.map(input => input.value).join("")).toBe("987654");
  });
  it("navigates the shared calendar and returns the selected ISO date", () => {
    const onSelect = vi.fn();
    act(() => root.render(createElement(CalendarDemo, { ko: true, value: "2024-02-01", onSelect })));
    expect(host.querySelectorAll(".lk-calendar button")).toHaveLength(29);
    click('[aria-label="2024-02-29"]');
    expect(onSelect).toHaveBeenCalledWith("2024-02-29");
    click('[aria-label="다음 달"]');
    expect(host.querySelectorAll(".lk-calendar button")).toHaveLength(31);
    expect(host.querySelector('[aria-label="2024-03-31"]')).not.toBeNull();
  });
  it("filters the catalog and finds a component by either language", () => {
    mount("ink");
    const search = host.querySelector<HTMLInputElement>(".lk-catalog-search input")!;
    fill(search, "장바구니");
    expect(host.querySelectorAll(".lk-example")).toHaveLength(1);
    expect(host.querySelector(".lk-example")?.getAttribute("data-component")).toBe("cart");
    fill(search, "calendar"); expect(host.querySelector(".lk-example")?.getAttribute("data-component")).toBe("calendar");
    fill(search, "not-a-component"); expect(host.querySelector("[role=status]")?.textContent).toContain("일치하는");
  });
  it("updates cart totals and disables checkout after removing the item", () => {
    mount("cushion");
    click('[data-component="cart"] [aria-label="Increase quantity"]');
    expect(host.querySelector('[data-component="cart"]')?.textContent).toContain("24,000");
    click('[data-component="cart"] [aria-label="Remove item"]');
    const buttons = host.querySelectorAll<HTMLButtonElement>('[data-component="cart"] button');
    expect(buttons[buttons.length - 1].disabled).toBe(true);
    expect(host.querySelector('[data-component="cart"] output')?.textContent).toBe("0");
  });
  it("filters real table rows and reverses score order", () => {
    mount("ink");
    const table = host.querySelector('[data-component="data-table"]')!;
    expect(table.querySelector("tbody tr td")?.textContent).toBe("Sam");
    click('[data-component="data-table"] button');
    expect(table.querySelector("tbody tr td")?.textContent).toBe("June");
    fill(table.querySelector("input")!, "Designer");
    expect(table.querySelectorAll("tbody tr")).toHaveLength(2);
  });
  it("opens the demo dialog and confirms a deletion without modifying other demos", () => {
    mount("cushion");
    const dialog = host.querySelector<HTMLDialogElement>('[data-component="confirm"] dialog')!;
    dialog.showModal = () => { dialog.open = true; };
    dialog.close = () => { dialog.open = false; };
    click('[data-component="confirm"] > .lk-example-body > .lk-stack > button');
    expect(dialog.open).toBe(true);
    act(() => (Array.from(dialog.querySelectorAll("button")).find(button => button.textContent === "Confirm")!).click());
    expect(dialog.open).toBe(false);
    expect(host.querySelector('[data-component="confirm"] [role="status"]')?.textContent).toContain("삭제");
    expect(host.querySelector('[data-component="cart"] output')?.textContent).toBe("1");
  });
});
