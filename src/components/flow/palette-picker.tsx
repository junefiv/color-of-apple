"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useCopy } from "@/hooks/use-copy";
import { extractSpacePalettes } from "@/lib/space-palettes";
import { useMatchuStore } from "@/lib/store";

export function PalettePicker({ hex }: { hex: string }) {
  const copy = useCopy();
  const selectedPaletteId = useMatchuStore((state) => state.selectedPaletteId);
  const setSelectedPaletteId = useMatchuStore((state) => state.setSelectedPaletteId);
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const palettes = useMemo(() => extractSpacePalettes(hex), [hex]);
  const selected = palettes.find((palette) => palette.id === selectedPaletteId) ?? palettes[0];

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
    <div ref={rootRef} className="palette-picker">
      <button
        type="button"
        className="palette-picker-trigger"
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen((value) => !value)}
      >
        <span className="palette-picker-kicker">{copy.result.palette}</span>
        <span className="palette-picker-name">{selected.name}</span>
        <span className="space-palette-swatches" aria-hidden>
          {selected.colors.map((color) => (
            <span key={`${selected.id}-${color}`} style={{ background: color }} />
          ))}
        </span>
      </button>
      {open ? (
        <div className="palette-picker-tip" role="dialog" aria-label={copy.result.palettePicker}>
          <p className="palette-picker-tip-title">{copy.result.palettePicker}</p>
          <div className="palette-picker-list">
            {palettes.map((palette) => (
              <button
                key={palette.id}
                type="button"
                className="space-palette"
                data-active={palette.id === selected.id ? "true" : "false"}
                onClick={() => {
                  setSelectedPaletteId(palette.id);
                  setOpen(false);
                }}
              >
                <span className="space-palette-name">{palette.name}</span>
                <span className="space-palette-swatches">
                  {palette.colors.map((color) => (
                    <span key={`${palette.id}-${color}`} style={{ background: color }} />
                  ))}
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
