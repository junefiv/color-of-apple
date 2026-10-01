import { contrastRatio } from "@/lib/color-engine/color-utils";
import { categoricalToCssVariables } from "./categorical";
import { dataVisualizationCssVariables } from "./data-viz";
import { secondaryRoleCssVariables } from "./secondary-role";
import type { PaletteTokens } from "./types";

export function paletteTokensToCssVariables(tokens: PaletteTokens): Record<string, string> {
  const accentText =
    contrastRatio(tokens.core.accent, tokens.backgroundAndSurface.background) >= 4.5
      ? tokens.core.accent
      : tokens.text.link;

  return {
    "--color-primary-default": tokens.core.primary,
    ...secondaryRoleCssVariables(tokens),
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
    "--color-success-text": tokens.system.statuses.success.text,
    "--color-warning": tokens.status.warning,
    "--color-warning-default": tokens.status.warning,
    "--color-warning-surface": tokens.status.warningSurface,
    "--color-warning-text": tokens.system.statuses.warning.text,
    "--color-danger": tokens.status.danger,
    "--color-danger-default": tokens.status.danger,
    "--color-danger-surface": tokens.status.dangerSurface,
    "--color-danger-text": tokens.system.statuses.danger.text,
    "--color-info": tokens.status.info,
    "--color-info-default": tokens.status.info,
    "--color-info-surface": tokens.status.infoSurface,
    "--color-info-text": tokens.system.statuses.info.text,
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
    "--color-accent-subtle": tokens.system.actions.accent.selected,
    "--color-accent-text": tokens.system.actions.accent.selectedText,
    ...dataVisualizationCssVariables(tokens),
    ...categoricalToCssVariables(tokens.system.categorical),
    ...Object.fromEntries(Object.entries(tokens.system.actions).flatMap(([role, action]) => Object.entries(action).map(([state, hex]) => [`--action-${role}-${state.replace(/[A-Z]/g, c => `-${c.toLowerCase()}`)}`, hex]))),
    ...Object.fromEntries(Object.entries(tokens.system.statuses).flatMap(([role, status]) => Object.entries(status).map(([state, hex]) => [`--color-${role}-${state.replace(/[A-Z]/g, c => `-${c.toLowerCase()}`)}`, hex]))),
    "--color-accent-hover": tokens.system.actions.accent.hover,
    "--color-accent-pressed": tokens.system.actions.accent.pressed,
    "--color-primary-on-hover": tokens.system.actions.primary.onHover,
    "--color-primary-on-pressed": tokens.system.actions.primary.onPressed,
    "--color-secondary-on-hover": tokens.system.actions.secondary.onHover,
    "--color-secondary-on-pressed": tokens.system.actions.secondary.onPressed,
    "--color-accent-on-hover": tokens.system.actions.accent.onHover,
    "--color-accent-on-pressed": tokens.system.actions.accent.onPressed,
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
