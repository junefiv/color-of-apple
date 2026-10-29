"use client";

import { useEffect, useRef, useState, type CSSProperties, type DragEvent } from "react";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Check, ChevronDown, ChevronRight, Download, Frame, GripVertical, Image as ImageIcon, LayoutGrid, Layers, Megaphone, MousePointerClick, PanelBottom, Menu, Monitor, Plus, Redo2, RotateCcw, Smartphone, Trash2, Undo2 } from "lucide-react";
import { HeaderFrame } from "./header-frame";
import { HeaderSettings } from "./header-settings";
import { HeroFrame } from "./hero-frame";
import { HeroSettings } from "./hero-settings";
import { PageSettings } from "./page-settings";
import { CardsFrame } from "./cards-frame";
import { CardsSettings } from "./cards-settings";
import { CtaFrame } from "./cta-frame";
import { CtaSettings } from "./cta-settings";
import { FloatingFrame, floatPos } from "./floating-frame";
import { FloatingSettings } from "./floating-settings";
import { FooterFrame } from "./footer-frame";
import { FooterSettings } from "./footer-settings";
import { applyCardsPreset, cardsPresets, withCardsDefaults } from "@/lib/cards-config";
import { applyCtaPreset, ctaPresets, withCtaDefaults } from "@/lib/cta-config";
import { applyFloatingPreset, floatingPresets, withFloatingDefaults } from "@/lib/floating-config";
import { applyFooterPreset, footerPresets, withFooterDefaults } from "@/lib/footer-config";
import type { EditFocus } from "./settings-focus";
import { PresetPopover, type Anchor, type PresetChoice } from "./preset-popover";
import { PresetThumb } from "./preset-thumb";
import { BlockFrame } from "./block-frames";
import { BlockSettings } from "./block-settings";
import { blockIcons } from "./block-registry";
import { ComponentLibrary, type LibraryItem } from "./component-library";
import { blockSpecs, isOverlayBlock, specOf } from "@/lib/blocks";
import { applyBlockPreset, setImage, withBlockDefaults } from "@/lib/block-schema";
import { applyHeaderPreset, defaultHeader, headerItems, headerPresets, withHeaderDefaults, type HeaderConfig, type HeaderMobileMenu } from "@/lib/header-config";
import { applyHeroPreset, heroPresets, withHeroDefaults } from "@/lib/hero-config";
import { readImageFile } from "@/lib/image-data";
import { surfaceColors } from "@/lib/section-surface";
import { findLayoutNode, insertLayoutNode, isComponentKind, migrateLayoutDocument, paddedComponent, pageOf, type LayoutKind, type PageFrame, moveLayoutNode, newLayoutNode, removeLayoutNode, resolveLayout, updateLayoutNode, validLayoutDocument, type Insets, type LayoutDocument, type LayoutNode, type LayoutStyle } from "@/lib/page-layout";

const emptyDocument: LayoutDocument = { version: 1, nodes: [], menu: "overlay" };
type Device = "desktop" | "mobile";
// Where a dragged layer would land: next to `target` (before/after), inside it, or at the page end.
// slot: hero | logo | promo | cta | footer | card:<i> | aside (the column's side panel, node "page").
type ImageSlot = { node: string; slot: string };
const imageMax = (slot: string) => slot.startsWith("img:") ? 1600 : slot === "logo" || slot === "footer" || slot === "aside" ? 600 : slot === "promo" || slot.startsWith("card:") ? 1200 : 1800;
// Writes a dropped image into whichever component setting owns the slot.
function withImage(n: LayoutNode, slot: string, src: string, menu: HeaderMobileMenu): LayoutNode {
  const spec = specOf(n.kind);
  if (spec && slot.startsWith("img:")) return { ...n, block: setImage(withBlockDefaults(spec, n.block), slot.slice(4), src) };
  if (slot === "hero") return { ...n, hero: { ...withHeroDefaults(n.hero), image: src } };
  if (slot === "cta") return { ...n, cta: { ...withCtaDefaults(n.cta), image: src } };
  if (slot === "footer") return { ...n, footer: { ...withFooterDefaults(n.footer), logoImage: src } };
  if (slot.startsWith("card:")) { const cards = withCardsDefaults(n.cards), i = Number(slot.slice(5)); return { ...n, cards: { ...cards, items: cards.items.map((item, j) => j === i ? { ...item, image: src } : item) } }; }
  if (n.kind !== "header") return n;
  return slot === "promo" ? { ...n, header: { ...headerOf(n, menu), promo: true, promoImage: src } } : { ...n, header: { ...headerOf(n, menu), logo: "slot", logoImage: src } };
}
// Settings part each image slot focuses after a drop.
const imagePart = (slot: string) => slot.startsWith("img:") ? slot.slice(4).replace(/:image$/, "").replace(/^(\w+:\d+):\w+$/, "$1") : slot === "hero" ? "media" : slot === "cta" ? "image" : slot === "footer" ? "brand" : slot === "aside" ? "aside-logo" : slot;
// Older saved headers lack later options; every read goes through the defaults.
const headerOf = (node: LayoutNode, menu: HeaderMobileMenu): HeaderConfig => withHeaderDefaults(node.header ?? defaultHeader(menu), menu);
const isFileDrag = (e: DragEvent | globalThis.DragEvent) => Array.from(e.dataTransfer?.types ?? []).includes("Files");
// The image slot under the pointer: a hero visual or a header logo marked with data-image-drop.
function imageSlotAt(e: DragEvent): ImageSlot | null {
  const el = (e.target as HTMLElement).closest<HTMLElement>("[data-image-drop]");
  if (el?.dataset.imageDrop === "aside") return { node: "page", slot: "aside" };
  const owner = el?.closest<HTMLElement>(".lb-layout-node");
  return el && owner?.dataset.id ? { node: owner.dataset.id, slot: el.dataset.imageDrop! } : null;
}
// Page-level components offered in the layer panel, in survey frequency order after header and hero.
const componentButtons: [LayoutKind, string, typeof Frame][] = [["header", "헤더", Menu], ["hero", "히어로", ImageIcon], ["cards", "카드", LayoutGrid], ["cta", "CTA", Megaphone], ["footer", "푸터", PanelBottom], ["floating", "플로팅", MousePointerClick]];
const kindIcons = { ...blockIcons, section: Layers, frame: Frame, header: Menu, hero: ImageIcon, cards: LayoutGrid, cta: Megaphone, footer: PanelBottom, floating: MousePointerClick } as Record<LayoutKind, typeof Frame>;
// Everything the component library offers: the six built first, then the schema-described blocks.
const libraryItems: LibraryItem[] = [
  ...componentButtons.map(([kind, name, icon]) => ({ kind, name, icon, group: "기본 구조", note: ({ header: "로고 · 메뉴 · 하위 메뉴", hero: "첫 화면 비주얼", cards: "제목 + 카드 · 슬라이더", cta: "행동을 부르는 구역", footer: "회사 정보 · 사이트맵", floating: "퀵메뉴 · 맨 위로 · 탭바" } as Record<string, string>)[kind] })),
  ...blockSpecs.map(spec => ({ kind: spec.kind, name: spec.name, note: spec.note, group: spec.group, icon: blockIcons[spec.kind] })),
];
// Components painting their own full-width background read the container gutter as a CSS var.
const gutterKinds = new Set<LayoutKind>(["hero", "cards", "cta", "footer"]);
// Side panel width plus its gap to the column (page-frame.css), so floats can line up with the column.
const asideSpan = 340 + 88;
const pageBrand = (doc: LayoutDocument) => doc.nodes.find(n => n.kind === "header")?.header?.logoText || "Brand";
// Styles each component offers, picked from a popover on its insert button or its preview handle.
// Applying one reshapes structure and color but keeps the user's own copy (see each apply*Preset).
type PresetSet = { title: string; presets: PresetChoice[]; apply: (n: LayoutNode, key: string, menu: HeaderMobileMenu) => LayoutNode };
const byKey = <T extends PresetChoice>(list: T[], key: string) => list.find(p => p.key === key)!;
const presetSets: Partial<Record<LayoutKind, PresetSet>> = {
  header: { title: "헤더", presets: headerPresets, apply: (n, key, menu) => ({ ...n, header: applyHeaderPreset(headerOf(n, menu), byKey(headerPresets, key)) }) },
  hero: { title: "히어로", presets: heroPresets, apply: (n, key) => ({ ...n, hero: applyHeroPreset(withHeroDefaults(n.hero), byKey(heroPresets, key)) }) },
  cards: { title: "카드 섹션", presets: cardsPresets, apply: (n, key) => ({ ...n, cards: applyCardsPreset(withCardsDefaults(n.cards), byKey(cardsPresets, key)) }) },
  cta: { title: "CTA", presets: ctaPresets, apply: (n, key) => ({ ...n, cta: applyCtaPreset(withCtaDefaults(n.cta), byKey(ctaPresets, key)) }) },
  footer: { title: "푸터", presets: footerPresets, apply: (n, key) => ({ ...n, footer: applyFooterPreset(withFooterDefaults(n.footer), byKey(footerPresets, key)) }) },
  floating: { title: "플로팅 버튼", presets: floatingPresets, apply: (n, key) => ({ ...n, floating: applyFloatingPreset(withFloatingDefaults(n.floating), byKey(floatingPresets, key)) }) },
  ...Object.fromEntries(blockSpecs.map(spec => [spec.kind, { title: spec.name, presets: spec.presets,
    apply: (n: LayoutNode, key: string) => ({ ...n, block: applyBlockPreset(spec, withBlockDefaults(spec, n.block), byKey(spec.presets, key)) }) }])),
};
// An open style popover: for a new layer (insert button) or for an existing one (`node`).
type StylePicker = { kind: LayoutKind; anchor: Anchor; node?: string };
const anchorOf = (el: Element): Anchor => { const r = el.getBoundingClientRect(); return { left: r.left, top: r.top, right: r.right, bottom: r.bottom }; };
// Live size shown beside the handle while a layer is being resized in the preview.
type Resizing = { id: string; w: number; h: number; label?: string };
// x/y/xy resize the layer; mt/mb drag its top or bottom margin.
type HandleAxis = "x" | "y" | "xy" | "mt" | "mb";
// "side" docks a header to the left or right of the PC page as a sidebar.
type DropHint = { parent: string | null; before?: string; target?: string; edge: "before" | "after" | "inside" | "end" | "side"; side?: "left" | "right"; axis: "x" | "y" };
export function LayoutBuilder({ platform }: { platform: "web" | "app" }) {
  // Separate mounted editors keep web and app documents and histories independent.
  return <LayoutEditor key={platform} platform={platform} />;
}

function LayoutEditor({ platform }: { platform: "web" | "app" }) {
  const [doc, setDoc] = useState<LayoutDocument>(emptyDocument);
  const [selected, setSelected] = useState("");
  const [phase, setPhase] = useState<"desktop" | "responsive">("desktop");
  const [device, setDevice] = useState<Device>(platform === "app" ? "mobile" : "desktop");
  const [past, setPast] = useState<LayoutDocument[]>([]);
  const [future, setFuture] = useState<LayoutDocument[]>([]);
  const [ready, setReady] = useState(false);
  const [status, setStatus] = useState("불러오는 중");
  const [headerPreview, setHeaderPreview] = useState(false);
  const [focus, setFocus] = useState<EditFocus>();
  const focusCount = useRef(0);
  const [hint, setHint] = useState<DropHint | null>(null);
  // A layer dragged off both device screens is removed on drop; `trash` shows that will happen.
  const [trash, setTrash] = useState<string | null>(null);
  const [removed, setRemoved] = useState<string | null>(null);
  const [imageOver, setImageOver] = useState<ImageSlot | null>(null);
  const [resizing, setResizing] = useState<Resizing | null>(null);
  const [picker, setPicker] = useState<StylePicker | null>(null);
  const [library, setLibrary] = useState<Anchor | null>(null);
  const pageFrame = pageOf(doc);
  // A mobile-first column shows the phone layout on the PC screen too, so edits there target mobile.
  const column = platform === "web" && pageFrame.mode === "column";
  // Image files decode asynchronously, so their commit reads the document as it is by then.
  const latest = useRef(doc);
  useEffect(() => { latest.current = doc; }, [doc]);
  const drag = useRef<{ id?: string; kind?: LayoutNode["kind"] } | null>(null);
  const node = findLayoutNode(doc.nodes, selected);
  const style = node ? resolveLayout(node, device === "mobile") : null;
  const storageKey = `coa-layout-v1-${platform}`;
  useEffect(() => {
    try { const raw = localStorage.getItem(storageKey); if (raw) { const parsed: unknown = JSON.parse(raw); if (validLayoutDocument(parsed)) setDoc(migrateLayoutDocument(parsed)); } } catch { /* Keep the editor usable without storage. */ }
    setReady(true);
  }, [storageKey]);
  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem(storageKey, JSON.stringify(doc)); setStatus("이 브라우저에 저장됨"); } catch { setStatus("저장 불가 · JSON으로 보관하세요"); }
  }, [doc, ready, storageKey]);
  useEffect(() => { if (selected && !findLayoutNode(doc.nodes, selected)) setSelected(""); }, [doc.nodes, selected]);
  useEffect(() => {
    // A drag cancelled with Escape or dropped outside the artboards still has to clear the line.
    const clear = () => { setHint(null); setTrash(null); setImageOver(null); };
    // A file dropped beside an image slot must not make the browser navigate to it.
    const guard = (e: globalThis.DragEvent) => { if (isFileDrag(e)) e.preventDefault(); };
    const end = (e: globalThis.DragEvent) => { guard(e); clear(); };
    window.addEventListener("dragend", clear); window.addEventListener("drop", end); window.addEventListener("dragover", guard);
    return () => { window.removeEventListener("dragend", clear); window.removeEventListener("drop", end); window.removeEventListener("dragover", guard); };
  }, []);

  function commit(next: LayoutDocument) { setPast(p => [...p.slice(-49), doc]); setFuture([]); setDoc(next); }
  function patchNode(update: (n: LayoutNode) => LayoutNode) { if (node) commit({ ...doc, nodes: updateLayoutNode(doc.nodes, node.id, update) }); }
  function patchStyle(patch: Partial<LayoutStyle>) { patchNode(n => ({ ...n, [device]: { ...n[device], ...patch } })); }
  function add(kind: LayoutNode["kind"], parent: string | null = null, before?: string, prepare: (n: LayoutNode) => LayoutNode = n => n) {
    const item = prepare(newLayoutNode(kind));
    const siblings = parent ? findLayoutNode(doc.nodes, parent)?.children ?? [] : doc.nodes;
    const index = before ? siblings.findIndex(n => n.id === before) : siblings.length;
    commit({ ...doc, nodes: insertLayoutNode(doc.nodes, item, parent, index < 0 ? undefined : index) }); setSelected(item.id);
  }
  function beginDrag(e: DragEvent, payload: NonNullable<typeof drag.current>) { e.stopPropagation(); drag.current = payload; e.dataTransfer.effectAllowed = "move"; e.dataTransfer.setData("text/plain", JSON.stringify(payload)); }
  function drop(e: DragEvent, parent: string | null, before?: string) {
    e.preventDefault(); e.stopPropagation(); const source = drag.current; drag.current = null; if (!source) return;
    if (source.id) commit({ ...doc, nodes: moveLayoutNode(doc.nodes, source.id, parent, before) });
    else if (source.kind) add(source.kind, source.kind === "section" || isComponentKind(source.kind) ? null : parent, before);
  }
  // Pages, headers and heroes only live at page level; frames can also go inside sections and frames.
  // Near a layer's edge (or anywhere on a component) the drop goes beside it, otherwise inside it.
  function hintAt(e: DragEvent, mobile: boolean): DropHint | null {
    const source = drag.current; if (!source) return null;
    const moving = source.id ? findLayoutNode(doc.nodes, source.id) : undefined;
    const kind = source.kind ?? moving?.kind;
    const pageLevel = kind === "section" || (!!kind && isComponentKind(kind));
    if (kind === "header" && !mobile) {
      const box = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const x = (e.clientX - box.left) / box.width;
      if (x < .1 || x > .9) return { parent: null, edge: "side", side: x < .1 ? "left" : "right", axis: "x" };
    }
    let el = (e.target as HTMLElement).closest<HTMLElement>(".lb-layout-node");
    while (pageLevel && el?.dataset.parent) el = el.parentElement?.closest<HTMLElement>(".lb-layout-node") ?? null;
    if (!el) return { parent: null, edge: "end", axis: "y" };
    const id = el.dataset.id!, parent = el.dataset.parent || null;
    if (moving && (moving.id === id || findLayoutNode(moving.children, id))) return null;
    const target = findLayoutNode(doc.nodes, id); if (!target) return null;
    const axis = parent && resolveLayout(findLayoutNode(doc.nodes, parent)!, mobile).direction === "row" ? "x" : "y";
    const rect = el.getBoundingClientRect();
    const size = axis === "y" ? rect.height : rect.width;
    const pos = ((axis === "y" ? e.clientY - rect.top : e.clientX - rect.left) / size) || 0;
    const container = !pageLevel && !isComponentKind(target.kind);
    const edge = container ? Math.min(.25, 16 / size) : .5;
    if (container && pos > edge && pos < 1 - edge) return { parent: id, target: id, edge: "inside", axis };
    if (pos <= .5) return { parent, before: id, target: id, edge: "before", axis };
    const siblings = parent ? findLayoutNode(doc.nodes, parent)!.children : doc.nodes;
    return { parent, before: siblings[siblings.findIndex(n => n.id === id) + 1]?.id, target: id, edge: "after", axis };
  }
  function trackHint(e: DragEvent, mobile: boolean) {
    e.preventDefault(); e.stopPropagation(); setTrash(null);
    if (!drag.current && isFileDrag(e)) {
      const slot = imageSlotAt(e);
      e.dataTransfer.dropEffect = slot ? "copy" : "none";
      setImageOver(prev => prev?.node === slot?.node && prev?.slot === slot?.slot ? prev : slot);
      return;
    }
    const next = hintAt(e, mobile);
    e.dataTransfer.dropEffect = next ? "move" : "none";
    setHint(prev => JSON.stringify(prev) === JSON.stringify(next) ? prev : next);
  }
  async function placeImage(e: DragEvent) {
    e.preventDefault(); e.stopPropagation(); setImageOver(null);
    const slot = imageSlotAt(e), file = e.dataTransfer.files[0];
    if (!slot || !file) return;
    let src: string;
    try { src = await readImageFile(file, imageMax(slot.slot)); } catch { setStatus("이미지를 읽지 못했어요"); return; }
    const current = latest.current;
    const next = slot.node === "page" ? { ...current, page: { ...pageOf(current), asideImage: src } } : { ...current, nodes: updateLayoutNode(current.nodes, slot.node, n => withImage(n, slot.slot, src, current.menu)) };
    setPast(p => [...p.slice(-49), current]); setFuture([]); setDoc(next);
    setSelected(slot.node === "page" ? "" : slot.node); setFocus({ node: slot.node, part: imagePart(slot.slot), at: ++focusCount.current });
  }
  // Docks a dragged or new header beside the PC page; it moves first so the phone keeps it on top.
  function placeSide(e: DragEvent, side: "left" | "right") {
    e.preventDefault(); e.stopPropagation(); const source = drag.current; drag.current = null; if (!source) return;
    const item = source.id ? findLayoutNode(doc.nodes, source.id) : source.kind === "header" ? newLayoutNode("header") : undefined;
    if (item?.kind !== "header") return;
    const rest = source.id ? removeLayoutNode(doc.nodes, item.id) : doc.nodes;
    commit({ ...doc, nodes: [{ ...item, header: { ...headerOf(item, doc.menu), placement: side } }, ...rest] }); setSelected(item.id);
  }
  function dropAtHint(e: DragEvent, mobile: boolean) {
    if (!drag.current && isFileDrag(e)) { void placeImage(e); return; }
    const target = hint ?? hintAt(e, mobile); setHint(null);
    if (!target) { e.preventDefault(); drag.current = null; return; }
    if (target.edge === "side") { placeSide(e, target.side!); return; }
    // Dragging a sidebar back into the page flow turns it into a top header again.
    const moving = drag.current?.id ? findLayoutNode(doc.nodes, drag.current.id) : undefined;
    if (!mobile && moving?.kind === "header" && headerOf(moving, doc.menu).placement !== "top") {
      e.preventDefault(); e.stopPropagation(); drag.current = null;
      const nodes = updateLayoutNode(moveLayoutNode(doc.nodes, moving.id, target.parent, target.before), moving.id, n => ({ ...n, header: { ...headerOf(n, doc.menu), placement: "top" } }));
      commit({ ...doc, nodes }); return;
    }
    drop(e, target.parent, target.before);
  }
  function selectFrom(id: string, part: string | undefined, mobile: boolean) {
    setSelected(id); setDevice(mobile ? "mobile" : "desktop");
    setFocus(part ? { node: id, part, at: ++focusCount.current } : undefined);
  }
  function reorder(offset: number) {
    if (!node) return;
    function siblings(nodes: LayoutNode[], parent: string | null): { nodes: LayoutNode[]; parent: string | null } | undefined {
      if (nodes.some(n => n.id === selected)) return { nodes, parent };
      for (const n of nodes) { const found = siblings(n.children, n.id); if (found) return found; }
    }
    const group = siblings(doc.nodes, null); if (!group) return;
    const index = group.nodes.findIndex(n => n.id === selected); const target = index + offset;
    if (target < 0 || target >= group.nodes.length) return;
    commit({ ...doc, nodes: moveLayoutNode(doc.nodes, selected, group.parent, offset < 0 ? group.nodes[target].id : group.nodes[target + 1]?.id) });
  }
  function exportLayout() {
    const url = URL.createObjectURL(new Blob([JSON.stringify(doc, null, 2)], { type: "application/json" }));
    const a = document.createElement("a"); a.href = url; a.download = `color-of-apple-${platform}-layout.json`; a.click(); URL.revokeObjectURL(url);
  }
  function trackTrash(e: DragEvent) {
    const id = drag.current?.id;
    // Only existing layers can be thrown away, and only once the pointer has left the device frames.
    if (!id || (e.target as HTMLElement).closest(".lb-device-shell")) { if (trash) setTrash(null); return; }
    e.preventDefault(); e.dataTransfer.dropEffect = "move";
    if (trash !== id) { setTrash(id); setHint(null); }
  }
  function dropInTrash(e: DragEvent) {
    const id = drag.current?.id; setTrash(null);
    if (!id || (e.target as HTMLElement).closest(".lb-device-shell")) return;
    e.preventDefault(); drag.current = null;
    const gone = findLayoutNode(doc.nodes, id); if (!gone) return;
    commit({ ...doc, nodes: removeLayoutNode(doc.nodes, id) }); setRemoved(gone.name);
  }
  useEffect(() => { if (!removed) return; const timer = window.setTimeout(() => setRemoved(null), 4000); return () => window.clearTimeout(timer); }, [removed]);
  function pickStyle(key: string) {
    if (!picker) return;
    const set = presetSets[picker.kind]!;
    if (picker.node) { const id = picker.node; commit({ ...doc, nodes: updateLayoutNode(doc.nodes, id, n => set.apply(n, key, doc.menu)) }); setSelected(id); }
    else add(picker.kind, null, undefined, n => key === "default" ? n : set.apply(n, key, doc.menu));
    setPicker(null);
  }
  function setPage(patch: Partial<PageFrame>) {
    commit({ ...doc, page: { ...pageFrame, ...patch } });
    // The PC artboard edits mobile values only while it shows a column, so follow the mode switch.
    if (patch.mode && phase === "desktop") setDevice(patch.mode === "column" ? "mobile" : "desktop");
  }
  // Dragging a handle updates the document live and records one undo step when released.
  // Width only applies to layers inside another layer; page-level width comes from the page frame.
  function beginResize(e: React.PointerEvent, id: string, axis: HandleAxis, box: DOMRect, scale: number, narrow: boolean) {
    e.preventDefault(); e.stopPropagation();
    const start = doc, key = narrow ? "mobile" : "desktop";
    const x0 = e.clientX, y0 = e.clientY, w0 = box.width / scale, h0 = box.height / scale;
    const snap = (v: number) => Math.round(v / 4) * 4;
    const startNode = findLayoutNode(doc.nodes, id);
    setSelected(id); setDevice(narrow ? "mobile" : "desktop");
    const move = (ev: PointerEvent) => {
      const dy = (ev.clientY - y0) / scale;
      const w = snap(Math.max(40, Math.min(1440, w0 + (ev.clientX - x0) / scale)));
      const h = snap(Math.max(24, Math.min(1440, h0 + dy)));
      if (axis === "mt" || axis === "mb") {
        // Margin handles sit outside the layer: dragging away from it grows that margin.
        if (!startNode) return;
        const m = [...resolveLayout(startNode, narrow).margin] as Insets, edge = axis === "mt" ? 0 : 2;
        m[edge] = Math.max(0, Math.min(1440, snap(m[edge] + (axis === "mt" ? -dy : dy))));
        setResizing({ id, w: Math.round(w0), h: m[edge], label: `${axis === "mt" ? "위" : "아래"} 마진 ${m[edge]}` });
        setDoc(d => ({ ...d, nodes: updateLayoutNode(d.nodes, id, n => ({ ...n, [key]: { ...n[key], margin: m } })) }));
        return;
      }
      // Headers, cards, CTAs and footers are as tall as their content plus the layer's padding, so
      // their bottom edge grows or shrinks the top and bottom padding evenly.
      if (startNode && axis === "y" && (startNode.kind === "header" || paddedComponent(startNode.kind))) {
        const [t, r, b, l] = resolveLayout(startNode, narrow).padding;
        const padding: Insets = [Math.max(0, Math.min(1440, snap(t + dy / 2))), r, Math.max(0, Math.min(1440, snap(b + dy / 2))), l];
        setResizing({ id, w: Math.round(w0), h, label: `패딩 ${padding[0]} · ${padding[2]}` });
        // A min-height left on the layer by older drags would hold it open, so padding takes over.
        setDoc(d => ({ ...d, nodes: updateLayoutNode(d.nodes, id, n => ({ ...n, [key]: { ...n[key], height: 0, padding } })) }));
        return;
      }
      setResizing({ id, w: axis === "y" ? Math.round(w0) : w, h: axis === "x" ? Math.round(h0) : h });
      setDoc(d => ({ ...d, nodes: updateLayoutNode(d.nodes, id, n => {
        // A hero's height is its own setting, so its bottom edge switches it to a custom px height.
        if (n.kind === "hero") { const hero = withHeroDefaults(n.hero); return { ...n, hero: narrow ? { ...hero, mobileHeight: "custom", mobileHeightPx: Math.max(160, h) } : { ...hero, height: "custom", heightPx: Math.max(160, h) } }; }
        const patch: Partial<LayoutStyle> = { ...(axis !== "y" ? { sizing: "fixed" as const, width: w } : {}), ...(axis !== "x" ? { height: h } : {}) };
        return { ...n, [key]: { ...n[key], ...patch } };
      }) }));
    };
    const up = () => {
      window.removeEventListener("pointermove", move); setResizing(null);
      setPast(p => [...p.slice(-49), start]); setFuture([]);
    };
    window.addEventListener("pointermove", move); window.addEventListener("pointerup", up, { once: true });
  }
  function undo() { if (!past.length) return; setFuture(f => [doc, ...f]); setDoc(past[past.length - 1]); setPast(p => p.slice(0, -1)); }
  function redo() { if (!future.length) return; setPast(p => [...p, doc]); setDoc(future[0]); setFuture(f => f.slice(1)); }

  const renderTree = (nodes: LayoutNode[], parent: string | null, depth = 0): React.ReactNode => nodes.map(n => <div key={n.id}>
    <button className={`lb-tree-node ${selected === n.id ? "active" : ""}`} style={{ paddingLeft: 10 + depth * 14 }} draggable onDragStart={e => beginDrag(e, { id: n.id })} onDragEnd={() => { drag.current = null; }} onDragOver={e => e.preventDefault()} onDrop={e => drop(e, parent, n.id)} onClick={() => setSelected(n.id)}><GripVertical size={11} /><span>{(() => { const Icon = kindIcons[n.kind]; return <Icon size={13} />; })()}</span>{n.name}{resolveLayout(n, device === "mobile").hidden && <small>숨김</small>}</button>
    {renderTree(n.children, n.id, depth + 1)}
  </div>);

  const pickerSet = picker && presetSets[picker.kind];
  // Each choice previews the layer it would produce: the existing layer restyled, or a new one.
  const pickerChoices = (() => {
    if (!picker || !pickerSet) return [];
    const base = (picker.node && findLayoutNode(doc.nodes, picker.node)) || newLayoutNode(picker.kind);
    const items = (() => { const header = doc.nodes.find(n => n.kind === "header"); return header ? headerOf(header, doc.menu).items : headerItems; })();
    const thumb = (n: LayoutNode) => <PresetThumb node={n} menu={doc.menu} items={items} />;
    const styled = pickerSet.presets.map(p => ({ key: p.key, name: p.name, note: p.note, thumb: thumb(pickerSet.apply(base, p.key, doc.menu)) }));
    return picker.node ? styled : [{ key: "default", name: "기본", note: "기본 설정 그대로", thumb: thumb(base) }, ...styled];
  })();
  return <div className="layout-builder" data-platform={platform}>
    {library && <ComponentLibrary anchor={library} items={libraryItems} onClose={() => setLibrary(null)} onDrag={(e, kind) => { beginDrag(e, { kind: kind as LayoutKind }); setLibrary(null); }}
      onPick={kind => { setPicker({ kind: kind as LayoutKind, anchor: library }); setLibrary(null); }} />}
    {picker && pickerSet && <PresetPopover title={`${pickerSet.title} 스타일`} note={picker.node ? "고르면 지금 레이어에 적용돼요. 내가 쓴 문구와 이미지는 그대로 남아요." : "고른 스타일로 페이지에 추가돼요. 끌어서 원하는 자리에 놓아도 돼요."}
      anchor={picker.anchor} choices={pickerChoices} onPick={pickStyle} onClose={() => setPicker(null)} />}
    <div className="lb-toolbar"><div className="lb-history"><button aria-label="배치 실행 취소" disabled={!past.length} onClick={undo}><Undo2 size={14} /></button><button aria-label="배치 다시 실행" disabled={!future.length} onClick={redo}><Redo2 size={14} /></button><span /></div><div className="lb-steps">{platform === "web" ? <><button aria-pressed={phase === "desktop"} onClick={() => { setPhase("desktop"); setDevice("desktop"); }}><span>1</span>PC 만들기</button><ChevronRight size={12} /><button aria-pressed={phase === "responsive"} onClick={() => { setPhase("responsive"); setDevice("mobile"); }}><span>2</span>모바일 다듬기</button></> : <span className="lb-app-label"><Smartphone size={14} />앱 화면 만들기 · 375 × 667</span>}</div><button className="lb-export" onClick={exportLayout} title="구조 JSON 내보내기"><Download size={14} /><span>구조</span></button></div>
    <div className="lb-body"><aside className="lb-controls" aria-label="레이어와 배치 속성"><div className="lb-control-heading"><Layers size={14} /><strong>레이어</strong><small>드래그로 이동</small></div><div className="lb-inserts"><button draggable onDragStart={e => beginDrag(e, { kind: "section" })} onClick={() => add("section")}><Plus size={12} />섹션</button><button draggable onDragStart={e => beginDrag(e, { kind: "frame" })} onClick={() => add("frame", node && !isComponentKind(node.kind) ? node.id : null)}><Frame size={12} />빈 프레임</button><button className="lb-library-open" aria-haspopup="dialog" aria-expanded={!!library} onClick={e => setLibrary(library ? null : anchorOf(e.currentTarget))}><Plus size={12} />컴포넌트 추가<small>{libraryItems.length}종</small></button></div><p className="lb-note">프레임을 섹션 안으로 드래그하세요.<br />배치와 간격부터 잡고, 컴포넌트는 나중에.</p><div className="lb-tree" onDragOver={e => e.preventDefault()} onDrop={e => drop(e, null)}>{platform === "web" && <button className={`lb-tree-node lb-tree-page ${selected ? "" : "active"}`} onClick={() => setSelected("")}><Monitor size={12} />페이지<small>{pageFrame.mode === "full" ? "화면 가득" : pageFrame.mode === "contained" ? `컨테이너 ${pageFrame.maxWidth}` : `컬럼 ${pageFrame.maxWidth}`}</small></button>}{doc.nodes.length ? renderTree(doc.nodes, null) : <p>아직 레이어가 없어요.<br />섹션을 추가해 시작하세요.</p>}<div className="lb-root-drop">페이지 끝으로 이동</div></div>
      {node && style ? <div className="lb-properties"><div className="lb-control-heading"><strong>배치 속성</strong><span className="lb-device-tag">{device === "desktop" ? "PC" : "모바일"}</span></div><label className="lb-field">이름<input value={node.name} onChange={e => patchNode(n => ({ ...n, name: e.target.value }))} /></label><div className="lb-device-notice">{column ? "모바일 퍼스트 컬럼이에요.\nPC 화면도 모바일 배치를 그대로 씁니다." : device === "desktop" ? "PC의 기본 배치를 편집합니다." : "미지정 값은 PC에서 이어받습니다.\n변경한 속성만 모바일에 적용됩니다."}</div>
        {pageFrame.mode === "contained" && platform === "web" && doc.nodes.includes(node) && <label className="lb-check"><input type="checkbox" checked={!!node.bleed} onChange={e => patchNode(n => ({ ...n, bleed: e.target.checked }))} />컨테이너 무시 · 내용도 화면 끝까지</label>}
        <label className="lb-field">배치 방향<select value={style.direction} onChange={e => patchStyle({ direction: e.target.value as LayoutStyle["direction"] })}><option value="column">세로 · Column</option><option value="row">가로 · Row</option><option value="grid">그리드 · Grid</option></select></label>
        {style.direction === "grid" && <Numeric label="열 개수" value={style.columns} min={1} max={12} onChange={columns => patchStyle({ columns })} />}
        <div className="lb-two-fields"><label className="lb-field">교차축 정렬<select value={style.align} onChange={e => patchStyle({ align: e.target.value as LayoutStyle["align"] })}><option value="stretch">채우기</option><option value="start">시작</option><option value="center">가운데</option><option value="end">끝</option></select></label><label className="lb-field">주축 정렬<select value={style.justify} onChange={e => patchStyle({ justify: e.target.value as LayoutStyle["justify"] })}><option value="start">시작</option><option value="center">가운데</option><option value="end">끝</option><option value="space-between">양쪽 분배</option></select></label></div>
        <Numeric label="요소 사이 간격" value={style.gap} onChange={gap => patchStyle({ gap })} />
        <InsetsEditor label="Padding · 안쪽 여백" value={style.padding} onChange={padding => patchStyle({ padding })} />
        <InsetsEditor label="Margin · 바깥 여백" value={style.margin} onChange={margin => patchStyle({ margin })} />
        <div className="lb-two-fields"><label className="lb-field">너비<select value={style.sizing} onChange={e => patchStyle({ sizing: e.target.value as LayoutStyle["sizing"] })}><option value="fill">부모 채우기</option><option value="fixed">고정 px</option></select></label><Numeric label="최소 높이" value={style.height} onChange={height => patchStyle({ height })} /></div>
        {style.sizing === "fixed" && <Numeric label="고정 너비" value={style.width} onChange={width => patchStyle({ width })} />}
        {device === "mobile" && <><label className="lb-check"><input type="checkbox" checked={style.hidden} onChange={e => patchStyle({ hidden: e.target.checked })} />모바일에서 이 레이어 숨기기</label><button className="lb-reset" onClick={() => patchNode(n => ({ ...n, mobile: {} }))}><RotateCcw size={12} />모바일 조정 초기화</button></>}
        {node.kind === "header" && <HeaderSettings config={headerOf(node, doc.menu)} onChange={header => patchNode(n => ({ ...n, header }))} preview={headerPreview} onPreview={setHeaderPreview} focus={focus?.node === node.id ? focus : undefined} />}
        {node.kind === "hero" && <HeroSettings config={withHeroDefaults(node.hero)} onChange={hero => patchNode(n => ({ ...n, hero }))} focus={focus?.node === node.id ? focus : undefined} />}
        {node.kind === "cards" && <CardsSettings config={withCardsDefaults(node.cards)} onChange={cards => patchNode(n => ({ ...n, cards }))} focus={focus?.node === node.id ? focus : undefined} />}
        {node.kind === "cta" && <CtaSettings config={withCtaDefaults(node.cta)} onChange={cta => patchNode(n => ({ ...n, cta }))} focus={focus?.node === node.id ? focus : undefined} />}
        {node.kind === "footer" && <FooterSettings config={withFooterDefaults(node.footer)} onChange={footer => patchNode(n => ({ ...n, footer }))} focus={focus?.node === node.id ? focus : undefined} />}
        {specOf(node.kind) && <BlockSettings key={node.id} spec={specOf(node.kind)!} config={withBlockDefaults(specOf(node.kind)!, node.block)} onChange={block => patchNode(n => ({ ...n, block }))} focus={focus?.node === node.id ? focus : undefined} />}
        {node.kind === "floating" && <FloatingSettings config={withFloatingDefaults(node.floating)} onChange={floating => patchNode(n => ({ ...n, floating }))} focus={focus?.node === node.id ? focus : undefined} />}
        <div className="lb-node-actions"><button aria-label="선택 레이어 위로" onClick={() => reorder(-1)}><ArrowUp size={13} /></button><button aria-label="선택 레이어 아래로" onClick={() => reorder(1)}><ArrowDown size={13} /></button><button onClick={() => commit({ ...doc, nodes: removeLayoutNode(doc.nodes, selected) })}><Trash2 size={13} />삭제</button></div>
      </div> : platform === "web" ? <PageSettings page={pageFrame} onChange={setPage} brand={pageBrand(doc)} focus={focus?.node === "page" ? focus : undefined} /> : <div className="lb-selection-hint"><Frame size={24} strokeWidth={1} /><p>레이어를 선택하면<br />배치와 간격을 조정할 수 있어요.</p></div>}
    </aside><div className="lb-stage-area" data-trash={trash ? true : undefined} onDragOver={trackTrash} onDrop={dropInTrash}>
      {trash && <div className="lb-trash-hint" role="status"><Trash2 size={14} />여기서 놓으면 레이어가 삭제돼요</div>}
      {removed && !trash && <div className="lb-toast" role="status">‘{removed}’ 레이어를 삭제했어요<button onClick={() => { undo(); setRemoved(null); }}>되돌리기</button></div>}<div className="lb-stage-description"><span>{platform === "app" ? "폰 프레임에서 바로 구성하세요." : phase === "desktop" ? "PC의 구조부터 만드세요. 다음 단계에서 모바일을 다듬습니다." : "같은 구조, 다른 배치. PC와 비교하며 모바일만 조정하세요."}</span><small>{ready ? status : "불러오는 중"}</small></div><div className={`lb-artboards ${phase === "responsive" && platform === "web" ? "lb-compare" : ""}`}>
      {platform === "web" && <DeviceArtboard mobile={false} active={device === "desktop" || column} onActivate={() => setDevice(column ? "mobile" : "desktop")} onClear={() => setSelected("")} onPage={part => { setSelected(""); setFocus({ node: "page", part, at: ++focusCount.current }); }} onResize={beginResize} resizing={resizing} doc={doc} selected={selected} onSelect={(id, part) => selectFrom(id, part, column)} onStyle={(id, kind, el) => { if (presetSets[kind]) setPicker({ kind, node: id, anchor: anchorOf(el) }); }} onDrag={beginDrag} hint={hint} onHint={trackHint} onDropHint={dropAtHint} onLeave={() => { setHint(null); setImageOver(null); }} removing={trash} imageOver={imageOver} headerPreview={headerPreview ? selected : ""} onAdd={() => add("section")} />}
      {(platform === "app" || phase === "responsive") && <DeviceArtboard mobile active={device === "mobile"} onActivate={() => setDevice("mobile")} onClear={() => setSelected("")} onPage={() => undefined} onStyle={(id, kind, el) => { if (presetSets[kind]) setPicker({ kind, node: id, anchor: anchorOf(el) }); }} onResize={beginResize} resizing={resizing} doc={doc} selected={selected} onSelect={(id, part) => selectFrom(id, part, true)} onDrag={beginDrag} hint={hint} onHint={trackHint} onDropHint={dropAtHint} onLeave={() => { setHint(null); setImageOver(null); }} removing={trash} imageOver={imageOver} headerPreview={headerPreview ? selected : ""} onAdd={() => add("section")} />}
    </div><div className="lb-stage-footer"><span><Frame size={12} />{platform === "app" ? "iPhone SE · 375 × 667" : "PC 1440 × 1024 · iPhone SE 375 × 667"}</span>{platform === "web" && <button onClick={() => { setPhase(phase === "desktop" ? "responsive" : "desktop"); setDevice(phase === "desktop" ? "mobile" : "desktop"); }}>{phase === "desktop" ? <>다음 · 모바일 다듬기<ArrowRight size={14} /></> : <><ArrowLeft size={14} />PC 편집으로</>}</button>}</div></div></div>
  </div>;
}

function Numeric({ label, value, min = 0, max = 1440, onChange }: { label: string; value: number; min?: number; max?: number; onChange: (n: number) => void }) {
  return <label className="lb-field">{label}<span className="lb-number"><input type="number" aria-label={label} min={min} max={max} value={value} onChange={e => { if (e.target.value !== "") onChange(Math.max(min, Math.min(max, Math.round(Number(e.target.value))))); }} /><small>{label === "열 개수" ? "열" : "px"}</small></span></label>;
}
function InsetsEditor({ label, value, onChange }: { label: string; value: Insets; onChange: (n: Insets) => void }) {
  return <fieldset className="lb-insets"><legend>{label}</legend><div>{["위", "오른쪽", "아래", "왼쪽"].map((side, i) => <label key={side}><input aria-label={`${label} ${side}`} type="number" min={0} max={1440} value={value[i]} onChange={e => { if (e.target.value === "") return; const next: Insets = [...value]; next[i] = Math.max(0, Math.min(1440, Math.round(Number(e.target.value)))); onChange(next); }} /><span>{side}</span></label>)}</div></fieldset>;
}

function DeviceArtboard({ mobile, active, onActivate, onClear, onPage, onStyle, onResize, resizing, doc, selected, onSelect, onDrag, onAdd, headerPreview, hint, onHint, onDropHint, onLeave, removing, imageOver }: {
  headerPreview: string; mobile: boolean; active: boolean; onActivate: () => void; onClear: () => void; onPage: (part: string) => void; resizing: Resizing | null;
  onStyle: (id: string, kind: LayoutKind, handle: Element) => void;
  onResize: (e: React.PointerEvent, id: string, axis: HandleAxis, box: DOMRect, scale: number, narrow: boolean) => void; doc: LayoutDocument; selected: string; onSelect: (id: string, part?: string) => void;
  onDrag: (e: DragEvent, payload: { id: string }) => void; onAdd: () => void;
  hint: DropHint | null; onHint: (e: DragEvent, mobile: boolean) => void; onDropHint: (e: DragEvent, mobile: boolean) => void; onLeave: () => void; removing: string | null; imageOver: ImageSlot | null;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const screen = useRef<HTMLDivElement>(null);
  const shell = useRef<HTMLDivElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const scroll = useRef({ speed: 0, last: 0, frame: 0 });
  const [scale, setScale] = useState(.4);
  const width = mobile ? 375 : 1440, height = mobile ? 667 : 1024;
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const measure = () => setScale(Math.max(.08, Math.min(1, (el.clientWidth - (mobile ? 34 : 28)) / width, (el.clientHeight - (mobile ? 130 : 90)) / height)));
    measure(); const ro = new ResizeObserver(measure); ro.observe(el); return () => ro.disconnect();
  }, [width, height, mobile]);
  useEffect(() => () => cancelAnimationFrame(scroll.current.frame), []);
  // Holding a dragged layer near the top or bottom of the screen (or just past it) scrolls the page.
  // dragover keeps firing while the pointer rests, and the loop stops once it goes quiet.
  function edgeScroll(e: DragEvent) {
    const box = screen.current?.getBoundingClientRect(), frame = shell.current?.getBoundingClientRect(); if (!box || !frame) return;
    const zone = Math.min(72, box.height / 4);
    // Past the device frame is the delete zone, so scrolling stops at the bezel.
    const inFrame = e.clientX >= frame.left && e.clientX <= frame.right && e.clientY >= frame.top && e.clientY <= frame.bottom;
    const depth = !inFrame ? 0 : e.clientY < box.top + zone ? e.clientY - (box.top + zone) : e.clientY > box.bottom - zone ? e.clientY - (box.bottom - zone) : 0;
    const state = scroll.current;
    state.speed = Math.max(-1, Math.min(1, depth / zone)) * 18 / scale; state.last = performance.now();
    if (!state.speed || state.frame) return;
    const step = () => {
      const el = viewport.current;
      if (!el || !state.speed || performance.now() - state.last > 160) { state.frame = 0; return; }
      el.scrollTop += state.speed; state.frame = requestAnimationFrame(step);
    };
    state.frame = requestAnimationFrame(step);
  }
  const frame = pageOf(doc);
  const column = !mobile && frame.mode === "column";
  // The PC artboard of a mobile-first column renders the phone layout inside the column.
  const narrow = mobile || column;
  // Contained pages keep backgrounds full width and pad page-level content in to the container edge.
  const gutter = !mobile && frame.mode === "contained" ? `max(0px, calc((100% - ${frame.maxWidth}px) / 2))` : "";
  // On PC a header placed left or right leaves the flow and becomes a column beside the page.
  const footerMenu = (() => { const header = doc.nodes.find(n => n.kind === "header"); return header ? headerOf(header, doc.menu).items : headerItems; })();
  const sideNode = narrow ? undefined : doc.nodes.find(n => n.kind === "header" && !resolveLayout(n, false).hidden && headerOf(n, doc.menu).placement !== "top");
  function render(nodes: LayoutNode[], parent: string | null): React.ReactNode {
    return nodes.map(n => {
      const s = resolveLayout(n, narrow);
      if (s.hidden) return null;
      const contain = gutter && !parent && !n.bleed;
      // Components that paint their own full-width background pull only their content in to the container.
      const ownGutter = gutterKinds.has(n.kind);
      // Cards, CTAs and footers draw their own background, so the layer padding becomes their inner spacing.
      const selfPadded = paddedComponent(n.kind);
      const g = contain ? ` + ${gutter}` : "";
      const layout: CSSProperties = { display: s.direction === "grid" ? "grid" : "flex", flexDirection: s.direction === "row" ? "row" : "column", gridTemplateColumns: s.direction === "grid" ? `repeat(${s.columns}, minmax(0,1fr))` : undefined, gap: s.gap, alignItems: s.align === "start" ? "flex-start" : s.align === "end" ? "flex-end" : s.align, justifyContent: s.justify === "start" ? "flex-start" : s.justify === "end" ? "flex-end" : s.justify, padding: selfPadded ? 0 : contain && !ownGutter ? `${s.padding[0]}px calc(${s.padding[1]}px + ${gutter}) ${s.padding[2]}px calc(${s.padding[3]}px + ${gutter})` : s.padding.map(v => `${v}px`).join(" "), margin: s.margin.map(v => `${v}px`).join(" "), minHeight: s.height, width: s.sizing === "fixed" ? s.width : undefined, flexGrow: parent && s.sizing === "fill" ? 1 : 0, flexBasis: s.sizing === "fill" && parent && resolveLayout(findLayoutNode(doc.nodes, parent)!, narrow).direction === "row" ? 0 : undefined, ...(contain && ownGutter ? { "--lb-gutter": gutter } : {}),
        ...(selfPadded ? { "--np-t": `${s.padding[0]}px`, "--np-r": `calc(${s.padding[1]}px${g})`, "--np-b": `${s.padding[2]}px`, "--np-l": `calc(${s.padding[3]}px${g})` } : {}), ...(n.kind === "floating" ? floatPos(withFloatingDefaults(n.floating), narrow) : {}), ...(isOverlayBlock(n.kind) ? { position: "absolute", inset: 0 } : {}) } as CSSProperties;
      const marked = hint?.target === n.id ? hint.edge : undefined;
      return <div key={n.id} data-id={n.id} data-parent={parent ?? undefined} data-drop={marked === "inside" ? "inside" : undefined} data-removing={removing === n.id || undefined} data-image-over={imageOver?.node === n.id ? imageOver.slot : undefined} className={`lb-layout-node lb-kind-${n.kind} ${selected === n.id && active ? "is-selected" : ""}`} style={layout}
        onClickCapture={e => {
          // Capture runs before the frames' own buttons swallow the click, so a part can still be picked.
          if ((e.target as HTMLElement).closest(".lb-layout-node") !== e.currentTarget) return;
          onSelect(n.id, (e.target as HTMLElement).closest<HTMLElement>("[data-edit]")?.dataset.edit);
        }} onClick={e => e.stopPropagation()}>
        <div className="lb-node-label" draggable title={presetSets[n.kind] ? "클릭: 스타일 바꾸기 · 끌기: 옮기기" : "끌어서 옮기기"} data-styles={presetSets[n.kind] ? true : undefined} onDragStart={e => onDrag(e, { id: n.id })} onClick={e => onStyle(n.id, n.kind, e.currentTarget)}><GripVertical size={13} />{n.name}{presetSets[n.kind] && <ChevronDown size={12} />}</div>
        {selected === n.id && active && n.kind !== "floating" && !isOverlayBlock(n.kind) && <ResizeHandles width={!!parent && !isComponentKind(n.kind)} padding={s.padding} margin={s.margin} size={resizing?.id === n.id ? resizing : null} onStart={(e, axis) => onResize(e, n.id, axis, (e.currentTarget.parentElement as HTMLElement).getBoundingClientRect(), scale, narrow)} />}
        {(marked === "before" || marked === "after") && <div className="lb-drop-line" data-edge={marked} data-axis={hint!.axis}><span>여기에 놓기</span></div>}
        {n.kind === "header" ? <HeaderFrame config={headerOf(n, doc.menu)} mobile={narrow} preview={headerPreview === n.id} /> : n.kind === "hero" ? <HeroFrame config={withHeroDefaults(n.hero)} mobile={narrow} viewport={height} />
          : n.kind === "cards" ? <CardsFrame config={withCardsDefaults(n.cards)} mobile={narrow} />
          : n.kind === "cta" ? <CtaFrame config={withCtaDefaults(n.cta)} mobile={narrow} />
          : n.kind === "footer" ? <FooterFrame config={withFooterDefaults(n.footer)} menu={footerMenu} mobile={narrow} />
          : n.kind === "floating" ? <FloatingFrame config={withFloatingDefaults(n.floating)} mobile={narrow} />
          : specOf(n.kind) ? <BlockFrame kind={n.kind} config={withBlockDefaults(specOf(n.kind)!, n.block)} mobile={narrow} /> : n.children.length ? render(n.children, n.id) : <div className="lb-drop-placeholder"><Plus size={24} strokeWidth={1} /><span>{n.kind === "section" ? "이 섹션에 프레임을 드래그하세요" : "컴포넌트가 들어갈 빈 프레임"}</span></div>}
      </div>;
    });
  }
  // Floating layers stay pinned to the screen, so they render in an overlay above the scrolling page.
  // Layers like popups and toasts would cover the page while editing, so they open only while selected
  // (the scroll progress marker is small enough to stay); the rest wait as chips in a corner.
  const floating = (n: LayoutNode) => n.kind === "floating" || isOverlayBlock(n.kind);
  const shown = (n: LayoutNode) => n.kind === "floating" || n.kind === "progress" || n.id === selected;
  const floats = doc.nodes.filter(n => floating(n) && shown(n));
  const parked = doc.nodes.filter(n => floating(n) && !shown(n));
  const flow = doc.nodes.filter(n => n !== sideNode && !floating(n));
  const page = <>{render(flow, null)}{hint?.edge === "end" && <div className="lb-drop-line lb-drop-end" data-axis="y"><span>여기에 놓기</span></div>}{!doc.nodes.length && <div className="lb-start"><Frame size={44} strokeWidth={1} /><h2>{mobile ? "나의 첫 앱 화면" : "나의 첫 웹 페이지"}</h2><p>섹션을 놓고, 프레임을 배치해보세요.</p><button onClick={e => { e.stopPropagation(); onAdd(); }}><Plus size={17} />첫 섹션 추가</button></div>}<button className="lb-page-add" onClick={e => { e.stopPropagation(); onAdd(); }}><Plus size={17} />섹션 추가</button>{gutter && <div className="lb-container-guide" style={{ width: frame.maxWidth }} aria-hidden />}</>;
  return <div className={`lb-device-area ${active ? "active" : ""}`} ref={ref} onDragOverCapture={edgeScroll}><button className="lb-artboard-title" onClick={onActivate}>{mobile ? <Smartphone size={13} /> : <Monitor size={13} />}<strong>{mobile ? "iPhone SE" : "Desktop"}</strong><span>{width} × {height}</span>{active && <Check size={12} />}<small>{Math.round(scale * 100)}%</small></button><div className={`lb-device-shell ${mobile ? "lb-phone" : "lb-monitor"}`} ref={shell} style={{ width: width * scale + (mobile ? 24 : 20), height: height * scale + (mobile ? 94 : 44) }}>
    {mobile ? <div className="lb-phone-speaker" /> : <div className="lb-monitor-camera" />}<div className="lb-scaled-viewport" ref={screen} style={{ width: width * scale, height: height * scale }}><div className="lb-viewport" ref={viewport} data-device={mobile ? "mobile" : "desktop"} style={{ width, height, transform: `scale(${scale})`, "--lb-scale": scale, "--lb-vh": `${height}px` } as CSSProperties} onClick={() => { onActivate(); onClear(); }}
      onDragOver={e => onHint(e, narrow)} onDrop={e => onDropHint(e, narrow)} onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget as Node)) onLeave(); }}><div className="lb-page-content" data-page={mobile ? undefined : frame.mode}>{column ? <ColumnPage frame={frame} brand={pageBrand(doc)} onPart={onPage}>{page}</ColumnPage>
        : sideNode ? <div className="lb-page-split" data-side={headerOf(sideNode, doc.menu).placement}>{render([sideNode], null)}<div className="lb-page-main">{page}</div></div> : page}</div></div>
      {parked.length > 0 && <div className="lb-overlay-chips" data-compact={mobile || undefined}>{parked.map(n => { const Icon = kindIcons[n.kind]; return <button key={n.id} type="button" title={`${n.name} · 눌러서 펼쳐 보고 편집하기`} onClick={e => { e.stopPropagation(); onSelect(n.id); }}><Icon size={12} /><span>{n.name}</span></button>; })}</div>}
      {floats.length > 0 && <div className="lb-overlay" style={{ width, height, transform: `scale(${scale})`, "--lb-scale": scale } as CSSProperties}>
        <div className="lb-overlay-frame" style={column ? { width: frame.maxWidth, ...(frame.aside ? { marginLeft: `calc((100% - ${frame.maxWidth + asideSpan}px) / 2 + ${asideSpan}px)` } : {}) } : undefined}>{render(floats, null)}</div></div>}
      {!mobile && hint?.edge === "side" && <div className="lb-side-zone" data-side={hint.side}><span>{hint.side === "left" ? "왼쪽" : "오른쪽"} 사이드 내비로 놓기</span></div>}</div>{mobile ? <div className="lb-phone-home" /> : <div className="lb-monitor-foot" />}</div></div>;
}

// Handles on the selected layer. Inside the bottom edge (blue): height, which for components means
// padding. Outside the top and bottom edges (orange): margins. Right edge and corner: width inside a
// parent. The padding and margin areas are tinted so the drag shows what it changes.
function ResizeHandles({ width, padding, margin, size, onStart }: { width: boolean; padding: Insets; margin: Insets; size: Resizing | null; onStart: (e: React.PointerEvent, axis: HandleAxis) => void }) {
  const stop = (e: React.MouseEvent) => e.stopPropagation();
  return <>
    <span className="lb-pad-box" aria-hidden style={{ borderWidth: padding.map(v => `${v}px`).join(" ") }} />
    <span className="lb-margin-box" aria-hidden style={{ top: -margin[0], right: -margin[1], bottom: -margin[2], left: -margin[3], borderWidth: margin.map(v => `${v}px`).join(" ") }} />
    <div className="lb-resize lb-resize-y" title="끌어서 높이 · 안쪽 여백(패딩) 조절" onPointerDown={e => onStart(e, "y")} onClick={stop} />
    <div className="lb-margin-handle" data-edge="top" title="끌어서 위 바깥 여백(마진) 조절" style={{ top: -margin[0] }} onPointerDown={e => onStart(e, "mt")} onClick={stop} />
    <div className="lb-margin-handle" data-edge="bottom" title="끌어서 아래 바깥 여백(마진) 조절" style={{ bottom: -margin[2] }} onPointerDown={e => onStart(e, "mb")} onClick={stop} />
    {width && <><div className="lb-resize lb-resize-x" title="끌어서 너비 조절" onPointerDown={e => onStart(e, "x")} onClick={stop} />
      <div className="lb-resize lb-resize-xy" title="끌어서 너비와 높이 조절" onPointerDown={e => onStart(e, "xy")} onClick={stop} /></>}
    {size && <span className="lb-resize-size">{size.label ?? `${size.w} × ${size.h}`}</span>}
  </>;
}

// A fixed QR-looking placeholder: finder-like corners and a scattered middle.
const qrPattern = [1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1].map(Boolean);
// Mobile-first PC page: the phone layout centered on a backdrop, optionally beside a sticky brand panel.
// Every part of the panel is page content: clicking one opens its field in the page settings.
function ColumnPage({ frame, brand, onPart, children }: { frame: PageFrame; brand: string; onPart: (part: string) => void; children: React.ReactNode }) {
  const [bg, fg, muted] = surfaceColors[frame.backdrop];
  return <div className="lb-page-column-wrap" style={{ "--lb-backdrop": bg, "--lb-backdrop-fg": fg, "--lb-backdrop-muted": muted, "--lb-col": `${frame.maxWidth}px` } as CSSProperties}
    onClick={e => { const part = (e.target as HTMLElement).closest<HTMLElement>("[data-edit]")?.dataset.edit; if (part && !(e.target as HTMLElement).closest(".lb-page-column")) { e.stopPropagation(); onPart(part); } }}>
    {frame.aside && <aside className="lb-page-aside" data-edit="backdrop" data-align={frame.asideAlign}>
      {/* eslint-disable-next-line @next/next/no-img-element -- inline data URL from the user's drop */}
      <strong className="lb-aside-logo" data-edit="aside-logo" data-image-drop="aside">{frame.asideImage ? <img src={frame.asideImage} alt={frame.asideLogo || brand} draggable={false} /> : frame.asideLogo || brand}</strong>
      {frame.asideTitle && <h2 data-edit="aside-title">{frame.asideTitle}</h2>}
      {frame.asideText && <p data-edit="aside-text">{frame.asideText}</p>}
      {frame.asideCta && <span className="lb-aside-cta" data-edit="aside-cta">{frame.asideCta}</span>}
      {frame.asideQr && <span className="lb-page-qr" data-edit="aside-qr">{qrPattern.map((on, i) => <i key={i} data-on={on || undefined} />)}</span>}
      {frame.asideStores && <div className="lb-page-stores" data-edit="aside-stores"><span>App Store</span><span>Google Play</span></div>}</aside>}
    <div className="lb-page-column">{children}</div>
  </div>;
}
