import {
  chooseOnColor,
  clamp,
  contrastRatio,
  hueDistance,
  parseToOklch,
  preserveSourceHex,
  rotateHue,
  toHex,
} from "./color-utils";
import type { OklchColor } from "./types";

export type Harmony =
  | "monochrome"
  | "analogous"
  | "complementary"
  | "splitComplementary"
  | "triadic";

export type PaletteMood = "clean" | "soft" | "vivid" | "muted" | "highContrast";
export type HueDirection = 1 | -1;
export type BackgroundTint = "brand" | "warm" | "cool" | "neutral" | "complement";

export type PaletteRecipe = {
  harmony: Harmony;
  mood: PaletteMood;
  hueDirection: HueDirection;
  backgroundTint: BackgroundTint;
};

export type CorePalette = {
  textPrimary: string;
  background: string;
  primary: string;
  primaryAction: string;
  onPrimary: string;
  secondary: string;
  onSecondary: string;
  accent: string;
  onAccent: string;
  surface: string;
};

type MoodProfile = {
  backgroundChroma: number;
  backgroundLightness: number;
  surfaceLightness: number;
  textLightness: number;
  secondaryChromaRatio: number;
  accentChromaRatio: number;
};

const MOOD_PROFILES: Record<PaletteMood, MoodProfile> = {
  clean: {
    backgroundChroma: 0.006,
    backgroundLightness: 0.985,
    surfaceLightness: 0.955,
    textLightness: 0.2,
    secondaryChromaRatio: 0.65,
    accentChromaRatio: 1,
  },
  soft: {
    backgroundChroma: 0.018,
    backgroundLightness: 0.982,
    surfaceLightness: 0.948,
    textLightness: 0.2,
    secondaryChromaRatio: 0.45,
    accentChromaRatio: 0.7,
  },
  vivid: {
    backgroundChroma: 0.004,
    backgroundLightness: 0.988,
    surfaceLightness: 0.958,
    textLightness: 0.18,
    secondaryChromaRatio: 0.85,
    accentChromaRatio: 1.2,
  },
  muted: {
    backgroundChroma: 0.015,
    backgroundLightness: 0.978,
    surfaceLightness: 0.942,
    textLightness: 0.2,
    secondaryChromaRatio: 0.4,
    accentChromaRatio: 0.55,
  },
  highContrast: {
    backgroundChroma: 0.003,
    backgroundLightness: 0.99,
    surfaceLightness: 0.94,
    textLightness: 0.14,
    secondaryChromaRatio: 0.75,
    accentChromaRatio: 1.15,
  },
};

const WARM_HUE = 80;
const COOL_HUE = 240;

function oklch(l: number, c: number, h: number): OklchColor {
  return { mode: "oklch", l, c, h };
}

export function createHarmonyHues(hue: number, harmony: Harmony, direction: HueDirection) {
  const dir = direction;
  switch (harmony) {
    case "monochrome":
      return { secondary: hue, accent: hue };
    case "analogous":
      return { secondary: rotateHue(hue, 30 * dir), accent: rotateHue(hue, -35 * dir) };
    case "complementary":
      return { secondary: rotateHue(hue, 180), accent: rotateHue(hue, 30 * dir) };
    case "splitComplementary":
      return { secondary: rotateHue(hue, 150 * dir), accent: rotateHue(hue, 210 * dir) };
    case "triadic":
      return { secondary: rotateHue(hue, 120 * dir), accent: rotateHue(hue, 240 * dir) };
  }
}

function backgroundHue(primaryHue: number, tint: BackgroundTint) {
  switch (tint) {
    case "brand":
      return primaryHue;
    case "warm":
      return WARM_HUE;
    case "cool":
      return COOL_HUE;
    case "neutral":
      return primaryHue;
    case "complement":
      return rotateHue(primaryHue, 180);
  }
}

function backgroundChroma(profile: MoodProfile, tint: BackgroundTint) {
  if (tint === "neutral") return clamp(Math.min(profile.backgroundChroma, 0.004), 0.003, 0.02);
  if (tint === "complement") return clamp(Math.min(profile.backgroundChroma, 0.01), 0.003, 0.02);
  return clamp(profile.backgroundChroma, 0.003, 0.02);
}

function createBackground(primary: OklchColor, recipe: PaletteRecipe) {
  const profile = MOOD_PROFILES[recipe.mood];
  return oklch(
    profile.backgroundLightness,
    backgroundChroma(profile, recipe.backgroundTint),
    backgroundHue(primary.h, recipe.backgroundTint),
  );
}

function createSurface(background: OklchColor, recipe: PaletteRecipe) {
  const profile = MOOD_PROFILES[recipe.mood];
  return oklch(
    profile.surfaceLightness,
    Math.min(background.c * 1.3, 0.025),
    background.h,
  );
}

function pushContrast(color: OklchColor, against: string, minimum: number, towardDark: boolean) {
  const next = { ...color };
  let hex = toHex(next);
  for (let i = 0; i < 48 && contrastRatio(hex, against) < minimum; i += 1) {
    next.l = clamp(next.l + (towardDark ? -0.015 : 0.015), 0.08, 0.97);
    hex = toHex(next);
  }
  return { color: next, hex };
}

function createTextColor(primary: OklchColor, background: string, surface: string, recipe: PaletteRecipe) {
  const profile = MOOD_PROFILES[recipe.mood];
  const paperL = parseToOklch(background).l;
  let color = oklch(
    profile.textLightness,
    Math.min(primary.c * 0.12, 0.025),
    primary.h,
  );
  const towardDark = paperL > 0.55;
  ({ color } = pushContrast(color, background, 4.5, towardDark));
  ({ color } = pushContrast(color, surface, 4.5, towardDark));
  const preferred = pushContrast(color, background, 7, towardDark);
  if (contrastRatio(preferred.hex, surface) >= 4.5) {
    return preferred.hex;
  }
  return toHex(color);
}

function pairFill(color: OklchColor, canvas: string) {
  const canvasL = parseToOklch(canvas).l;
  let fill = { ...color };
  let hex = toHex(fill);
  for (let i = 0; i < 40 && contrastRatio(hex, canvas) < 3; i += 1) {
    fill.l = clamp(fill.l + (canvasL > 0.55 ? -0.02 : 0.02), 0.16, 0.84);
    hex = toHex(fill);
  }
  let on = chooseOnColor(hex);
  for (let i = 0; i < 40 && contrastRatio(hex, on) < 4.5; i += 1) {
    fill.l = clamp(fill.l + (on === "#ffffff" ? -0.02 : 0.02), 0.14, 0.86);
    hex = toHex(fill);
    on = chooseOnColor(hex);
  }
  return { hex, on };
}

function createSecondary(primary: OklchColor, hue: number, recipe: PaletteRecipe) {
  const profile = MOOD_PROFILES[recipe.mood];
  const ratio =
    recipe.harmony === "complementary"
      ? Math.min(profile.secondaryChromaRatio, 0.55)
      : profile.secondaryChromaRatio;
  return oklch(
    clamp(primary.l + 0.08, 0.55, 0.75),
    clamp(primary.c * ratio, 0.06, 0.18),
    hue,
  );
}

function createAccent(primary: OklchColor, hue: number, recipe: PaletteRecipe) {
  const profile = MOOD_PROFILES[recipe.mood];
  let lightness = clamp(primary.l + 0.12, 0.58, 0.8);
  if (Math.abs(lightness - primary.l) < 0.12 && recipe.harmony === "monochrome") {
    lightness = clamp(primary.l - 0.12, 0.58, 0.8);
  }
  return oklch(lightness, clamp(primary.c * profile.accentChromaRatio, 0.12, 0.28), hue);
}

function isDistinct(a: OklchColor, b: OklchColor) {
  return (
    hueDistance(a.h, b.h) >= 30 ||
    Math.abs(a.l - b.l) >= 0.12 ||
    (Math.max(a.c, b.c) > 0 && Math.abs(a.c - b.c) / Math.max(a.c, b.c) >= 0.3)
  );
}

function keepSecondarySofter(secondary: OklchColor, primary: OklchColor) {
  const next = { ...secondary };
  if (next.c > primary.c) {
    next.c = Math.max(0.06, primary.c * 0.85);
  }
  if (next.l < primary.l - 0.04 && next.c >= primary.c * 0.9) {
    next.l = clamp(primary.l + 0.06, 0.55, 0.75);
  }
  return next;
}

function ensureAccentDistinct(accent: OklchColor, primary: OklchColor, secondary: OklchColor) {
  let next = { ...accent };
  if (!isDistinct(next, primary)) {
    next.h = rotateHue(next.h, 30);
    if (Math.abs(next.l - primary.l) < 0.12) {
      next.l = clamp(primary.l + (primary.l > 0.62 ? -0.14 : 0.14), 0.58, 0.8);
    }
  }
  if (hueDistance(next.h, secondary.h) < 12 && Math.abs(next.l - secondary.l) < 0.06) {
    next.h = rotateHue(next.h, 28);
    next.l = clamp(next.l + 0.08, 0.58, 0.8);
  }
  return next;
}

function ensureSurfaceGap(surface: OklchColor, background: OklchColor) {
  const next = { ...surface };
  if (Math.abs(next.l - background.l) < 0.02) {
    next.l = clamp(background.l - 0.03, 0.92, 0.97);
  }
  return next;
}

export function toDarkStructural(light: CorePalette) {
  const backgroundColor = parseToOklch(light.background);
  const textColor = parseToOklch(light.textPrimary);
  const background = toHex(oklch(0.145, Math.min(backgroundColor.c, 0.02), backgroundColor.h));
  const surface = toHex(
    oklch(0.195, Math.min(backgroundColor.c * 1.3, 0.028), backgroundColor.h),
  );
  const textPrimary = toHex(oklch(0.93, Math.min(textColor.c, 0.025), textColor.h));
  return { background, surface, textPrimary };
}

export function generateCorePalette(primaryHex: string, recipe: PaletteRecipe): CorePalette {
  const primary = parseToOklch(primaryHex);
  const hues = createHarmonyHues(primary.h, recipe.harmony, recipe.hueDirection);
  const background = createBackground(primary, recipe);
  const surface = ensureSurfaceGap(createSurface(background, recipe), background);
  const backgroundHex = toHex(background);
  const surfaceHex = toHex(surface);
  const textPrimary = createTextColor(primary, backgroundHex, surfaceHex, recipe);
  const action = pairFill(primary, backgroundHex);
  const secondary = keepSecondarySofter(createSecondary(primary, hues.secondary, recipe), primary);
  const accent = ensureAccentDistinct(
    createAccent(primary, hues.accent, recipe),
    primary,
    secondary,
  );
  const secondaryPair = pairFill(secondary, backgroundHex);
  const accentPair = pairFill(accent, backgroundHex);

  return {
    textPrimary,
    background: backgroundHex,
    primary: preserveSourceHex(primaryHex, primary),
    primaryAction: action.hex,
    onPrimary: action.on,
    secondary: secondaryPair.hex,
    onSecondary: secondaryPair.on,
    accent: accentPair.hex,
    onAccent: accentPair.on,
    surface: surfaceHex,
  };
}
