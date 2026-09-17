import { en } from "./en";
import { ko, type Copy } from "./ko";

export type Locale = "ko" | "en";

export const dictionaries: Record<Locale, Copy> = { ko, en };

export function interpolate(template: string, values: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key] ?? ""));
}

export type { Copy };
