"use client";

import { useCallback, useState } from "react";
import { prefersReducedMotion } from "@/lib/match-reveal";
import { getSpacePalette, resolvePaletteId, type SpacePaletteId } from "@/lib/space-palettes";
import { useMatchuStore } from "@/lib/store";

export type PaletteWashState = {
  id: SpacePaletteId;
  colors: string[];
};

export function usePaletteSelect(hex: string) {
  const selectedPaletteId = useMatchuStore((state) => state.selectedPaletteId);
  const setSelectedPaletteId = useMatchuStore((state) => state.setSelectedPaletteId);
  const [wash, setWash] = useState<PaletteWashState | null>(null);

  const selectPalette = useCallback(
    (id: string) => {
      const resolvedId = resolvePaletteId(id);
      if (resolvedId === selectedPaletteId || wash) return;
      const palette = getSpacePalette(hex, resolvedId);
      if (prefersReducedMotion()) {
        setSelectedPaletteId(palette.id);
        return;
      }
      setWash({ id: palette.id, colors: palette.colors });
    },
    [hex, selectedPaletteId, setSelectedPaletteId, wash],
  );

  const finishWash = useCallback(() => {
    if (!wash) return;
    setSelectedPaletteId(wash.id);
    setWash(null);
  }, [setSelectedPaletteId, wash]);

  return { selectedPaletteId, selectPalette, wash, finishWash };
}
