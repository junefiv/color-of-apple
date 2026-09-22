"use client";

import {
  previewComponentVars,
  primitivesToCssVars,
  semanticToCssVars,
  type ColorSystemResult,
} from "@/lib/color-engine";
import { paletteTokensToCssVariables } from "@/lib/palette-semantic-tokens";

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
    ...semanticToCssVars(semantic),
    ...previewComponentVars(result.primitive, semantic),
    ...paletteTokensToCssVariables(result.derived.light),
    ...extraVars,
  };

  return (
    <div
      data-theme="light"
      className={`matchu-preview ${className ?? ""}`}
      style={vars as React.CSSProperties}
    >
      {children}
    </div>
  );
}
