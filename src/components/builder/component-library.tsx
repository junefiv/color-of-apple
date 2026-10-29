"use client";

import type { DragEvent } from "react";
import { X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { usePopover, type Anchor } from "./preset-popover";

export type LibraryItem = { kind: string; name: string; note: string; group: string; icon: LucideIcon };

// Every page component, grouped, in one popover. Picking one opens its style picker; dragging one
// onto an artboard inserts it with default settings.
export function ComponentLibrary({ anchor, items, onPick, onDrag, onClose }: { anchor: Anchor; items: LibraryItem[]; onPick: (kind: string, tile: Element) => void; onDrag: (e: DragEvent, kind: string) => void; onClose: () => void }) {
  const [box, pos] = usePopover(anchor, onClose);
  const groups = [...new Set(items.map(i => i.group))];
  return <div ref={box} className="lb-popover lb-library" role="dialog" aria-label="컴포넌트 추가" style={pos ? { left: pos.left, top: pos.top } : { visibility: "hidden", left: 0, top: 0 }}>
    <div className="lb-popover-head"><strong>컴포넌트 추가</strong><button type="button" aria-label="닫기" onClick={onClose}><X size={13} /></button></div>
    <p>고르면 스타일을 고를 수 있어요. 끌어서 원하는 자리에 바로 놓아도 돼요.</p>
    {groups.map(group => <section key={group}><h4>{group}</h4><div className="lb-library-grid">{items.filter(i => i.group === group).map(item => {
      const Icon = item.icon;
      return <button key={item.kind} type="button" draggable onDragStart={e => onDrag(e, item.kind)} onClick={e => onPick(item.kind, e.currentTarget)}><Icon size={15} /><span><b>{item.name}</b><small>{item.note}</small></span></button>;
    })}</div></section>)}
  </div>;
}
