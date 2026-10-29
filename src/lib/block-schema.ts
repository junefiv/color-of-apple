import { int, oneOf, record, text } from "./config-check";
import { headerIcons } from "./header-config";
import { validImageData } from "./image-data";

// Most builder components after the first six are described by a field schema instead of hand-written
// types: the schema drives their settings panel, validation of stored layouts, preset application,
// click-to-edit focus and image drops. Each one only adds its own preview frame and styles.
export type Opt = readonly [string, string];
export type Field =
  | { key: string; type: "text"; label: string; max: number; multiline?: boolean; placeholder?: string }
  | { key: string; type: "select" | "segment"; label: string; options: readonly Opt[] }
  | { key: string; type: "range"; label: string; min: number; max: number; step?: number; unit?: string }
  | { key: string; type: "check"; label: string }
  | { key: string; type: "image"; label: string; max?: number }
  | { key: string; type: "surface" | "accent" | "icon"; label: string }
  | { key: string; type: "list"; label: string; max: number; min?: number; title: string; add: string; item: Field[]; make: (i: number) => Config };
export type Config = Record<string, unknown>;
export type SchemaSection = { part: string; title: string; note?: string; fields: Field[]; show?: (c: Config) => boolean };
export type BlockPreset = { key: string; name: string; note: string; config: Config };
export type BlockPlace = "flow" | "overlay";
export type BlockSpec = { kind: string; name: string; group: string; note: string; place: BlockPlace; sections: SchemaSection[]; defaults: () => Config; presets: BlockPreset[] };

// Field builders keep the specs short.
export const t = (key: string, label: string, max: number, extra: { multiline?: boolean; placeholder?: string } = {}): Field => ({ key, type: "text", label, max, ...extra });
export const sel = (key: string, label: string, options: readonly Opt[]): Field => ({ key, type: "select", label, options });
export const seg = (key: string, label: string, options: readonly Opt[]): Field => ({ key, type: "segment", label, options });
export const rng = (key: string, label: string, min: number, max: number, step = 1, unit = "px"): Field => ({ key, type: "range", label, min, max, step, unit });
export const chk = (key: string, label: string): Field => ({ key, type: "check", label });
export const img = (key: string, label: string, max = 1600): Field => ({ key, type: "image", label, max });
export const surface = (label = "배경"): Field => ({ key: "surface", type: "surface", label });
export const accent = (label = "강조 컬러"): Field => ({ key: "accent", type: "accent", label });
export const icon = (key = "icon", label = "아이콘"): Field => ({ key, type: "icon", label });
export const list = (key: string, label: string, item: Field[], make: (i: number) => Config, opts: { max?: number; min?: number; title?: string; add?: string } = {}): Field =>
  ({ key, type: "list", label, item, make, max: opts.max ?? 8, min: opts.min ?? 1, title: opts.title ?? item[0].key, add: opts.add ?? "항목 추가" });

const surfaces = ["surface", "subtle", "primary", "secondary", "inverse"];
function validField(field: Field, value: unknown): boolean {
  switch (field.type) {
    case "text": return text(value, field.max);
    case "select": case "segment": return oneOf(value, field.options.map(o => o[0]));
    case "range": return int(value, field.min, field.max);
    case "check": return typeof value === "boolean";
    case "image": return validImageData(value);
    case "surface": return oneOf(value, surfaces);
    case "accent": return oneOf(value, ["primary", "secondary", "accent"]);
    case "icon": return oneOf(value, ["", ...headerIcons]);
    case "list": return Array.isArray(value) && value.length >= (field.min ?? 0) && value.length <= field.max
      && value.every(item => record(item) && field.item.every(f => item[f.key] === undefined || validField(f, item[f.key])));
  }
}
export const allFields = (spec: BlockSpec) => spec.sections.flatMap(s => s.fields);
// Stored settings may lack keys added later (the defaults fill them) but every present key must be valid.
export function validBlock(spec: BlockSpec, value: unknown): boolean {
  return record(value) && allFields(spec).every(f => value[f.key] === undefined || validField(f, value[f.key]));
}
export const withBlockDefaults = (spec: BlockSpec, config: Config | undefined): Config => ({ ...spec.defaults(), ...config });
// Presets reshape structure and color; the user's own copy, images, icons and lists stay unless the preset names them.
export function applyBlockPreset(spec: BlockSpec, config: Config | undefined, preset: BlockPreset): Config {
  const own = Object.fromEntries(allFields(spec).filter(f => ["text", "image", "list", "icon"].includes(f.type) && config?.[f.key] !== undefined).map(f => [f.key, config![f.key]]));
  return { ...spec.defaults(), ...own, ...preset.config };
}
// Settings section that edits a clicked part: a field key, or "list:index[:field]".
export function sectionOf(spec: BlockSpec, part: string): string | undefined {
  const key = part.split(":")[0];
  return spec.sections.find(s => s.fields.some(f => f.key === key))?.part;
}
// Writes an image into a key path ("hero" or "items:2:image") of a block's settings.
export function setImage(config: Config, path: string, src: string): Config {
  const [key, index, field] = path.split(":");
  if (index === undefined) return { ...config, [key]: src };
  const items = Array.isArray(config[key]) ? [...(config[key] as Config[])] : [];
  const i = Number(index);
  if (!items[i]) return config;
  items[i] = { ...items[i], [field ?? "image"]: src };
  return { ...config, [key]: items };
}
