// @vitest-environment jsdom
import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { RefreshProvider, useRefresh } from "@/components/refresh-provider";

let root: Root;
let container: HTMLDivElement;
let refresh: ReturnType<typeof useRefresh>;
function Editor() {
  refresh = useRefresh();
  return createElement("input", { defaultValue: "palette edit" });
}
beforeEach(async () => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  vi.useFakeTimers();
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
  await act(() => root.render(createElement(RefreshProvider, null, createElement(Editor))));
});
afterEach(async () => {
  await act(() => root.unmount());
  container.remove();
  vi.useRealTimers();
});

it("shows a visible refresh state for instant changes while retaining the editor", async () => {
  const editor = container.querySelector("input")!;
  editor.value = "unsaved custom color";
  let pending!: Promise<number>;
  await act(async () => { pending = refresh.runRefresh("Switching to English…", () => 42); });
  expect(document.querySelector('[role="status"]')?.textContent).toBe("Switching to English…");
  expect(container.querySelector("[inert]")).not.toBeNull();
  await act(async () => { await vi.advanceTimersByTimeAsync(500); });
  expect(await pending).toBe(42);
  expect(container.querySelector("input")).toBe(editor);
  expect(editor.value).toBe("unsaved custom color");
  expect(document.querySelector('[role="status"]')).toBeNull();
});

it("removes the loading screen after a failed or cancelled action", async () => {
  let pending!: Promise<unknown>;
  await act(async () => {
    pending = refresh.runRefresh("Signing in…", () => Promise.reject(new Error("cancelled"))).catch(error => error);
  });
  await act(async () => { await vi.advanceTimersByTimeAsync(500); });
  expect(await pending).toBeInstanceOf(Error);
  expect(document.querySelector('[role="status"]')).toBeNull();
  expect(container.querySelector("[inert]")).toBeNull();
});
