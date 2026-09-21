import { toDarkStructural } from "./core-palette";
import { filledScaleStates } from "./on-ink";
import { primaryButtonTokens } from "./primary-button";
import { paletteChartStops, type PaletteRoles } from "@/lib/space-palettes";
import { FIXED_STATUS, MOOD_PRESETS } from "./constants";
import {
  chooseOnColor,
  contrastRatio,
  mixOklab,
  parseToOklch,
  readableOnColor,
  resolveSurfaceInk,
  setLightness,
  shiftLightness,
  toHex,
  toHex8,
} from "./color-utils";
import type {
  AccessibilityTarget,
  Mood,
  PrimitiveScales,
  SemanticTokens,
  ThemeMode,
} from "./types";

function pickOn(background: string, min: number) {
  let on = readableOnColor(background, min);
  if (contrastRatio(background, on) >= min) {
    return { background, on };
  }

  let next = background;
  const towardDark = on === "#ffffff";
  for (let i = 0; i < 40; i += 1) {
    next = shiftLightness(next, towardDark ? -0.012 : 0.012);
    if (contrastRatio(next, on) >= min) {
      return { background: next, on };
    }
  }

  on = on === "#ffffff" ? "#111111" : "#ffffff";
  return { background: next, on };
}

function fade(ink: string, paper: string, amount: number) {
  return mixOklab(ink, paper, amount);
}

function statusBlock(
  solid: string,
  canvas: string,
  mode: ThemeMode,
  mix: number,
  min: number,
) {
  const hover = shiftLightness(solid, mode === "light" ? -0.06 : 0.06);
  const surface = mixOklab(canvas, solid, mix);
  const text = shiftLightness(solid, mode === "light" ? -0.16 : 0.18);
  const border = mixOklab(canvas, solid, mode === "light" ? 0.28 : 0.4);
  const on = pickOn(solid, min).on;
  return { surface, border, text, default: solid, hover, on };
}

export function mapSemanticTokens(options: {
  primitives: PrimitiveScales;
  mood: Mood;
  mode: ThemeMode;
  target: AccessibilityTarget;
  sourceHex?: string;
  palette?: PaletteRoles;
}): SemanticTokens {
  const { primitives, mood, mode } = options;
  const preset = MOOD_PRESETS[mood];
  const min = options.target === "AAA" ? 7 : 4.5;
  const { primary, secondary, accent, neutral } = primitives;
  const strong = preset.contrastStrength;
  const palette = options.palette;
  const primarySolid =
    palette?.primaryAction ??
    palette?.primary ??
    options.sourceHex ??
    (mode === "light" ? primary[600] : primary[400]);
  const secondarySolid = palette?.secondary.hex ?? (mode === "light" ? secondary[600] : secondary[400]);
  const accentSolid = palette?.accent.hex ?? (mode === "light" ? accent[500] : accent[400]);
  const chart = paletteChartStops(palette?.chips ?? [primarySolid]);

  if (mode === "light") {
    const canvas = palette?.background ?? setLightness(neutral[50], preset.backgroundLightness);
    const surfaceBase = palette?.surface ?? mixOklab(canvas, neutral[0], 0.72);
    const canvasSubtle = palette?.backgroundSubtle ?? mixOklab(canvas, neutral[100], 0.45);
    const primaryFill = primaryButtonTokens(primary, neutral, mode);
    const secondaryFill = filledScaleStates(secondary, neutral, mode === "light" ? 500 : 400);
    const secondaryDefault = palette
      ? { background: secondaryFill.default, on: secondaryFill.on }
      : pickOn(secondarySolid, min);
    const accentDefault = palette ? resolveSurfaceInk(accentSolid, min) : pickOn(accentSolid, min);
    const brandPrimary = palette?.primary ?? primary[500];
    const success = statusBlock(FIXED_STATUS.success, canvas, mode, preset.subtleMix, min);
    const warning = statusBlock(FIXED_STATUS.warning, canvas, mode, Math.min(preset.subtleMix + 0.02, 0.14), min);
    const danger = statusBlock(FIXED_STATUS.danger, canvas, mode, preset.subtleMix, min);
    const info = statusBlock(FIXED_STATUS.info, canvas, mode, preset.subtleMix, min);

    const textPrimary = palette?.text ?? (strong >= 1.15 ? neutral[1000] : strong < 0.95 ? neutral[800] : neutral[900]);
    const textSecondary = palette?.textSecondary ?? fade(textPrimary, canvas, 0.35);

    return {
      background: {
        canvas,
        subtle: canvasSubtle,
        inverse: neutral[950],
        brand: mixOklab(canvas, primaryFill.default, 0.16),
      },
      surface: {
        default: surfaceBase,
        subtle: mixOklab(surfaceBase, canvas, 0.35),
        raised: palette?.surfaceRaised ?? mixOklab(surfaceBase, "#ffffff", 0.28),
        sunken: palette?.surfaceSunken ?? mixOklab(surfaceBase, canvas, 0.55),
        overlay: mixOklab(surfaceBase, "#ffffff", 0.18),
        inverse: fade(textPrimary, canvas, 0.08),
      },
      text: {
        primary: textPrimary,
        secondary: textSecondary,
        tertiary: palette?.textTertiary ?? fade(textPrimary, canvas, 0.55),
        disabled: palette?.textDisabled ?? fade(textPrimary, canvas, 0.68),
        inverse: chooseOnColor(textPrimary),
        brand: brandPrimary,
        link: brandPrimary,
        danger: danger.text,
        success: success.text,
        warning: warning.text,
      },
      border: {
        subtle: palette?.borderSubtle ?? fade(textPrimary, canvas, 0.9),
        default: palette?.borderDefault ?? fade(textPrimary, canvas, 0.82),
        strong: palette?.borderStrong ?? fade(textPrimary, canvas, 0.7),
        focus: primaryFill.default,
        disabled: fade(textPrimary, canvas, 0.92),
        danger: danger.default,
      },
      primary: {
        default: primaryFill.default,
        hover: primaryFill.hover,
        pressed: primaryFill.pressed,
        selected: primaryFill.default,
        subtle: mixOklab(canvas, primaryFill.default, preset.subtleMix),
        border: primaryFill.default,
        text: brandPrimary,
        onPrimary: primaryFill.on,
      },
      secondary: {
        default: palette ? secondaryFill.default : secondaryDefault.background,
        hover: palette ? secondaryFill.hover : shiftLightness(secondaryDefault.background, -0.05),
        pressed: palette ? secondaryFill.pressed : shiftLightness(secondaryDefault.background, -0.1),
        subtle: mixOklab(canvas, (palette ? secondaryFill.default : secondaryDefault.background), preset.subtleMix),
        border: palette ? secondary[200] : secondaryDefault.background,
        text: secondarySolid,
        onSecondary: palette ? secondaryFill.on : secondaryDefault.on,
      },
      accent: {
        default: accentDefault.background,
        subtle: mixOklab(canvas, accentDefault.background, preset.subtleMix),
        text: accentSolid,
        onAccent: accentDefault.on,
      },
      success: {
        ...success,
        onSuccess: success.on,
      },
      warning: {
        ...warning,
        onWarning: warning.on,
      },
      danger: {
        ...danger,
        pressed: shiftLightness(danger.default, -0.08),
        onDanger: danger.on,
      },
      info: {
        ...info,
        onInfo: info.on,
      },
      interaction: {
        hover: mixOklab(canvas, textPrimary, 0.06),
        pressed: mixOklab(canvas, textPrimary, 0.1),
        selected: mixOklab(canvas, primaryFill.default, 0.14),
        focusRing: primary[500],
        disabledBackground: fade(textPrimary, canvas, 0.94),
        disabledForeground: fade(textPrimary, canvas, 0.68),
        selection: mixOklab(canvas, primaryFill.default, 0.22),
        primaryHover: primaryFill.hover,
        primaryPressed: primaryFill.pressed,
        primarySelected: mixOklab(canvas, primaryFill.default, 0.18),
        secondaryHover: palette ? secondaryFill.hover : shiftLightness(secondaryDefault.background, -0.05),
        secondaryPressed: palette ? secondaryFill.pressed : shiftLightness(secondaryDefault.background, -0.1),
        neutralHover: mixOklab(canvas, textPrimary, 0.06),
        neutralPressed: mixOklab(canvas, textPrimary, 0.1),
        disabledSurface: fade(textPrimary, canvas, 0.94),
        disabledBorder: fade(textPrimary, canvas, 0.82),
      },
      overlay: {
        scrim: toHex8(parseToOklch(neutral[1000]), 0.48),
        hover: toHex8(parseToOklch(neutral[1000]), 0.08),
        pressed: toHex8(parseToOklch(neutral[1000]), 0.14),
      },
      shadow: {
        subtle: toHex8({ ...parseToOklch(primary[900]), c: 0.02 }, 0.08),
        default: toHex8({ ...parseToOklch(primary[900]), c: 0.03 }, 0.14),
        strong: toHex8({ ...parseToOklch(primary[950]), c: 0.04 }, 0.28),
      },
      chart,
    };
  }

  const darkPaper = palette
    ? toDarkStructural({
        textPrimary: palette.text,
        background: palette.background,
        primary: palette.primary,
        primaryAction: palette.primaryAction,
        onPrimary: palette.onPrimary,
        secondary: palette.secondary.hex,
        onSecondary: palette.onSecondary,
        accent: palette.accent.hex,
        onAccent: palette.onAccent,
        surface: palette.surface,
      })
    : null;
  const canvas = darkPaper?.background ?? neutral[950];
  const surfaceBase = darkPaper?.surface ?? mixOklab(canvas, neutral[900], 0.45);
  const primaryFill = primaryButtonTokens(primary, neutral, mode);
  const secondaryDefault = pickOn(secondarySolid, min);
  const accentDefault = pickOn(accentSolid, min);
  const success = statusBlock(FIXED_STATUS.success, canvas, mode, 0.2, min);
  const warning = statusBlock(FIXED_STATUS.warning, canvas, mode, 0.22, min);
  const danger = statusBlock(FIXED_STATUS.danger, canvas, mode, 0.2, min);
  const info = statusBlock(FIXED_STATUS.info, canvas, mode, 0.2, min);
  const textPrimary = darkPaper?.textPrimary
    ? darkPaper.textPrimary
    : strong >= 1.15
      ? neutral[0]
      : neutral[50];

  return {
    background: {
      canvas,
      subtle: mixOklab(canvas, surfaceBase, 0.35),
      inverse: textPrimary,
      brand: mixOklab(canvas, primaryFill.default, 0.22),
    },
    surface: {
      default: surfaceBase,
      subtle: mixOklab(surfaceBase, canvas, 0.28),
      raised: mixOklab(surfaceBase, "#ffffff", 0.08),
      sunken: mixOklab(surfaceBase, canvas, 0.45),
      overlay: mixOklab(surfaceBase, "#ffffff", 0.06),
      inverse: textPrimary,
    },
    text: {
      primary: textPrimary,
      secondary: fade(textPrimary, canvas, 0.35),
      tertiary: fade(textPrimary, canvas, 0.55),
      disabled: fade(textPrimary, canvas, 0.68),
      inverse: chooseOnColor(textPrimary),
      brand: palette?.primary ?? primary[500],
      link: palette?.primary ?? primary[500],
      danger: danger.text,
      success: success.text,
      warning: warning.text,
    },
    border: {
      subtle: fade(textPrimary, canvas, 0.86),
      default: fade(textPrimary, canvas, 0.76),
      strong: fade(textPrimary, canvas, 0.62),
      focus: primaryFill.default,
      disabled: fade(textPrimary, canvas, 0.9),
      danger: danger.default,
    },
    primary: {
      default: primaryFill.default,
      hover: primaryFill.hover,
      pressed: primaryFill.pressed,
      selected: primaryFill.default,
      subtle: mixOklab(canvas, primaryFill.default, 0.22),
      border: primaryFill.default,
      text: palette?.primary ?? primary[500],
      onPrimary: primaryFill.on,
    },
    secondary: {
      default: secondaryDefault.background,
      hover: shiftLightness(secondaryDefault.background, 0.05),
      pressed: shiftLightness(secondaryDefault.background, 0.09),
      subtle: mixOklab(canvas, secondaryDefault.background, 0.22),
      border: secondaryDefault.background,
      text: secondaryDefault.background,
      onSecondary: secondaryDefault.on,
    },
    accent: {
      default: accentDefault.background,
      subtle: mixOklab(canvas, accentDefault.background, 0.22),
      text: accentDefault.background,
      onAccent: accentDefault.on,
    },
    success: {
      ...success,
      onSuccess: success.on,
    },
    warning: {
      ...warning,
      onWarning: warning.on,
    },
    danger: {
      ...danger,
      pressed: shiftLightness(danger.default, 0.08),
      onDanger: danger.on,
    },
    info: {
      ...info,
      onInfo: info.on,
    },
    interaction: {
      hover: mixOklab(canvas, textPrimary, 0.12),
      pressed: mixOklab(canvas, textPrimary, 0.18),
      selected: mixOklab(canvas, primaryFill.default, 0.24),
      focusRing: primaryFill.default,
      disabledBackground: fade(textPrimary, canvas, 0.88),
      disabledForeground: fade(textPrimary, canvas, 0.68),
      selection: mixOklab(canvas, primaryFill.default, 0.3),
      primaryHover: primaryFill.hover,
      primaryPressed: primaryFill.pressed,
      primarySelected: mixOklab(canvas, primaryFill.default, 0.22),
      secondaryHover: shiftLightness(secondaryDefault.background, 0.05),
      secondaryPressed: shiftLightness(secondaryDefault.background, 0.09),
      neutralHover: mixOklab(canvas, textPrimary, 0.12),
      neutralPressed: mixOklab(canvas, textPrimary, 0.18),
      disabledSurface: fade(textPrimary, canvas, 0.88),
      disabledBorder: fade(textPrimary, canvas, 0.76),
    },
    overlay: {
      scrim: toHex8(parseToOklch(neutral[1000]), 0.64),
      hover: toHex8(parseToOklch(neutral[0]), 0.06),
      pressed: toHex8(parseToOklch(neutral[0]), 0.1),
    },
    shadow: {
      subtle: toHex8({ ...parseToOklch(neutral[1000]), c: 0.02 }, 0.28),
      default: toHex8({ ...parseToOklch(neutral[1000]), c: 0.03 }, 0.4),
      strong: toHex8({ ...parseToOklch(neutral[1000]), c: 0.04 }, 0.56),
    },
    chart,
  };
}
