"use client";

import { useMemo } from "react";
import { generateColorSystem, type GenerateInput } from "@/lib/color-engine";

export function useColorSystem(input: GenerateInput, paletteId?: string) {
  const key = JSON.stringify({ input, paletteId });
  return useMemo(() => generateColorSystem(input, paletteId), [key, input, paletteId]);
}
