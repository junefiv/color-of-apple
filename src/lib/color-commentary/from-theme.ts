import type { SemanticTokens } from "@/lib/color-engine";
import type { CommentaryColors } from "./comment";

export function colorsFromTheme(theme: SemanticTokens): CommentaryColors {
  return {
    primary: theme.primary.default,
    secondary: theme.secondary.default,
    accent: theme.accent.default,
    background: theme.background.canvas,
    surface: theme.surface.default,
    text: theme.text.primary,
    onPrimary: theme.primary.onPrimary,
    backgroundSubtle: theme.background.subtle,
    surfaceRaised: theme.surface.raised,
    surfaceOverlay: theme.surface.overlay,
    textSecondary: theme.text.secondary,
    textDisabled: theme.text.disabled,
    focusRing: theme.interaction.focusRing,
    primaryHover: theme.primary.hover,
    primaryPressed: theme.primary.pressed,
    primarySelected: theme.primary.selected,
    success: theme.success.default,
    warning: theme.warning.default,
    danger: theme.danger.default,
    info: theme.info.default,
    successText: theme.success.text,
    successSurface: theme.success.surface,
    warningText: theme.warning.text,
    warningSurface: theme.warning.surface,
    dangerText: theme.danger.text,
    dangerSurface: theme.danger.surface,
    infoText: theme.info.text,
    infoSurface: theme.info.surface,
  };
}
