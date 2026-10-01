import type { PaletteTokens } from "./types";

/** Role-based data visualization tokens (not categorical chart-1..n). */
export function dataVisualizationCssVariables(tokens: PaletteTokens): Record<string, string> {
  const { primitives } = tokens.system;
  const p = primitives.primary;
  const s = primitives.secondary;
  const n = primitives.neutral;
  const { success, warning, danger } = tokens.status;

  const sequentialSteps = [100, 200, 300, 400, 500, 600, 700] as const;

  const vars: Record<string, string> = {
    "--color-data-primary": tokens.core.primary,
    "--color-data-secondary": tokens.core.secondary,
    "--color-data-accent": tokens.core.accent,
    "--color-data-muted": n[300],

    "--color-chart-primary": tokens.core.primary,
    "--color-chart-secondary": tokens.core.secondary,
    "--color-chart-accent": tokens.core.accent,
    "--color-chart-muted": n[300],

    "--color-data-comparison-current": tokens.core.primary,
    "--color-data-comparison-previous": p[300],

    "--color-data-negative": danger,
    "--color-data-neutral": n[500],
    "--color-data-positive": success,

    "--color-progress-track": n[100],
    "--color-progress-default": tokens.core.primary,
    "--color-progress-success": success,
    "--color-progress-warning": warning,
    "--color-progress-danger": danger,
    "--color-progress-label": tokens.text.secondary,

    "--color-series-primary": tokens.core.primary,
    "--color-series-secondary": tokens.core.secondary,
    "--color-series-accent": tokens.core.accent,
    "--color-series-muted": n[300],
  };

  for (let i = 0; i < sequentialSteps.length; i++) {
    vars[`--color-data-sequential-${i + 1}`] = p[sequentialSteps[i]];
  }

  return vars;
}
