"use client";

import {
  previewComponentVars,
  primitivesToCssVars,
  semanticToCssVars,
  type ColorSystemResult,
  type ThemeMode,
} from "@/lib/color-engine";
import { paletteTokensToCssVariables } from "@/lib/palette-semantic-tokens";

export function ThemeScope({
  result,
  mode,
  className,
  extraVars,
  children,
}: {
  result: ColorSystemResult;
  mode: ThemeMode;
  className?: string;
  extraVars?: Record<string, string>;
  children: React.ReactNode;
}) {
  const semantic = result.semantic[mode];
  const vars = {
    ...primitivesToCssVars(result.primitive),
    ...semanticToCssVars(semantic),
    ...previewComponentVars(result.primitive, semantic),
    ...paletteTokensToCssVariables(result.derived),
    ...extraVars,
  };

  return (
    <div
      data-theme={mode}
      className={`matchu-preview ${className ?? ""}`}
      style={vars as React.CSSProperties}
    >
      {children}
    </div>
  );
}
