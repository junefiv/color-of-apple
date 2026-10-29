import { int, listOf, oneOf, record, text } from "./config-check";
import { headerIcons, type HeaderIcon } from "./header-config";
import { validImageData } from "./image-data";
import type { SectionSurface } from "./section-surface";

// The most common body section in the survey (§3): a heading block over cards that run as a grid,
// slider, list, board, stats or offset grid, with the mobile change (stack / two / swipe) chosen apart.
export type CardItem = { title: string; text: string; tag: string; value: string; icon: HeaderIcon; image: string };
export type CardsConfig = {
  eyebrow: string;
  title: string;
  desc: string;
  more: string;
  headAlign: "start" | "center" | "split";
  variant: "grid" | "slider" | "list" | "board" | "stats" | "stagger";
  columns: number;
  mobileMode: "stack" | "two" | "swipe";
  media: "top" | "left" | "background" | "icon" | "none";
  ratio: "1:1" | "4:3" | "3:4" | "16:9";
  card: "none" | "surface" | "subtle" | "outline" | "inverse";
  radius: number;
  hover: "none" | "lift" | "zoom";
  meta: boolean;
  nav: "arrows" | "dots" | "both";
  surface: Exclude<SectionSurface, "transparent">;
  accent: "primary" | "secondary" | "accent";
  gap: number;
  items: CardItem[];
};

const sample = ["브랜드 스토리", "새 컬렉션", "함께하는 사람들", "오프라인 공간", "지속가능성", "멤버십 혜택", "커뮤니티", "파트너십"];
const sampleValues = ["120+", "98%", "24h", "1.2M", "15년", "4.9", "30곳", "7개국"];
const sampleIcons: HeaderIcon[] = ["sparkles", "gift", "users", "building", "leaf", "heart", "star", "shield"];
export const cardItem = (i: number): CardItem => ({ title: sample[i % sample.length], text: "한두 줄로 이 카드의 내용을 소개해요.", tag: i % 2 ? "소식" : "이야기", value: sampleValues[i % sampleValues.length], icon: sampleIcons[i % sampleIcons.length], image: "" });

export function defaultCards(): CardsConfig {
  return { eyebrow: "WHAT WE DO", title: "우리가 하는 일", desc: "섹션을 한 문장으로 소개해 주세요.", more: "전체 보기", headAlign: "split", variant: "grid", columns: 3, mobileMode: "stack",
    media: "top", ratio: "4:3", card: "none", radius: 16, hover: "lift", meta: true, nav: "arrows", surface: "surface", accent: "primary", gap: 24, items: Array.from({ length: 6 }, (_, i) => cardItem(i)) };
}

export type CardsPreset = { key: string; name: string; note: string; config: Partial<CardsConfig> };
export const cardsPresets: CardsPreset[] = [
  { key: "grid", name: "기본 그리드", note: "3열 · 이미지 위 · 모바일 1열", config: { variant: "grid", columns: 3, media: "top", ratio: "4:3", card: "none", mobileMode: "stack", headAlign: "split" } },
  { key: "slider", name: "슬라이더", note: "4장 + 다음 카드 살짝 · 스와이프", config: { variant: "slider", columns: 4, media: "top", ratio: "3:4", card: "none", mobileMode: "swipe", nav: "both", headAlign: "split" } },
  { key: "features", name: "아이콘 특징", note: "아이콘 · 제목 · 설명 4열", config: { variant: "grid", columns: 4, media: "icon", card: "subtle", meta: false, mobileMode: "two", headAlign: "center" } },
  { key: "list", name: "가로 리스트", note: "왼쪽 썸네일 · 오른쪽 글", config: { variant: "list", columns: 1, media: "left", ratio: "4:3", card: "none", mobileMode: "stack", headAlign: "start" } },
  { key: "board", name: "공지 게시판", note: "날짜 · 제목 줄 목록", config: { variant: "board", columns: 1, media: "none", meta: true, mobileMode: "stack", headAlign: "split", eyebrow: "NOTICE", title: "공지사항" } },
  { key: "stats", name: "숫자 통계", note: "큰 숫자 4개 · 모바일 2열", config: { variant: "stats", columns: 4, media: "none", card: "none", mobileMode: "two", headAlign: "center", surface: "inverse" } },
  { key: "stagger", name: "오프셋 포트폴리오", note: "세로 카드 · 가운데 열 내림", config: { variant: "stagger", columns: 3, media: "top", ratio: "3:4", card: "none", mobileMode: "stack", headAlign: "start" } },
  { key: "overlay", name: "이미지 위 글", note: "사진 배경 카드 · 글 겹침", config: { variant: "grid", columns: 3, media: "background", ratio: "3:4", card: "none", mobileMode: "swipe", headAlign: "split" } },
];
export function applyCardsPreset(config: CardsConfig, preset: CardsPreset): CardsConfig {
  // Presets reshape the layout but keep the user's cards and heading copy (unless the preset names its own).
  const { eyebrow, title, desc, more, items, accent } = config;
  return { ...defaultCards(), eyebrow, title, desc, more, accent, ...preset.config, items };
}
export const withCardsDefaults = (config: Partial<CardsConfig> | undefined): CardsConfig => ({ ...defaultCards(), ...config });

function validItem(value: unknown): boolean {
  if (!record(value)) return false;
  return text(value.title, 60) && text(value.text, 160) && text(value.tag, 20) && text(value.value, 16) && oneOf(value.icon, ["", ...headerIcons]) && validImageData(value.image);
}
export function validCardsConfig(value: unknown): value is CardsConfig {
  if (!record(value)) return false;
  const v = value;
  return text(v.eyebrow, 40) && text(v.title, 80) && text(v.desc, 200) && text(v.more, 24) && oneOf(v.headAlign, ["start", "center", "split"])
    && oneOf(v.variant, ["grid", "slider", "list", "board", "stats", "stagger"]) && int(v.columns, 1, 6) && oneOf(v.mobileMode, ["stack", "two", "swipe"])
    && oneOf(v.media, ["top", "left", "background", "icon", "none"]) && oneOf(v.ratio, ["1:1", "4:3", "3:4", "16:9"]) && oneOf(v.card, ["none", "surface", "subtle", "outline", "inverse"])
    && int(v.radius, 0, 40) && oneOf(v.hover, ["none", "lift", "zoom"]) && typeof v.meta === "boolean" && oneOf(v.nav, ["arrows", "dots", "both"])
    && oneOf(v.surface, ["surface", "subtle", "primary", "secondary", "inverse"]) && oneOf(v.accent, ["primary", "secondary", "accent"]) && int(v.gap, 0, 120) && (v.padding === undefined || int(v.padding, 0, 240))
    && listOf(v.items, 12, validItem, 1);
}
