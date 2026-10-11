import type { LibraryItemId } from "./catalog";

export type SettingValue = string | number | boolean;
export type ComponentOptions = Record<string, SettingValue>;
export type Setting = {
  key: string; kind: "select" | "boolean" | "number" | "text" | "color";
  initial: SettingValue; values?: readonly string[]; min?: number; max?: number;
};
const select = (key: string, values: readonly string[], initial = values[0]): Setting => ({ key, kind: "select", values, initial });
const bool = (key: string): Setting => ({ key, kind: "boolean", initial: false });
const text = (key: string, initial = ""): Setting => ({ key, kind: "text", initial });
const number = (key: string, initial: number, min?: number, max?: number): Setting => ({ key, kind: "number", initial, min, max });
const size = select("size", ["small", "medium", "large"], "medium");
export const VARIANT_FAMILIES = ["primary", "secondary", "accent", "neutral"] as const;
export const VARIANT_STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900] as const;
export const VARIANTS = VARIANT_FAMILIES.flatMap(family => VARIANT_STEPS.map(step => `${family}-${step}`));
const variant = select("variant", VARIANTS, "primary-500");
const shape = select("shape", ["pill", "square"]);
const disabled = bool("disabled");
const label = text("label", "Apple");
const placement = select("placement", ["top", "bottom", "left", "right", "start", "end"], "bottom");
const bounds = [number("min", 0), number("max", 100), number("step", 1, 0.001)];

// Jelly UI v1.1 showcase controls; sample values are distinct from API defaults.
export const COMPONENT_SETTINGS: Record<LibraryItemId, readonly Setting[]> = {
  button: [variant, size, shape, disabled, bool("block")],
  "icon-button": [variant, size, select("shape", ["square", "circle"]), disabled, label],
  checkbox: [bool("checked"), bool("indeterminate"), variant, size, disabled],
  input: [text("placeholder", "Your name"), text("value"), select("type", ["text", "email", "password", "search", "number", "tel", "url"]), size, disabled, bool("readonly")],
  label: [bool("required"), size],
  otp: [number("length", 6, 1, 12), variant, size, disabled],
  radio: [{ ...bool("checked"), initial: true }, variant, size, disabled],
  "radio-group": [select("direction", ["horizontal", "vertical"]), size, text("label", "Plan")],
  range: [number("low", 20), number("high", 75), ...bounds, variant, size, disabled],
  segmented: [select("value", ["day", "week", "month"], "month"), size, disabled],
  select: [select("value", ["", "kiwi", "fig", "plum"], ""), variant, size, disabled],
  slider: [number("value", 50), ...bounds, variant, size, disabled],
  switch: [bool("checked"), variant, size, disabled],
  textarea: [text("placeholder", "Write a note..."), text("value"), number("rows", 2, 1, 12), size, disabled, bool("readonly")],
  alert: [select("tone", ["info", "success", "warning", "danger"]), bool("dismissible"), size],
  badge: [variant, size, bool("outline"), shape, bool("live"), bool("instant")],
  progress: [number("value", 60, 0), number("max", 100, 1), bool("indeterminate"), variant, size],
  skeleton: [select("shape", ["line", "rect", "square", "circle"])],
  spinner: [select("type", ["dots", "blob"]), variant, size],
  toaster: [select("position", ["top", "bottom"])],
  accordion: [bool("single"), size],
  card: [bool("squish"), size],
  chip: [bool("selected"), bool("selectable"), bool("removable"), variant, shape, size, disabled],
  collapsible: [bool("open"), size],
  divider: [select("direction", ["horizontal", "vertical"]), text("content", "OR"), size],
  kbd: [text("key", "Enter"), size],
  breadcrumbs: [size],
  pagination: [number("total", 12, 1, 10000), number("page", 3, 1), { ...size, initial: "small" }],
  resizable: [select("direction", ["horizontal", "vertical", "both"])],
  tabs: [select("value", ["overview", "activity", "settings"], "overview"), size],
  dialog: [bool("open"), text("label", "Workspace")],
  drawer: [bool("open"), text("label", "Navigation"), select("side", ["end", "start", "right", "left", "bottom"])],
  menu: [placement, size],
  popover: [placement, size, text("label", "Options")],
  tooltip: [text("text", "Copy link"), { ...placement, initial: "top" }, size],
};

export function defaultOptions(id: LibraryItemId): ComponentOptions {
  return Object.fromEntries(COMPONENT_SETTINGS[id].map(setting => [setting.key, setting.initial]));
}

export function updateOptions(id: LibraryItemId, previous: ComponentOptions, key: string, value: SettingValue): ComponentOptions {
  if (["length", "rows", "total", "page"].includes(key) && typeof value === "number") value = Math.max(1, Math.trunc(value));
  const next = { ...previous, [key]: value };
  if (id === "range" || id === "slider") {
    if (Number(next.max) <= Number(next.min)) {
      if (key === "min") next.max = Number(next.min) + Number(next.step);
      else next.min = Number(next.max) - Number(next.step);
    }
    const clamp = (v: SettingValue) => Math.max(Number(next.min), Math.min(Number(next.max), Number(v)));
    if (id === "slider") next.value = clamp(next.value);
    else {
      next.low = clamp(next.low); next.high = clamp(next.high);
      if (Number(next.low) > Number(next.high)) {
        if (key === "low") next.high = next.low;
        else next.low = next.high;
      }
    }
  }
  if (id === "pagination") next.page = Math.max(1, Math.min(Number(next.total), Number(next.page)));
  if (id === "progress") next.value = Math.min(Number(next.max), Number(next.value));
  return next;
}
