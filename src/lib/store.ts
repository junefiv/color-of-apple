"use client";

import { create } from "zustand";
import { DEFAULT_INPUT, type GenerateInput, type ThemeMode } from "@/lib/color-engine";
import type { Locale } from "@/lib/copy";
import type { MatchStage } from "@/lib/match-reveal";
import { FALLBACK_HEX } from "@/lib/picked-color";
import { DEFAULT_PALETTE_ID } from "@/lib/space-palettes";

export type PreviewTab = "overview" | "components";
export type PreviewKind =
  | "work"
  | "shop"
  | "finance"
  | "travel"
  | "community"
  | "education"
  | "health"
  | "media"
  | "food";
export type PlatformView = "web" | "app";

export const PREVIEW_KINDS: PreviewKind[] = [
  "work",
  "shop",
  "finance",
  "travel",
  "community",
  "education",
  "health",
  "media",
  "food",
];

export function normalizePreviewKind(value?: string): PreviewKind {
  return PREVIEW_KINDS.includes(value as PreviewKind) ? (value as PreviewKind) : "work";
}

type Persisted = {
  locale: Locale;
  input: GenerateInput;
  themeMode: ThemeMode;
  platform: PlatformView;
  previewTab: PreviewTab;
  previewKind: PreviewKind;
  hasMatched: boolean;
  matchedHex: string | null;
  selectedPaletteId: string;
  palettesRevealed: boolean;
};

type MatchuState = Persisted & {
  hydrated: boolean;
  skipLoader: boolean;
  pendingBleed: boolean;
  bleedKey: number;
  matchNonce: number;
  viewAllTokens: boolean;
  matchStage: MatchStage;
  setLocale: (locale: Locale) => void;
  setInput: (input: Partial<GenerateInput>) => void;
  replaceInput: (input: GenerateInput) => void;
  setThemeMode: (mode: ThemeMode) => void;
  setPlatform: (platform: PlatformView) => void;
  setPreviewTab: (tab: PreviewTab) => void;
  setPreviewKind: (kind: PreviewKind) => void;
  setViewAllTokens: (value: boolean) => void;
  setSkipLoader: (value: boolean) => void;
  setPendingBleed: (value: boolean) => void;
  setMatchStage: (stage: MatchStage) => void;
  setSelectedPaletteId: (id: string) => void;
  setPalettesRevealed: (value: boolean) => void;
  completeMatch: (hex: string) => void;
  resetMatch: () => void;
  resetSession: () => void;
  hydrate: (value: Partial<Persisted>) => void;
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
  themeMode: "light",
  platform: "web",
  previewTab: "overview",
  previewKind: "work",
  viewAllTokens: false,
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
  setInput: (input) =>
    set((state) => ({
      input: { ...state.input, ...input },
    })),
  replaceInput: (input) => set({ input }),
  setThemeMode: (themeMode) => set({ themeMode }),
  setPlatform: (platform) => set({ platform }),
  setPreviewTab: (previewTab) => set({ previewTab }),
  setPreviewKind: (previewKind) => set({ previewKind }),
  setViewAllTokens: (viewAllTokens) => set({ viewAllTokens }),
  setSkipLoader: (skipLoader) => set({ skipLoader }),
  setPendingBleed: (pendingBleed) => set({ pendingBleed }),
  setMatchStage: (matchStage) => set({ matchStage }),
  setSelectedPaletteId: (selectedPaletteId) => set({ selectedPaletteId }),
  setPalettesRevealed: (palettesRevealed) => set({ palettesRevealed }),
  completeMatch: (hex) =>
    set((state) => ({
      hasMatched: true,
      matchedHex: hex,
      matchStage: "done",
      pendingBleed: true,
      bleedKey: state.bleedKey + 1,
    })),
  resetMatch: () =>
    set((state) => ({
      hasMatched: false,
      matchedHex: null,
      matchStage: "idle",
      skipLoader: false,
      pendingBleed: false,
      palettesRevealed: false,
      selectedPaletteId: DEFAULT_PALETTE_ID,
      matchNonce: state.matchNonce + 1,
    })),
  resetSession: () =>
    set((state) => ({
      input: EMPTY_INPUT,
      themeMode: "light",
      platform: "web",
      previewTab: "overview",
      previewKind: "work",
      viewAllTokens: false,
      skipLoader: false,
      pendingBleed: false,
      hasMatched: false,
      matchedHex: null,
      matchStage: "idle",
      selectedPaletteId: DEFAULT_PALETTE_ID,
      palettesRevealed: false,
      locale: state.locale,
    })),
  hydrate: (value) =>
    set({
      ...value,
      hydrated: true,
      hasMatched: Boolean(value.hasMatched),
      matchedHex: value.matchedHex ?? null,
      matchStage: value.hasMatched ? "done" : "idle",
      selectedPaletteId: value.selectedPaletteId ?? DEFAULT_PALETTE_ID,
      palettesRevealed: Boolean(value.palettesRevealed),
      previewTab: value.previewTab === "components" ? "components" : "overview",
      previewKind: normalizePreviewKind(value.previewKind),
    }),
}));

export function readDraft(): Partial<Persisted> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Partial<Persisted>) : null;
  } catch {
    return null;
  }
}

export function writeDraft(state: MatchuState) {
  if (typeof window === "undefined") return;
  const draft: Persisted = {
    locale: state.locale,
    input: state.input,
    themeMode: state.themeMode,
    platform: state.platform,
    previewTab: state.previewTab,
    previewKind: state.previewKind,
    hasMatched: state.hasMatched,
    matchedHex: state.matchedHex,
    selectedPaletteId: state.selectedPaletteId,
    palettesRevealed: state.palettesRevealed,
  };
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
}

export { STORAGE_KEY };
