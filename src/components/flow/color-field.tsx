"use client";

import { useEffect, useRef, useState } from "react";
import { HexColorPicker } from "react-colorful";
import { useCopy } from "@/hooks/use-copy";
import { parseToOklch } from "@/lib/color-engine";
import { FALLBACK_HEX, isHexColor, normalizeHex } from "@/lib/picked-color";

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
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
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

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div className="space-y-2">
      {hideLabel ? null : (
        <label className="ui-label text-[var(--text-secondary)]">{copy.hero.hexLabel}</label>
      )}
      <div className="flex items-center gap-3 rounded-2xl border border-[var(--border-default)] bg-[var(--surface)] p-2">
        <div ref={rootRef} className="relative shrink-0">
          <button
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
          {open ? (
            <div className="color-picker-tip" role="dialog" aria-label={copy.hero.hexLabel}>
              <HexColorPicker
                className="matchu-color-picker"
                color={hex}
                onChange={(hex) => commit(hex)}
              />
            </div>
          ) : null}
        </div>
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
    </div>
  );
}
