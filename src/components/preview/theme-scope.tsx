"use client";

import {
  primitivesToCssVars,
  semanticToCssVars,
  type ColorSystemResult,
  type ThemeMode,
} from "@/lib/color-engine";

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
  const vars = {
    ...primitivesToCssVars(result.primitive),
    ...semanticToCssVars(result.semantic[mode]),
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
