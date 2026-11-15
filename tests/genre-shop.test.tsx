// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { act, type ComponentType } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it } from "vitest";
import { ShopApp, ShopWeb } from "../src/components/preview/genres/shop-preview";
import { useMatchuStore } from "../src/lib/store";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
// The phone frame measures itself; jsdom has no ResizeObserver.
globalThis.ResizeObserver ??= class { observe() {} unobserve() {} disconnect() {} } as unknown as typeof ResizeObserver;

let mounted: { host: HTMLDivElement; root: Root } | null = null;

// Client render, so the locale set on the store applies (a server render reads the initial state).
function mount(Sample: ComponentType) {
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  act(() => root.render(<Sample />));
  mounted = { host, root };
  return host;
}
function render(Sample: ComponentType) {
  const host = mount(Sample);
  const html = host.innerHTML, text = host.textContent ?? "";
  unmount();
  return { html, text };
}
function unmount() {
  if (!mounted) return;
  const { host, root } = mounted;
  act(() => root.unmount());
  host.remove();
  mounted = null;
}
function button(host: HTMLElement, label: string | RegExp) {
  const match = (value: string | null) => value != null && (typeof label === "string" ? value.trim() === label : label.test(value));
  const found = Array.from(host.querySelectorAll("button")).find((b) => match(b.getAttribute("aria-label")) || match(b.textContent));
  if (!found) throw new Error(`No button ${label}`);
  return found;
}
function click(element: HTMLElement) { act(() => element.click()); }
function type(input: HTMLInputElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!;
  act(() => { setter.call(input, value); input.dispatchEvent(new Event("input", { bubbles: true })); });
}
const ariaLabels = (html: string) => [...html.matchAll(/aria-label="([^"]*)"/g)].map((m) => m[1]).join(" ");

describe("shop sample", () => {
  afterEach(() => { unmount(); useMatchuStore.setState({ locale: "ko" }); });

  it("renders the Korean web shop with products, tags and won prices", () => {
    const { text } = render(ShopWeb);
    expect(text).toContain("loom");
    expect(text).toContain("오늘의 셀렉션");
    expect(text).toContain("울 블렌드 싱글 코트");
    expect(text).toContain("151,200원");
    expect(text).toContain("20%");
    expect(text).toContain("BEST");
    expect(text).toContain("품절");
  });

  it("renders the Korean app with bottom tabs", () => {
    const { text, html } = render(ShopApp);
    for (const label of ["홈", "카테고리", "위시", "장바구니", "마이"]) expect(text).toContain(label);
    expect(text).toContain("지금 많이 찾는");
    expect(html).toContain("shop-tabbar");
  });

  it("has no Korean left in the English web page or app screen", () => {
    useMatchuStore.setState({ locale: "en" });
    for (const { html, text } of [render(ShopWeb), render(ShopApp)]) {
      expect(text).toContain("Wool-blend single coat");
      expect(text).toContain("₩");
      expect(text).not.toMatch(/[가-힣]/);
      expect(ariaLabels(html)).not.toMatch(/[가-힣]/);
    }
  });

  it("keeps English through the detail, cart and checkout overlays", () => {
    useMatchuStore.setState({ locale: "en" });
    const host = mount(ShopWeb);
    click(button(host, /Wool-blend single coat/));
    expect(host.textContent).toContain("Add to cart");
    click(button(host, "Close"));
    click(button(host, /^Cart, /));
    expect(host.textContent).toContain("Add ₩18,000 more for free shipping");
    click(button(host, /Check out/));
    expect(host.textContent).toContain("Where should we send it?");
    expect(host.textContent).not.toMatch(/[가-힣]/);
    expect(ariaLabels(host.innerHTML)).not.toMatch(/[가-힣]/);
  });

  it("adds a sized product to the cart and walks through checkout", () => {
    const host = mount(ShopWeb);
    expect(button(host, /^장바구니, /).getAttribute("aria-label")).toBe("장바구니, 1개");
    click(button(host, /울 블렌드 싱글 코트/));
    const dialog = host.querySelector<HTMLElement>('[role="dialog"]')!;
    expect(dialog).not.toBeNull();
    // Sold-out sizes cannot be picked; adding without a size asks for one.
    expect(button(dialog, /XL/).disabled).toBe(true);
    click(button(dialog, "장바구니 담기"));
    expect(dialog.textContent).toContain("사이즈를 먼저 선택해 주세요.");
    click(button(dialog, "M"));
    click(button(dialog, "수량 늘리기"));
    click(button(dialog, "장바구니 담기"));
    expect(host.querySelector('[role="status"]')?.textContent).toContain("장바구니에 담았어요");
    click(button(dialog, "장바구니 보기"));
    expect(button(host, /^장바구니, /).getAttribute("aria-label")).toBe("장바구니, 3개");
    expect(host.textContent).toContain("무료배송 조건을 채웠어요");

    click(button(host, /주문하기/));
    click(button(host, "결제 수단 선택"));
    expect(host.textContent).toContain("확인이 필요한 항목이 3개 있어요.");
    const input = (name: string) => host.querySelector<HTMLInputElement>(`input[name="${name}"]`)!;
    expect(input("phone").getAttribute("aria-invalid")).toBe("true");
    type(input("name"), "김지우");
    type(input("phone"), "010-1234-5678");
    type(input("address"), "서울시 성동구 왕십리로 1");
    click(button(host, "결제 수단 선택"));
    expect(host.textContent).toContain("결제 수단");
    click(button(host, /결제하기$/));
    expect(host.textContent).toContain("결제하려면 주문 내용 확인에 동의해 주세요.");
    click(host.querySelector<HTMLInputElement>('input[name="agree"]')!);
    click(button(host, /결제하기$/));
    expect(host.textContent).toContain("주문이 완료됐어요");
    expect(button(host, /^장바구니, /).getAttribute("aria-label")).toBe("장바구니, 0개");

    click(button(host, "주문 내역 보기"));
    expect(host.textContent).toContain("LM-2611-0455");
    expect(host.querySelectorAll(".shop-status-info").length).toBeGreaterThan(0);
    expect(host.querySelectorAll(".shop-status-danger").length).toBeGreaterThan(0);
  });

  it("filters to an empty state and resets", () => {
    const host = mount(ShopWeb);
    type(host.querySelector<HTMLInputElement>('input[type="search"]')!, "없는상품");
    expect(host.textContent).toContain("조건에 맞는 상품이 없어요");
    click(button(host, "필터 초기화"));
    expect(host.textContent).toContain("울 블렌드 싱글 코트");
  });

  it("opens a product panel and adds to cart in the app", () => {
    const host = mount(ShopApp);
    click(button(host, /스톤웨어 머그 2P/));
    expect(host.querySelector('[role="dialog"]')).not.toBeNull();
    click(button(host, "장바구니 담기"));
    click(button(host, "장바구니 보기"));
    expect(host.textContent).toContain("64,000원");
    expect(host.textContent).toContain("무료배송 조건을 채웠어요");
  });

  it("paints only with palette tokens", () => {
    const css = readFileSync("src/components/preview/genres/shop-preview.css", "utf8");
    expect(css).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
    expect(css).not.toMatch(/\brgba?\(|\bhsla?\(/);
    // Every class selector is namespaced so nothing leaks into the rest of the app.
    const classes = [...css.replace(/var\([^)]*\)/g, "").matchAll(/\.([a-zA-Z][\w-]*)/g)].map((m) => m[1]);
    expect(classes.filter((name) => name !== "shop" && !name.startsWith("shop-") && !name.startsWith("is-"))).toEqual([]);
  });
});
