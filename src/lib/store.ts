"use client";

import { create } from "zustand";
import { DEFAULT_INPUT, type GenerateInput } from "@/lib/color-engine";
import type { Locale } from "@/lib/copy";
import type { MatchStage } from "@/lib/match-reveal";
import { FALLBACK_HEX } from "@/lib/picked-color";
import { DEFAULT_PALETTE_ID, resolvePaletteId } from "@/lib/space-palettes";
import { clearPreviewDraft } from "@/lib/preview-draft";

export type PreviewTab = "overview" | "components";
export type PlatformView = "web" | "app";

type Persisted = {
  locale: Locale;
  platform: PlatformView;
  previewTab: PreviewTab;
};

type HydrationInput = Partial<Persisted> & {
  // Accepted only so older callers/drafts remain type-compatible. Palette
  // data is deliberately ignored and is no longer written to localStorage.
  input?: GenerateInput;
  hasMatched?: boolean;
  matchedHex?: string | null;
  selectedPaletteId?: string;
  palettesRevealed?: boolean;
};

type MatchuState = Persisted & {
  input: GenerateInput;
  primaryDraftHex: string | null;
  hasMatched: boolean;
  matchedHex: string | null;
  selectedPaletteId: string;
  palettesRevealed: boolean;
  hydrated: boolean;
  skipLoader: boolean;
  pendingBleed: boolean;
  bleedKey: number;
  matchNonce: number;
  matchStage: MatchStage;
  setLocale: (locale: Locale) => void;
  setInput: (input: Partial<GenerateInput>) => void;
  setPrimaryDraftHex: (hex: string | null) => void;
  replaceInput: (input: GenerateInput) => void;
  setPlatform: (platform: PlatformView) => void;
  setPreviewTab: (tab: PreviewTab) => void;
  setSkipLoader: (value: boolean) => void;
  setPendingBleed: (value: boolean) => void;
  setMatchStage: (stage: MatchStage) => void;
  setSelectedPaletteId: (id: string) => void;
  setPalettesRevealed: (value: boolean) => void;
  completeMatch: (hex: string) => void;
  resetMatch: () => void;
  resetSession: () => void;
  hydrate: (value: HydrationInput) => void;
};

const STORAGE_KEY = "matchu:draft";

export const EMPTY_INPUT: GenerateInput = {
  ...DEFAULT_INPUT,
  hex: FALLBACK_HEX,
  previewTarget: "both",
};

export const useMatchuStore = create<MatchuState>((set) => ({
  locale: "ko",
  input: EMPTY_INPUT,
  primaryDraftHex: null,
  platform: "web",
  previewTab: "overview",
  hydrated: false,
  skipLoader: false,
  pendingBleed: false,
  bleedKey: 0,
  matchNonce: 0,
  hasMatched: false,
  matchedHex: null,
  matchStage: "idle",
  selectedPaletteId: DEFAULT_PALETTE_ID,
  palettesRevealed: false,
  setLocale: (locale) => set({ locale }),
  setPrimaryDraftHex: (primaryDraftHex) => set({ primaryDraftHex }),
  setInput: (input) =>
    set((state) => ({
      input: { ...state.input, ...input },
    })),
  replaceInput: (input) => set({ input }),
  setPlatform: (platform) => set({ platform }),
  setPreviewTab: (previewTab) => set({ previewTab }),
  setSkipLoader: (skipLoader) => set({ skipLoader }),
  setPendingBleed: (pendingBleed) => set({ pendingBleed }),
  setMatchStage: (matchStage) => set({ matchStage }),
  setSelectedPaletteId: (selectedPaletteId) => set({ selectedPaletteId: resolvePaletteId(selectedPaletteId) }),
  setPalettesRevealed: (palettesRevealed) => set({ palettesRevealed }),
  completeMatch: (hex) =>
    set((state) => ({
      hasMatched: true,
      matchedHex: hex,
      matchStage: "done",
      pendingBleed: true,
      bleedKey: state.bleedKey + 1,
    })),
  resetMatch: () => {
    clearPreviewDraft();
    set((state) => ({
      hasMatched: false,
      matchedHex: null,
      matchStage: "idle",
      skipLoader: false,
      pendingBleed: false,
      palettesRevealed: false,
      selectedPaletteId: DEFAULT_PALETTE_ID,
      matchNonce: state.matchNonce + 1,
    }));
  },
  resetSession: () => {
    clearPreviewDraft();
    set((state) => ({
      primaryDraftHex: null,
      input: EMPTY_INPUT,
      platform: "web",
      previewTab: "overview",
      skipLoader: false,
      pendingBleed: false,
      hasMatched: false,
      matchedHex: null,
      matchStage: "idle",
      selectedPaletteId: DEFAULT_PALETTE_ID,
      palettesRevealed: false,
      locale: state.locale,
    }));
  },
  hydrate: (value) =>
    set((state) => ({
      locale: value.locale ?? state.locale,
      platform: value.platform ?? state.platform,
      previewTab: value.previewTab === "components" ? "components" : state.previewTab,
      hydrated: true,
    })),
}));

export function readDraft(): HydrationInput | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as HydrationInput) : null;
  } catch {
    return null;
  }
}

export function writeDraft(state: MatchuState) {
  if (typeof window === "undefined") return;
  const draft: Persisted = {
    locale: state.locale,
    platform: state.platform,
    previewTab: state.previewTab,
  };
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
}

export { STORAGE_KEY };
