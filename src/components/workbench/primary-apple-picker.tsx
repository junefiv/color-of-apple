"use client";

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { HexColorPicker } from "react-colorful";
import { LogoApple } from "@/components/brand/logo-apple";
import { MatchButton } from "@/components/flow/match-button";
import { useAppleHop } from "@/hooks/use-apple-hop";
import { useMatchuStore } from "@/lib/store";

export function PrimaryApplePicker({ hex, locale, onGenerate }: { hex: string; locale: "ko" | "en"; onGenerate: (hex: string) => void }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(hex);
  const [ready, setReady] = useState(false);
  const [position, setPosition] = useState<CSSProperties>({ top: 0, left: 0 });
  const anchorRef = useRef<HTMLButtonElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const selecting = useRef(false);
  const { hopping } = useAppleHop(!open);
  const setPrimaryDraftHex = useMatchuStore(state => state.setPrimaryDraftHex);

  useEffect(() => {
    if (!open) return;
    return () => setPrimaryDraftHex(null);
  }, [open, setPrimaryDraftHex]);

  useLayoutEffect(() => {
    if (!open) return;
    function positionPopup() {
      const rect = anchorRef.current?.getBoundingClientRect();
      if (!rect) return;
      const width = Math.min(240, window.innerWidth - 16);
      const left = rect.left >= width + 16 ? rect.left - width - 12 : Math.min(rect.right + 12, window.innerWidth - width - 8);
      setPosition({ width, left: Math.max(8, left), top: Math.max(8, Math.min(rect.top, window.innerHeight - 350)) });
    }
    positionPopup();
    window.addEventListener("resize", positionPopup);
    window.addEventListener("scroll", positionPopup, true);
    return () => {
      window.removeEventListener("resize", positionPopup);
      window.removeEventListener("scroll", positionPopup, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function outside(event: PointerEvent) {
      if (!event.composedPath().some(node => node === anchorRef.current || node === popupRef.current)) setOpen(false);
    }
    function release() {
      if (!selecting.current) return;
      selecting.current = false;
      setReady(true);
    }
    function escape(event: KeyboardEvent) {
      if (event.key === "Escape") { setOpen(false); anchorRef.current?.focus(); }
    }
    document.addEventListener("pointerdown", outside, true);
    document.addEventListener("pointerup", release);
    document.addEventListener("keydown", escape);
    return () => {
      selecting.current = false;
      document.removeEventListener("pointerdown", outside, true);
      document.removeEventListener("pointerup", release);
      document.removeEventListener("keydown", escape);
    };
  }, [open]);

  return <>
    <button ref={anchorRef} type="button" className="studio-apple token-primary-apple" data-hop={hopping ? "true" : "false"} aria-label={locale === "ko" ? "새 Primary 컬러 선택" : "Choose a new Primary color"} aria-haspopup="dialog" aria-expanded={open} onClick={() => { setDraft(hex); setReady(false); setOpen(value => !value); }}>
      <LogoApple hex={open ? draft : hex} />
    </button>
    {open ? createPortal(<div ref={popupRef} className="primary-apple-popover" style={position} role="dialog" aria-label={locale === "ko" ? "Primary 컬러 선택" : "Choose Primary color"}>
      <div className="primary-apple-picker-card">
        <p>{locale === "ko" ? "새 Primary 컬러" : "New Primary color"}</p>
        <div onPointerDownCapture={() => { selecting.current = true; setReady(false); }} onKeyUp={event => { if (event.key.startsWith("Arrow")) setReady(true); }}>
          <HexColorPicker color={draft} onChange={value => { const next = value.toUpperCase(); setDraft(next); setPrimaryDraftHex(next); }} />
        </div>
        <span className="token-name">{draft.toUpperCase()}</span>
      </div>
      {ready ? <div className="primary-apple-generate-tip">
        <MatchButton hex={draft} label="Generate Color Palette" onClick={() => { onGenerate(draft); setOpen(false); anchorRef.current?.focus(); }} />
      </div> : null}
    </div>, document.body) : null}
  </>;
}
