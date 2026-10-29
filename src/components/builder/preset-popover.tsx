"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { Check, X } from "lucide-react";

export type PresetChoice = { key: string; name: string; note: string; thumb?: ReactNode };
export type Anchor = { left: number; top: number; right: number; bottom: number };

// Places a popover next to its anchor (below, flipped above when it would run off the window, kept on
// screen) and closes it on Escape or a press anywhere outside it.
export function usePopover(anchor: Anchor, onClose: () => void): [RefObject<HTMLDivElement | null>, { left: number; top: number } | null] {
  const box = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null);
  useLayoutEffect(() => {
    const el = box.current; if (!el) return;
    const w = el.offsetWidth, h = el.offsetHeight, gap = 8;
    const below = anchor.bottom + gap + h <= window.innerHeight;
    const top = below ? anchor.bottom + gap : Math.max(gap, anchor.top - gap - h);
    const left = Math.min(Math.max(gap, anchor.left), window.innerWidth - w - gap);
    setPos({ left, top });
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
export function PresetPopover({ title, note, anchor, choices, onPick, onClose }: { title: string; note: string; anchor: Anchor; choices: PresetChoice[]; onPick: (key: string) => void; onClose: () => void }) {
  const [box, pos] = usePopover(anchor, onClose);
  return <div ref={box} className="lb-popover" data-thumbs={choices.some(c => c.thumb) || undefined} role="dialog" aria-label={title} style={pos ? { left: pos.left, top: pos.top } : { visibility: "hidden", left: 0, top: 0 }}>
    <div className="lb-popover-head"><strong>{title}</strong><button type="button" aria-label="닫기" onClick={onClose}><X size={13} /></button></div>
    <p>{note}</p>
    {/* Thumbnails render real component markup (with its own buttons), so a transparent button laid over each
        choice takes the click instead of wrapping it. */}
    <ul>{choices.map(choice => <li key={choice.key}><button type="button" className="lb-choice-hit" aria-label={`${choice.name} · ${choice.note}`} onClick={() => onPick(choice.key)} />
      {choice.thumb}<span className="lb-choice-text"><b>{choice.name}</b><small>{choice.note}</small></span><Check size={13} aria-hidden /></li>)}</ul>
  </div>;
}
