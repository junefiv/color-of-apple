// @vitest-environment jsdom

import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Workbench } from "@/components/workbench/workbench";
import { AccountButton } from "@/components/auth/account-sheet";
import { GiftSupportButton } from "@/components/billing/gift-support-button";
import { ProjectLimitError } from "@/lib/firebase/data";
import { useMatchuStore } from "@/lib/store";

const mocks = vi.hoisted(() => ({
  capacity: vi.fn(), save: vi.fn(), remove: vi.fn(), push: vi.fn(), replace: vi.fn(), error: vi.fn(), info: vi.fn(),
  user: { uid: "test-user", displayName: "Test" }, profile: { plan: "free" },
}));

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: mocks.push, replace: mocks.replace }) }));
vi.mock("@/components/auth/auth-provider", () => ({
  useAuth: () => ({ user: mocks.user, profile: mocks.profile, loading: false, signIn: vi.fn(), signOut: vi.fn() }),
}));
vi.mock("@/lib/analytics", () => ({ trackProductEvent: vi.fn() }));
vi.mock("@/components/ui/toast", () => ({ uiToast: { success: vi.fn(), error: mocks.error, info: mocks.info } }));
vi.mock("@/components/brand/site-header", () => ({ SiteHeader: () => null }));
// Keep the account action test independent of the menu's floating-position loop in jsdom.
vi.mock("@/components/ui/dropdown-menu", async () => {
  const React = await import("react");
  type MenuState = { open: boolean; onOpenChange: (open: boolean) => void };
  const Context = React.createContext<MenuState>({ open: false, onOpenChange: () => undefined });
  const group = ({ children }: { children: React.ReactNode }) => createElement("div", null, children);
  return {
    DropdownMenu: ({ children, ...state }: MenuState & { children: React.ReactNode }) => createElement(Context.Provider, { value: state }, children),
    DropdownMenuTrigger: ({ children, ...props }: React.ComponentProps<"button">) => {
      const state = React.useContext(Context);
      return createElement("button", { ...props, onClick: () => state.onOpenChange(!state.open) }, children);
    },
    DropdownMenuContent: ({ children }: { children: React.ReactNode }) => React.useContext(Context).open ? createElement("div", null, children) : null,
    DropdownMenuGroup: group,
    DropdownMenuLabel: group,
    DropdownMenuSeparator: () => createElement("hr"),
    DropdownMenuItem: ({ children, variant, ...props }: React.ComponentProps<"button"> & { variant?: string }) => createElement("button", { ...props, "data-variant": variant }, children),
  };
});
vi.mock("@/components/preview/preview-canvas", () => ({ PreviewCanvas: () => null }));
vi.mock("@/components/workbench/palette-controls", () => ({ PaletteControls: () => null }));
vi.mock("@/components/flow/palette-picker", () => ({ PalettePicker: () => null }));
vi.mock("@/components/workbench/token-panel", () => ({
  TokenPanel: ({ onSave, onUpgradePlan }: { onSave: () => void; onUpgradePlan: () => void }) => createElement("div", null,
    createElement("button", { onClick: onSave }, "Save test colorbook"),
    createElement("button", { onClick: onUpgradePlan }, "Explore test Pro"),
  ),
}));
vi.mock("@/lib/firebase/data", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/lib/firebase/data")>();
  return {
    ...original,
    hasAvailableProjectSlot: mocks.capacity,
    saveProject: mocks.save,
    deleteProject: mocks.remove,
    subscribeProjects: (_uid: string, onValue: (projects: unknown[]) => void) => {
      onValue(Array.from({ length: original.FREE_PROJECT_LIMIT }, (_, index) => ({
        id: `slot-${index + 1}`, title: `기존 컬러북 ${index + 1}`,
        input: useMatchuStore.getState().input, selectedPaletteId: useMatchuStore.getState().selectedPaletteId,
        overrides: {}, tokenSnapshot: {}, colorHistory: [],
      })));
      return () => undefined;
    },
  };
});

let root: Root;
let container: HTMLDivElement;

function button(text: string) {
  const matches = Array.from(document.querySelectorAll<HTMLButtonElement>("button")).filter(element => element.textContent?.trim() === text);
  expect(matches.length, `button: ${text}`).toBe(1);
  return matches[0];
}

async function click(text: string) {
  await act(async () => button(text).click());
}

async function enterName(name: string) {
  const input = document.querySelector<HTMLInputElement>('input[placeholder="예: 브랜드 메인 컬러"]')!;
  expect(input).not.toBeNull();
  await act(() => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(input, name);
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
}

beforeEach(() => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  vi.clearAllMocks();
  mocks.capacity.mockResolvedValue(false);
  mocks.save.mockReset().mockResolvedValue("slot-1");
  mocks.remove.mockReset().mockResolvedValue(undefined);
  vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })));
  useMatchuStore.setState(useMatchuStore.getInitialState(), true);
  useMatchuStore.setState({ hydrated: true, hasMatched: true, matchStage: "done" });
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
});

afterEach(async () => {
  await act(() => root.unmount());
  container.remove();
  vi.unstubAllGlobals();
});

describe("upgrade and colorbook management", () => {
  it("shows Pro pricing and benefits in the first limit dialog alongside cleanup", async () => {
    await act(async () => root.render(createElement(Workbench)));
    await click("Save test colorbook");
    expect(document.body.textContent).toContain("저장 공간이 가득 찼어요");
    expect(button("기존 컬러북 정리하기")).toBeDefined();
    expect(mocks.remove).not.toHaveBeenCalled();
    expect(document.querySelector("table")?.textContent).toContain("Free");
    expect(document.querySelector("table")?.textContent).toContain("최대 5개");
    expect(document.querySelector("table")?.textContent).toContain("무제한");
    expect(document.querySelector("table")?.textContent).toContain("광고 제거");
    expect(document.body.textContent).toContain("₩990/ 월 · 예정");
    expect(document.body.textContent).not.toContain("Pro 혜택 보기");
    const rows = Array.from(document.querySelectorAll("tbody tr"));
    for (const name of ["팔레트 생성", "공유 링크", "파일 다운로드"]) {
      const row = rows.find(element => element.textContent?.includes(name))!;
      const values = row.querySelectorAll("td");
      expect(values[0].textContent).toBe(values[1].textContent);
    }
    expect(document.body.textContent).not.toContain("Pro 플랜은 출시 준비 중이에요");
    expect(document.body.textContent).not.toContain("현재는 결제하거나 업그레이드할 수 없어요.");
    expect(document.body.textContent).not.toContain("현재는 모든 플랜에서 광고가 표시되지 않아요.");
    expect(Array.from(document.querySelectorAll("button")).some(element => element.textContent?.trim() === "닫기")).toBe(false);
    await click("플랜 결제하기");
    expect(mocks.info).toHaveBeenCalled();
    expect(mocks.save).not.toHaveBeenCalled();
    await click("기존 컬러북 정리하기");
    expect(document.body.textContent).toContain("기존 컬러북 1");
    expect(mocks.save).not.toHaveBeenCalled();
    expect(mocks.push).not.toHaveBeenCalled();
  });

  it("confirms deletion and resumes a raced save with its name and draft intact", async () => {
    mocks.capacity.mockResolvedValue(true);
    mocks.save.mockRejectedValueOnce(new ProjectLimitError());
    await act(async () => root.render(createElement(Workbench)));
    await click("Save test colorbook");
    await enterName("작성 중인 새 컬러북");
    await click("저장");
    expect(document.body.textContent).toContain("저장 공간이 가득 찼어요");
    await click("기존 컬러북 정리하기");
    await act(() => {
      const project = Array.from(document.querySelectorAll("article")).find(element => element.textContent?.includes("기존 컬러북 1"))!;
      Array.from(project.querySelectorAll<HTMLButtonElement>("button")).find(element => element.textContent?.trim() === "이 컬러북 선택")!.click();
    });
    expect(mocks.remove).not.toHaveBeenCalled();
    await click("삭제 후 새 컬러북 저장");
    expect(mocks.remove).toHaveBeenCalledWith("test-user", "slot-1");
    expect(document.querySelector<HTMLInputElement>("input")?.value).toBe("작성 중인 새 컬러북");
    await click("저장");
    expect(mocks.save).toHaveBeenCalledTimes(2);
    expect(mocks.save.mock.calls[1][0]).toEqual(mocks.save.mock.calls[0][0]);
  });

  it("keeps the cleanup screen open when deletion fails and does not start saving", async () => {
    mocks.remove.mockRejectedValue(new Error("offline"));
    await act(async () => root.render(createElement(Workbench)));
    await click("Save test colorbook");
    await click("기존 컬러북 정리하기");
    await act(() => document.querySelector<HTMLButtonElement>('[aria-label="저장한 컬러 삭제"]')!.click());
    await click("취소");
    expect(mocks.remove).not.toHaveBeenCalled();
    await act(() => document.querySelector<HTMLButtonElement>('[aria-label="저장한 컬러 삭제"]')!.click());
    await click("삭제 후 새 컬러북 저장");
    expect(mocks.error).toHaveBeenCalled();
    expect(document.body.textContent).toContain("저장한 컬러를 삭제할까요?");
    expect(document.querySelector("input")).toBeNull();
    expect(mocks.save).not.toHaveBeenCalled();
  });

  it("does not interrupt updates to an existing colorbook with a capacity check", async () => {
    await act(async () => root.render(createElement(Workbench, { projectId: "slot-1", initialProjectTitle: "기존 컬러북" })));
    await click("Save test colorbook");
    expect(mocks.capacity).not.toHaveBeenCalled();
    expect(document.body.textContent).toContain("저장한 컬러 수정");
    await click("변경 내용 저장");
    expect(mocks.save).toHaveBeenCalledWith(expect.objectContaining({ projectId: "slot-1" }));
    expect(document.body.textContent).not.toContain("저장 공간이 가득 찼어요");
  });

  it("allows management from the folder Pro link without starting a new save", async () => {
    await act(async () => root.render(createElement(Workbench)));
    await click("Explore test Pro");
    await click("기존 컬러북 정리하기");
    await act(() => document.querySelector<HTMLButtonElement>('[aria-label="저장한 컬러 삭제"]')!.click());
    await click("영구 삭제");
    expect(mocks.remove).toHaveBeenCalled();
    expect(document.querySelector("input")).toBeNull();
    expect(mocks.save).not.toHaveBeenCalled();
  });

  it("opens the plan comparison from the account menu without leaving the work", async () => {
    await act(() => root.render(createElement(AccountButton)));
    await act(() => document.querySelector<HTMLButtonElement>('[aria-label="계정 메뉴"]')!.click());
    await click("플랜 업그레이드₩990/월");
    expect(document.body.textContent).toContain("Pro에서는 무엇이 달라지나요?");
    expect(mocks.push).not.toHaveBeenCalled();
  });

  it("opens gift support separately and updates the one-time amount when a gift changes", async () => {
    await act(() => root.render(createElement(GiftSupportButton)));
    await act(() => document.querySelector<HTMLButtonElement>('[aria-label="개발자에게 선물하기"]')!.click());
    expect(document.body.textContent).toContain("실제 상품이 배송되지는 않아요.");
    expect(document.querySelector('[aria-live="polite"]')?.textContent).toBe("₩4,700");
    const pen = document.querySelector<HTMLInputElement>('input[value="pen"]')!;
    await act(() => pen.click());
    expect(pen.checked).toBe(true);
    expect(document.querySelector('[aria-live="polite"]')?.textContent).toBe("₩1,000");
    const burger = document.querySelector<HTMLInputElement>('input[value="big-mac"]')!;
    await act(() => burger.click());
    expect(burger.checked).toBe(true);
    expect(pen.checked).toBe(false);
    expect(document.querySelector('[aria-live="polite"]')?.textContent).toBe("₩5,700");
    await click("선물 보내기");
    expect(mocks.info).toHaveBeenCalledWith("선물 후원 결제 연동을 준비하고 있어요.", "ko");
    expect(mocks.save).not.toHaveBeenCalled();
    expect(mocks.push).not.toHaveBeenCalled();
    expect(document.querySelector("table")).toBeNull();
  });
});
