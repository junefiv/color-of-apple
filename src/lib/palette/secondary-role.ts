import type { PaletteTokens } from "./types";

/** Secondary brand role tokens (actions, metrics, series) — not categorical or status. */
export function secondaryRoleCssVariables(tokens: PaletteTokens): Record<string, string> {
  const action = tokens.system.actions.secondary;
  const scale = tokens.system.primitives.secondary;
  return {
    "--color-secondary-default": tokens.core.secondary,
    "--color-secondary-hover": tokens.interaction.secondaryHover,
    "--color-secondary-pressed": tokens.interaction.secondaryPressed,
    "--color-secondary-subtle": action.selected,
    "--color-secondary-surface": scale[50],
    "--color-secondary-border": action.selectedBorder,
    "--color-secondary-text": action.selectedText,
  };
}
