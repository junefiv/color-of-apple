// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { act, type ComponentType } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it } from "vitest";
import { BudgetApp, BudgetWeb } from "../src/components/preview/budget-preview";
import { isPreviewGenre, useMatchuStore } from "../src/lib/store";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
// The phone frame measures itself; jsdom has no ResizeObserver.
globalThis.ResizeObserver ??= class { observe() {} unobserve() {} disconnect() {} } as unknown as typeof ResizeObserver;

// Client render, so the locale set on the store applies (a server render reads the initial state).
function render(Sample: ComponentType) {
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  act(() => root.render(<Sample />));
  const html = host.innerHTML, text = host.textContent ?? "";
  act(() => root.unmount());
  host.remove();
  return { html, text };
}

describe("budget sample", () => {
  afterEach(() => useMatchuStore.setState({ locale: "ko" }));
  it("renders in Korean", () => {
    const { text } = render(BudgetWeb);
    expect(text).toContain("작은 기록, 더 나은 내일");
    expect(text).toContain("553,200원");
  });
  it("has no Korean left in the English web page or app screen", () => {
    useMatchuStore.setState({ locale: "en" });
    for (const { html, text } of [render(BudgetWeb), render(BudgetApp)]) {
      expect(text).toContain("Small records, a better tomorrow");
      expect(text).not.toMatch(/[가-힣]/);
      // aria-labels are read aloud, so they follow the locale too.
      expect([...html.matchAll(/aria-label="([^"]*)"/g)].map(m => m[1]).join(" ")).not.toMatch(/[가-힣]/);
    }
  });
  it("paints only with palette tokens", () => {
    expect(readFileSync("src/components/preview/budget-preview.css", "utf8")).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
  });
  it("only accepts known genres from a saved draft", () => {
    expect(isPreviewGenre("travel")).toBe(true);
    expect(isPreviewGenre("crypto")).toBe(false);
  });
});
