// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_INPUT, ENGINE_VERSION } from "@/lib/color-engine";
import { PREVIEW_DRAFT_KEY, readPreviewDraft, writePreviewDraft } from "@/lib/preview-draft";
import { decodeShare } from "@/lib/share/encode";
import { useMatchuStore } from "@/lib/store";

const preview = {
  input: { ...DEFAULT_INPUT, hex: "#F15C5C" }, selectedPaletteId: "analog",
  overrides: { "primary.default": "#336699" },
  tokenSnapshot: { "primary.default": "#336699", "text.primary": "#111111" },
  platform: "app" as const, previewTab: "components" as const,
  projectTitle: "Edited palette", engineVersion: ENGINE_VERSION,
};

describe("preview refresh recovery", () => {
  beforeEach(() => { vi.restoreAllMocks(); sessionStorage.clear(); window.history.replaceState(null, "", "/result"); });
  it("recovers the chosen palette, edited primary and saved project after reload", () => {
    writePreviewDraft(preview, "project-1");
    const restored = readPreviewDraft();
    expect(restored?.projectId).toBe("project-1");
    expect(decodeShare(restored!.payload)).toEqual(preview);
  });
  it("clears the previous preview when generating a new palette or returning home", () => {
    writePreviewDraft(preview, null);
    useMatchuStore.getState().resetMatch();
    expect(readPreviewDraft()).toBeNull();
    writePreviewDraft(preview, null);
    useMatchuStore.getState().resetSession();
    expect(readPreviewDraft()).toBeNull();
  });
  it("ignores corrupted preview data", () => {
    sessionStorage.setItem(PREVIEW_DRAFT_KEY, JSON.stringify({ payload: "broken" }));
    expect(readPreviewDraft()).toBeNull();
    sessionStorage.setItem(PREVIEW_DRAFT_KEY, "{invalid");
    expect(readPreviewDraft()).toBeNull();
  });
  it("recovers edits on the same shared link without overriding a different link", () => {
    window.history.replaceState(null, "", "/result?d=first");
    writePreviewDraft(preview, null);
    expect(readPreviewDraft()).not.toBeNull();
    window.history.replaceState(null, "", "/result?d=second");
    expect(readPreviewDraft()).toBeNull();
  });
  it("keeps editing usable when browser storage is blocked", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("blocked"); });
    expect(() => writePreviewDraft(preview, null)).not.toThrow();
  });
});
