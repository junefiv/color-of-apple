import { validTexts, type Texts } from "./component-texts";
import { int, listOf, oneOf, record, text } from "./config-check";
import { headerIcons, type HeaderIcon } from "./header-config";
import { validImageData } from "./image-data";
import type { SectionSurface } from "./section-surface";

// CTA sections from the survey (§6): a one-line banner, a colored band, an image-backed call,
// contact cards, or a countdown before a deadline.
export type CtaContact = { label: string; value: string; icon: HeaderIcon };
export type CtaConfig = {
  texts?: Texts;
  layout: "inline" | "center" | "split" | "cards";
  surface: Exclude<SectionSurface, "transparent">;
  accent: "primary" | "secondary" | "accent";
  image: string;
  eyebrow: string;
  title: string;
  text: string;
  primary: string;
  secondary: string;
  buttonRadius: number;
  contacts: CtaContact[];
  countdown: boolean;
  countdownLabel: string;
  boxed: boolean;
};

export function defaultCta(): CtaConfig {
  return { layout: "center", surface: "primary", accent: "primary", image: "", eyebrow: "GET STARTED", title: "지금 바로 시작해 보세요", text: "궁금한 점은 언제든 편하게 물어보세요.", primary: "문의하기", secondary: "",
    buttonRadius: 40, contacts: [{ label: "전화 상담", value: "02-000-0000", icon: "phone" }, { label: "이메일", value: "hello@brand.kr", icon: "book" }, { label: "오시는 길", value: "서울 중구 세종대로 00", icon: "map" }, { label: "운영 시간", value: "평일 10:00 – 19:00", icon: "calendar" }],
    countdown: false, countdownLabel: "모집 마감까지", boxed: false };
}

export type CtaPreset = { key: string; name: string; note: string; config: Partial<CtaConfig> };
export const ctaPresets: CtaPreset[] = [
  { key: "band", name: "컬러 밴드", note: "Primary 배경 · 가운데 카피 · 버튼", config: { layout: "center", surface: "primary", image: "", countdown: false, boxed: false } },
  { key: "banner", name: "배너 띠", note: "한 줄 · 왼쪽 글 · 오른쪽 버튼", config: { layout: "inline", surface: "subtle", countdown: false, boxed: false } },
  { key: "boxed", name: "둥근 카드", note: "컨테이너 안 둥근 박스", config: { layout: "inline", surface: "inverse", countdown: false, boxed: true } },
  { key: "image", name: "이미지 배경", note: "사진 위 어둡게 · 큰 카피", config: { layout: "center", surface: "inverse", countdown: false, boxed: false } },
  { key: "contacts", name: "연락 카드", note: "제목 + 연락 수단 4칸", config: { layout: "cards", surface: "subtle", countdown: false, boxed: false } },
  { key: "countdown", name: "마감 카운트다운", note: "남은 시간 + 지원 버튼", config: { layout: "center", surface: "inverse", countdown: true, boxed: false } },
  { key: "split", name: "좌우 분할", note: "왼쪽 카피 · 오른쪽 이미지", config: { layout: "split", surface: "surface", countdown: false, boxed: false } },
];
export function applyCtaPreset(config: CtaConfig, preset: CtaPreset): CtaConfig {
  const { eyebrow, title, text: body, primary, secondary, contacts, image, accent, buttonRadius, countdownLabel } = config;
  return { ...defaultCta(), ...preset.config, eyebrow, title, text: body, primary, secondary, contacts, image, accent, buttonRadius, countdownLabel, texts: config.texts };
}
export const withCtaDefaults = (config: Partial<CtaConfig> | undefined): CtaConfig => ({ ...defaultCta(), ...config });

export function validCtaConfig(value: unknown): value is CtaConfig {
  if (!record(value)) return false;
  const v = value;
  const contact = (c: unknown) => record(c) && text(c.label, 30) && text(c.value, 60) && oneOf(c.icon, ["", ...headerIcons]);
  if (!validTexts(v.texts)) return false;
  return oneOf(v.layout, ["inline", "center", "split", "cards"]) && oneOf(v.surface, ["surface", "subtle", "primary", "secondary", "inverse"]) && oneOf(v.accent, ["primary", "secondary", "accent"])
    && validImageData(v.image) && text(v.eyebrow, 40) && text(v.title, 80) && text(v.text, 200) && text(v.primary, 24) && text(v.secondary, 24) && int(v.buttonRadius, 0, 40)
    && listOf(v.contacts, 6, contact) && typeof v.countdown === "boolean" && text(v.countdownLabel, 30) && (v.padding === undefined || int(v.padding, 0, 240)) && (v.size === undefined || oneOf(v.size, ["compact", "regular", "large"])) && typeof v.boxed === "boolean";
}
