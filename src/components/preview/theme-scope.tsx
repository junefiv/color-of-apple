"use client";

import { createContext, useContext, type CSSProperties } from "react";

import {
  previewComponentVars,
  chooseOnColor,
  primitivesToCssVars,
  semanticToCssVars,
  type ColorSystemResult,
} from "@/lib/color-engine";
import { paletteTokensToCssVariables } from "@/lib/palette-semantic-tokens";

const PreviewThemeContext = createContext<CSSProperties>({});
export function usePreviewTheme() { return useContext(PreviewThemeContext); }

export function ThemeScope({
  result,
  className,
  extraVars,
  children,
}: {
  result: ColorSystemResult;
  className?: string;
  extraVars?: Record<string, string>;
  children: React.ReactNode;
}) {
  const semantic = result.semantic.light;
  const vars = {
    ...primitivesToCssVars(result.primitive),
    ...Object.fromEntries(Object.entries(result.primitive).flatMap(([family, scale]) =>
      Object.entries(scale).map(([step, color]) => [`--color-${family}-${step}-on`, chooseOnColor(color)]),
    )),
    ...semanticToCssVars(semantic),
    ...previewComponentVars(result.primitive, semantic),
    ...paletteTokensToCssVariables(result.derived.light),
    ...extraVars,
  };

  return (
    <PreviewThemeContext.Provider value={vars as CSSProperties}><div
      data-theme="light"
      className={`matchu-preview ${className ?? ""}`}
      style={vars as React.CSSProperties}
    >
      {children}
    </div></PreviewThemeContext.Provider>
  );
}
