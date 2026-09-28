export const ENGINE_VERSION = "1.0.0";

export type Mood =
  | "balanced"
  | "vivid"
  | "soft"
  | "calm"
  | "bright"
  | "highContrast";

export type NeutralStyle = "pure" | "warm" | "cool" | "tinted";
export type SecondaryMode =
  | "monochrome"
  | "analogous"
  | "split"
  | "complementary";
export type ThemeMode = "light" | "dark";
export type PreviewTarget = "web" | "app" | "both";
export type AccessibilityTarget = "AA" | "AAA";

export type GenerateInput = {
  hex: string;
  mood: Mood;
  neutralStyle: NeutralStyle;
  secondaryMode: SecondaryMode;
  modes: ThemeMode[];
  accessibilityTarget: AccessibilityTarget;
  includeAccent: boolean;
  previewTarget: PreviewTarget;
};

export type OklchColor = {
  mode: "oklch";
  l: number;
  c: number;
  h: number;
};

export type PrimaryStep = 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950;
export type NeutralStep =
  | 0
  | 50
  | 100
  | 200
  | 300
  | 400
  | 500
  | 600
  | 700
  | 800
  | 850
  | 900
  | 950
  | 1000;

export type ColorScale<Step extends number> = Record<Step, string>;

export type StatusName = "success" | "warning" | "danger" | "info";

export type PrimitiveScales = {
  primary: ColorScale<PrimaryStep>;
  secondary: ColorScale<PrimaryStep>;
  accent: ColorScale<PrimaryStep>;
  neutral: ColorScale<NeutralStep>;
  success: ColorScale<PrimaryStep>;
  warning: ColorScale<PrimaryStep>;
  danger: ColorScale<PrimaryStep>;
  info: ColorScale<PrimaryStep>;
};

export type SemanticTokens = {
  background: {
    canvas: string;
    subtle: string;
    inverse: string;
    brand: string;
  };
  surface: {
    default: string;
    subtle: string;
    raised: string;
    sunken: string;
    overlay: string;
    inverse: string;
  };
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    disabled: string;
    inverse: string;
    brand: string;
    link: string;
    danger: string;
    success: string;
    warning: string;
  };
  border: {
    subtle: string;
    default: string;
    strong: string;
    focus: string;
    disabled: string;
    danger: string;
  };
  primary: {
    default: string;
    hover: string;
    pressed: string;
    selected: string;
    subtle: string;
    border: string;
    text: string;
    onPrimary: string;
  };
  secondary: {
    default: string;
    hover: string;
    pressed: string;
    selected: string;
    subtle: string;
    border: string;
    text: string;
    onSecondary: string;
  };
  accent: {
    default: string;
    hover: string;
    pressed: string;
    selected: string;
    subtle: string;
    border: string;
    text: string;
    onAccent: string;
  };
  success: {
    surface: string;
    border: string;
    text: string;
    default: string;
    hover: string;
    onSuccess: string;
  };
  warning: {
    surface: string;
    border: string;
    text: string;
    default: string;
    hover: string;
    onWarning: string;
  };
  danger: {
    surface: string;
    border: string;
    text: string;
    default: string;
    hover: string;
    pressed: string;
    onDanger: string;
  };
  info: {
    surface: string;
    border: string;
    text: string;
    default: string;
    onInfo: string;
  };
  interaction: {
    hover: string;
    pressed: string;
    selected: string;
    focusRing: string;
    disabledBackground: string;
    disabledForeground: string;
    selection: string;
    primaryHover: string;
    primaryPressed: string;
    primarySelected: string;
    secondaryHover: string;
    secondaryPressed: string;
    neutralHover: string;
    neutralPressed: string;
    disabledSurface: string;
    disabledBorder: string;
  };
  overlay: {
    scrim: string;
    hover: string;
    pressed: string;
  };
  shadow: {
    subtle: string;
    default: string;
    strong: string;
  };
  chart: Record<string, string>;
};

export type ContrastPairResult = {
  foreground: string;
  background: string;
  ratio: number;
  minimum: number;
  passed: boolean;
  autoFixed: boolean;
};

export type AccessibilityReport = {
  target: AccessibilityTarget;
  pairs: ContrastPairResult[];
  failCount: number;
};

export type ColorSystemResult = {
  source: string;
  primitive: PrimitiveScales;
  derived: {
    light: import("@/lib/palette-semantic-tokens").PaletteTokens;
    dark: import("@/lib/palette-semantic-tokens").PaletteTokens;
  };
  semantic: {
    light: SemanticTokens;
    dark: SemanticTokens;
  };
  accessibility: {
    light: AccessibilityReport;
    dark: AccessibilityReport;
  };
  meta: {
    engineVersion: string;
    anchorStep: PrimaryStep;
    sourceHex: string;
    coreTokenCount: number;
  };
};

export const DEFAULT_INPUT: GenerateInput = {
  hex: "#FF6B35",
  mood: "balanced",
  neutralStyle: "tinted",
  secondaryMode: "analogous",
  modes: ["light", "dark"],
  accessibilityTarget: "AA",
  includeAccent: true,
  previewTarget: "both",
};
