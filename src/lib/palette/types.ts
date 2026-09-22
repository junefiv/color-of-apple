export type PaletteConceptId =
  | "balance"
  | "monochrome"
  | "tonal"
  | "neighbor"
  | "analogous-flow"
  | "complement"
  | "split-complement"
  | "triad"
  | "square"
  | "highlight"
  | "vivid-pop"
  | "playful"
  | "soft-pastel"
  | "dusty"
  | "natural"
  | "fresh-air"
  | "clean"
  | "minimal-gray"
  | "warm-neutral"
  | "cool-neutral"
  | "classy"
  | "editorial";

export type PaletteGroup = "harmony" | "expressive" | "soft-natural" | "professional";
export type PaletteTag = "calm" | "vivid" | "contrast";
export type SurfaceProfile = "crisp" | "soft" | "tinted" | "paper";
export type ContrastProfile = "soft" | "normal" | "strong";
export type ColorStrength = "low" | "medium" | "high";
export type ThemeMode = "light" | "dark";

export type ColorRule =
  | { kind: "rotate"; degrees: number; chromaRatio: number; lightness?: number; chromaCap?: number }
  | { kind: "same"; chromaRatio: number; lightness?: number; lightnessDelta?: number }
  | { kind: "mix-neutral"; primaryRatio: number }
  | { kind: "dark-tone"; chromaRatio?: number; lightnessDelta?: number }
  | { kind: "darken-low-chroma"; chromaRatio: number; lightnessDelta?: number }
  | { kind: "mix-charcoal" }
  | { kind: "towards"; hue: number; amount: number; chromaRatio?: number; lightness?: number };

export type NeutralHueRule =
  | { kind: "primary" }
  | { kind: "mid-ps" }
  | { kind: "mean-psa" }
  | { kind: "achromatic" }
  | { kind: "fixed"; hue: number };

export type PalettePreset = {
  secondaryRule: ColorRule;
  accentRule: ColorRule;
  neutralHue: NeutralHueRule;
  neutralChroma: number;
  surfaceProfile: SurfaceProfile;
  contrastProfile: ContrastProfile;
  colorStrength: ColorStrength;
  semanticIntensity: number;
};

export type PaletteConcept = {
  id: PaletteConceptId;
  group: PaletteGroup;
  name: string;
  impression: { ko: string; en: string };
  tags: PaletteTag[];
  preset: PalettePreset;
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

export type GeneratedPalette = {
  id: PaletteConceptId;
  tokens: PaletteTokens;
  accessible: boolean;
  corrected: boolean;
};
