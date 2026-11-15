"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { Check, X } from "lucide-react";

// `preview` is a large render of the same choice, shown beside the list while the choice is hovered.
export type PresetChoice = { key: string; name: string; note: string; thumb?: ReactNode; preview?: ReactNode };
export type Anchor = { left: number; top: number; right: number; bottom: number };

// Places a popover next to its anchor (below, flipped above when it would run off the window, kept on
// screen) and closes it on Escape or a press anywhere outside it.
export function usePopover(anchor: Anchor, onClose: () => void): [RefObject<HTMLDivElement | null>, { left: number; top: number } | null] {
  const box = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null);
  useLayoutEffect(() => {
    const el = box.current; if (!el) return;
    const place = () => {
      const w = el.offsetWidth, h = el.offsetHeight, gap = 8;
      const below = anchor.bottom + gap + h <= window.innerHeight;
      const top = below ? anchor.bottom + gap : Math.max(gap, anchor.top - gap - h);
      const left = Math.min(Math.max(gap, anchor.left), window.innerWidth - w - gap);
      setPos(prev => prev && prev.left === left && prev.top === top ? prev : { left, top });
    };
    place();
    // Re-place when the popover's own size changes (thumbnails loading, a wider layout) or the window resizes.
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(place);
    observer?.observe(el);
    window.addEventListener("resize", place);
    return () => { observer?.disconnect(); window.removeEventListener("resize", place); };
  }, [anchor]);
  useEffect(() => {
    const down = (e: PointerEvent) => { if (!box.current?.contains(e.target as Node)) onClose(); };
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("pointerdown", down, true); window.addEventListener("keydown", key);
    return () => { window.removeEventListener("pointerdown", down, true); window.removeEventListener("keydown", key); };
  }, [onClose]);
  return [box, pos];
}

// Style picker shown next to whatever opened it: the component library, or a layer's handle in the
// preview. It renders in place (fixed) rather than in a portal so the thumbnails inherit the live palette tokens.
export function PresetPopover({ title, note, anchor, choices, onPick, onClose, action = "이 스타일로 추가" }: { title: string; note: string; anchor: Anchor; choices: PresetChoice[]; onPick: (key: string) => void; onClose: () => void; action?: string }) {
  const [box, pos] = usePopover(anchor, onClose);
  const previews = choices.some(c => c.preview);
  // With previews, a click only selects; the button under the large preview adds the selected style
  // (a double click adds at once). Hovering or focusing another choice shows it until the pointer leaves.
  const [selected, setSelected] = useState(choices[0]?.key ?? "");
  const [peek, setPeek] = useState<string | null>(null);
  const picked = choices.find(c => c.key === selected) ?? choices[0];
  const shown = choices.find(c => c.key === peek) ?? picked;
  return <div ref={box} className="lb-popover" data-thumbs={choices.some(c => c.thumb) || undefined} data-preview={previews || undefined} role="dialog" aria-label={title} style={pos ? { left: pos.left, top: pos.top } : { visibility: "hidden", left: 0, top: 0 }}>
    <div className="lb-popover-head"><strong>{title}</strong><button type="button" aria-label="닫기" onClick={onClose}><X size={13} /></button></div>
    <p>{note}</p>
    {/* Thumbnails render real component markup (with its own buttons), so a transparent button laid over each
        choice takes the click instead of wrapping it. */}
    <ul onPointerLeave={() => setPeek(null)}>{choices.map(choice => <li key={choice.key} data-selected={previews && choice.key === picked?.key || undefined} data-active={previews && choice.key === shown?.key || undefined} onPointerEnter={() => previews && setPeek(choice.key)}>
      <button type="button" className="lb-choice-hit" aria-label={`${choice.name} · ${choice.note}`} aria-pressed={previews ? choice.key === picked?.key : undefined}
        onFocus={() => previews && setPeek(choice.key)} onBlur={() => setPeek(null)}
        onClick={() => { if (previews) { setSelected(choice.key); setPeek(null); } else onPick(choice.key); }}
        onDoubleClick={() => previews && onPick(choice.key)} />
      {choice.thumb}<span className="lb-choice-text"><b>{choice.name}</b><small>{choice.note}</small></span><Check size={13} aria-hidden /></li>)}</ul>
    {previews && shown && picked && <aside className="lb-choice-preview" aria-live="polite">
      {shown.preview}
      <div className="lb-choice-preview-foot"><span><b>{shown.name}</b><small>{shown.key === picked.key ? "선택됨" : "미리 보는 중 · 눌러서 선택"}{" · "}{shown.note}</small></span>
        <button type="button" onClick={() => onPick(picked.key)}>{action}</button></div>
    </aside>}
  </div>;
}
