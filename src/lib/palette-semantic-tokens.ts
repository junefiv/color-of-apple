/**
 * Derives a complete UI token set from the six colors that already change
 * when a palette recipe is selected.
 *
 * No runtime dependency is required. Colour interpolation uses OKLab so
 * tints and shades remain perceptually smoother than raw RGB interpolation.
 */

export type CorePalette = {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  primaryText: string;
};

export type PaletteTokens = {
  core: {
    primary: string;
    secondary: string;
    accent: string;
    surface: string;
    onPrimary: string;
    onSecondary: string;
    onAccent: string;
    primarySubtle: string;
  };
  backgroundAndSurface: {
    background: string;
    subtleBackground: string;
    raisedSurface: string;
    overlaySurface: string;
  };
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    disabled: string;
    inverse: string;
    link: string;
  };
  border: {
    subtle: string;
    default: string;
    strong: string;
    focus: string;
  };
  status: {
    success: string;
    successSurface: string;
    warning: string;
    warningSurface: string;
    danger: string;
    dangerSurface: string;
    info: string;
    infoSurface: string;
    onSuccess: string;
    onWarning: string;
    onDanger: string;
    onInfo: string;
  };
  interaction: {
    primaryHover: string;
    primaryPressed: string;
    primarySelected: string;
    secondaryHover: string;
    secondaryPressed: string;
    neutralHover: string;
    neutralPressed: string;
    focusRing: string;
    disabledSurface: string;
    disabledBorder: string;
  };
};

type Rgb = { r: number; g: number; b: number };
type Oklab = { l: number; a: number; b: number };

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

function normalizeHex(hex: string): string {
  const value = hex.trim().replace(/^#/, "");
  if (/^[0-9a-f]{3}$/i.test(value)) {
    return `#${value
      .split("")
      .map((part) => part + part)
      .join("")}`.toUpperCase();
  }
  if (/^[0-9a-f]{6}$/i.test(value)) return `#${value.toUpperCase()}`;
  throw new Error(`Unsupported colour value: ${hex}. Expected #RGB or #RRGGBB.`);
}

function hexToRgb(hex: string): Rgb {
  const value = normalizeHex(hex).slice(1);
  return {
    r: parseInt(value.slice(0, 2), 16) / 255,
    g: parseInt(value.slice(2, 4), 16) / 255,
    b: parseInt(value.slice(4, 6), 16) / 255,
  };
}

function rgbToHex({ r, g, b }: Rgb): string {
  const channel = (value: number) =>
    Math.round(clamp01(value) * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${channel(r)}${channel(g)}${channel(b)}`.toUpperCase();
}

function srgbToLinear(value: number): number {
  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
}

function linearToSrgb(value: number): number {
  return value <= 0.0031308 ? 12.92 * value : 1.055 * value ** (1 / 2.4) - 0.055;
}

function rgbToOklab(rgb: Rgb): Oklab {
  const r = srgbToLinear(rgb.r);
  const g = srgbToLinear(rgb.g);
  const b = srgbToLinear(rgb.b);

  const l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
  const m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
  const s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;

  const lRoot = Math.cbrt(l);
  const mRoot = Math.cbrt(m);
  const sRoot = Math.cbrt(s);

  return {
    l: 0.2104542553 * lRoot + 0.793617785 * mRoot - 0.0040720468 * sRoot,
    a: 1.9779984951 * lRoot - 2.428592205 * mRoot + 0.4505937099 * sRoot,
    b: 0.0259040371 * lRoot + 0.7827717662 * mRoot - 0.808675766 * sRoot,
  };
}

function oklabToRgb(oklab: Oklab): Rgb {
  const lRoot = oklab.l + 0.3963377774 * oklab.a + 0.2158037573 * oklab.b;
  const mRoot = oklab.l - 0.1055613458 * oklab.a - 0.0638541728 * oklab.b;
  const sRoot = oklab.l - 0.0894841775 * oklab.a - 1.291485548 * oklab.b;

  const l = lRoot ** 3;
  const m = mRoot ** 3;
  const s = sRoot ** 3;

  return {
    r: linearToSrgb(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    g: linearToSrgb(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    b: linearToSrgb(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
  };
}

/** amount=0 returns from; amount=1 returns to. */
export function mixColor(from: string, to: string, amount: number): string {
  const start = rgbToOklab(hexToRgb(from));
  const end = rgbToOklab(hexToRgb(to));
  const t = clamp01(amount);
  return rgbToHex(
    oklabToRgb({
      l: start.l + (end.l - start.l) * t,
      a: start.a + (end.a - start.a) * t,
      b: start.b + (end.b - start.b) * t,
    }),
  );
}

function relativeLuminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  return 0.2126 * srgbToLinear(r) + 0.7152 * srgbToLinear(g) + 0.0722 * srgbToLinear(b);
}

export function contrastRatio(first: string, second: string): number {
  const a = relativeLuminance(first);
  const b = relativeLuminance(second);
  const light = Math.max(a, b);
  const dark = Math.min(a, b);
  return (light + 0.05) / (dark + 0.05);
}

function bestOnColor(background: string, primaryText: string): string {
  const dark =
    relativeLuminance(primaryText) < 0.25
      ? mixColor("#000000", primaryText, 0.4)
      : "#000000";
  const light = "#FFFFFF";
  const darkContrast = contrastRatio(dark, background);
  const lightContrast = contrastRatio(light, background);

  if (darkContrast >= 4.5 && lightContrast < 4.5) return dark;
  if (lightContrast >= 4.5 && darkContrast < 4.5) return light;
  if (darkContrast >= 4.5 && lightContrast >= 4.5) {
    return darkContrast >= lightContrast ? dark : light;
  }

  const blackContrast = contrastRatio("#000000", background);
  return blackContrast >= lightContrast ? "#000000" : light;
}

function ensureContrast(
  foreground: string,
  background: string,
  toward: string,
  minimum = 4.5,
): string {
  if (contrastRatio(foreground, background) >= minimum) return normalizeHex(foreground);

  for (let step = 1; step <= 20; step += 1) {
    const candidate = mixColor(foreground, toward, step / 20);
    if (contrastRatio(candidate, background) >= minimum) return candidate;
  }

  const blackContrast = contrastRatio("#000000", background);
  const whiteContrast = contrastRatio("#FFFFFF", background);
  return blackContrast >= whiteContrast ? "#000000" : "#FFFFFF";
}

function themedStatus(
  anchor: string,
  atmosphere: string,
  background: string,
  primaryText: string,
): string {
  const themed = mixColor(anchor, atmosphere, 0.22);
  return ensureContrast(themed, background, primaryText, 3);
}

export function derivePaletteTokens(input: CorePalette): PaletteTokens {
  const primary = normalizeHex(input.primary);
  const secondary = normalizeHex(input.secondary);
  const accent = normalizeHex(input.accent);
  const background = normalizeHex(input.background);
  const surface = normalizeHex(input.surface);
  const primaryText = ensureContrast(
    normalizeHex(input.primaryText),
    background,
    relativeLuminance(background) > 0.5 ? "#000000" : "#FFFFFF",
    7,
  );

  const isDark = relativeLuminance(background) < 0.25;
  const opposite = isDark ? "#000000" : "#FFFFFF";
  const atmosphere = mixColor(secondary, accent, 0.28);
  const ink = mixColor(primaryText, secondary, 0.18);

  const onPrimary = bestOnColor(primary, primaryText);
  const onSecondary = bestOnColor(secondary, primaryText);
  const onAccent = bestOnColor(accent, primaryText);

  const textSecondary = ensureContrast(mixColor(background, ink, 0.7), background, primaryText, 4.5);
  const textTertiary = mixColor(background, ink, 0.52);
  const textDisabled = mixColor(background, ink, 0.38);

  const success = themedStatus("#18A66A", atmosphere, background, primaryText);
  const warning = themedStatus("#D98200", atmosphere, background, primaryText);
  const danger = themedStatus("#D9363E", atmosphere, background, primaryText);
  const info = themedStatus("#2878E8", atmosphere, background, primaryText);

  return {
    core: {
      primary,
      secondary,
      accent,
      surface,
      onPrimary,
      onSecondary,
      onAccent,
      primarySubtle: mixColor(mixColor(background, secondary, 0.08), primary, 0.16),
    },
    backgroundAndSurface: {
      background,
      subtleBackground: mixColor(background, atmosphere, 0.08),
      raisedSurface: mixColor(surface, isDark ? primaryText : "#FFFFFF", isDark ? 0.08 : 0.28),
      overlaySurface: mixColor(mixColor(surface, background, 0.28), secondary, 0.06),
    },
    text: {
      primary: primaryText,
      secondary: textSecondary,
      tertiary: textTertiary,
      disabled: textDisabled,
      inverse: opposite,
      link: ensureContrast(mixColor(primary, secondary, 0.2), background, primaryText, 4.5),
    },
    border: {
      subtle: mixColor(background, ink, 0.12),
      default: mixColor(background, ink, 0.26),
      strong: mixColor(background, ink, 0.4),
      focus: primary,
    },
    status: {
      success,
      successSurface: mixColor(background, mixColor(success, secondary, 0.12), 0.14),
      warning,
      warningSurface: mixColor(background, mixColor(warning, secondary, 0.12), 0.15),
      danger,
      dangerSurface: mixColor(background, mixColor(danger, secondary, 0.12), 0.14),
      info,
      infoSurface: mixColor(background, mixColor(info, secondary, 0.12), 0.14),
      onSuccess: bestOnColor(success, primaryText),
      onWarning: bestOnColor(warning, primaryText),
      onDanger: bestOnColor(danger, primaryText),
      onInfo: bestOnColor(info, primaryText),
    },
    interaction: {
      primaryHover: mixColor(primary, primaryText, isDark ? 0.16 : 0.14),
      primaryPressed: mixColor(primary, primaryText, isDark ? 0.26 : 0.24),
      primarySelected: mixColor(background, mixColor(primary, secondary, 0.28), 0.22),
      secondaryHover: mixColor(secondary, primaryText, isDark ? 0.16 : 0.14),
      secondaryPressed: mixColor(secondary, primaryText, isDark ? 0.26 : 0.24),
      neutralHover: mixColor(background, ink, 0.1),
      neutralPressed: mixColor(background, ink, 0.18),
      focusRing: primary,
      disabledSurface: mixColor(background, ink, 0.12),
      disabledBorder: mixColor(background, ink, 0.22),
    },
  };
}

export function paletteTokensToCssVariables(tokens: PaletteTokens): Record<string, string> {
  const accentText = ensureContrast(
    tokens.core.accent,
    tokens.backgroundAndSurface.background,
    tokens.text.primary,
    4.5,
  );

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
    "--color-interaction-primary-hover": tokens.interaction.primaryHover,
    "--color-interaction-primary-pressed": tokens.interaction.primaryPressed,
    "--color-interaction-primary-selected": tokens.interaction.primarySelected,
    "--color-interaction-selected": tokens.interaction.primarySelected,
    "--color-secondary-hover": tokens.interaction.secondaryHover,
    "--color-secondary-pressed": tokens.interaction.secondaryPressed,
    "--color-interaction-secondary-hover": tokens.interaction.secondaryHover,
    "--color-interaction-secondary-pressed": tokens.interaction.secondaryPressed,
    "--color-interaction-hover": tokens.interaction.neutralHover,
    "--color-interaction-pressed": tokens.interaction.neutralPressed,
    "--color-interaction-neutral-hover": tokens.interaction.neutralHover,
    "--color-interaction-neutral-pressed": tokens.interaction.neutralPressed,
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
  };
}

export function applyPaletteTokens(
  tokens: PaletteTokens,
  target: HTMLElement = document.documentElement,
): void {
  for (const [name, value] of Object.entries(paletteTokensToCssVariables(tokens))) {
    target.style.setProperty(name, value);
  }
}
