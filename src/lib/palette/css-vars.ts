import { contrastRatio, mixOklab } from "@/lib/color-engine/color-utils";
import type { PaletteTokens } from "./types";

export function paletteTokensToCssVariables(tokens: PaletteTokens): Record<string, string> {
  const accentText =
    contrastRatio(tokens.core.accent, tokens.backgroundAndSurface.background) >= 4.5
      ? tokens.core.accent
      : tokens.text.link;

  return {
    "--color-primary-default": tokens.core.primary,
    "--color-secondary-default": tokens.core.secondary,
    "--color-accent-default": tokens.core.accent,
    "--color-surface-default": tokens.core.surface,
    "--color-primary-on": tokens.core.onPrimary,
    "--color-secondary-on": tokens.core.onSecondary,
    "--color-accent-on": tokens.core.onAccent,
    "--color-primary-subtle": tokens.core.primarySubtle,

    "--color-bg-canvas": tokens.backgroundAndSurface.background,
    "--color-bg-subtle": tokens.backgroundAndSurface.subtleBackground,
    "--color-surface-raised": tokens.backgroundAndSurface.raisedSurface,
    "--color-surface-overlay": tokens.backgroundAndSurface.overlaySurface,

    "--color-text-primary": tokens.text.primary,
    "--color-text-secondary": tokens.text.secondary,
    "--color-text-tertiary": tokens.text.tertiary,
    "--color-text-disabled": tokens.text.disabled,
    "--color-text-inverse": tokens.text.inverse,
    "--color-link": tokens.text.link,
    "--color-text-link": tokens.text.link,

    "--color-border-subtle": tokens.border.subtle,
    "--color-border-default": tokens.border.default,
    "--color-border-strong": tokens.border.strong,
    "--color-border-focus": tokens.border.focus,

    "--color-success": tokens.status.success,
    "--color-success-default": tokens.status.success,
    "--color-success-surface": tokens.status.successSurface,
    "--color-success-text": tokens.status.success,
    "--color-warning": tokens.status.warning,
    "--color-warning-default": tokens.status.warning,
    "--color-warning-surface": tokens.status.warningSurface,
    "--color-warning-text": tokens.status.warning,
    "--color-danger": tokens.status.danger,
    "--color-danger-default": tokens.status.danger,
    "--color-danger-surface": tokens.status.dangerSurface,
    "--color-danger-text": tokens.status.danger,
    "--color-info": tokens.status.info,
    "--color-info-default": tokens.status.info,
    "--color-info-surface": tokens.status.infoSurface,
    "--color-info-text": tokens.status.info,
    "--color-success-on": tokens.status.onSuccess,
    "--color-warning-on": tokens.status.onWarning,
    "--color-danger-on": tokens.status.onDanger,
    "--color-info-on": tokens.status.onInfo,

    "--color-primary-hover": tokens.interaction.primaryHover,
    "--color-primary-pressed": tokens.interaction.primaryPressed,
    "--color-primary-selected": tokens.interaction.primarySelected,
    "--color-interaction-primary-hover": tokens.interaction.primaryHover,
    "--color-interaction-primary-pressed": tokens.interaction.primaryPressed,
    "--color-interaction-primary-selected": tokens.interaction.primarySelected,
    "--color-interaction-selected": tokens.interaction.primarySelected,
    "--color-secondary-hover": tokens.interaction.secondaryHover,
    "--color-secondary-pressed": tokens.interaction.secondaryPressed,
    "--color-interaction-secondary-hover": tokens.interaction.secondaryHover,
    "--color-interaction-secondary-pressed": tokens.interaction.secondaryPressed,
    "--color-neutral-hover": tokens.interaction.neutralHover,
    "--color-neutral-pressed": tokens.interaction.neutralPressed,
    "--color-interaction-hover": tokens.interaction.neutralHover,
    "--color-interaction-pressed": tokens.interaction.neutralPressed,
    "--color-interaction-neutral-hover": tokens.interaction.neutralHover,
    "--color-interaction-neutral-pressed": tokens.interaction.neutralPressed,
    "--color-focus-ring": tokens.interaction.focusRing,
    "--color-interaction-focus": tokens.interaction.focusRing,
    "--color-interaction-focus-ring": tokens.interaction.focusRing,
    "--color-interaction-disabled": tokens.interaction.disabledSurface,
    "--color-interaction-disabled-bg": tokens.interaction.disabledSurface,
    "--color-interaction-disabled-border": tokens.interaction.disabledBorder,
    "--color-interaction-disabled-fg": tokens.text.disabled,
    "--color-border-disabled": tokens.interaction.disabledBorder,

    "--color-primary-text": tokens.text.link,
    "--color-primary-border": tokens.border.focus,
    "--color-accent-text": accentText,
    "--color-chart-1": tokens.core.primary,
    "--color-chart-2": tokens.core.secondary,
    "--color-chart-3": tokens.core.accent,
    "--color-chart-4": mixOklab(tokens.core.secondary, tokens.core.accent, 0.45),
    "--color-chart-5": tokens.core.primarySubtle,
  };
}

export function applyPaletteTokens(
  tokens: PaletteTokens,
  target: HTMLElement = document.documentElement,
) {
  for (const [name, value] of Object.entries(paletteTokensToCssVariables(tokens))) {
    target.style.setProperty(name, value);
  }
}
