import { defaultHeader, validHeaderConfig, type HeaderConfig } from "./header-config";

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
export type LayoutNode = { id: string; name: string; kind: "section" | "frame" | "header"; desktop: LayoutStyle; mobile: Partial<LayoutStyle>; children: LayoutNode[]; header?: HeaderConfig };
export type LayoutDocument = { version: 1; nodes: LayoutNode[]; menu: "overlay" | "expand" };
export const baseLayout: LayoutStyle = { direction: "column", gap: 24, columns: 3, align: "stretch", justify: "start", padding: [32, 32, 32, 32], margin: [0, 0, 0, 0], height: 180, width: 240, sizing: "fill", hidden: false };
export function newLayoutNode(kind: LayoutNode["kind"]): LayoutNode {
  return { id: `${kind}-${crypto.randomUUID()}`, name: kind === "section" ? "섹션" : kind === "header" ? "헤더" : "빈 프레임", kind,
    desktop: { ...baseLayout, padding: kind === "header" ? [16, 32, 16, 32] : [...baseLayout.padding], margin: [...baseLayout.margin], height: kind === "header" ? 80 : kind === "frame" ? 120 : 240 }, mobile: {}, children: [], ...(kind === "header" ? { header: defaultHeader() } : {}) };
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
  if (parent && (!target || target.kind === "header")) return nodes;
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
      return typeof n.name === "string" && ["section", "frame", "header"].includes(n.kind) && style(n.desktop, false) && style(n.mobile, true) && (n.header === undefined || (n.kind === "header" && validHeaderConfig(n.header))) && nodes(n.children, depth + 1);
    });
  }
  return doc.version === 1 && ["overlay", "expand"].includes(doc.menu) && nodes(doc.nodes, 0);
}
