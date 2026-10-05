// @vitest-environment jsdom

import { act, createElement, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import { PaletteControls } from "@/components/workbench/palette-controls";
import { DEFAULT_INPUT, generateColorSystem } from "@/lib/color-engine";
import { appleCommentLines, colorsFromTheme } from "@/lib/color-commentary";

vi.mock("@/components/flow/palette-picker", () => ({ PalettePicker: () => null }));
vi.mock("@/components/workbench/primary-apple-picker", () => ({
  PrimaryApplePicker: ({ children }: { children: ReactNode }) => createElement("button", null, children),
}));
vi.mock("@/lib/match-reveal", () => ({ prefersReducedMotion: () => true }));

it("shows tailored commentary in the control card after color changes and undo", async () => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  vi.stubGlobal("ResizeObserver", class { observe() {} disconnect() {} });
  vi.useFakeTimers();
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  try {
    const original = generateColorSystem(DEFAULT_INPUT).semantic.light;
    const changed = { ...original, primary: { ...original.primary, default: "#ff015c" } };
    const render = (theme: typeof original, resetNonce: number, commentTheme = theme) => root.render(createElement(PaletteControls, {
      theme, commentTheme, resetNonce, locale: "ko", savedProject: false, onGenerate: vi.fn(),
    }));
    await act(() => render(original, 0));
    expect(container.querySelector('.palette-control-comment [role="note"]')).not.toBeNull();
    const prompt = container.querySelector('[role="note"]')?.textContent;
    await act(() => render(changed, 0, original));
    await act(() => vi.advanceTimersByTime(1000));
    expect(container.querySelector('[role="note"]')?.textContent).toBe(prompt);
    await act(() => render(original, 0));
    await act(() => vi.advanceTimersByTime(1000));
    expect(container.querySelector('[role="note"]')?.textContent).toBe(prompt);
    await act(() => render(changed, 0));
    await act(() => vi.advanceTimersByTime(650));
    expect(container.querySelector('[role="note"]')?.textContent).toBe(
      appleCommentLines(colorsFromTheme(changed), colorsFromTheme(original), { locale: "ko" }).join(" "),
    );
    await act(() => render(original, 1));
    await act(() => vi.advanceTimersByTime(650));
    expect(container.querySelector('[role="note"]')?.textContent).toBe(
      appleCommentLines(colorsFromTheme(original), colorsFromTheme(changed), { locale: "ko", reset: true }).join(" "),
    );
  } finally {
    await act(() => root.unmount());
    container.remove();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  }
});
