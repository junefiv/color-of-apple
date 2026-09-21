import type { PrimitiveScales, SemanticTokens } from "./types";

const CSS_ALIASES: Record<string, string> = {
  "background.canvas": "--color-bg-canvas",
  "background.subtle": "--color-bg-subtle",
  "background.inverse": "--color-bg-inverse",
  "background.brand": "--color-bg-brand",
  "primary.onPrimary": "--color-primary-on",
  "secondary.onSecondary": "--color-secondary-on",
  "accent.onAccent": "--color-accent-on",
  "success.onSuccess": "--color-success-on",
  "warning.onWarning": "--color-warning-on",
  "danger.onDanger": "--color-danger-on",
  "info.onInfo": "--color-info-on",
  "interaction.focusRing": "--color-interaction-focus-ring",
  "interaction.disabledBackground": "--color-interaction-disabled-bg",
  "interaction.disabledForeground": "--color-interaction-disabled-fg",
  "interaction.primaryHover": "--color-primary-hover",
  "interaction.primaryPressed": "--color-primary-pressed",
  "interaction.primarySelected": "--color-interaction-selected",
  "interaction.secondaryHover": "--color-secondary-hover",
  "interaction.secondaryPressed": "--color-secondary-pressed",
  "interaction.neutralHover": "--color-interaction-hover",
  "interaction.neutralPressed": "--color-interaction-pressed",
  "interaction.disabledSurface": "--color-interaction-disabled-bg",
  "interaction.disabledBorder": "--color-interaction-disabled-border",
};

function toKebab(path: string) {
  return path
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/\./g, "-")
    .toLowerCase();
}

export function tokenPathToCssVar(path: string) {
  return CSS_ALIASES[path] ?? `--color-${toKebab(path)}`;
}

export function flattenObject(
  value: unknown,
  prefix = "",
): Array<{ path: string; value: string }> {
  if (typeof value === "string") {
    return [{ path: prefix, value }];
  }
  if (!value || typeof value !== "object") {
    return [];
  }
  return Object.entries(value).flatMap(([key, nested]) =>
    flattenObject(nested, prefix ? `${prefix}.${key}` : key),
  );
}

export function semanticToCssVars(tokens: SemanticTokens): Record<string, string> {
  const vars: Record<string, string> = {};
  for (const entry of flattenObject(tokens)) {
    vars[tokenPathToCssVar(entry.path)] = entry.value;
  }
  return vars;
}

export function primitivesToCssVars(primitives: PrimitiveScales): Record<string, string> {
  const vars: Record<string, string> = {};
  for (const [group, scale] of Object.entries(primitives)) {
    for (const [step, value] of Object.entries(scale)) {
      vars[`--color-${group}-${step}`] = value;
    }
  }
  return vars;
}
