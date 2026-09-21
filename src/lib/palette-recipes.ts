export type SpacePaletteId =
  | "generic-gradient"
  | "matching-gradient"
  | "spot"
  | "twisted-spot"
  | "classy"
  | "cube"
  | "switch"
  | "small-switch"
  | "skip-gradient"
  | "natural"
  | "matching"
  | "squash"
  | "grey-friends"
  | "dotting"
  | "skip-shade"
  | "threedom"
  | "highlight"
  | "neighbor"
  | "discreet"
  | "dust"
  | "collective"
  | "friend"
  | "pin"
  | "shades"
  | "random-shades";

export type ColorSource = "primary" | "secondary" | "accent";
export type BackgroundTint = "subtle" | "soft" | "visible";
export type TextTint = "subtle" | "soft";
export type ContrastLevel = "soft" | "normal" | "high";
export type FoundationTemperature = "cool" | "neutral" | "warm";

export type ColorGenerationRule =
  | { mode: "same"; chromaRatio: number; lightness?: number }
  | { mode: "rotate"; degrees: number; chromaRatio: number; lightness?: number }
  | { mode: "fixed"; hue: number; chroma: number; lightness?: number };

export type FoundationRecipe = {
  backgroundSource: ColorSource;
  textSource: ColorSource;
  borderSource?: ColorSource;
  backgroundTint: BackgroundTint;
  textTint: TextTint;
  contrast: ContrastLevel;
  temperature?: FoundationTemperature;
};

export type PaletteRecipe = {
  secondary: ColorGenerationRule;
  accent: ColorGenerationRule;
  foundation: FoundationRecipe;
  primaryChromaRatio?: number;
};

const primaryFoundation = (
  tint: BackgroundTint,
  contrast: ContrastLevel,
  temperature: FoundationTemperature = "neutral",
): FoundationRecipe => ({
  backgroundSource: "primary",
  textSource: "primary",
  borderSource: "primary",
  backgroundTint: tint,
  textTint: contrast === "soft" ? "soft" : "subtle",
  contrast,
  temperature,
});

const secondaryFoundation = (
  tint: BackgroundTint,
  contrast: ContrastLevel,
  temperature: FoundationTemperature = "neutral",
): FoundationRecipe => ({
  backgroundSource: "secondary",
  textSource: "secondary",
  borderSource: "secondary",
  backgroundTint: tint,
  textTint: "soft",
  contrast,
  temperature,
});

const splitFoundation = (
  tint: BackgroundTint,
  contrast: ContrastLevel,
): FoundationRecipe => ({
  backgroundSource: "primary",
  textSource: "secondary",
  borderSource: "primary",
  backgroundTint: tint,
  textTint: "subtle",
  contrast,
  temperature: "neutral",
});

export const PALETTE_RECIPES: Record<SpacePaletteId, PaletteRecipe> = {
  "generic-gradient": {
    secondary: { mode: "same", chromaRatio: 0.45 },
    accent: { mode: "same", chromaRatio: 1, lightness: 0.48 },
    foundation: primaryFoundation("soft", "normal", "cool"),
  },
  "matching-gradient": {
    secondary: { mode: "rotate", degrees: 25, chromaRatio: 0.7 },
    accent: { mode: "rotate", degrees: -25, chromaRatio: 0.9 },
    foundation: primaryFoundation("soft", "soft"),
  },
  spot: {
    secondary: { mode: "fixed", hue: 70, chroma: 0.02, lightness: 0.55 },
    accent: { mode: "same", chromaRatio: 0.9, lightness: 0.42 },
    foundation: { ...primaryFoundation("soft", "normal", "warm"), textTint: "soft" },
  },
  "twisted-spot": {
    secondary: { mode: "rotate", degrees: 70, chromaRatio: 0.7 },
    accent: { mode: "rotate", degrees: -135, chromaRatio: 0.95 },
    foundation: splitFoundation("subtle", "normal"),
  },
  classy: {
    secondary: { mode: "fixed", hue: 264, chroma: 0.07, lightness: 0.32 },
    accent: { mode: "fixed", hue: 12, chroma: 0.12, lightness: 0.42 },
    foundation: { ...secondaryFoundation("soft", "normal", "cool"), temperature: "cool" },
  },
  cube: {
    secondary: { mode: "same", chromaRatio: 0.28, lightness: 0.82 },
    accent: { mode: "rotate", degrees: 180, chromaRatio: 1.1 },
    foundation: primaryFoundation("subtle", "high"),
  },
  switch: {
    secondary: { mode: "fixed", hue: 305, chroma: 0.1, lightness: 0.68 },
    accent: { mode: "rotate", degrees: 180, chromaRatio: 1 },
    foundation: secondaryFoundation("soft", "normal", "cool"),
  },
  "small-switch": {
    secondary: { mode: "fixed", hue: 232, chroma: 0.055, lightness: 0.72 },
    accent: { mode: "fixed", hue: 220, chroma: 0.1, lightness: 0.58 },
    foundation: secondaryFoundation("soft", "normal", "cool"),
  },
  "skip-gradient": {
    secondary: { mode: "rotate", degrees: 180, chromaRatio: 0.45 },
    accent: { mode: "rotate", degrees: 180, chromaRatio: 1 },
    foundation: splitFoundation("soft", "normal"),
  },
  natural: {
    secondary: { mode: "fixed", hue: 52, chroma: 0.07, lightness: 0.62 },
    accent: { mode: "fixed", hue: 38, chroma: 0.13, lightness: 0.55 },
    foundation: secondaryFoundation("soft", "soft", "warm"),
  },
  matching: {
    secondary: { mode: "fixed", hue: 135, chroma: 0.07, lightness: 0.58 },
    accent: { mode: "fixed", hue: 110, chroma: 0.11, lightness: 0.48 },
    foundation: secondaryFoundation("soft", "soft", "warm"),
  },
  squash: {
    secondary: { mode: "rotate", degrees: 180, chromaRatio: 0.7 },
    accent: { mode: "rotate", degrees: 180, chromaRatio: 1 },
    foundation: splitFoundation("soft", "normal"),
  },
  "grey-friends": {
    secondary: { mode: "fixed", hue: 270, chroma: 0.018, lightness: 0.3 },
    accent: { mode: "same", chromaRatio: 1 },
    foundation: secondaryFoundation("subtle", "normal"),
  },
  dotting: {
    secondary: { mode: "fixed", hue: 70, chroma: 0.02, lightness: 0.56 },
    accent: { mode: "fixed", hue: 25, chroma: 0.16, lightness: 0.65 },
    foundation: primaryFoundation("subtle", "normal"),
  },
  "skip-shade": {
    secondary: { mode: "fixed", hue: 220, chroma: 0.05, lightness: 0.74 },
    accent: { mode: "fixed", hue: 220, chroma: 0.1, lightness: 0.58 },
    foundation: secondaryFoundation("soft", "normal", "cool"),
  },
  threedom: {
    secondary: { mode: "rotate", degrees: 120, chromaRatio: 0.85 },
    accent: { mode: "rotate", degrees: 240, chromaRatio: 0.9 },
    foundation: splitFoundation("subtle", "normal"),
  },
  highlight: {
    secondary: { mode: "fixed", hue: 264, chroma: 0.04, lightness: 0.18 },
    accent: { mode: "fixed", hue: 108, chroma: 0.19, lightness: 0.88 },
    foundation: { ...secondaryFoundation("subtle", "high"), backgroundTint: "subtle" },
  },
  neighbor: {
    secondary: { mode: "rotate", degrees: 20, chromaRatio: 0.75 },
    accent: { mode: "rotate", degrees: -20, chromaRatio: 0.9 },
    foundation: primaryFoundation("soft", "soft"),
  },
  discreet: {
    primaryChromaRatio: 0.55,
    secondary: { mode: "same", chromaRatio: 0.3 },
    accent: { mode: "same", chromaRatio: 0.6 },
    foundation: primaryFoundation("subtle", "soft"),
  },
  dust: {
    secondary: { mode: "fixed", hue: 78, chroma: 0.08, lightness: 0.62 },
    accent: { mode: "fixed", hue: 68, chroma: 0.12, lightness: 0.48 },
    foundation: secondaryFoundation("soft", "soft", "warm"),
  },
  collective: {
    secondary: { mode: "rotate", degrees: 150, chromaRatio: 0.8 },
    accent: { mode: "rotate", degrees: -150, chromaRatio: 0.9 },
    foundation: splitFoundation("subtle", "normal"),
  },
  friend: {
    secondary: { mode: "fixed", hue: 142, chroma: 0.08, lightness: 0.42 },
    accent: { mode: "fixed", hue: 55, chroma: 0.06, lightness: 0.38 },
    foundation: secondaryFoundation("soft", "soft", "warm"),
  },
  pin: {
    secondary: { mode: "fixed", hue: 270, chroma: 0.018, lightness: 0.3 },
    accent: { mode: "fixed", hue: 88, chroma: 0.14, lightness: 0.72 },
    foundation: secondaryFoundation("subtle", "normal", "warm"),
  },
  shades: {
    secondary: { mode: "same", chromaRatio: 0.55, lightness: 0.82 },
    accent: { mode: "same", chromaRatio: 0.85, lightness: 0.42 },
    foundation: primaryFoundation("visible", "normal"),
  },
  "random-shades": {
    secondary: { mode: "rotate", degrees: 65, chromaRatio: 0.8 },
    accent: { mode: "rotate", degrees: 155, chromaRatio: 0.9 },
    foundation: primaryFoundation("subtle", "normal"),
  },
};
