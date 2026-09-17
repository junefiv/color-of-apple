"use client";

import { useMemo } from "react";
import { generateColorSystem, parseToOklch, type GenerateInput } from "@/lib/color-engine";

export function useOptionalColorSystem(input: GenerateInput) {
  const key = JSON.stringify(input);
  return useMemo(() => {
    try {
      parseToOklch(input.hex);
      return generateColorSystem(input);
    } catch {
      return null;
    }
  }, [key, input]);
}
