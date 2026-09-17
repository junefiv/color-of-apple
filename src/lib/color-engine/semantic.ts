import { paletteChartStops, themeInk, themePaper, type PaletteRoles } from "@/lib/space-palettes";
import { MOOD_PRESETS } from "./constants";
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

function statusBlock(
  scale: PrimitiveScales["success"],
  canvas: string,
  mode: ThemeMode,
  mix: number,
  min: number,
) {
  const solid = mode === "light" ? scale[600] : scale[400];
  const hover = mode === "light" ? scale[700] : scale[300];
  const surface = mixOklab(canvas, solid, mix);
  const text = mode === "light" ? scale[800] : scale[200];
  const border = mode === "light" ? scale[300] : scale[700];
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
  const primarySolid = options.sourceHex ?? (mode === "light" ? primary[600] : primary[400]);
  const chart = paletteChartStops(options.palette?.chips ?? [primarySolid]);

  if (mode === "light") {
    const canvas = options.palette?.background ?? setLightness(neutral[50], preset.backgroundLightness);
    const primaryDefault = pickOn(primarySolid, min);
    const secondaryDefault = pickOn(secondary[600], min);
    const accentDefault = pickOn(accent[500], min);
    const success = statusBlock(primitives.success, canvas, mode, preset.subtleMix, min);
    const warning = statusBlock(primitives.warning, canvas, mode, Math.min(preset.subtleMix + 0.02, 0.14), min);
    const danger = statusBlock(primitives.danger, canvas, mode, preset.subtleMix, min);
    const info = statusBlock(primitives.info, canvas, mode, preset.subtleMix, min);

    const textPrimary = options.palette?.text ?? (strong >= 1.15 ? neutral[1000] : strong < 0.95 ? neutral[800] : neutral[900]);
    const textSecondary = strong >= 1.15 ? neutral[800] : neutral[700];

    return {
      background: {
        canvas,
        subtle: mixOklab(canvas, neutral[100], 0.45),
        inverse: neutral[950],
        brand: mixOklab(canvas, primaryDefault.background, 0.16),
      },
      surface: {
        default: mixOklab(canvas, neutral[0], 0.72),
        subtle: mixOklab(canvas, neutral[50], 0.55),
        raised: mixOklab(canvas, neutral[0], 0.82),
        sunken: mixOklab(canvas, neutral[100], 0.4),
        overlay: mixOklab(canvas, neutral[0], 0.78),
        inverse: neutral[900],
      },
      text: {
        primary: textPrimary,
        secondary: textSecondary,
        tertiary: neutral[600],
        disabled: neutral[400],
        inverse: neutral[0],
        brand: primary[700],
        link: primary[700],
        danger: danger.text,
        success: success.text,
        warning: warning.text,
      },
      border: {
        subtle: neutral[200],
        default: neutral[300],
        strong: neutral[500],
        focus: primary[500],
        disabled: neutral[200],
        danger: primitives.danger[400],
      },
      primary: {
        default: primaryDefault.background,
        hover: shiftLightness(primaryDefault.background, -0.05),
        pressed: shiftLightness(primaryDefault.background, -0.1),
        selected: primary[500],
        subtle: mixOklab(canvas, primaryDefault.background, preset.subtleMix),
        border: primary[300],
        text: primary[700],
        onPrimary: primaryDefault.on,
      },
      secondary: {
        default: secondaryDefault.background,
        hover: shiftLightness(secondaryDefault.background, -0.05),
        pressed: shiftLightness(secondaryDefault.background, -0.1),
        subtle: mixOklab(canvas, secondaryDefault.background, preset.subtleMix),
        border: secondary[300],
        text: secondary[700],
        onSecondary: secondaryDefault.on,
      },
      accent: {
        default: accentDefault.background,
        subtle: mixOklab(canvas, accentDefault.background, preset.subtleMix),
        text: accent[700],
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
        disabledBackground: mixOklab(canvas, neutral[100], 0.5),
        disabledForeground: neutral[400],
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

  const canvas = options.palette?.background
    ? themePaper(options.palette.background, "dark")
    : neutral[950];
  const primaryDefault = pickOn(primarySolid, min);
  const secondaryDefault = pickOn(secondary[400], min);
  const accentDefault = pickOn(accent[400], min);
  const success = statusBlock(primitives.success, canvas, mode, 0.2, min);
  const warning = statusBlock(primitives.warning, canvas, mode, 0.22, min);
  const danger = statusBlock(primitives.danger, canvas, mode, 0.2, min);
  const info = statusBlock(primitives.info, canvas, mode, 0.2, min);
  const textPrimary = options.palette?.text
    ? themeInk(options.palette.text, "dark")
    : strong >= 1.15
      ? neutral[0]
      : neutral[50];

  return {
    background: {
      canvas,
      subtle: mixOklab(canvas, neutral[900], 0.35),
      inverse: neutral[50],
      brand: mixOklab(canvas, primaryDefault.background, 0.22),
    },
    surface: {
      default: mixOklab(canvas, neutral[900], 0.45),
      subtle: mixOklab(canvas, neutral[850], 0.4),
      raised: mixOklab(canvas, neutral[800], 0.35),
      sunken: mixOklab(canvas, neutral[950], 0.5),
      overlay: mixOklab(canvas, neutral[800], 0.3),
      inverse: neutral[50],
    },
    text: {
      primary: textPrimary,
      secondary: neutral[300],
      tertiary: neutral[400],
      disabled: neutral[600],
      inverse: neutral[950],
      brand: primary[300],
      link: primary[300],
      danger: danger.text,
      success: success.text,
      warning: warning.text,
    },
    border: {
      subtle: neutral[800],
      default: neutral[700],
      strong: neutral[500],
      focus: primary[400],
      disabled: neutral[800],
      danger: primitives.danger[600],
    },
    primary: {
      default: primaryDefault.background,
      hover: shiftLightness(primaryDefault.background, 0.05),
      pressed: shiftLightness(primaryDefault.background, 0.09),
      selected: primary[300],
      subtle: mixOklab(canvas, primaryDefault.background, 0.22),
      border: primary[700],
      text: primary[300],
      onPrimary: primaryDefault.on,
    },
    secondary: {
      default: secondaryDefault.background,
      hover: shiftLightness(secondaryDefault.background, 0.05),
      pressed: shiftLightness(secondaryDefault.background, 0.09),
      subtle: mixOklab(canvas, secondaryDefault.background, 0.22),
      border: secondary[700],
      text: secondary[300],
      onSecondary: secondaryDefault.on,
    },
    accent: {
      default: accentDefault.background,
      subtle: mixOklab(canvas, accentDefault.background, 0.22),
      text: accent[300],
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
      focusRing: primary[400],
      disabledBackground: mixOklab(canvas, neutral[800], 0.4),
      disabledForeground: neutral[600],
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
