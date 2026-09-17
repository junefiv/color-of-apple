"use client";

import { useMemo } from "react";
import { generateColorSystem, type GenerateInput } from "@/lib/color-engine";

export function useColorSystem(input: GenerateInput) {
  const key = JSON.stringify(input);
  return useMemo(() => generateColorSystem(input), [key, input]);
}
