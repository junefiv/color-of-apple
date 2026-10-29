import { defaultHeader, validHeaderConfig, type HeaderConfig } from "./header-config";
import { defaultHero, validHeroConfig, type HeroConfig } from "./hero-config";
import { defaultFooter, validFooterConfig, type FooterConfig } from "./footer-config";
import { defaultCards, validCardsConfig, type CardsConfig } from "./cards-config";
import { defaultCta, validCtaConfig, type CtaConfig } from "./cta-config";
import { defaultFloating, validFloatingConfig, type FloatingConfig } from "./floating-config";
import { validImageData } from "./image-data";
import { BLOCK_KINDS, blockPadding, blockSpecs, specOf, type BlockKindName } from "./blocks";
import { validBlock, type Config } from "./block-schema";

export type Insets = [number, number, number, number];
export type LayoutStyle = {
  direction: "column" | "row" | "grid";
  gap: number;
  columns: number;
  align: "stretch" | "start" | "center" | "end";
  justify: "start" | "center" | "end" | "space-between";
  padding: Insets;
  margin: Insets;
  height: number;
  width: number;
  sizing: "fill" | "fixed";
  hidden: boolean;
};
// `bleed` lets a page-level layer ignore the contained page width and run edge to edge.
export type LayoutKind = "section" | "frame" | "header" | "hero" | "cards" | "cta" | "footer" | "floating" | BlockKindName;
export type LayoutNode = { id: string; name: string; kind: LayoutKind; desktop: LayoutStyle; mobile: Partial<LayoutStyle>; children: LayoutNode[]; bleed?: boolean;
  header?: HeaderConfig; hero?: HeroConfig; cards?: CardsConfig; cta?: CtaConfig; footer?: FooterConfig; floating?: FloatingConfig;
  // Settings of a schema-described block (src/lib/blocks.ts), keyed by its spec's fields.
  block?: Config };
// Component frames render their own content and sit at page level; they never take children.
export const componentKinds = ["header", "hero", "cards", "cta", "footer", "floating"] as const;
export const isComponentKind = (kind: LayoutKind) => (componentKinds as readonly string[]).includes(kind) || (BLOCK_KINDS as readonly string[]).includes(kind);
const configs = { header: [defaultHeader, validHeaderConfig], hero: [defaultHero, validHeroConfig], cards: [defaultCards, validCardsConfig], cta: [defaultCta, validCtaConfig], footer: [defaultFooter, validFooterConfig], floating: [defaultFloating, validFloatingConfig] } as const;
// How the PC page uses its width: edge to edge, a centered container with full-width backgrounds,
// or a mobile-first column (the phone layout centered on a backdrop, optionally beside a brand panel).
// The column's side panel is the page's own content: every line, the logo and the QR/store blocks are editable.
export type PageFrame = { mode: "full" | "contained" | "column"; maxWidth: number; backdrop: "subtle" | "surface" | "primary" | "inverse"; aside: boolean;
  asideLogo: string; asideImage: string; asideTitle: string; asideText: string; asideQr: boolean; asideStores: boolean; asideCta: string; asideAlign: "start" | "center" };
export const defaultPage: PageFrame = { mode: "full", maxWidth: 1200, backdrop: "subtle", aside: true,
  asideLogo: "", asideImage: "", asideTitle: "앱처럼 가볍게,\n웹에서도 그대로", asideText: "휴대폰으로 QR을 찍으면\n바로 이어서 볼 수 있어요.", asideQr: true, asideStores: true, asideCta: "", asideAlign: "start" };
export type LayoutDocument = { version: 1; nodes: LayoutNode[]; menu: "overlay" | "expand"; page?: PageFrame };
export const pageOf = (doc: LayoutDocument): PageFrame => ({ ...defaultPage, ...doc.page });
function validPage(value: unknown): boolean {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  // Aside fields arrived after the first page settings, so each may be absent.
  const later = (key: string, ok: (x: unknown) => boolean) => v[key] === undefined || ok(v[key]);
  const str = (max: number) => (x: unknown) => typeof x === "string" && x.length <= max;
  return ["full", "contained", "column"].includes(v.mode as string) && ["subtle", "surface", "primary", "inverse"].includes(v.backdrop as string) && typeof v.aside === "boolean"
    && Number.isInteger(v.maxWidth) && (v.maxWidth as number) >= 320 && (v.maxWidth as number) <= 1440
    && later("asideLogo", str(40)) && later("asideImage", validImageData) && later("asideTitle", str(80)) && later("asideText", str(160)) && later("asideCta", str(24))
    && later("asideQr", x => typeof x === "boolean") && later("asideStores", x => typeof x === "boolean") && later("asideAlign", x => x === "start" || x === "center");
}
export const baseLayout: LayoutStyle = { direction: "column", gap: 24, columns: 3, align: "stretch", justify: "start", padding: [32, 32, 32, 32], margin: [0, 0, 0, 0], height: 180, width: 240, sizing: "fill", hidden: false };
const kindNames = { section: "섹션", frame: "빈 프레임", header: "헤더", hero: "히어로", cards: "카드 섹션", cta: "CTA", footer: "푸터", floating: "플로팅 버튼",
  ...Object.fromEntries(blockSpecs.map(spec => [spec.kind, spec.name])) } as Record<LayoutKind, string>;
// Cards, CTAs and footers paint their background across the layer, so the layer's padding is
// their inner spacing; phones start from a tighter override.
const componentPadding: Partial<Record<LayoutKind, [Insets, Insets]>> = {
  cards: [[96, 64, 96, 64], [56, 20, 56, 20]], cta: [[96, 64, 96, 64], [64, 20, 64, 20]], footer: [[64, 64, 64, 64], [48, 20, 48, 20]],
};
export const paddedComponent = (kind: LayoutKind) => kind in componentPadding || kind in blockPadding;
export function newLayoutNode(kind: LayoutKind): LayoutNode {
  const own = componentPadding[kind] ?? blockPadding[kind];
  const padding: Insets = own ? [...own[0]] : kind === "header" ? [16, 32, 16, 32] : kind === "section" || kind === "frame" ? [...baseLayout.padding] : [0, 0, 0, 0];
  const height = kind === "section" ? 240 : kind === "header" ? 80 : kind === "frame" ? 120 : 0;
  const spec = specOf(kind);
  const config = spec ? { block: spec.defaults() } : kind === "section" || kind === "frame" ? {} : { [kind]: configs[kind as keyof typeof configs][0]() };
  return { id: `${kind}-${crypto.randomUUID()}`, name: kindNames[kind], kind, desktop: { ...baseLayout, padding, margin: [...baseLayout.margin], height }, mobile: own ? { padding: [...own[1]] } : {}, children: [], ...config };
}

// Layouts saved while cards/CTA/footer kept their own "padding" (or a CTA "size") move that spacing
// onto the layer's padding, keeping the old phone ratios, and drop the old field.
const legacyShare: Record<string, number> = { cards: .6, cta: .66, footer: .75 };
const ctaSizes: Record<string, number> = { compact: 56, regular: 96, large: 160 };
export function migrateLayoutDocument(doc: LayoutDocument): LayoutDocument {
  const fix = (n: LayoutNode): LayoutNode => {
    const children = n.children.map(fix);
    if (n.kind !== "cards" && n.kind !== "cta" && n.kind !== "footer") return { ...n, children };
    const config = { ...(n[n.kind] as unknown as Record<string, unknown>) };
    const old = typeof config.padding === "number" ? config.padding : n.kind === "cta" && typeof config.size === "string" ? ctaSizes[config.size] : undefined;
    if (old === undefined && !("padding" in config) && !("size" in config)) return { ...n, children };
    delete config.padding; delete config.size;
    const flat = n.desktop.padding.every(v => v === 0);
    const top = old ?? componentPadding[n.kind]![0][0], phone = Math.round(top * legacyShare[n.kind]);
    return { ...n, children, [n.kind]: config, desktop: flat ? { ...n.desktop, padding: [top, 64, top, 64], height: 0 } : n.desktop,
      mobile: flat && !n.mobile.padding ? { ...n.mobile, padding: [phone, 20, phone, 20], height: 0 } : n.mobile };
  };
  return { ...doc, nodes: doc.nodes.map(fix) };
}
// Mobile follows desktop values until a property is explicitly overridden.
// Horizontal/grid layouts receive a natural single-column mobile fallback.
export function resolveLayout(node: LayoutNode, mobile: boolean): LayoutStyle {
  return mobile ? { ...node.desktop, direction: "column", columns: 1, ...node.mobile } : node.desktop;
}
export function findLayoutNode(nodes: LayoutNode[], id: string): LayoutNode | undefined {
  for (const node of nodes) { if (node.id === id) return node; const child = findLayoutNode(node.children, id); if (child) return child; }
}
export function updateLayoutNode(nodes: LayoutNode[], id: string, update: (node: LayoutNode) => LayoutNode): LayoutNode[] {
  return nodes.map(node => node.id === id ? update(node) : { ...node, children: updateLayoutNode(node.children, id, update) });
}
export function removeLayoutNode(nodes: LayoutNode[], id: string): LayoutNode[] {
  return nodes.filter(node => node.id !== id).map(node => ({ ...node, children: removeLayoutNode(node.children, id) }));
}
export function insertLayoutNode(nodes: LayoutNode[], node: LayoutNode, parent: string | null, index?: number): LayoutNode[] {
  const insert = (items: LayoutNode[]) => { const next = [...items]; next.splice(index ?? next.length, 0, node); return next; };
  return parent ? updateLayoutNode(nodes, parent, item => ({ ...item, children: insert(item.children) })) : insert(nodes);
}
export function moveLayoutNode(nodes: LayoutNode[], source: string, parent: string | null, before?: string): LayoutNode[] {
  const node = findLayoutNode(nodes, source);
  if (!node || source === before || source === parent || (parent && findLayoutNode(node.children, parent))) return nodes;
  const target = parent ? findLayoutNode(nodes, parent) : undefined;
  if (parent && (!target || isComponentKind(target.kind))) return nodes;
  const stripped = removeLayoutNode(nodes, source);
  const siblings = parent ? findLayoutNode(stripped, parent)!.children : stripped;
  const index = before ? siblings.findIndex(n => n.id === before) : siblings.length;
  return insertLayoutNode(stripped, node, parent, index < 0 ? siblings.length : index);
}
export function validLayoutDocument(value: unknown): value is LayoutDocument {
  if (!value || typeof value !== "object") return false;
  const doc = value as LayoutDocument;
  let count = 0;
  const ids = new Set<string>();
  function style(value: unknown, partial: boolean): boolean {
    if (!value || typeof value !== "object") return false;
    const v = value as Record<string, unknown>;
    const options: Record<string, unknown[]> = { direction: ["column", "row", "grid"], align: ["stretch", "start", "center", "end"], justify: ["start", "center", "end", "space-between"], sizing: ["fill", "fixed"] };
    return Object.entries(baseLayout).every(([key]) => {
      if (partial && !(key in v)) return true;
      if (options[key]) return options[key].includes(v[key]);
      if (key === "hidden") return typeof v[key] === "boolean";
      if (key === "padding" || key === "margin") return Array.isArray(v[key]) && v[key].length === 4 && v[key].every(n => Number.isFinite(n) && n >= 0 && n <= 1440);
      return typeof v[key] === "number" && Number.isFinite(v[key]) && v[key] >= (key === "columns" ? 1 : 0) && v[key] <= (key === "columns" ? 12 : 1440);
    });
  }
  function nodes(value: unknown, depth: number): boolean {
    return depth < 16 && Array.isArray(value) && value.every(n => {
      if (++count > 300 || !n || typeof n.id !== "string" || ids.has(n.id)) return false;
      ids.add(n.id);
      // Each component's settings may only sit on a node of that kind.
      const settings = componentKinds.every(kind => n[kind] === undefined || (n.kind === kind && (configs[kind][1] as (v: unknown) => boolean)(n[kind])));
      return typeof n.name === "string" && Object.keys(kindNames).includes(n.kind) && style(n.desktop, false) && style(n.mobile, true) && settings
        && (n.block === undefined || (!!specOf(n.kind) && validBlock(specOf(n.kind)!, n.block)))
        && (n.bleed === undefined || typeof n.bleed === "boolean") && nodes(n.children, depth + 1);
    });
  }
  return doc.version === 1 && ["overlay", "expand"].includes(doc.menu) && (doc.page === undefined || validPage(doc.page)) && nodes(doc.nodes, 0);
}
