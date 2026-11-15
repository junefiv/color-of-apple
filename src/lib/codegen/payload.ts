import { validImageData } from "@/lib/image-data";
import { validLayoutDocument } from "@/lib/page-layout";
import type { ExportPayload } from "./generate";

// Checks a browser-sent export request before any generation runs. Images arrive once each and
// are referenced as `coa-image:N` in the markup and the layout, so the layout is validated with
// its images put back.
export const EXPORT_LIMITS = { markup: 3_000_000, css: 1_500_000, tokens: 3000, images: 80, title: 80 };

const str = (v: unknown, max: number) => typeof v === "string" && v.length <= max;

export function parseExportPayload(value: unknown): ExportPayload | null {
  if (!value || typeof value !== "object") return null;
  const v = value as Record<string, unknown>;
  if (!["react", "html", "markdown"].includes(v.format as string) || !["web", "app"].includes(v.platform as string)) return null;
  if (!str(v.title, EXPORT_LIMITS.title) || !str(v.font, 400) || !str(v.css, EXPORT_LIMITS.css) || !str(v.mobile, EXPORT_LIMITS.markup)) return null;
  if (v.desktop !== undefined && (v.platform !== "web" || !str(v.desktop, EXPORT_LIMITS.markup))) return null;
  const tokens = v.tokens;
  if (!tokens || typeof tokens !== "object" || Array.isArray(tokens)) return null;
  const entries = Object.entries(tokens as Record<string, unknown>);
  if (entries.length > EXPORT_LIMITS.tokens || !entries.every(([k, t]) => /^--[\w-]{1,80}$/.test(k) && str(t, 200) && !/[;{}<]/.test(t as string))) return null;
  if (!Array.isArray(v.images) || v.images.length > EXPORT_LIMITS.images || !v.images.every(src => src !== "" && validImageData(src))) return null;
  const images = v.images as string[];
  let doc: unknown;
  try { doc = JSON.parse(JSON.stringify(v.doc ?? null).replace(/coa-image:(\d+)/g, (m, i: string) => images[Number(i)] ?? m)); } catch { return null; }
  if (!validLayoutDocument(doc)) return null;
  return { format: v.format as ExportPayload["format"], platform: v.platform as ExportPayload["platform"], title: v.title as string, font: v.font as string,
    css: v.css as string, mobile: v.mobile as string, desktop: v.desktop as string | undefined, tokens: tokens as Record<string, string>, images,
    // Generation works from references again; the layout was only checked with real images.
    doc: v.doc as ExportPayload["doc"] };
}
