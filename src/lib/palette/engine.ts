import {
  clamp,
  contrastRatio,
  hueDistance,
  mixOklab,
  parseToOklch,
  preserveSourceHex,
  rotateHue,
  toHex,
} from "@/lib/color-engine/color-utils";
import type { OklchColor } from "@/lib/color-engine/types";
import { PALETTE_CONCEPTS, getPaletteConcept, resolvePaletteId } from "./concepts";
import type {
  ColorRule,
  ColorStrength,
  ContrastProfile,
  GeneratedPalette,
  NeutralHueRule,
  PalettePreset,
  PaletteTokens,
  SurfaceProfile,
  ThemeMode,
} from "./types";

const ACHROMATIC_CHROMA = 0.03;
const FALLBACK_HUE = 260;
const MIN_ROLE_HUE = 18;

const SURFACE_L: Record<SurfaceProfile, Record<"background" | "subtle" | "surface" | "raised" | "overlay", number>> = {
  crisp: { background: 0.99, subtle: 0.97, surface: 1, raised: 1, overlay: 1 },
  soft: { background: 0.985, subtle: 0.965, surface: 0.997, raised: 1, overlay: 1 },
  tinted: { background: 0.982, subtle: 0.96, surface: 0.995, raised: 1, overlay: 0.998 },
  paper: { background: 0.98, subtle: 0.958, surface: 0.993, raised: 0.999, overlay: 0.997 },
};

const DARK_SURFACE_L = {
  background: 0.16,
  subtle: 0.2,
  surface: 0.22,
  raised: 0.26,
  overlay: 0.28,
} as const;

const TEXT_L: Record<ContrastProfile, Record<"primary" | "secondary" | "tertiary" | "disabled", number>> = {
  soft: { primary: 0.22, secondary: 0.43, tertiary: 0.57, disabled: 0.7 },
  normal: { primary: 0.18, secondary: 0.39, tertiary: 0.54, disabled: 0.69 },
  strong: { primary: 0.14, secondary: 0.34, tertiary: 0.49, disabled: 0.66 },
};

const DARK_TEXT_L: Record<ContrastProfile, Record<"primary" | "secondary" | "tertiary" | "disabled", number>> = {
  soft: { primary: 0.9, secondary: 0.72, tertiary: 0.6, disabled: 0.48 },
  normal: { primary: 0.93, secondary: 0.76, tertiary: 0.64, disabled: 0.5 },
  strong: { primary: 0.96, secondary: 0.8, tertiary: 0.68, disabled: 0.52 },
};

const BORDER_L: Record<ContrastProfile, Record<"subtle" | "default" | "strong", number>> = {
  soft: { subtle: 0.91, default: 0.84, strong: 0.72 },
  normal: { subtle: 0.89, default: 0.8, strong: 0.67 },
  strong: { subtle: 0.87, default: 0.76, strong: 0.6 },
};

const DARK_BORDER_L: Record<ContrastProfile, Record<"subtle" | "default" | "strong", number>> = {
  soft: { subtle: 0.28, default: 0.36, strong: 0.48 },
  normal: { subtle: 0.26, default: 0.34, strong: 0.46 },
  strong: { subtle: 0.24, default: 0.32, strong: 0.44 },
};

const STRENGTH: Record<
  ColorStrength,
  { subtle: number; selected: number; hover: number; pressed: number; statusSurface: number }
> = {
  low: { subtle: 0.08, selected: 0.12, hover: 0.04, pressed: 0.08, statusSurface: 0.08 },
  medium: { subtle: 0.1, selected: 0.16, hover: 0.05, pressed: 0.1, statusSurface: 0.1 },
  high: { subtle: 0.12, selected: 0.2, hover: 0.06, pressed: 0.12, statusSurface: 0.12 },
};

const STATUS = {
  success: { h: 145, c: 0.14, l: 0.55 },
  warning: { h: 85, c: 0.13, l: 0.52 },
  danger: { h: 25, c: 0.16, l: 0.52 },
  info: { h: 250, c: 0.14, l: 0.55 },
} as const;

function oklch(l: number, c: number, h: number): OklchColor {
  return { mode: "oklch", l: clamp(l, 0, 1), c: Math.max(0, c), h: (h + 360) % 360 };
}

function hexOf(l: number, c: number, h: number) {
  return toHex(oklch(l, c, h));
}

function shortestHueMix(from: number, to: number, amount: number) {
  const delta = ((to - from + 540) % 360) - 180;
  return rotateHue(from, delta * clamp(amount, 0, 1));
}

function circularMean(hues: number[]) {
  const x = hues.reduce((sum, hue) => sum + Math.cos((hue * Math.PI) / 180), 0);
  const y = hues.reduce((sum, hue) => sum + Math.sin((hue * Math.PI) / 180), 0);
  return (Math.atan2(y, x) * 180) / Math.PI;
}

function workingHue(primary: OklchColor) {
  return primary.c < ACHROMATIC_CHROMA ? primary.h || FALLBACK_HUE : primary.h;
}

function workingChroma(primary: OklchColor, ratio: number) {
  const base = primary.c < ACHROMATIC_CHROMA ? 0.06 : primary.c;
  return clamp(base * ratio, 0, 0.4);
}

function ensureContrast(
  color: string,
  against: string,
  minimum: number,
  toward: "lighter" | "darker" | "auto" = "auto",
) {
  if (contrastRatio(color, against) >= minimum) return { hex: color, corrected: false };

  const seed = parseToOklch(color);
  const againstL = parseToOklch(against).l;
  const direction =
    toward === "lighter" ? 1 : toward === "darker" ? -1 : seed.l >= againstL ? 1 : -1;

  const next = { ...seed };
  let hex = color;
  for (let step = 0; step < 48 && contrastRatio(hex, against) < minimum; step += 1) {
    next.l = clamp(next.l + direction * 0.012, 0.04, 0.98);
    hex = toHex(next);
  }

  if (contrastRatio(hex, against) >= minimum) return { hex, corrected: true };

  const fallback = contrastRatio("#000000", against) >= contrastRatio("#ffffff", against) ? "#000000" : "#ffffff";
  return { hex: fallback, corrected: true };
}

function applyRule(primary: OklchColor, rule: ColorRule, neutralHex: string): OklchColor {
  const hue = workingHue(primary);

  switch (rule.kind) {
    case "rotate": {
      const chroma = Math.min(workingChroma(primary, rule.chromaRatio), rule.chromaCap ?? 0.4);
      return oklch(rule.lightness ?? clamp(primary.l + 0.02, 0.28, 0.86), chroma, rotateHue(hue, rule.degrees));
    }
    case "same": {
      const lightness =
        rule.lightness ??
        clamp(primary.l + (rule.lightnessDelta ?? 0.08), 0.22, 0.88);
      return oklch(lightness, workingChroma(primary, rule.chromaRatio), hue);
    }
    case "mix-neutral": {
      const mixed = parseToOklch(mixOklab(toHex(primary), neutralHex, 1 - rule.primaryRatio));
      return oklch(mixed.l, mixed.c, mixed.h);
    }
    case "dark-tone": {
      return oklch(
        clamp(primary.l + (rule.lightnessDelta ?? -0.22), 0.16, 0.42),
        workingChroma(primary, rule.chromaRatio ?? 0.85),
        hue,
      );
    }
    case "darken-low-chroma": {
      return oklch(
        clamp(primary.l + (rule.lightnessDelta ?? -0.18), 0.2, 0.44),
        clamp(primary.c * rule.chromaRatio, 0.01, 0.12),
        hue,
      );
    }
    case "mix-charcoal": {
      const charcoal = hexOf(0.22, 0.01, 75);
      const mixed = parseToOklch(mixOklab(toHex(primary), charcoal, 0.55));
      return oklch(mixed.l, mixed.c, mixed.h);
    }
    case "towards": {
      return oklch(
        rule.lightness ?? clamp(primary.l + 0.02, 0.3, 0.82),
        workingChroma(primary, rule.chromaRatio ?? 0.7),
        shortestHueMix(hue, rule.hue, rule.amount),
      );
    }
  }
}

function separateFrom(base: OklchColor, candidate: OklchColor) {
  if (base.c < ACHROMATIC_CHROMA && candidate.c < ACHROMATIC_CHROMA) {
    const gap = Math.abs(candidate.l - base.l);
    if (gap >= 0.1) return candidate;
    return oklch(clamp(candidate.l + (candidate.l >= base.l ? 0.12 : -0.12), 0.2, 0.88), candidate.c, candidate.h);
  }

  const bumps = [0, 18, -18, 36, -36, 55, -55];
  for (const bump of bumps) {
    const next = oklch(candidate.l, candidate.c, rotateHue(candidate.h, bump));
    if (hueDistance(base.h, next.h) >= MIN_ROLE_HUE || Math.abs(base.l - next.l) >= 0.12) {
      return next;
    }
  }
  return oklch(clamp(candidate.l + 0.14, 0.2, 0.88), candidate.c, rotateHue(candidate.h, 28));
}

function resolveNeutralHue(
  primary: OklchColor,
  secondary: OklchColor,
  accent: OklchColor,
  rule: NeutralHueRule,
) {
  switch (rule.kind) {
    case "primary":
      return workingHue(primary);
    case "mid-ps":
      return shortestHueMix(workingHue(primary), secondary.h, 0.5);
    case "mean-psa":
      return circularMean([workingHue(primary), secondary.h, accent.h]);
    case "achromatic":
      return 0;
    case "fixed":
      return rule.hue;
  }
}

function getOnColor(background: string, dark: string, light: string) {
  const preferred =
    contrastRatio(dark, background) >= contrastRatio(light, background) ? dark : light;
  return ensureContrast(preferred, background, 4.5).hex;
}

function isLightOn(onColor: string) {
  return parseToOklch(onColor).l >= 0.65;
}

function stateColor(base: string, onColor: string, amount: number) {
  const color = parseToOklch(base);
  const direction = isLightOn(onColor) ? -1 : 1;
  const shifted = oklch(
    color.l + direction * amount,
    color.c * clamp(1 + direction * 0.03, 0.95, 1.05),
    color.h,
  );
  return ensureContrast(toHex(shifted), onColor, 4.5).hex;
}

function buildSurfaces(preset: PalettePreset, hue: number, mode: ThemeMode) {
  const levels = mode === "dark" ? DARK_SURFACE_L : SURFACE_L[preset.surfaceProfile];
  // Light surfaces vary within off-whites, independently of the brand's saturation.
  const chroma = mode === "dark" ? preset.neutralChroma : Math.min(preset.neutralChroma * 0.25, 0.004);
  return {
    background: hexOf(levels.background, chroma, hue),
    subtleBackground: hexOf(levels.subtle, chroma * 1.15, hue),
    surface: hexOf(levels.surface, chroma * 0.45, hue),
    raisedSurface: hexOf(levels.raised, chroma * 0.2, hue),
    overlaySurface: hexOf(levels.overlay, chroma * 0.25, hue),
  };
}

function buildText(
  preset: PalettePreset,
  hue: number,
  background: string,
  mode: ThemeMode,
) {
  const levels = mode === "dark" ? DARK_TEXT_L[preset.contrastProfile] : TEXT_L[preset.contrastProfile];
  const toward = mode === "dark" ? "lighter" : "darker";
  const primary = ensureContrast(
    hexOf(levels.primary, Math.min(preset.neutralChroma, 0.018), hue),
    background,
    4.5,
    toward,
  );
  const secondary = ensureContrast(
    hexOf(levels.secondary, preset.neutralChroma * 0.8, hue),
    background,
    4.5,
    toward,
  );
  const tertiary = hexOf(levels.tertiary, preset.neutralChroma * 0.6, hue);
  const disabled = hexOf(levels.disabled, preset.neutralChroma * 0.4, hue);
  const inverse = hexOf(mode === "dark" ? 0.16 : 0.985, preset.neutralChroma * 0.1, hue);
  return {
    primary: primary.hex,
    secondary: secondary.hex,
    tertiary,
    disabled,
    inverse,
    corrected: primary.corrected || secondary.corrected,
  };
}

function buildLink(primary: OklchColor, background: string) {
  const link = hexOf(primary.l, primary.c, workingHue(primary));
  const result = ensureContrast(link, background, 4.5, "darker");
  return result;
}

function buildBorders(
  preset: PalettePreset,
  hue: number,
  primary: string,
  surface: string,
  mode: ThemeMode,
) {
  const levels = mode === "dark" ? DARK_BORDER_L[preset.contrastProfile] : BORDER_L[preset.contrastProfile];
  const focus = ensureContrast(primary, surface, 3, "auto");
  return {
    subtle: hexOf(levels.subtle, preset.neutralChroma * 0.6, hue),
    default: hexOf(levels.default, preset.neutralChroma * 0.7, hue),
    strong: hexOf(levels.strong, preset.neutralChroma * 0.8, hue),
    focus: focus.hex,
    corrected: focus.corrected,
  };
}

function buildStatus(preset: PalettePreset, surface: string, background: string) {
  const ratio = STRENGTH[preset.colorStrength].statusSurface;
  const make = (role: keyof typeof STATUS) => {
    const spec = STATUS[role];
    const solid = ensureContrast(
      hexOf(spec.l, spec.c * preset.semanticIntensity, spec.h),
      background,
      4.5,
      "darker",
    ).hex;
    return {
      solid,
      surface: mixOklab(surface, solid, ratio),
      on: getOnColor(solid, "#111111", "#ffffff"),
    };
  };

  const success = make("success");
  const warning = make("warning");
  const danger = make("danger");
  const info = make("info");

  return {
    success: success.solid,
    successSurface: success.surface,
    warning: warning.solid,
    warningSurface: warning.surface,
    danger: danger.solid,
    dangerSurface: danger.surface,
    info: info.solid,
    infoSurface: info.surface,
    onSuccess: success.on,
    onWarning: warning.on,
    onDanger: danger.on,
    onInfo: info.on,
  };
}

export function generatePalette(
  primaryHex: string,
  conceptId?: string,
  mode: ThemeMode = "light",
): GeneratedPalette {
  const id = resolvePaletteId(conceptId);
  const concept = getPaletteConcept(id);
  const preset = concept.preset;
  const source = parseToOklch(primaryHex);
  const primaryKept = preserveSourceHex(primaryHex, source);
  const primary = parseToOklch(primaryKept);

  const probeHue = resolveNeutralHue(primary, primary, primary, preset.neutralHue);
  const probeNeutral = hexOf(clamp(primary.l, 0.35, 0.78), preset.neutralChroma, probeHue);

  let secondary = applyRule(primary, preset.secondaryRule, probeNeutral);
  let accent = applyRule(primary, preset.accentRule, probeNeutral);
  secondary = separateFrom(primary, secondary);
  accent = separateFrom(primary, separateFrom(secondary, accent));

  const secondaryHex = toHex(secondary);
  const accentHex = toHex(accent);
  const secondaryColor = parseToOklch(secondaryHex);
  const accentColor = parseToOklch(accentHex);
  const neutralHue = resolveNeutralHue(primary, secondaryColor, accentColor, preset.neutralHue);
  const surfaces = buildSurfaces(preset, neutralHue, mode);
  const text = buildText(preset, neutralHue, surfaces.background, mode);
  const link = buildLink(primary, surfaces.background);
  const onPrimary = getOnColor(primaryKept, text.primary, text.inverse);
  const onSecondary = getOnColor(secondaryHex, text.primary, text.inverse);
  const onAccent = getOnColor(accentHex, text.primary, text.inverse);
  const strength = STRENGTH[preset.colorStrength];
  const borders = buildBorders(preset, neutralHue, primaryKept, surfaces.surface, mode);
  const status = buildStatus(preset, surfaces.surface, surfaces.background);
  const focusRing = ensureContrast(primaryKept, surfaces.background, 3);

  const tokens: PaletteTokens = {
    core: {
      primary: primaryKept,
      secondary: secondaryHex,
      accent: accentHex,
      surface: surfaces.surface,
      onPrimary,
      onSecondary,
      onAccent,
      primarySubtle: mixOklab(surfaces.surface, primaryKept, strength.subtle),
    },
    backgroundAndSurface: {
      background: surfaces.background,
      subtleBackground: surfaces.subtleBackground,
      raisedSurface: surfaces.raisedSurface,
      overlaySurface: surfaces.overlaySurface,
    },
    text: {
      primary: text.primary,
      secondary: text.secondary,
      tertiary: text.tertiary,
      disabled: text.disabled,
      inverse: text.inverse,
      link: link.hex,
    },
    border: {
      subtle: borders.subtle,
      default: borders.default,
      strong: borders.strong,
      focus: borders.focus,
    },
    status,
    interaction: {
      primaryHover: stateColor(primaryKept, onPrimary, 0.035),
      primaryPressed: stateColor(primaryKept, onPrimary, 0.07),
      primarySelected: mixOklab(surfaces.surface, primaryKept, strength.selected),
      secondaryHover: stateColor(secondaryHex, onSecondary, 0.035),
      secondaryPressed: stateColor(secondaryHex, onSecondary, 0.07),
      neutralHover: mixOklab(surfaces.surface, text.primary, strength.hover),
      neutralPressed: mixOklab(surfaces.surface, text.primary, strength.pressed),
      focusRing: focusRing.hex,
      disabledSurface: mixOklab(surfaces.surface, text.primary, 0.05),
      disabledBorder: mixOklab(surfaces.surface, text.primary, 0.14),
    },
  };

  const accessible =
    contrastRatio(tokens.text.primary, tokens.backgroundAndSurface.background) >= 4.5 &&
    contrastRatio(tokens.core.onPrimary, tokens.core.primary) >= 4.5;

  return {
    id,
    tokens,
    accessible,
    corrected: text.corrected || link.corrected || borders.corrected || focusRing.corrected,
  };
}

export function generatePaletteTokens(
  primaryHex: string,
  conceptId?: string,
  mode: ThemeMode = "light",
) {
  return generatePalette(primaryHex, conceptId, mode).tokens;
}

export function listGeneratedPalettes(primaryHex: string, mode: ThemeMode = "light") {
  return PALETTE_CONCEPTS.map((concept) => generatePalette(primaryHex, concept.id, mode));
}
