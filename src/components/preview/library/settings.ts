import type { LibraryItemId } from "./catalog";
import { REVEAL_DIRECTIONS, REVEAL_FITS, revealCount, revealImage, DEFAULT_REVEAL_IMAGE } from "./reveal";
export type SettingValue = string | number | boolean;
export type ComponentOptions = Record<string, SettingValue>;
export type Setting = { key: string; kind: "select" | "boolean" | "text" | "number" | "image" | "direction"; initial: SettingValue; values?: readonly string[]; min?: number; max?: number };
export const VARIANT_FAMILIES = ["primary", "secondary", "accent", "neutral"] as const;
export const VARIANT_STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900] as const;
export const VARIANTS = VARIANT_FAMILIES.flatMap(family => VARIANT_STEPS.map(step => family + "-" + step));
export const SLIME_DURATIONS = ["100ms", "200ms", "300ms", "400ms", "500ms", "600ms", "700ms", "800ms", "900ms"] as const;
export const COMPONENT_SETTINGS: Record<LibraryItemId, readonly Setting[]> = {
  "fold-button": [
    { key: "label", kind: "text", initial: "Peel off" },
    { key: "variant", kind: "select", values: VARIANTS, initial: "primary-500" },
    { key: "size", kind: "select", values: ["small", "medium", "large"], initial: "medium" },
    { key: "disabled", kind: "boolean", initial: false },
    { key: "block", kind: "boolean", initial: false },
  ],
  "slime-toggle": [
    { key: "on", kind: "boolean", initial: true },
    { key: "variant", kind: "select", values: VARIANTS, initial: "primary-500" },
    { key: "size", kind: "select", values: ["small", "medium", "large"], initial: "medium" },
    { key: "duration", kind: "select", values: SLIME_DURATIONS, initial: "500ms" },
  ],
  "glass-drop": [
    { key: "label", kind: "text", initial: "Raindrop" },
    { key: "variant", kind: "select", values: VARIANTS, initial: "primary-500" },
    { key: "size", kind: "select", values: ["small", "medium", "large"], initial: "medium" },
  ],
  "image-reveal": [
    { key: "label", kind: "text", initial: "Reveal New Arrival" },
    { key: "variant", kind: "select", values: VARIANTS, initial: "primary-500" },
    { key: "image", kind: "image", initial: "" },
    { key: "fit", kind: "select", values: REVEAL_FITS, initial: "fill" },
    { key: "direction", kind: "direction", values: REVEAL_DIRECTIONS, initial: "n" },
    { key: "columns", kind: "number", initial: 6, min: 1, max: 12 },
    { key: "rows", kind: "number", initial: 4, min: 1, max: 12 },
  ],
};
export function defaultOptions(id: LibraryItemId): ComponentOptions {
  return Object.fromEntries(COMPONENT_SETTINGS[id].map(setting => [setting.key, setting.initial]));
}
export function updateOptions(id: LibraryItemId, previous: ComponentOptions, key: string, value: SettingValue): ComponentOptions {
  const setting = COMPONENT_SETTINGS[id].find(setting => setting.key === key);
  if (!setting || (setting.values && !setting.values.includes(String(value)))) return previous;
  if (setting.kind === "boolean" && typeof value !== "boolean") return previous;
  if (setting.kind === "number") {
    const next = revealCount(value, Number(setting.initial));
    return { ...previous, [key]: next };
  }
  if (setting.kind === "image") {
    if (value === "") return { ...previous, [key]: "" };
    if (typeof value !== "string" || revealImage(value) === DEFAULT_REVEAL_IMAGE) return previous;
    return { ...previous, [key]: value };
  }
  return { ...previous, [key]: value };
}
