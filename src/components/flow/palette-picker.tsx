"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { PaletteWash } from "@/components/flow/palette-wash";
import { useCopy } from "@/hooks/use-copy";
import { usePaletteSelect } from "@/hooks/use-palette-select";
import { paletteName } from "@/lib/palette-names";
import { extractSpacePalettes, paletteSwatches } from "@/lib/space-palettes";
import { useMatchuStore } from "@/lib/store";

export function PalettePicker({ hex }: { hex: string }) {
  const copy = useCopy();
  const locale = useMatchuStore((state) => state.locale);
  const { selectedPaletteId, selectPalette, wash, finishWash } = usePaletteSelect(hex);
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
        <span className="palette-picker-name">{paletteName(selected.id, locale)}</span>
        <span className="space-palette-swatches" aria-hidden>
          {paletteSwatches(selected).map((color, index) => (
            <span key={`${selected.id}-${index}`} style={{ background: color }} />
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
                  selectPalette(palette.id);
                  setOpen(false);
                }}
              >
                <span className="space-palette-name">{paletteName(palette.id, locale)}</span>
                <span className="space-palette-swatches">
                  {paletteSwatches(palette).map((color, index) => (
                    <span key={`${palette.id}-${index}`} style={{ background: color }} />
                  ))}
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : null}
      {wash ? <PaletteWash colors={wash.colors} onDone={finishWash} /> : null}
    </div>
  );
}
