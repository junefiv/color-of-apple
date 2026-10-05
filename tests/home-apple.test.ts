// @vitest-environment jsdom

import { Activity, act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ColorApple } from "@/components/flow/color-apple";
import { PrimaryApplePicker } from "@/components/workbench/primary-apple-picker";
import { Wordmark } from "@/components/brand/wordmark";
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
  isPlanRequiredError: () => false,
  quotaErrorMessage: () => "quota error",
}));
vi.mock("react-colorful", () => ({
  HexColorPicker: ({ onChange }: { onChange: (hex: string) => void }) =>
    createElement("button", { onClick: () => onChange("#3388FF"), "data-testid": "pick-blue" }, "Blue"),
}));

let root: Root;
let container: HTMLDivElement;

it("generates a fresh palette directly from a project's current Primary", async () => {
  const onGenerate = vi.fn();
  await act(() => root.render(createElement(PrimaryApplePicker, { hex: "#ff015c", locale: "ko", savedProject: true, onGenerate })));
  const apple = container.querySelector<HTMLButtonElement>('[aria-label="이 Primary로 새 팔레트 만들기"]')!;
  expect(apple.hasAttribute("aria-haspopup")).toBe(false);
  await act(() => apple.click());
  expect(onGenerate).toHaveBeenCalledWith("#ff015c");
  expect(container.querySelector('[data-testid="pick-blue"]')).toBeNull();
});

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
  vi.useRealTimers();
  vi.restoreAllMocks();
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
  it("keeps a panel Primary selection as a draft until release and Generate", async () => {
    const generate = vi.fn();
    await act(() => root.render(createElement("div", null,
      createElement(Wordmark, { remake: true }),
      createElement(PrimaryApplePicker, { hex: "#f15c5c", locale: "ko", onGenerate: generate }),
    )));
    await act(() => container.querySelector<HTMLButtonElement>(".token-primary-apple")!.click());
    const picker = document.querySelector<HTMLButtonElement>('[data-testid="pick-blue"]')!;
    await act(() => picker.dispatchEvent(new Event("pointerdown", { bubbles: true })));
    await act(() => picker.click());
    expect(useMatchuStore.getState().primaryDraftHex).toBe("#3388FF");
    for (const apple of container.querySelectorAll<HTMLElement>(".logo-apple")) {
      expect(apple.style.getPropertyValue("--apple")).toBe("#3388FF");
    }
    expect(generate).not.toHaveBeenCalled();
    expect(document.querySelector(".primary-apple-generate-tip")).toBeNull();
    await act(() => document.dispatchEvent(new Event("pointerup", { bubbles: true })));
    await act(() => document.querySelector<HTMLButtonElement>(".primary-apple-generate-tip button")!.click());
    expect(generate).toHaveBeenCalledExactlyOnceWith("#3388FF");
    expect(document.querySelector(".primary-apple-popover")).toBeNull();
    expect(useMatchuStore.getState().primaryDraftHex).toBeNull();
  });

  it("dismisses a panel Primary draft without generating", async () => {
    const generate = vi.fn();
    await act(() => root.render(createElement(PrimaryApplePicker, { hex: "#f15c5c", locale: "ko", onGenerate: generate })));
    await act(() => container.querySelector<HTMLButtonElement>(".token-primary-apple")!.click());
    await act(() => document.querySelector<HTMLButtonElement>('[data-testid="pick-blue"]')!.click());
    await act(() => document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" })));
    expect(generate).not.toHaveBeenCalled();
    expect(document.querySelector(".primary-apple-popover")).toBeNull();
  });
  it("keeps the current color in flight and hops when the dice lands", async () => {
    vi.useFakeTimers();
    await act(() => root.render(createElement(Hero)));
    const apple = () => container.querySelector('[data-testid="color-apple"]')!;
    const artwork = apple().querySelector("svg");
    await act(() => container.querySelector<HTMLButtonElement>(".hero-random-button")!.click());
    expect(appleColor()).toBe(APPLE_HEX);
    await act(() => vi.advanceTimersByTime(779));
    expect(appleColor()).toBe(APPLE_HEX);
    await act(() => vi.advanceTimersByTime(1));
    expect(appleColor()).not.toBe(APPLE_HEX);
    expect(apple().getAttribute("data-hop")).toBe("true");
    expect(apple().querySelector("svg")).not.toBe(artwork);
    await act(() => vi.advanceTimersByTime(1900));
    expect(apple().getAttribute("data-hop")).toBe("false");
  });

  it("waits until the edited picker closes before hopping", async () => {
    vi.useFakeTimers();
    await act(() => root.render(createElement(Hero)));
    const apple = container.querySelector<HTMLButtonElement>('[data-testid="color-apple"]')!;
    await act(() => apple.click());
    await act(() => document.querySelector<HTMLButtonElement>('[data-testid="pick-blue"]')!.click());
    expect(appleColor()).toBe("#3388FF");
    expect(apple.getAttribute("data-hop")).toBe("false");
    await act(() => document.body.dispatchEvent(new Event("pointerdown", { bubbles: true })));
    expect(document.querySelector('[role="dialog"]')).toBeNull();
    expect(apple.getAttribute("data-hop")).toBe("true");
  });

  it("does not hop when the picker closes without a color change", async () => {
    vi.useFakeTimers();
    await act(() => root.render(createElement(Hero)));
    const apple = container.querySelector<HTMLButtonElement>('[data-testid="color-apple"]')!;
    await act(() => apple.click());
    await act(() => document.body.dispatchEvent(new Event("pointerdown", { bubbles: true })));
    expect(apple.getAttribute("data-hop")).toBe("false");
  });

  it("restarts the throw on repeated clicks and cancels it for picker edits", async () => {
    vi.useFakeTimers();
    await act(() => root.render(createElement(Hero)));
    const random = container.querySelector<HTMLButtonElement>(".hero-random-button")!;
    await act(() => random.click());
    await act(() => vi.advanceTimersByTime(400));
    await act(() => random.click());
    await act(() => vi.advanceTimersByTime(400));
    expect(appleColor()).toBe(APPLE_HEX);
    await chooseBlue();
    await act(() => vi.advanceTimersByTime(780));
    expect(appleColor()).toBe("#3388FF");
  });

  it("uses the same artwork during loading and after hydration", () => {
    const fallback = document.createElement("div");
    fallback.innerHTML = renderToStaticMarkup(createElement(HomePageFallback));
    const interactive = document.createElement("div");
    interactive.innerHTML = renderToStaticMarkup(createElement(ColorApple, { hex: APPLE_HEX, onChange: () => {} }));
    const artwork = (element: HTMLElement) => {
      const svg = element.querySelector(".color-apple svg")!;
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
