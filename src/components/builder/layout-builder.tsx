"use client";

import { useEffect, useRef, useState, type CSSProperties, type DragEvent } from "react";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Check, ChevronRight, Download, Frame, GripVertical, Layers, Menu, Monitor, Plus, Redo2, RotateCcw, Smartphone, Trash2, Undo2 } from "lucide-react";
import { HeaderFrame } from "./header-frame";
import { HeaderSettings } from "./header-settings";
import { defaultHeader } from "@/lib/header-config";
import { findLayoutNode, insertLayoutNode, moveLayoutNode, newLayoutNode, removeLayoutNode, resolveLayout, updateLayoutNode, validLayoutDocument, type Insets, type LayoutDocument, type LayoutNode, type LayoutStyle } from "@/lib/page-layout";

const emptyDocument: LayoutDocument = { version: 1, nodes: [], menu: "overlay" };
type Device = "desktop" | "mobile";
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
  const drag = useRef<{ id?: string; kind?: LayoutNode["kind"] } | null>(null);
  const node = findLayoutNode(doc.nodes, selected);
  const style = node ? resolveLayout(node, device === "mobile") : null;
  const storageKey = `coa-layout-v1-${platform}`;
  useEffect(() => {
    try { const raw = localStorage.getItem(storageKey); if (raw) { const parsed: unknown = JSON.parse(raw); if (validLayoutDocument(parsed)) setDoc(parsed); } } catch { /* Keep the editor usable without storage. */ }
    setReady(true);
  }, [storageKey]);
  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem(storageKey, JSON.stringify(doc)); setStatus("이 브라우저에 저장됨"); } catch { setStatus("저장 불가 · JSON으로 보관하세요"); }
  }, [doc, ready, storageKey]);
  useEffect(() => { if (selected && !findLayoutNode(doc.nodes, selected)) setSelected(""); }, [doc.nodes, selected]);

  function commit(next: LayoutDocument) { setPast(p => [...p.slice(-49), doc]); setFuture([]); setDoc(next); }
  function patchNode(update: (n: LayoutNode) => LayoutNode) { if (node) commit({ ...doc, nodes: updateLayoutNode(doc.nodes, node.id, update) }); }
  function patchStyle(patch: Partial<LayoutStyle>) { patchNode(n => ({ ...n, [device]: { ...n[device], ...patch } })); }
  function add(kind: LayoutNode["kind"], parent: string | null = null, before?: string) {
    const item = newLayoutNode(kind);
    const siblings = parent ? findLayoutNode(doc.nodes, parent)?.children ?? [] : doc.nodes;
    const index = before ? siblings.findIndex(n => n.id === before) : siblings.length;
    commit({ ...doc, nodes: insertLayoutNode(doc.nodes, item, parent, index < 0 ? undefined : index) }); setSelected(item.id);
  }
  function beginDrag(e: DragEvent, payload: NonNullable<typeof drag.current>) { e.stopPropagation(); drag.current = payload; e.dataTransfer.effectAllowed = "move"; e.dataTransfer.setData("text/plain", JSON.stringify(payload)); }
  function drop(e: DragEvent, parent: string | null, before?: string) {
    e.preventDefault(); e.stopPropagation(); const source = drag.current; drag.current = null; if (!source) return;
    if (source.id) commit({ ...doc, nodes: moveLayoutNode(doc.nodes, source.id, parent, before) });
    else if (source.kind) add(source.kind, source.kind === "section" || source.kind === "header" ? null : parent, before);
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
  function undo() { if (!past.length) return; setFuture(f => [doc, ...f]); setDoc(past[past.length - 1]); setPast(p => p.slice(0, -1)); }
  function redo() { if (!future.length) return; setPast(p => [...p, doc]); setDoc(future[0]); setFuture(f => f.slice(1)); }

  const renderTree = (nodes: LayoutNode[], parent: string | null, depth = 0): React.ReactNode => nodes.map(n => <div key={n.id}>
    <button className={`lb-tree-node ${selected === n.id ? "active" : ""}`} style={{ paddingLeft: 10 + depth * 14 }} draggable onDragStart={e => beginDrag(e, { id: n.id })} onDragEnd={() => { drag.current = null; }} onDragOver={e => e.preventDefault()} onDrop={e => drop(e, parent, n.id)} onClick={() => setSelected(n.id)}><GripVertical size={11} /><span>{n.kind === "section" ? <Layers size={13} /> : <Frame size={13} />}</span>{n.name}{resolveLayout(n, device === "mobile").hidden && <small>숨김</small>}</button>
    {renderTree(n.children, n.id, depth + 1)}
  </div>);

  return <div className="layout-builder" data-platform={platform}>
    <div className="lb-toolbar"><div className="lb-history"><button aria-label="배치 실행 취소" disabled={!past.length} onClick={undo}><Undo2 size={14} /></button><button aria-label="배치 다시 실행" disabled={!future.length} onClick={redo}><Redo2 size={14} /></button><span /></div><div className="lb-steps">{platform === "web" ? <><button aria-pressed={phase === "desktop"} onClick={() => { setPhase("desktop"); setDevice("desktop"); }}><span>1</span>PC 만들기</button><ChevronRight size={12} /><button aria-pressed={phase === "responsive"} onClick={() => { setPhase("responsive"); setDevice("mobile"); }}><span>2</span>모바일 다듬기</button></> : <span className="lb-app-label"><Smartphone size={14} />앱 화면 만들기 · 375 × 667</span>}</div><button className="lb-export" onClick={exportLayout} title="구조 JSON 내보내기"><Download size={14} /><span>구조</span></button></div>
    <div className="lb-body"><aside className="lb-controls" aria-label="레이어와 배치 속성"><div className="lb-control-heading"><Layers size={14} /><strong>레이어</strong><small>드래그로 이동</small></div><div className="lb-inserts"><button draggable onDragStart={e => beginDrag(e, { kind: "section" })} onClick={() => add("section")}><Plus size={12} />섹션</button><button draggable onDragStart={e => beginDrag(e, { kind: "frame" })} onClick={() => add("frame", node && node.kind !== "header" ? node.id : null)}><Frame size={12} />빈 프레임</button><button draggable onDragStart={e => beginDrag(e, { kind: "header" })} onClick={() => add("header")}><Menu size={12} />헤더 프레임</button></div><p className="lb-note">프레임을 섹션 안으로 드래그하세요.<br />배치와 간격부터 잡고, 컴포넌트는 나중에.</p><div className="lb-tree" onDragOver={e => e.preventDefault()} onDrop={e => drop(e, null)}>{doc.nodes.length ? renderTree(doc.nodes, null) : <p>아직 레이어가 없어요.<br />섹션을 추가해 시작하세요.</p>}<div className="lb-root-drop">페이지 끝으로 이동</div></div>
      {node && style ? <div className="lb-properties"><div className="lb-control-heading"><strong>배치 속성</strong><span className="lb-device-tag">{device === "desktop" ? "PC" : "모바일"}</span></div><label className="lb-field">이름<input value={node.name} onChange={e => patchNode(n => ({ ...n, name: e.target.value }))} /></label><div className="lb-device-notice">{device === "desktop" ? "PC의 기본 배치를 편집합니다." : "미지정 값은 PC에서 이어받습니다.\n변경한 속성만 모바일에 적용됩니다."}</div>
        <label className="lb-field">배치 방향<select value={style.direction} onChange={e => patchStyle({ direction: e.target.value as LayoutStyle["direction"] })}><option value="column">세로 · Column</option><option value="row">가로 · Row</option><option value="grid">그리드 · Grid</option></select></label>
        {style.direction === "grid" && <Numeric label="열 개수" value={style.columns} min={1} max={12} onChange={columns => patchStyle({ columns })} />}
        <div className="lb-two-fields"><label className="lb-field">교차축 정렬<select value={style.align} onChange={e => patchStyle({ align: e.target.value as LayoutStyle["align"] })}><option value="stretch">채우기</option><option value="start">시작</option><option value="center">가운데</option><option value="end">끝</option></select></label><label className="lb-field">주축 정렬<select value={style.justify} onChange={e => patchStyle({ justify: e.target.value as LayoutStyle["justify"] })}><option value="start">시작</option><option value="center">가운데</option><option value="end">끝</option><option value="space-between">양쪽 분배</option></select></label></div>
        <Numeric label="요소 사이 간격" value={style.gap} onChange={gap => patchStyle({ gap })} />
        <InsetsEditor label="Padding · 안쪽 여백" value={style.padding} onChange={padding => patchStyle({ padding })} />
        <InsetsEditor label="Margin · 바깥 여백" value={style.margin} onChange={margin => patchStyle({ margin })} />
        <div className="lb-two-fields"><label className="lb-field">너비<select value={style.sizing} onChange={e => patchStyle({ sizing: e.target.value as LayoutStyle["sizing"] })}><option value="fill">부모 채우기</option><option value="fixed">고정 px</option></select></label><Numeric label="최소 높이" value={style.height} onChange={height => patchStyle({ height })} /></div>
        {style.sizing === "fixed" && <Numeric label="고정 너비" value={style.width} onChange={width => patchStyle({ width })} />}
        {device === "mobile" && <><label className="lb-check"><input type="checkbox" checked={style.hidden} onChange={e => patchStyle({ hidden: e.target.checked })} />모바일에서 이 레이어 숨기기</label><button className="lb-reset" onClick={() => patchNode(n => ({ ...n, mobile: {} }))}><RotateCcw size={12} />모바일 조정 초기화</button></>}
        {node.kind === "header" && <HeaderSettings config={node.header ?? defaultHeader(doc.menu)} onChange={header => patchNode(n => ({ ...n, header }))} preview={headerPreview} onPreview={setHeaderPreview} />}
        <div className="lb-node-actions"><button aria-label="선택 레이어 위로" onClick={() => reorder(-1)}><ArrowUp size={13} /></button><button aria-label="선택 레이어 아래로" onClick={() => reorder(1)}><ArrowDown size={13} /></button><button onClick={() => commit({ ...doc, nodes: removeLayoutNode(doc.nodes, selected) })}><Trash2 size={13} />삭제</button></div>
      </div> : <div className="lb-selection-hint"><Frame size={24} strokeWidth={1} /><p>레이어를 선택하면<br />배치와 간격을 조정할 수 있어요.</p></div>}
    </aside><div className="lb-stage-area"><div className="lb-stage-description"><span>{platform === "app" ? "폰 프레임에서 바로 구성하세요." : phase === "desktop" ? "PC의 구조부터 만드세요. 다음 단계에서 모바일을 다듬습니다." : "같은 구조, 다른 배치. PC와 비교하며 모바일만 조정하세요."}</span><small>{ready ? status : "불러오는 중"}</small></div><div className={`lb-artboards ${phase === "responsive" && platform === "web" ? "lb-compare" : ""}`}>
      {platform === "web" && <DeviceArtboard mobile={false} active={device === "desktop"} onActivate={() => setDevice("desktop")} doc={doc} selected={selected} onSelect={id => { setSelected(id); setDevice("desktop"); }} onDrag={beginDrag} onDrop={drop} headerPreview={headerPreview ? selected : ""} onAdd={() => add("section")} />}
      {(platform === "app" || phase === "responsive") && <DeviceArtboard mobile active={device === "mobile"} onActivate={() => setDevice("mobile")} doc={doc} selected={selected} onSelect={id => { setSelected(id); setDevice("mobile"); }} onDrag={beginDrag} onDrop={drop} headerPreview={headerPreview ? selected : ""} onAdd={() => add("section")} />}
    </div><div className="lb-stage-footer"><span><Frame size={12} />{platform === "app" ? "iPhone SE · 375 × 667" : "PC 1440 × 1024 · iPhone SE 375 × 667"}</span>{platform === "web" && <button onClick={() => { setPhase(phase === "desktop" ? "responsive" : "desktop"); setDevice(phase === "desktop" ? "mobile" : "desktop"); }}>{phase === "desktop" ? <>다음 · 모바일 다듬기<ArrowRight size={14} /></> : <><ArrowLeft size={14} />PC 편집으로</>}</button>}</div></div></div>
  </div>;
}

function Numeric({ label, value, min = 0, max = 1440, onChange }: { label: string; value: number; min?: number; max?: number; onChange: (n: number) => void }) {
  return <label className="lb-field">{label}<span className="lb-number"><input type="number" aria-label={label} min={min} max={max} value={value} onChange={e => { if (e.target.value !== "") onChange(Math.max(min, Math.min(max, Math.round(Number(e.target.value))))); }} /><small>{label === "열 개수" ? "열" : "px"}</small></span></label>;
}
function InsetsEditor({ label, value, onChange }: { label: string; value: Insets; onChange: (n: Insets) => void }) {
  return <fieldset className="lb-insets"><legend>{label}</legend><div>{["위", "오른쪽", "아래", "왼쪽"].map((side, i) => <label key={side}><input aria-label={`${label} ${side}`} type="number" min={0} max={1440} value={value[i]} onChange={e => { if (e.target.value === "") return; const next: Insets = [...value]; next[i] = Math.max(0, Math.min(1440, Math.round(Number(e.target.value)))); onChange(next); }} /><span>{side}</span></label>)}</div></fieldset>;
}

function DeviceArtboard({ mobile, active, onActivate, doc, selected, onSelect, onDrag, onDrop, onAdd, headerPreview }: {
  headerPreview: string; mobile: boolean; active: boolean; onActivate: () => void; doc: LayoutDocument; selected: string; onSelect: (id: string) => void;
  onDrag: (e: DragEvent, payload: { id: string }) => void; onDrop: (e: DragEvent, parent: string | null, before?: string) => void; onAdd: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(.4);
  const width = mobile ? 375 : 1440, height = mobile ? 667 : 1024;
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const measure = () => setScale(Math.max(.08, Math.min(1, (el.clientWidth - (mobile ? 34 : 28)) / width, (el.clientHeight - (mobile ? 130 : 90)) / height)));
    measure(); const ro = new ResizeObserver(measure); ro.observe(el); return () => ro.disconnect();
  }, [width, height, mobile]);
  function render(nodes: LayoutNode[], parent: string | null): React.ReactNode {
    return nodes.map(n => {
      const s = resolveLayout(n, mobile);
      if (s.hidden) return null;
      const layout: CSSProperties = { display: s.direction === "grid" ? "grid" : "flex", flexDirection: s.direction === "row" ? "row" : "column", gridTemplateColumns: s.direction === "grid" ? `repeat(${s.columns}, minmax(0,1fr))` : undefined, gap: s.gap, alignItems: s.align === "start" ? "flex-start" : s.align === "end" ? "flex-end" : s.align, justifyContent: s.justify === "start" ? "flex-start" : s.justify === "end" ? "flex-end" : s.justify, padding: s.padding.map(v => `${v}px`).join(" "), margin: s.margin.map(v => `${v}px`).join(" "), minHeight: s.height, width: s.sizing === "fixed" ? s.width : undefined, flexGrow: parent && s.sizing === "fill" ? 1 : 0, flexBasis: s.sizing === "fill" && parent && resolveLayout(findLayoutNode(doc.nodes, parent)!, mobile).direction === "row" ? 0 : undefined };
      return <div key={n.id} className={`lb-layout-node lb-kind-${n.kind} ${selected === n.id && active ? "is-selected" : ""}`} style={layout} onClick={e => { e.stopPropagation(); onSelect(n.id); }} onDragOver={e => { e.preventDefault(); e.stopPropagation(); }} onDrop={e => onDrop(e, n.kind === "header" ? parent : n.id, n.kind === "header" ? n.id : undefined)}>
        <div className="lb-node-label" draggable onDragStart={e => onDrag(e, { id: n.id })}><GripVertical size={13} />{n.name}</div>
        <div className="lb-insert-before" title="이 레이어 앞으로 이동" onDragOver={e => { e.preventDefault(); e.stopPropagation(); }} onDrop={e => onDrop(e, parent, n.id)} />
        {n.kind === "header" ? <HeaderFrame config={n.header ?? defaultHeader(doc.menu)} mobile={mobile} preview={headerPreview === n.id} /> : n.children.length ? render(n.children, n.id) : <div className="lb-drop-placeholder"><Plus size={24} strokeWidth={1} /><span>{n.kind === "section" ? "이 섹션에 프레임을 드래그하세요" : "컴포넌트가 들어갈 빈 프레임"}</span></div>}
      </div>;
    });
  }
  return <div className={`lb-device-area ${active ? "active" : ""}`} ref={ref}><button className="lb-artboard-title" onClick={onActivate}>{mobile ? <Smartphone size={13} /> : <Monitor size={13} />}<strong>{mobile ? "iPhone SE" : "Desktop"}</strong><span>{width} × {height}</span>{active && <Check size={12} />}<small>{Math.round(scale * 100)}%</small></button><div className={`lb-device-shell ${mobile ? "lb-phone" : "lb-monitor"}`} style={{ width: width * scale + (mobile ? 24 : 20), height: height * scale + (mobile ? 94 : 44) }}>
    {mobile ? <div className="lb-phone-speaker" /> : <div className="lb-monitor-camera" />}<div className="lb-scaled-viewport" style={{ width: width * scale, height: height * scale }}><div className="lb-viewport" data-device={mobile ? "mobile" : "desktop"} style={{ width, height, transform: `scale(${scale})` }} onClick={onActivate} onDragOver={e => e.preventDefault()} onDrop={e => onDrop(e, null)}><div className="lb-page-content">{render(doc.nodes, null)}{!doc.nodes.length && <div className="lb-start"><Frame size={44} strokeWidth={1} /><h2>{mobile ? "나의 첫 앱 화면" : "나의 첫 웹 페이지"}</h2><p>섹션을 놓고, 프레임을 배치해보세요.</p><button onClick={e => { e.stopPropagation(); onAdd(); }}><Plus size={17} />첫 섹션 추가</button></div>}<button className="lb-page-add" onClick={e => { e.stopPropagation(); onAdd(); }}><Plus size={17} />섹션 추가</button></div></div></div>{mobile ? <div className="lb-phone-home" /> : <div className="lb-monitor-foot" />}</div></div>;
}
