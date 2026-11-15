// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { act, type ComponentType } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it } from "vitest";
import { TravelApp, TravelWeb } from "../src/components/preview/genres/travel-preview";
import { useMatchuStore } from "../src/lib/store";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
// The phone frame measures itself; jsdom has no ResizeObserver.
globalThis.ResizeObserver ??= class { observe() {} unobserve() {} disconnect() {} } as unknown as typeof ResizeObserver;

// Client render so the locale set on the store applies, and so tests can click through flows.
function mount(Sample: ComponentType) {
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  act(() => root.render(<Sample />));
  return {
    host,
    click(el: Element | null | undefined) { if (!el) throw new Error("element not found"); act(() => { (el as HTMLElement).click(); }); },
    button(label: string | RegExp) {
      return [...host.querySelectorAll("button")].find((b) => typeof label === "string" ? (b.getAttribute("aria-label") ?? b.textContent ?? "").includes(label) : label.test(b.getAttribute("aria-label") ?? b.textContent ?? ""));
    },
    unmount() { act(() => root.unmount()); host.remove(); },
  };
}
function render(Sample: ComponentType) {
  const view = mount(Sample);
  const html = view.host.innerHTML, text = view.host.textContent ?? "";
  view.unmount();
  return { html, text };
}
const ariaLabels = (html: string) => [...html.matchAll(/aria-label="([^"]*)"/g)].map((m) => m[1]).join(" ");

describe("travel sample (nadeul.)", () => {
  afterEach(() => useMatchuStore.setState({ locale: "ko" }));

  it("renders the Korean web page with search, stays, filters and map", () => {
    const { text, html } = render(TravelWeb);
    for (const s of ["nadeul", "숙소", "여행 일정", "저장함", "예약 내역", "목적지", "체크인 – 체크아웃", "성인 2명", "바다결 리조트", "189,000원", "특가", "무료 취소", "마감 임박", "한옥", "캠핑", "숙소 10곳"]) expect(text).toContain(s);
    expect(html).toContain('class="trip trip-web"');
    expect(html).toContain("trip-pin");
    expect(html).toContain("10월 3일 (토) – 10월 5일 (월)");
  });

  it("renders the Korean app screen with bottom tabs", () => {
    const { text, html } = render(TravelApp);
    expect(html).toContain('class="trip trip-app"');
    for (const s of ["탐색", "지도", "여행", "저장", "마이", "이번 주 특가", "추천 숙소"]) expect(text).toContain(s);
  });

  it("has no Korean left in the English web page or app screen", () => {
    useMatchuStore.setState({ locale: "en" });
    const web = render(TravelWeb), app = render(TravelApp);
    expect(web.text).toContain("This autumn, stay somewhere you love");
    expect(web.text).toContain("₩189,000");
    expect(web.text).toContain("Sat, Oct 3 – Mon, Oct 5");
    expect(app.text).toContain("Deals this week");
    for (const { html, text } of [web, app]) {
      expect(text).not.toMatch(/[가-힣]/);
      expect(ariaLabels(html)).not.toMatch(/[가-힣]/);
    }
  });

  it("keeps every web view and the stay detail free of Korean in English", () => {
    useMatchuStore.setState({ locale: "en" });
    const view = mount(TravelWeb);
    for (const tab of ["Trips", "Saved", "Bookings"]) {
      view.click([...view.host.querySelectorAll(".trip-nav button")].find((b) => b.textContent?.includes(tab)));
      expect(view.host.textContent).not.toMatch(/[가-힣]/);
      expect(ariaLabels(view.host.innerHTML)).not.toMatch(/[가-힣]/);
    }
    expect(view.host.textContent).toContain("Awaiting payment");
    expect(view.host.textContent).toContain("Cancelled");
    view.click(view.button("Stays"));
    view.click(view.host.querySelector(".trip-card-open"));
    const dialog = view.host.querySelector('[role="dialog"]');
    expect(dialog?.textContent).toContain("Choose a room");
    expect(dialog?.textContent).toMatch(/Total/);
    expect(dialog?.textContent).not.toMatch(/[가-힣]/);
    expect(ariaLabels(dialog!.innerHTML)).not.toMatch(/[가-힣]/);
    view.unmount();
  });

  it("filters, saves and walks the reserve flow with validation", () => {
    const view = mount(TravelWeb);
    view.click([...view.host.querySelectorAll(".trip-chip")].find((b) => b.textContent === "한옥"));
    expect(view.host.querySelectorAll(".trip-grid .trip-card")).toHaveLength(2);
    view.click(view.button("담장 한옥 저장 취소"));
    expect(view.host.textContent).toContain("저장함에서 뺐어요");
    view.click(view.host.querySelector(".trip-card-open"));
    const dialog = () => view.host.querySelector('[role="dialog"]')!;
    expect(dialog().querySelector("input[type=radio]:disabled")).not.toBeNull(); // sold-out room
    view.click([...dialog().querySelectorAll("button")].find((b) => b.textContent === "예약하기"));
    view.click([...dialog().querySelectorAll("button")].find((b) => b.textContent?.includes("결제하고 예약")));
    expect(dialog().querySelectorAll('[aria-invalid="true"]').length).toBeGreaterThan(0);
    expect(dialog().textContent).toContain("이름을 2자 이상 입력해 주세요.");
    view.unmount();
  });

  it("adds and removes itinerary stops", () => {
    const view = mount(TravelWeb);
    view.click(view.button("여행 일정"));
    const before = view.host.querySelectorAll(".trip-stop").length;
    view.click(view.button("체크아웃 일정에서 삭제"));
    expect(view.host.querySelectorAll(".trip-stop")).toHaveLength(before - 1);
    view.unmount();
  });

  it("paints only with palette tokens", () => {
    const css = readFileSync("src/components/preview/genres/travel-preview.css", "utf8");
    expect(css).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
    expect(css).not.toMatch(/\brgba?\(|\bhsla?\(/);
    // Every selector is scoped under .trip so nothing leaks into the host app.
    const selectors = (css.replace(/\/\*[\s\S]*?\*\//g, "").match(/[^{}]+\{/g) ?? [])
      .map((rule) => rule.slice(0, -1).trim()).filter((rule) => !rule.startsWith("@"));
    expect(selectors.flatMap((rule) => rule.split(/,(?![^(]*\))/)).map((sel) => sel.trim()).filter((sel) => !/^(\.trip\b|:where\(\.trip\)|from$|to$)/.test(sel))).toEqual([]);
  });
});
