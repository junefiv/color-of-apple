import { validTexts, type Texts } from "./component-texts";
import { validImageData } from "./image-data";
import { isLightSurface, sectionSurfaces, surfaceColors, type SectionSurface } from "./section-surface";

// Header options distilled from surveyed Korean award-site headers (gdweb.co.kr):
// where the logo sits, how depth-2 menus open, and which token role paints the bar.
export type HeaderArrangement = "menu-right" | "menu-center" | "menu-follow" | "logo-center" | "stacked" | "minimal";
// Frames a depth-2 menu opens in. mega/tabs/cards/side came from the second header survey pass.
export type HeaderSubmenu = "none" | "dropdown" | "bubble" | "panel" | "all" | "bar" | "mega" | "tabs" | "cards" | "side";
// What each depth-2 entry shows inside that frame.
export type HeaderSubStyle = "text" | "desc" | "thumb";
export type HeaderMotion = "none" | "fade" | "slide" | "reveal";
// Top bar, or a full-height navigation column beside the page.
export type HeaderPlacement = "top" | "left" | "right";
export const headerIcons = ["star", "sparkles", "heart", "shield", "leaf", "building", "users", "phone", "map", "calendar", "book", "gift"] as const;
export type HeaderIcon = typeof headerIcons[number] | "";
export type HeaderMobileMenu = "overlay" | "expand" | "drawer" | "split";
export type HeaderSurface = SectionSurface;
export type HeaderPanel = "surface" | "header" | "inverse";
export type HeaderAccent = "primary" | "secondary" | "accent";
export type HeaderActive = "text" | "underline" | "pill";
export type HeaderLogo = "wordmark" | "symbol" | "slot";
export type HeaderSubItem = { label: string; desc: string; icon: HeaderIcon; badge: string; image: string; items: string[] };
// Headers saved before rich depth-2 entries stored plain strings; withHeaderDefaults() upgrades them.
export type HeaderMenuItem = { label: string; children: HeaderSubItem[] };
export type HeaderConfig = {
  texts?: Texts;
  arrangement: HeaderArrangement;
  submenu: HeaderSubmenu;
  trigger: "hover" | "click";
  mobileMenu: HeaderMobileMenu;
  mobileLogo: "left" | "center";
  surface: HeaderSurface;
  panel: HeaderPanel;
  accent: HeaderAccent;
  active: HeaderActive;
  logo: HeaderLogo;
  logoText: string;
  // Image dropped into the logo slot; absent on headers saved before images existed.
  logoImage?: string;
  items: HeaderMenuItem[];
  topBar: boolean;
  search: boolean;
  language: boolean;
  login: boolean;
  cta: string;
  sitemap: boolean;
  divider: boolean;
  subStyle: HeaderSubStyle;
  motion: HeaderMotion;
  dim: boolean;
  placement: HeaderPlacement;
  promo: boolean;
  promoTitle: string;
  promoText: string;
  promoCta: string;
  promoImage: string;
};

export const subItem = (label: string, extra: Partial<HeaderSubItem> = {}): HeaderSubItem => ({ label, desc: "", icon: "", badge: "", image: "", items: [], ...extra });

export const headerItems: HeaderMenuItem[] = [
  { label: "회사소개", children: [subItem("인사말", { desc: "대표 메시지와 비전", icon: "users", items: ["CEO 메시지", "비전", "핵심 가치"] }), subItem("연혁", { desc: "걸어온 길", icon: "calendar", items: ["2020 –", "2010 – 2019"] }), subItem("오시는 길", { desc: "본사와 지점 안내", icon: "map", items: ["본사", "지점"] })] },
  { label: "사업영역", children: [subItem("브랜드", { desc: "우리가 만드는 브랜드", icon: "sparkles", badge: "NEW", items: ["라이프", "뷰티", "리빙"] }), subItem("플랫폼", { desc: "서비스와 기술", icon: "building", items: ["커머스", "멤버십"] }), subItem("파트너십", { desc: "함께하는 방법", icon: "heart", items: ["제휴 문의", "입점 안내"] })] },
  { label: "소식", children: [subItem("공지사항", { desc: "새로운 안내", icon: "book" }), subItem("보도자료", { desc: "언론 속 우리", icon: "star" })] },
  { label: "고객지원", children: [subItem("자주 묻는 질문", { desc: "빠르게 답을 찾아요", icon: "book" }), subItem("문의하기", { desc: "1:1로 물어보세요", icon: "phone" })] },
];
const cloneItems = (items: HeaderMenuItem[]) => items.map(item => ({ ...item, children: item.children.map(child => ({ ...child, items: [...child.items] })) }));

export function defaultHeader(mobileMenu: HeaderMobileMenu = "overlay"): HeaderConfig {
  return { arrangement: "menu-right", submenu: "dropdown", trigger: "hover", mobileMenu, mobileLogo: "left", surface: "surface", panel: "surface", accent: "primary", active: "text",
    logo: "wordmark", logoText: "Brand", items: cloneItems(headerItems), topBar: false, search: false, language: false, login: false, cta: "", sitemap: false, divider: true,
    subStyle: "text", motion: "fade", dim: false, placement: "top", promo: false, promoTitle: "이달의 이벤트", promoText: "새 시즌 혜택을 확인하세요", promoCta: "자세히 보기", promoImage: "" };
}

// Fills options added after the first saved headers and upgrades plain-string depth-2 entries.
export function withHeaderDefaults(config: Partial<HeaderConfig> & Pick<HeaderConfig, "items">, mobileMenu?: HeaderMobileMenu): HeaderConfig {
  const items = config.items.map(item => ({ label: item.label, children: (item.children as (HeaderSubItem | string)[]).map(child => typeof child === "string" ? subItem(child) : subItem(child.label, child)) }));
  return { ...defaultHeader(mobileMenu), ...config, items };
}

export type HeaderPreset = { key: string; name: string; note: string; config: Partial<HeaderConfig> };
export const headerPresets: HeaderPreset[] = [
  { key: "corporate", name: "기업형 메가메뉴", note: "로고 왼쪽 · 메뉴 오른쪽 · 하위 전체 펼침", config: { arrangement: "menu-right", submenu: "all", surface: "surface", panel: "surface", active: "underline", search: true, language: true, sitemap: true, mobileMenu: "split" } },
  { key: "hotel", name: "투명 오버레이", note: "히어로 위 투명 · 열리면 흰 패널", config: { arrangement: "menu-follow", submenu: "panel", surface: "transparent", panel: "surface", active: "text", topBar: true, cta: "예약하기", sitemap: false, mobileMenu: "drawer" } },
  { key: "minimal", name: "미니멀 브랜드", note: "로고 옆 메뉴 · 하위 없음", config: { arrangement: "menu-follow", submenu: "none", surface: "surface", active: "text", language: true, divider: false, mobileMenu: "overlay" } },
  { key: "festival", name: "2단 이벤트", note: "상단 유틸 바 · 가운데 메뉴 · 드롭다운", config: { arrangement: "menu-center", submenu: "dropdown", surface: "surface", panel: "inverse", active: "text", topBar: true, search: true, language: true, mobileMenu: "drawer" } },
  { key: "commerce", name: "가로 서브바", note: "하위 메뉴가 한 줄로 펼쳐짐", config: { arrangement: "menu-center", submenu: "bar", surface: "primary", panel: "surface", active: "pill", login: true, search: true, mobileMenu: "expand" } },
  { key: "center", name: "센터 로고", note: "메뉴 · 로고 · 버튼 3분할", config: { arrangement: "logo-center", submenu: "dropdown", surface: "surface", active: "underline", cta: "문의하기", mobileLogo: "center", mobileMenu: "overlay" } },
  { key: "stacked", name: "로고 위 메뉴 아래", note: "브랜드를 크게, 메뉴는 한 줄", config: { arrangement: "stacked", submenu: "dropdown", surface: "subtle", active: "underline", mobileLogo: "center", mobileMenu: "drawer" } },
  { key: "hamburger", name: "햄버거 전용", note: "로고와 메뉴 버튼만", config: { arrangement: "minimal", submenu: "none", surface: "inverse", panel: "header", active: "text", mobileMenu: "overlay" } },
  { key: "mega", name: "메가메뉴 + 프로모션", note: "하위 열과 3단 메뉴 · 오른쪽 이벤트 카드", config: { arrangement: "menu-center", submenu: "mega", subStyle: "text", surface: "surface", panel: "surface", active: "underline", promo: true, motion: "slide", dim: true, search: true, mobileMenu: "split" } },
  { key: "tabs", name: "패널 속 세로 탭", note: "하위를 고르면 오른쪽 내용이 바뀜", config: { arrangement: "menu-right", submenu: "tabs", subStyle: "desc", surface: "surface", panel: "surface", active: "text", promo: true, motion: "fade", dim: true, mobileMenu: "split" } },
  { key: "service", name: "아이콘 + 설명", note: "드롭다운 속 아이콘과 한 줄 설명", config: { arrangement: "menu-follow", submenu: "dropdown", subStyle: "desc", surface: "surface", panel: "surface", active: "pill", motion: "slide", dim: false, cta: "시작하기", mobileMenu: "drawer" } },
  { key: "cards", name: "썸네일 카드", note: "하위 항목이 사진 카드로", config: { arrangement: "menu-center", submenu: "cards", subStyle: "thumb", surface: "inverse", panel: "inverse", active: "text", motion: "reveal", dim: true, mobileMenu: "overlay" } },
  { key: "side", name: "왼쪽 사이드 내비", note: "페이지 옆 세로 메뉴 · 옆으로 펼침", config: { arrangement: "menu-right", submenu: "side", subStyle: "desc", placement: "left", surface: "subtle", panel: "surface", active: "pill", motion: "slide", dim: false, mobileMenu: "drawer" } },
];

export function applyHeaderPreset(config: HeaderConfig, preset: HeaderPreset): HeaderConfig {
  // Presets reshape structure and color, but keep the user's own logo, menu and promo copy, and
  // the placement the user dragged it into unless the preset is itself about placement.
  const { logo, logoText, logoImage, items, placement, promoTitle, promoText, promoCta, promoImage } = config;
  return { ...defaultHeader(), placement, ...preset.config, logo, logoText, logoImage, items, promoTitle, promoText, promoCta, promoImage, texts: config.texts };
}

const options: { [K in keyof HeaderConfig]?: readonly string[] } = {
  arrangement: ["menu-right", "menu-center", "menu-follow", "logo-center", "stacked", "minimal"],
  submenu: ["none", "dropdown", "bubble", "panel", "all", "bar", "mega", "tabs", "cards", "side"],
  subStyle: ["text", "desc", "thumb"],
  motion: ["none", "fade", "slide", "reveal"],
  placement: ["top", "left", "right"],
  trigger: ["hover", "click"],
  mobileMenu: ["overlay", "expand", "drawer", "split"],
  mobileLogo: ["left", "center"],
  surface: sectionSurfaces,
  panel: ["surface", "header", "inverse"],
  accent: ["primary", "secondary", "accent"],
  active: ["text", "underline", "pill"],
  logo: ["wordmark", "symbol", "slot"],
};
const text = (value: unknown, max: number) => typeof value === "string" && value.length <= max;
// Options added after the first saved headers may be absent; withHeaderDefaults() fills them.
const laterKeys = ["subStyle", "motion", "dim", "placement", "promo", "promoTitle", "promoText", "promoCta", "promoImage", "logoImage"];
function validSubItem(child: unknown): boolean {
  if (typeof child === "string") return child.length <= 40;
  if (!child || typeof child !== "object") return false;
  const c = child as Record<string, unknown>;
  return text(c.label, 40) && text(c.desc, 80) && text(c.badge, 12) && ["", ...headerIcons].includes(c.icon as string) && validImageData(c.image)
    && Array.isArray(c.items) && c.items.length <= 12 && c.items.every(item => text(item, 40));
}
export function validHeaderConfig(value: unknown): value is HeaderConfig {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  const later = (key: string) => laterKeys.includes(key) && v[key] === undefined;
  const enums = Object.entries(options).every(([key, allowed]) => later(key) || allowed!.includes(v[key] as string));
  const flags = ["topBar", "search", "language", "login", "sitemap", "divider", "dim", "promo"].every(key => later(key) || typeof v[key] === "boolean");
  const copy = ([["promoTitle", 40], ["promoText", 80], ["promoCta", 24]] as const).every(([key, max]) => later(key) || text(v[key], max));
  const images = ["logoImage", "promoImage"].every(key => later(key) || validImageData(v[key]));
  const items = Array.isArray(v.items) && v.items.length <= 8 && v.items.every(item => item && text(item.label, 40) && Array.isArray(item.children) && item.children.length <= 12 && item.children.every(validSubItem));
  if (!validTexts(v.texts)) return false;
  return enums && flags && copy && images && items && text(v.logoText, 40) && text(v.cta, 24);
}

// Token roles a surface paints with. The panel and accent resolve against the same live palette.
export function headerColorVars(config: HeaderConfig): Record<string, string> {
  const [bg, fg, muted, line] = surfaceColors[config.surface];
  const panel = config.panel === "header" && config.surface !== "transparent" ? [bg, fg, muted, line] : config.panel === "inverse" ? surfaceColors.inverse : surfaceColors.surface;
  // A tinted or dark bar can't guarantee contrast with an arbitrary accent, so the accent there
  // becomes the bar's own text color. The chosen accent still drives panels and a lifted transparent bar.
  const chosen = `var(--color-${config.accent}-default)`, chosenOn = `var(--color-${config.accent}-on,#fff)`;
  const light = isLightSurface(config.surface);
  const accent = light ? chosen : fg;
  const accentOn = light ? chosenOn : config.surface === "transparent" ? "var(--color-text-primary,#303039)" : bg;
  return { "--hd-bg": bg, "--hd-fg": fg, "--hd-muted": muted, "--hd-line": line, "--hd-panel-bg": panel[0], "--hd-panel-fg": panel[1], "--hd-panel-muted": panel[2], "--hd-panel-line": panel[3],
    "--hd-accent": accent, "--hd-accent-on": accentOn, "--hd-accent-chosen": chosen, "--hd-accent-chosen-on": chosenOn, "--hd-panel-accent": config.panel === "inverse" ? `var(--color-${config.accent}-default)` : `var(--color-${config.accent}-text,var(--color-${config.accent}-default))` };
}
