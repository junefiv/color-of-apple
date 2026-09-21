import { filledScaleStates, pickOnNeutral, TRANSPARENT } from "./on-ink";
import type { PrimitiveScales, SemanticTokens } from "./types";

type Triple = { bg: string; fg: string; border: string };

function set(
  vars: Record<string, string>,
  prefix: string,
  state: string,
  { bg, fg, border }: Triple,
) {
  vars[`${prefix}-bg-${state}`] = bg;
  vars[`${prefix}-fg-${state}`] = fg;
  vars[`${prefix}-border-${state}`] = border;
}

function filledSet(
  vars: Record<string, string>,
  prefix: string,
  scale: PrimitiveScales["primary"],
  neutral: PrimitiveScales["neutral"],
  focus: string,
) {
  const filled = filledScaleStates(scale, neutral);
  const on = filled.on;
  set(vars, prefix, "default", { bg: filled.default, fg: on, border: TRANSPARENT });
  set(vars, prefix, "hover", { bg: filled.hover, fg: on, border: TRANSPARENT });
  set(vars, prefix, "pressed", { bg: filled.pressed, fg: on, border: TRANSPARENT });
  set(vars, prefix, "selected", { bg: filled.default, fg: on, border: TRANSPARENT });
  set(vars, prefix, "focus", { bg: filled.default, fg: on, border: focus });
  set(vars, prefix, "disabled", {
    bg: neutral[200],
    fg: neutral[500],
    border: TRANSPARENT,
  });
  vars[`${prefix}-fg`] = on;
  return filled;
}

function tonalPrimarySet(
  vars: Record<string, string>,
  prefix: string,
  p: PrimitiveScales["primary"],
  onP: string,
  n: PrimitiveScales["neutral"],
  focus: string,
) {
  set(vars, prefix, "default", { bg: p[50], fg: p[800], border: p[200] });
  set(vars, prefix, "hover", { bg: p[100], fg: p[800], border: p[300] });
  set(vars, prefix, "pressed", { bg: p[200], fg: p[900], border: p[400] });
  set(vars, prefix, "selected", { bg: p[500], fg: onP, border: p[500] });
  set(vars, prefix, "focus", { bg: p[50], fg: p[800], border: focus });
  set(vars, prefix, "disabled", { bg: n[100], fg: n[400], border: n[200] });
}

function outlinePrimarySet(
  vars: Record<string, string>,
  prefix: string,
  p: PrimitiveScales["primary"],
  onP: string,
  n: PrimitiveScales["neutral"],
  focus: string,
) {
  set(vars, prefix, "default", { bg: TRANSPARENT, fg: p[700], border: p[500] });
  set(vars, prefix, "hover", { bg: p[50], fg: p[800], border: p[600] });
  set(vars, prefix, "pressed", { bg: p[100], fg: p[900], border: p[700] });
  set(vars, prefix, "selected", { bg: p[500], fg: onP, border: p[500] });
  set(vars, prefix, "focus", { bg: TRANSPARENT, fg: p[700], border: focus });
  set(vars, prefix, "disabled", { bg: TRANSPARENT, fg: n[400], border: n[300] });
}

function ghostPrimarySet(
  vars: Record<string, string>,
  prefix: string,
  p: PrimitiveScales["primary"],
  n: PrimitiveScales["neutral"],
  focus: string,
) {
  set(vars, prefix, "default", { bg: TRANSPARENT, fg: p[700], border: TRANSPARENT });
  set(vars, prefix, "hover", { bg: p[50], fg: p[800], border: TRANSPARENT });
  set(vars, prefix, "pressed", { bg: p[100], fg: p[900], border: TRANSPARENT });
  set(vars, prefix, "selected", { bg: p[100], fg: p[800], border: TRANSPARENT });
  set(vars, prefix, "focus", { bg: TRANSPARENT, fg: p[700], border: focus });
  set(vars, prefix, "disabled", { bg: TRANSPARENT, fg: n[400], border: TRANSPARENT });
}

function statusTonal(
  vars: Record<string, string>,
  prefix: string,
  x: PrimitiveScales["primary"],
) {
  vars[`${prefix}-bg`] = x[50];
  vars[`${prefix}-fg`] = x[800];
  vars[`${prefix}-border`] = x[200];
  vars[`${prefix}-bg-hover`] = x[100];
  vars[`${prefix}-bg-pressed`] = x[200];
}

export function previewComponentVars(
  primitives: PrimitiveScales,
  semantic: SemanticTokens,
): Record<string, string> {
  const {
    primary: p,
    secondary: s,
    accent: a,
    neutral: n,
    success: su,
    warning: wa,
    danger: er,
    info: infoScale,
  } = primitives;
  const focus = semantic.border.focus;
  const vars: Record<string, string> = {};

  const primaryFilled = filledSet(vars, "--btn-primary", p, n, focus);
  const onP = primaryFilled.on;
  filledSet(vars, "--btn-secondary", s, n, focus);
  filledSet(vars, "--btn-cta", a, n, focus);
  filledSet(vars, "--btn-destructive", er, n, focus);

  tonalPrimarySet(vars, "--btn-tonal-primary", p, onP, n, focus);
  outlinePrimarySet(vars, "--btn-outline-primary", p, onP, n, focus);
  ghostPrimarySet(vars, "--btn-ghost-primary", p, n, focus);

  set(vars, "--chip", "default", { bg: p[50], fg: p[800], border: p[200] });
  set(vars, "--chip", "hover", { bg: p[100], fg: p[800], border: p[300] });
  set(vars, "--chip", "pressed", { bg: p[200], fg: p[900], border: p[400] });
  set(vars, "--chip", "selected", { bg: p[500], fg: onP, border: p[500] });
  set(vars, "--chip", "disabled", { bg: n[100], fg: n[400], border: n[200] });

  set(vars, "--filter-chip", "default", { bg: n[0], fg: n[700], border: n[300] });
  set(vars, "--filter-chip", "hover", { bg: n[50], fg: n[900], border: n[400] });
  set(vars, "--filter-chip", "pressed", { bg: n[100], fg: n[900], border: n[500] });
  set(vars, "--filter-chip", "selected", { bg: p[100], fg: p[800], border: p[400] });
  set(vars, "--filter-chip", "disabled", { bg: n[100], fg: n[400], border: n[200] });

  vars["--tab-fg-default"] = n[600];
  vars["--tab-fg-hover"] = p[700];
  vars["--tab-fg-pressed"] = p[800];
  vars["--tab-fg-selected"] = p[700];
  vars["--tab-bg-hover"] = p[50];
  vars["--tab-bg-pressed"] = p[100];
  vars["--tab-indicator"] = p[500];

  vars["--nav-fg-default"] = n[700];
  vars["--nav-bg-hover"] = n[100];
  vars["--nav-bg-pressed"] = n[200];
  vars["--nav-bg-selected"] = p[50];
  vars["--nav-fg-selected"] = p[800];
  vars["--nav-indicator"] = p[500];

  vars["--switch-track-off"] = n[300];
  vars["--switch-thumb-off"] = n[0];
  vars["--switch-track-off-hover"] = n[400];
  vars["--switch-track-on"] = p[500];
  vars["--switch-thumb-on"] = onP;
  vars["--switch-track-on-hover"] = primaryFilled.hover;

  set(vars, "--card", "default", { bg: n[0], fg: n[900], border: n[200] });
  set(vars, "--card", "hover", { bg: n[50], fg: n[900], border: n[300] });
  set(vars, "--card", "pressed", { bg: n[100], fg: n[900], border: n[300] });
  set(vars, "--card", "selected", { bg: p[50], fg: n[900], border: p[500] });
  set(vars, "--card", "disabled", { bg: n[50], fg: n[400], border: n[200] });
  vars["--card-fg-secondary"] = n[600];
  vars["--card-fg-link"] = p[700];

  vars["--progress-track"] = n[200];
  vars["--progress-indicator"] = p[500];
  vars["--progress-complete"] = su[500];
  vars["--progress-error"] = er[500];

  statusTonal(vars, "--badge-success", su);
  statusTonal(vars, "--badge-warning", wa);
  statusTonal(vars, "--badge-error", er);
  statusTonal(vars, "--badge-info", infoScale);
  vars["--badge-neutral-bg"] = n[100];
  vars["--badge-neutral-fg"] = n[700];
  vars["--badge-neutral-border"] = n[200];
  vars["--count-badge-bg"] = p[500];
  vars["--count-badge-fg"] = onP;
  vars["--count-badge-urgent-bg"] = er[500];
  vars["--count-badge-urgent-fg"] = pickOnNeutral(er[500], n);

  vars["--alert-success-bg"] = su[50];
  vars["--alert-success-fg"] = su[900];
  vars["--alert-success-border"] = su[300];
  vars["--alert-warning-bg"] = wa[50];
  vars["--alert-warning-fg"] = wa[900];
  vars["--alert-warning-border"] = wa[300];
  vars["--alert-error-bg"] = er[50];
  vars["--alert-error-fg"] = er[900];
  vars["--alert-error-border"] = er[300];
  vars["--alert-info-bg"] = infoScale[50];
  vars["--alert-info-fg"] = infoScale[900];
  vars["--alert-info-border"] = infoScale[300];

  vars["--action-primary-default"] = p[500];
  vars["--action-primary-hover"] = primaryFilled.hover;
  vars["--action-primary-pressed"] = primaryFilled.pressed;
  vars["--action-on-primary"] = onP;

  vars["--color-primary-default"] = p[500];
  vars["--color-primary-hover"] = primaryFilled.hover;
  vars["--color-primary-pressed"] = primaryFilled.pressed;
  vars["--color-primary-on"] = onP;
  vars["--color-primary-subtle"] = p[50];
  vars["--color-primary-text"] = semantic.primary.text;
  vars["--color-primary-border"] = p[200];

  vars["--color-secondary-default"] = s[500];
  vars["--color-secondary-on"] = pickOnNeutral(s[500], n);
  vars["--color-accent-default"] = a[500];
  vars["--color-accent-on"] = pickOnNeutral(a[500], n);
  vars["--color-accent-subtle"] = a[50];
  vars["--color-accent-text"] = a[800];

  vars["--color-success-surface"] = su[50];
  vars["--color-success-text"] = su[800];
  vars["--color-warning-surface"] = wa[50];
  vars["--color-warning-text"] = wa[800];
  vars["--color-danger-surface"] = er[50];
  vars["--color-danger-text"] = er[800];
  vars["--color-info-surface"] = infoScale[50];
  vars["--color-info-text"] = infoScale[800];

  return vars;
}
