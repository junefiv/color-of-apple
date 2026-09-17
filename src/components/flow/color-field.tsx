"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { HexColorPicker } from "react-colorful";
import { useCopy } from "@/hooks/use-copy";
import { parseToOklch } from "@/lib/color-engine";
import { FALLBACK_HEX, isHexColor, normalizeHex } from "@/lib/picked-color";

const TIP_WIDTH = 232;
const TIP_HEIGHT = 228;
const TIP_GAP = 10;

function placeTip(anchor: DOMRect) {
  const right = window.innerWidth - anchor.right;
  let left = right >= TIP_WIDTH + TIP_GAP ? anchor.right + TIP_GAP : anchor.left;
  let top = right >= TIP_WIDTH + TIP_GAP ? anchor.top : anchor.bottom + TIP_GAP;
  const place = right >= TIP_WIDTH + TIP_GAP ? "right" : "bottom";

  if (place === "bottom" && window.innerHeight - anchor.bottom < TIP_HEIGHT + TIP_GAP && anchor.top > TIP_HEIGHT + TIP_GAP) {
    top = anchor.top - TIP_HEIGHT - TIP_GAP;
  }

  left = Math.min(Math.max(8, left), window.innerWidth - TIP_WIDTH - 8);
  top = Math.min(Math.max(8, top), window.innerHeight - TIP_HEIGHT - 8);

  return { top, left, place: place === "right" ? "right" : top < anchor.top ? "top" : "bottom" };
}

export function ColorField({
  value,
  onChange,
  error,
  hideLabel = false,
}: {
  value: string;
  onChange: (value: string) => void;
  error?: string | null;
  hideLabel?: boolean;
}) {
  const copy = useCopy();
  const fieldRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLButtonElement>(null);
  const tipRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [tip, setTip] = useState({ top: 0, left: 0, place: "right" });
  const hex = isHexColor(value) ? normalizeHex(value) : FALLBACK_HEX;
  const picked = isHexColor(value);

  function commit(next: string) {
    onChange(next.toUpperCase());
  }

  function handleBlur() {
    const next = normalizeHex(value);
    try {
      parseToOklch(next);
      onChange(next);
    } catch {
      // Keep the typed value while the user is still editing.
    }
  }

  function isInside(event: Event) {
    const path = event.composedPath();
    return path.some((node) => node === ringRef.current || node === tipRef.current);
  }

  useLayoutEffect(() => {
    if (!open) return;

    function update() {
      const anchor = fieldRef.current?.getBoundingClientRect();
      if (!anchor) return;
      setTip(placeTip(anchor));
    }

    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: PointerEvent) {
      if (!isInside(event)) setOpen(false);
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", onPointerDown, true);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown, true);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div className="space-y-2">
      {hideLabel ? null : (
        <label className="ui-label text-[var(--text-secondary)]">{copy.hero.hexLabel}</label>
      )}
      <div
        ref={fieldRef}
        className="flex items-center gap-3 rounded-2xl border border-[var(--border-default)] bg-[var(--surface)] p-2"
      >
        <button
          ref={ringRef}
          type="button"
          aria-label={copy.hero.hexLabel}
          aria-expanded={open}
          aria-haspopup="dialog"
          className="color-ring"
          style={{
            background: hex,
            borderColor: hex,
          }}
          onClick={() => setOpen((value) => !value)}
        />
        <input
          value={picked ? value : FALLBACK_HEX}
          onChange={(event) => commit(event.target.value)}
          onBlur={handleBlur}
          spellCheck={false}
          data-testid="hex-input"
          className="hex-input w-full bg-transparent outline-none"
          placeholder={FALLBACK_HEX}
        />
      </div>
      {error ? <p className="caption text-[#E5484D]">{error}</p> : null}
      {open
        ? createPortal(
            <div
              ref={tipRef}
              className={`color-picker-tip is-${tip.place}`}
              role="dialog"
              aria-label={copy.hero.hexLabel}
              style={{ top: tip.top, left: tip.left }}
            >
              <HexColorPicker
                className="matchu-color-picker"
                color={hex}
                onChange={(next) => commit(next)}
              />
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
