// @vitest-environment jsdom

import { Activity, act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ColorApple } from "@/components/flow/color-apple";
import { Hero } from "@/components/landing/hero";
import { HomePageFallback } from "@/components/landing/home-page-fallback";
import { APPLE_HEX } from "@/lib/picked-color";
import { useMatchuStore } from "@/lib/store";

const { push } = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));
vi.mock("@/components/auth/auth-provider", () => ({
  useAuth: () => ({ user: { uid: "test-user" }, signIn: vi.fn() }),
}));
vi.mock("@/lib/firebase/data", () => ({
  consumeQuota: vi.fn().mockResolvedValue({ used: 1, limit: 5 }),
  isPlanRequiredError: () => false,
  quotaErrorMessage: () => "quota error",
}));
vi.mock("react-colorful", () => ({
  HexColorPicker: ({ onChange }: { onChange: (hex: string) => void }) =>
    createElement("button", { onClick: () => onChange("#3388FF"), "data-testid": "pick-blue" }, "Blue"),
}));

let root: Root;
let container: HTMLDivElement;

beforeEach(() => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  useMatchuStore.setState(useMatchuStore.getInitialState(), true);
  useMatchuStore.getState().hydrate({ input: { ...useMatchuStore.getState().input, hex: "#3388FF" } });
  push.mockClear();
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
});

afterEach(async () => {
  await act(() => root.unmount());
  container.remove();
});

function appleColor() {
  return container.querySelector<HTMLElement>('[data-testid="color-apple"]')?.style.getPropertyValue("--apple");
}

async function chooseBlue() {
  await act(() => container.querySelector<HTMLButtonElement>('[data-testid="color-apple"]')!.click());
  await act(() => document.querySelector<HTMLButtonElement>('[data-testid="pick-blue"]')!.click());
  expect(appleColor()).toBe("#3388FF");
  await act(() => document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" })));
}

describe("home apple", () => {
  it("uses the same artwork during loading and after hydration", () => {
    const fallback = document.createElement("div");
    fallback.innerHTML = renderToStaticMarkup(createElement(HomePageFallback));
    const interactive = document.createElement("div");
    interactive.innerHTML = renderToStaticMarkup(createElement(ColorApple, { hex: APPLE_HEX, onChange: () => {} }));
    const artwork = (element: HTMLElement) => {
      const svg = element.querySelector("svg")!;
      const filterId = svg.querySelector("filter")!.id;
      return svg.outerHTML.replaceAll(filterId, "apple-texture");
    };
    expect(artwork(fallback)).toBe(artwork(interactive));
    expect(fallback.querySelector("svg circle")).toBeNull();
  });

  it("starts red even with a saved color and sends the newly selected color to results", async () => {
    await act(() => root.render(createElement(Hero)));
    expect(appleColor()).toBe(APPLE_HEX);
    await chooseBlue();
    await act(async () => {
      container.querySelector<HTMLButtonElement>(".match-button")!.click();
      await Promise.resolve();
    });
    expect(push).toHaveBeenCalledWith("/result");
    expect(useMatchuStore.getState().input.hex).toBe("#3388FF");
  });

  it("resets on remount and cached-route reactivation", async () => {
    const page = (mode: "visible" | "hidden") => createElement(Activity, { mode, children: createElement(Hero) });
    await act(() => root.render(page("visible")));
    await chooseBlue();
    await act(() => root.render(page("hidden")));
    await act(() => root.render(page("visible")));
    expect(appleColor()).toBe(APPLE_HEX);
    await chooseBlue();
    await act(() => root.render(null));
    await act(() => root.render(page("visible")));
    expect(appleColor()).toBe(APPLE_HEX);
  });

  it("resets when the browser restores the document from its back-forward cache", async () => {
    await act(() => root.render(createElement(Hero)));
    await chooseBlue();
    await act(() => window.dispatchEvent(new PageTransitionEvent("pageshow", { persisted: true })));
    expect(appleColor()).toBe(APPLE_HEX);
  });
});
