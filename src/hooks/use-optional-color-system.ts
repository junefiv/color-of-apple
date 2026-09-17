"use client";

import { useMemo } from "react";
import { generateColorSystem, parseToOklch, type GenerateInput } from "@/lib/color-engine";

export function useOptionalColorSystem(input: GenerateInput, paletteId?: string) {
  const key = JSON.stringify({ input, paletteId });
  return useMemo(() => {
    try {
      parseToOklch(input.hex);
      return generateColorSystem(input, paletteId);
    } catch {
      return null;
    }
  }, [key, input, paletteId]);
}
