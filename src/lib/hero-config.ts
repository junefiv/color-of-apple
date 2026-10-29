import { validTexts, type Texts } from "./component-texts";
import { isLightSurface, surfaceColors, type SectionSurface } from "./section-surface";
import type { HeaderAccent } from "./header-config";
import { validImageData } from "./image-data";

// Hero options distilled from surveyed Korean award-site main visuals (docs/component-patterns.md):
// how copy sits against media, how tall the first screen is, and how slides are announced.
export type HeroLayout = "overlay" | "split" | "text" | "color" | "band";
// "custom" uses the px height set by dragging the hero's bottom edge in the preview.
export type HeroHeight = "screen" | "large" | "medium" | "band" | "custom";
export type HeroNav = "none" | "dots" | "fraction" | "thumbs" | "progress";
export type HeroSurface = Exclude<SectionSurface, "transparent">;
// "auto" keeps the contrast-safe pairing; the rest pin the button to a palette role.
export type HeroButtonColor = "auto" | "primary" | "secondary" | "accent" | "light" | "dark";
export type HeroConfig = {
  texts?: Texts;
  layout: HeroLayout;
  media: "image" | "video";
  height: HeroHeight;
  mobileHeight: HeroHeight;
  align: "start" | "center" | "end";
  scrim: "none" | "gradient" | "solid";
  surface: HeroSurface;
  accent: HeaderAccent;
  slides: number;
  nav: HeroNav;
  card: boolean;
  ticker: boolean;
  mediaFirst: boolean;
  eyebrow: string;
  title: string;
  body: string;
  primary: string;
  secondary: string;
  buttonRadius: number;
  buttonColor: HeroButtonColor;
  buttonStyle: "solid" | "outline";
  heightPx: number;
  mobileHeightPx: number;
  image: string;
  // cover fills the visual box and crops; contain keeps the whole image at its own ratio.
  imageFit: "cover" | "contain";
};

export function defaultHero(): HeroConfig {
  return { layout: "overlay", media: "image", height: "screen", mobileHeight: "large", align: "start", scrim: "gradient", surface: "surface", accent: "primary", slides: 1, nav: "none",
    card: false, ticker: false, mediaFirst: true, eyebrow: "NEW SEASON", title: "브랜드의 첫 화면을 여기에", body: "무엇을 하는 곳인지 한두 문장으로 알려 주세요.", primary: "자세히 보기", secondary: "",
    buttonRadius: 40, buttonColor: "auto", buttonStyle: "solid", image: "", imageFit: "cover", heightPx: 720, mobileHeightPx: 520 };
}

// Button design and images arrived after the first saved layouts, so older hero settings fill them in from the defaults.
const laterKeys = ["buttonRadius", "buttonColor", "buttonStyle", "image", "imageFit", "heightPx", "mobileHeightPx"] as const;
export function withHeroDefaults(config: Partial<HeroConfig> | undefined): HeroConfig {
  return { ...defaultHero(), ...config };
}

export type HeroPreset = { key: string; name: string; note: string; config: Partial<HeroConfig> };
export const heroPresets: HeroPreset[] = [
  { key: "video", name: "풀스크린 비디오", note: "화면 가득 영상 · 왼쪽 아래 카피", config: { layout: "overlay", media: "video", height: "screen", mobileHeight: "screen", align: "start", scrim: "gradient", slides: 1, nav: "none", card: false, ticker: false } },
  { key: "slider", name: "슬라이드 + 썸네일", note: "여러 장 · 썸네일로 넘김", config: { layout: "overlay", media: "image", height: "screen", mobileHeight: "large", align: "start", scrim: "gradient", slides: 4, nav: "thumbs", card: false, ticker: false } },
  { key: "notice", name: "공지 카드 얹기", note: "비주얼 위 오른쪽 아래 공지", config: { layout: "overlay", media: "video", height: "screen", mobileHeight: "large", align: "center", scrim: "solid", slides: 3, nav: "progress", card: true, ticker: false } },
  { key: "ticker", name: "티커 띠", note: "아래로 흐르는 키워드", config: { layout: "overlay", media: "image", height: "large", mobileHeight: "large", align: "center", scrim: "solid", slides: 1, nav: "none", card: false, ticker: true } },
  { key: "split", name: "좌우 분할", note: "카피와 버튼 · 이미지 반반", config: { layout: "split", height: "large", mobileHeight: "medium", align: "start", surface: "surface", slides: 1, nav: "none", card: false, ticker: false, mediaFirst: false } },
  { key: "text", name: "텍스트만", note: "이미지 없이 큰 헤드라인", config: { layout: "text", height: "medium", mobileHeight: "medium", align: "start", surface: "surface", slides: 1, nav: "none", card: false, ticker: false } },
  { key: "brand", name: "브랜드 컬러", note: "Primary 단색 전체 화면", config: { layout: "color", height: "screen", mobileHeight: "screen", align: "center", surface: "primary", slides: 1, nav: "none", card: false, ticker: false } },
  { key: "band", name: "띠 배너", note: "낮은 와이드 슬라이드", config: { layout: "band", media: "image", height: "band", mobileHeight: "band", align: "start", scrim: "gradient", slides: 5, nav: "fraction", card: false, ticker: false } },
];

export function applyHeroPreset(config: HeroConfig, preset: HeroPreset): HeroConfig {
  // Presets reshape structure and color, but keep the user's own copy, accent, button design and image.
  const { eyebrow, title, body, primary, secondary, accent, buttonRadius, buttonColor, buttonStyle, image, imageFit } = config;
  return { ...defaultHero(), ...preset.config, eyebrow, title, body, primary, secondary, accent, buttonRadius, buttonColor, buttonStyle, image, imageFit, texts: config.texts };
}

const ratios: Record<Exclude<HeroHeight, "band" | "custom">, number> = { screen: 1, large: .8, medium: .6 };
// Heights resolve against the artboard viewport so "screen" means one full first view on each device.
export function heroHeight(config: HeroConfig, mobile: boolean, viewport: number): number {
  const height = mobile ? config.mobileHeight : config.height;
  if (height === "band") return mobile ? 240 : 320;
  if (height === "custom") return mobile ? config.mobileHeightPx : config.heightPx;
  return Math.round(viewport * ratios[height]);
}

// Copy laid over media always reads as light-on-dark; the other layouts paint from their surface role.
export function heroColorVars(config: HeroConfig): Record<string, string> {
  const onMedia = config.layout === "overlay" || config.layout === "band";
  const [bg, fg, muted, line] = onMedia ? surfaceColors.transparent : surfaceColors[config.surface];
  const chosen = `var(--color-${config.accent}-default)`, chosenOn = `var(--color-${config.accent}-on,#fff)`;
  // Media and dark roles can't guarantee contrast with an arbitrary accent, so the button there
  // takes the copy color instead; the chosen accent drives buttons on light surfaces only.
  const light = !onMedia && isLightSurface(config.surface);
  const pinned: Record<Exclude<HeroButtonColor, "auto">, [string, string]> = {
    primary: ["var(--color-primary-default)", "var(--color-primary-on,#fff)"], secondary: ["var(--color-secondary-default)", "var(--color-secondary-on,#fff)"],
    accent: ["var(--color-accent-default)", "var(--color-accent-on,#fff)"], light: [surfaceColors.surface[0], surfaceColors.surface[1]], dark: [surfaceColors.inverse[0], surfaceColors.inverse[1]],
  };
  const [button, buttonOn] = config.buttonColor === "auto" ? [light ? chosen : fg, light ? chosenOn : onMedia ? "var(--color-text-primary,#303039)" : bg] : pinned[config.buttonColor];
  return { "--hr-bg": bg, "--hr-fg": fg, "--hr-muted": muted, "--hr-line": line, "--hr-accent": button, "--hr-accent-on": buttonOn, "--hr-accent-chosen": chosen, "--hr-radius": `${config.buttonRadius}px` };
}

const options: { [K in keyof HeroConfig]?: readonly string[] } = {
  layout: ["overlay", "split", "text", "color", "band"],
  media: ["image", "video"],
  height: ["screen", "large", "medium", "band", "custom"],
  mobileHeight: ["screen", "large", "medium", "band", "custom"],
  align: ["start", "center", "end"],
  scrim: ["none", "gradient", "solid"],
  surface: ["surface", "subtle", "primary", "secondary", "inverse"],
  accent: ["primary", "secondary", "accent"],
  nav: ["none", "dots", "fraction", "thumbs", "progress"],
  buttonColor: ["auto", "primary", "secondary", "accent", "light", "dark"],
  buttonStyle: ["solid", "outline"],
  imageFit: ["cover", "contain"],
};
const limits: [keyof HeroConfig, number][] = [["eyebrow", 40], ["title", 80], ["body", 200], ["primary", 24], ["secondary", 24]];
export function validHeroConfig(value: unknown): value is HeroConfig {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  const optional = (key: string) => (laterKeys as readonly string[]).includes(key) && v[key] === undefined;
  const enums = Object.entries(options).every(([key, allowed]) => optional(key) || allowed!.includes(v[key] as string));
  const px = (["heightPx", "mobileHeightPx"] as const).every(key => optional(key) || (Number.isInteger(v[key]) && (v[key] as number) >= 160 && (v[key] as number) <= 1440));
  const radius = optional("buttonRadius") || (Number.isInteger(v.buttonRadius) && (v.buttonRadius as number) >= 0 && (v.buttonRadius as number) <= 40);
  const flags = ["card", "ticker", "mediaFirst"].every(key => typeof v[key] === "boolean");
  const copy = limits.every(([key, max]) => typeof v[key] === "string" && (v[key] as string).length <= max);
  if (!validTexts(v.texts)) return false;
  return enums && flags && copy && radius && px && (optional("image") || validImageData(v.image)) && Number.isInteger(v.slides) && (v.slides as number) >= 1 && (v.slides as number) <= 6;
}
