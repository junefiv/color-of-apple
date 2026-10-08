import {
  DEFAULT_INPUT,
  type AccessibilityTarget,
  type GenerateInput,
  type Mood,
  type NeutralStyle,
  type PreviewTarget,
  type SecondaryMode,
  type ThemeMode,
} from "@/lib/color-engine";
import type { CommunityPalette } from "./types";

const HEX = /^#[0-9A-F]{6}(?:[0-9A-F]{2})?$/;
const TOKEN_PATH = /^[a-z][a-zA-Z0-9]*(?:\.[a-zA-Z0-9]+)+$/;
const MOODS = new Set<Mood>(["balanced", "vivid", "soft", "calm", "bright", "highContrast"]);
const NEUTRALS = new Set<NeutralStyle>(["pure", "warm", "cool", "tinted"]);
const SECONDARY = new Set<SecondaryMode>(["monochrome", "analogous", "split", "complementary"]);
const MODES = new Set<ThemeMode>(["light", "dark"]);
const ACCESS = new Set<AccessibilityTarget>(["AA", "AAA"]);
const TARGETS = new Set<PreviewTarget>(["web", "app", "both"]);

export const PALETTE_DOTS = [
  { role: "primary", path: "primary.default" },
  { role: "secondary", path: "secondary.default" },
  { role: "accent", path: "accent.default" },
  { role: "surface", path: "surface.default" },
  { role: "text", path: "text.primary" },
] as const;

export type PaletteDot = {
  role: (typeof PALETTE_DOTS)[number]["role"];
  path: (typeof PALETTE_DOTS)[number]["path"];
  hex: string | null;
};

export function sanitizeColorMap(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(
    Object.entries(value)
      .slice(0, 256)
      .filter(([path, color]) => TOKEN_PATH.test(path) && typeof color === "string" && HEX.test(color.toUpperCase()))
      .map(([path, color]) => [path, (color as string).toUpperCase()]),
  );
}

export function sanitizeGenerateInput(value: unknown): GenerateInput | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const source = value as Partial<GenerateInput>;
  if (typeof source.hex !== "string" || !/^#?[0-9a-fA-F]{6}$/.test(source.hex.trim())) return null;
  if (!MOODS.has(source.mood as Mood)) return null;
  if (!NEUTRALS.has(source.neutralStyle as NeutralStyle)) return null;
  if (!SECONDARY.has(source.secondaryMode as SecondaryMode)) return null;
  if (!Array.isArray(source.modes) || source.modes.length === 0 || source.modes.some((mode) => !MODES.has(mode))) return null;
  if (!ACCESS.has(source.accessibilityTarget as AccessibilityTarget)) return null;
  if (typeof source.includeAccent !== "boolean") return null;
  if (!TARGETS.has(source.previewTarget as PreviewTarget)) return null;
  return {
    ...DEFAULT_INPUT,
    hex: source.hex.trim().startsWith("#") ? source.hex.trim().toUpperCase() : `#${source.hex.trim().toUpperCase()}`,
    mood: source.mood as Mood,
    neutralStyle: source.neutralStyle as NeutralStyle,
    secondaryMode: source.secondaryMode as SecondaryMode,
    modes: [...source.modes],
    accessibilityTarget: source.accessibilityTarget as AccessibilityTarget,
    includeAccent: source.includeAccent,
    previewTarget: source.previewTarget as PreviewTarget,
  };
}

export function paletteFromProject(data: Record<string, unknown>): CommunityPalette | null {
  const input = sanitizeGenerateInput(data.input);
  const selectedPaletteId = typeof data.selectedPaletteId === "string" ? data.selectedPaletteId.trim() : "";
  if (!input || selectedPaletteId.length < 1 || selectedPaletteId.length > 80) return null;
  const tokenSnapshot = sanitizeColorMap(data.tokenSnapshot);
  if (Object.keys(tokenSnapshot).length === 0) return null;
  return {
    input,
    selectedPaletteId,
    tokenSnapshot,
    overrides: sanitizeColorMap(data.overrides),
  };
}

export function paletteDots(snapshot: Record<string, string> | undefined): PaletteDot[] {
  return PALETTE_DOTS.map((dot) => {
    const raw = snapshot?.[dot.path];
    const hex = typeof raw === "string" && HEX.test(raw.toUpperCase()) ? raw.toUpperCase() : null;
    return { role: dot.role, path: dot.path, hex };
  });
}
