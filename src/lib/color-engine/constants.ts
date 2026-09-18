import type { Mood, NeutralStyle, PrimaryStep } from "./types";

export const PRIMARY_STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;

export const LIGHTNESS_STEPS: Record<PrimaryStep, number> = {
  50: 0.97,
  100: 0.93,
  200: 0.86,
  300: 0.78,
  400: 0.69,
  500: 0.61,
  600: 0.53,
  700: 0.45,
  800: 0.36,
  900: 0.27,
  950: 0.2,
};

export const CHROMA_MULTIPLIER: Record<PrimaryStep, number> = {
  50: 0.12,
  100: 0.25,
  200: 0.45,
  300: 0.7,
  400: 0.9,
  500: 1,
  600: 0.95,
  700: 0.8,
  800: 0.6,
  900: 0.4,
  950: 0.25,
};

export const NEUTRAL_LIGHTNESS: Record<number, number> = {
  0: 1,
  50: 0.985,
  100: 0.965,
  200: 0.925,
  300: 0.87,
  400: 0.74,
  500: 0.62,
  600: 0.5,
  700: 0.39,
  800: 0.28,
  850: 0.24,
  900: 0.2,
  950: 0.14,
  1000: 0.08,
};

export const NEUTRAL_STEPS = [0, 50, 100, 200, 300, 400, 500, 600, 700, 800, 850, 900, 950, 1000] as const;

export const SEMANTIC_HUES = {
  danger: 25,
  warning: 80,
  success: 145,
  info: 245,
} as const;

export const FORBIDDEN_STATUS_RANGES: Array<[number, number]> = [
  [15, 35],
  [65, 95],
  [130, 165],
];

export const MOOD_PRESETS: Record<
  Mood,
  {
    chromaMultiplier: number;
    neutralChroma: number;
    backgroundLightness: number;
    contrastStrength: number;
    subtleMix: number;
  }
> = {
  balanced: {
    chromaMultiplier: 1,
    neutralChroma: 0.012,
    backgroundLightness: 0.98,
    contrastStrength: 1,
    subtleMix: 0.1,
  },
  vivid: {
    chromaMultiplier: 1.2,
    neutralChroma: 0.02,
    backgroundLightness: 0.985,
    contrastStrength: 1,
    subtleMix: 0.12,
  },
  soft: {
    chromaMultiplier: 0.72,
    neutralChroma: 0.012,
    backgroundLightness: 0.975,
    contrastStrength: 0.92,
    subtleMix: 0.08,
  },
  calm: {
    chromaMultiplier: 0.62,
    neutralChroma: 0.018,
    backgroundLightness: 0.97,
    contrastStrength: 0.9,
    subtleMix: 0.08,
  },
  bright: {
    chromaMultiplier: 1.15,
    neutralChroma: 0.016,
    backgroundLightness: 0.99,
    contrastStrength: 1,
    subtleMix: 0.1,
  },
  highContrast: {
    chromaMultiplier: 1,
    neutralChroma: 0.005,
    backgroundLightness: 1,
    contrastStrength: 1.2,
    subtleMix: 0.06,
  },
};

export const NEUTRAL_HUE: Record<NeutralStyle, number | "source"> = {
  pure: 0,
  warm: 70,
  cool: 250,
  tinted: "source",
};

export const NEUTRAL_CHROMA: Record<NeutralStyle, number> = {
  pure: 0,
  warm: 0.012,
  cool: 0.012,
  tinted: 0.018,
};

export const CONTRAST_PAIRS: Array<[string, string, number]> = [
  ["text.primary", "background.canvas", 4.5],
  ["text.secondary", "background.canvas", 4.5],
  ["text.primary", "surface.default", 4.5],
  ["text.secondary", "surface.default", 4.5],
  ["text.link", "background.canvas", 4.5],
  ["primary.onPrimary", "primary.default", 4.5],
  ["secondary.onSecondary", "secondary.default", 4.5],
  ["danger.text", "danger.surface", 4.5],
  ["warning.text", "warning.surface", 4.5],
  ["success.text", "success.surface", 4.5],
  ["info.text", "info.surface", 4.5],
  ["border.default", "background.canvas", 3],
  ["border.focus", "background.canvas", 3],
  ["interaction.focusRing", "background.canvas", 3],
];

export const AAA_TEXT_MIN = 7;

export const FIXED_STATUS = {
  success: "#20B26B",
  warning: "#F59E0B",
  danger: "#E5484D",
  info: "#3182F6",
} as const;
