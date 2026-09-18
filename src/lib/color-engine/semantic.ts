import { toDarkStructural } from "./core-palette";
import { paletteChartStops, type PaletteRoles } from "@/lib/space-palettes";
import { FIXED_STATUS, MOOD_PRESETS } from "./constants";
import {
  chooseOnColor,
  contrastRatio,
  mixOklab,
  parseToOklch,
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
  let on = chooseOnColor(background);
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
    const primaryDefault = palette
      ? { background: primarySolid, on: palette.onPrimary }
      : pickOn(primarySolid, min);
    const secondaryDefault = palette
      ? { background: secondarySolid, on: palette.onSecondary }
      : pickOn(secondarySolid, min);
    const accentDefault = palette
      ? { background: accentSolid, on: palette.onAccent }
      : pickOn(accentSolid, min);
    const success = statusBlock(FIXED_STATUS.success, canvas, mode, preset.subtleMix, min);
    const warning = statusBlock(FIXED_STATUS.warning, canvas, mode, Math.min(preset.subtleMix + 0.02, 0.14), min);
    const danger = statusBlock(FIXED_STATUS.danger, canvas, mode, preset.subtleMix, min);
    const info = statusBlock(FIXED_STATUS.info, canvas, mode, preset.subtleMix, min);

    const textPrimary = palette?.text ?? (strong >= 1.15 ? neutral[1000] : strong < 0.95 ? neutral[800] : neutral[900]);
    const textSecondary = fade(textPrimary, canvas, 0.35);

    return {
      background: {
        canvas,
        subtle: mixOklab(canvas, neutral[100], 0.45),
        inverse: neutral[950],
        brand: mixOklab(canvas, primaryDefault.background, 0.16),
      },
      surface: {
        default: surfaceBase,
        subtle: mixOklab(surfaceBase, canvas, 0.35),
        raised: mixOklab(surfaceBase, "#ffffff", 0.28),
        sunken: mixOklab(surfaceBase, canvas, 0.55),
        overlay: mixOklab(surfaceBase, "#ffffff", 0.18),
        inverse: fade(textPrimary, canvas, 0.08),
      },
      text: {
        primary: textPrimary,
        secondary: textSecondary,
        tertiary: fade(textPrimary, canvas, 0.55),
        disabled: fade(textPrimary, canvas, 0.68),
        inverse: chooseOnColor(textPrimary),
        brand: primaryDefault.background,
        link: primaryDefault.background,
        danger: danger.text,
        success: success.text,
        warning: warning.text,
      },
      border: {
        subtle: fade(textPrimary, canvas, 0.9),
        default: fade(textPrimary, canvas, 0.82),
        strong: fade(textPrimary, canvas, 0.7),
        focus: primaryDefault.background,
        disabled: fade(textPrimary, canvas, 0.92),
        danger: danger.default,
      },
      primary: {
        default: primaryDefault.background,
        hover: shiftLightness(primaryDefault.background, -0.05),
        pressed: shiftLightness(primaryDefault.background, -0.1),
        selected: primaryDefault.background,
        subtle: mixOklab(canvas, primaryDefault.background, preset.subtleMix),
        border: primaryDefault.background,
        text: primaryDefault.background,
        onPrimary: primaryDefault.on,
      },
      secondary: {
        default: secondaryDefault.background,
        hover: shiftLightness(secondaryDefault.background, -0.05),
        pressed: shiftLightness(secondaryDefault.background, -0.1),
        subtle: mixOklab(canvas, secondaryDefault.background, preset.subtleMix),
        border: secondaryDefault.background,
        text: secondaryDefault.background,
        onSecondary: secondaryDefault.on,
      },
      accent: {
        default: accentDefault.background,
        subtle: mixOklab(canvas, accentDefault.background, preset.subtleMix),
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
        pressed: shiftLightness(danger.default, -0.08),
        onDanger: danger.on,
      },
      info: {
        ...info,
        onInfo: info.on,
      },
      interaction: {
        hover: mixOklab(canvas, primaryDefault.background, 0.06),
        pressed: mixOklab(canvas, primaryDefault.background, 0.1),
        selected: mixOklab(canvas, primaryDefault.background, 0.14),
        focusRing: primary[500],
        disabledBackground: fade(textPrimary, canvas, 0.94),
        disabledForeground: fade(textPrimary, canvas, 0.68),
        selection: mixOklab(canvas, primaryDefault.background, 0.22),
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
  const primaryDefault = pickOn(primarySolid, min);
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
      brand: mixOklab(canvas, primaryDefault.background, 0.22),
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
      brand: primaryDefault.background,
      link: primaryDefault.background,
      danger: danger.text,
      success: success.text,
      warning: warning.text,
    },
    border: {
      subtle: fade(textPrimary, canvas, 0.86),
      default: fade(textPrimary, canvas, 0.76),
      strong: fade(textPrimary, canvas, 0.62),
      focus: primaryDefault.background,
      disabled: fade(textPrimary, canvas, 0.9),
      danger: danger.default,
    },
    primary: {
      default: primaryDefault.background,
      hover: shiftLightness(primaryDefault.background, 0.05),
      pressed: shiftLightness(primaryDefault.background, 0.09),
      selected: primaryDefault.background,
      subtle: mixOklab(canvas, primaryDefault.background, 0.22),
      border: primaryDefault.background,
      text: primaryDefault.background,
      onPrimary: primaryDefault.on,
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
      hover: mixOklab(canvas, primaryDefault.background, 0.12),
      pressed: mixOklab(canvas, primaryDefault.background, 0.18),
      selected: mixOklab(canvas, primaryDefault.background, 0.24),
      focusRing: primaryDefault.background,
      disabledBackground: fade(textPrimary, canvas, 0.88),
      disabledForeground: fade(textPrimary, canvas, 0.68),
      selection: mixOklab(canvas, primaryDefault.background, 0.3),
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
