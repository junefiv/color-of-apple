// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { act, type ComponentType } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it } from "vitest";
import { BookingApp, BookingWeb } from "../src/components/preview/genres/booking-preview";
import { useMatchuStore } from "../src/lib/store";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
// The phone frame measures itself; jsdom has no ResizeObserver.
globalThis.ResizeObserver ??= class { observe() {} unobserve() {} disconnect() {} } as unknown as typeof ResizeObserver;

// Client render, so the locale set on the store applies (a server render reads the initial state).
function mount(Sample: ComponentType) {
  const host = document.createElement("div");
  document.body.append(host);
  const root: Root = createRoot(host);
  act(() => root.render(<Sample />));
  return {
    host,
    unmount() {
      act(() => root.unmount());
      host.remove();
    },
  };
}
function render(Sample: ComponentType) {
  const view = mount(Sample);
  const html = view.host.innerHTML, text = view.host.textContent ?? "";
  view.unmount();
  return { html, text };
}
const ariaLabels = (html: string) => [...html.matchAll(/aria-label="([^"]*)"/g)].map((m) => m[1]).join(" ");
function click(el: Element | null | undefined) {
  if (!el) throw new Error("element not found");
  act(() => (el as HTMLElement).click());
}
function type(el: Element | null, value: string) {
  const input = el as HTMLInputElement;
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!;
  act(() => {
    setter.call(input, value);
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
}
const byText = (root: ParentNode, selector: string, text: string) => [...root.querySelectorAll(selector)].find((el) => el.textContent?.includes(text));

describe("booking sample", () => {
  afterEach(() => useMatchuStore.setState({ locale: "ko" }));

  it("renders the Korean web page and app screen", () => {
    const web = render(BookingWeb).text;
    for (const copy of ["둘러보기", "내 예약", "저장함", "오늘 저녁, 어디서 만날까요?", "한식", "와인바", "온기 한식당", "오늘 예약 가능", "마감 임박", "웨이팅", "28,000원"]) expect(web).toContain(copy);
    const app = render(BookingApp).text;
    for (const copy of ["지금 예약 가능", "내 주변 식당", "홈", "지도", "예약", "마이"]) expect(app).toContain(copy);
  });

  it("has no Korean left in the English web page or app screen", () => {
    useMatchuStore.setState({ locale: "en" });
    const web = render(BookingWeb);
    expect(web.text).toContain("Where shall we meet tonight?");
    expect(web.text).toContain("₩28,000");
    const app = render(BookingApp);
    expect(app.text).toContain("Open right now");
    for (const { html, text } of [web, app]) {
      expect(text).not.toMatch(/[가-힣]/);
      // aria-labels are read aloud, so they follow the locale too.
      expect(ariaLabels(html)).not.toMatch(/[가-힣]/);
    }
  });

  it("books a table on the web with validation, then lists it under my bookings", () => {
    const view = mount(BookingWeb);
    const host = view.host;
    click(byText(host, ".book-card-link", "온기 한식당"));
    const dialog = host.querySelector('[role="dialog"]')!;
    expect(dialog.getAttribute("aria-label")).toBe("온기 한식당");
    // Past dates are disabled; Monday (closed) is marked.
    expect(dialog.querySelector<HTMLButtonElement>('[aria-label="9월 20일 (일), 지난 날짜"]')!.disabled).toBe(true);
    expect(dialog.querySelector<HTMLButtonElement>('[aria-label="9월 28일 (월), 정기 휴무"]')!.disabled).toBe(true);
    // Lunch on "today" (after 14:10) is already past.
    expect(dialog.querySelector<HTMLButtonElement>('.book-slot[aria-label^="11:30"]')!.disabled).toBe(true);
    const next = byText(dialog, "button", "다음") as HTMLButtonElement;
    expect(next.disabled).toBe(true);
    click(dialog.querySelector(".book-slot.is-open:not(:disabled), .book-slot.is-few:not(:disabled)"));
    expect(next.disabled).toBe(false);
    click(next);
    click(dialog.querySelector('button[type="submit"]'));
    expect(dialog.textContent).toContain("휴대폰 번호를 010-1234-5678 형식으로 입력해 주세요.");
    type(dialog.querySelector('input[inputmode="tel"]'), "010-2345-6789");
    click(dialog.querySelector('input[type="checkbox"]'));
    click(dialog.querySelector('button[type="submit"]'));
    expect(dialog.textContent).toMatch(/예약이 확정됐어요!|예약을 요청했어요/);
    expect(host.querySelector('[role="status"]')!.textContent).toMatch(/예약/);
    click(byText(dialog, "button", "내 예약 보기"));
    expect(host.querySelector('[role="dialog"]')).toBeNull();
    expect(host.querySelector('[role="tabpanel"]')!.textContent).toContain("온기 한식당");
    view.unmount();
  });

  it("cancels with a confirm step and writes a review in the app", () => {
    const view = mount(BookingApp);
    const host = view.host;
    click(byText(host, ".book-tabbar button", "예약"));
    const panel = host.querySelector('[role="tabpanel"]')!;
    expect(panel.textContent).toContain("확정");
    expect(panel.textContent).toContain("대기");
    click(byText(panel, "button", "예약 취소"));
    const confirm = host.querySelector('[role="dialog"]')!;
    expect(confirm.textContent).toContain("예약을 취소할까요?");
    click(byText(confirm, ".book-danger-solid", "예약 취소"));
    click(byText(host, '[role="tab"]', "지난 예약"));
    expect(host.querySelector('[role="tabpanel"]')!.textContent).toContain("취소");
    click(byText(host, "button", "리뷰 쓰기"));
    const review = host.querySelector('[role="dialog"]')!;
    const submit = review.querySelector<HTMLButtonElement>('button[type="submit"]')!;
    expect(submit.disabled).toBe(true);
    click(review.querySelector('[role="radio"][aria-label="4점"]'));
    expect(submit.disabled).toBe(false);
    click(submit);
    expect(host.textContent).toContain("4점 · 리뷰 작성 완료");
    view.unmount();
  });

  it("paints only with palette tokens", () => {
    const css = readFileSync("src/components/preview/genres/booking-preview.css", "utf8");
    expect(css).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
    expect(css).not.toMatch(/rgba?\(|hsla?\(/);
    // Every rule is scoped to the sample.
    const selectors = css.replace(/\/\*[\s\S]*?\*\//g, "").replace(/@keyframes[^{]+\{(?:[^{}]*\{[^}]*\})*[^}]*\}/g, "").match(/(^|[{}])\s*([^{}@]+)\{/g) ?? [];
    expect(selectors.length).toBeGreaterThan(100);
    for (const raw of selectors) {
      // Drop the leading brace and any :is(...)/:not(...) arguments so only top-level commas split.
      // :where(.book) keeps the reset scoped with no specificity, so it counts as .book.
      const selector = raw.replace(/^[{}]?\s*/, "").replace(/\{$/, "").replace(/:where\(\.book\)/g, ".book").replace(/\([^)]*\)/g, "").trim();
      for (const part of selector.split(",")) expect(part.trim(), part).toMatch(/^\.book/);
    }
  });
});
