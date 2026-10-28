// Header options distilled from surveyed Korean award-site headers (gdweb.co.kr):
// where the logo sits, how depth-2 menus open, and which token role paints the bar.
export type HeaderArrangement = "menu-right" | "menu-center" | "menu-follow" | "logo-center" | "stacked" | "minimal";
export type HeaderSubmenu = "none" | "dropdown" | "panel" | "all" | "bar";
export type HeaderMobileMenu = "overlay" | "expand" | "drawer" | "split";
export type HeaderSurface = "surface" | "subtle" | "primary" | "secondary" | "inverse" | "transparent";
export type HeaderPanel = "surface" | "header" | "inverse";
export type HeaderAccent = "primary" | "secondary" | "accent";
export type HeaderActive = "text" | "underline" | "pill";
export type HeaderLogo = "wordmark" | "symbol" | "slot";
export type HeaderMenuItem = { label: string; children: string[] };
export type HeaderConfig = {
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
  items: HeaderMenuItem[];
  topBar: boolean;
  search: boolean;
  language: boolean;
  login: boolean;
  cta: string;
  sitemap: boolean;
  divider: boolean;
};

export const headerItems: HeaderMenuItem[] = [
  { label: "회사소개", children: ["인사말", "연혁", "오시는 길"] },
  { label: "사업영역", children: ["브랜드", "플랫폼", "파트너십"] },
  { label: "소식", children: ["공지사항", "보도자료"] },
  { label: "고객지원", children: ["자주 묻는 질문", "문의하기"] },
];

export function defaultHeader(mobileMenu: HeaderMobileMenu = "overlay"): HeaderConfig {
  return { arrangement: "menu-right", submenu: "dropdown", trigger: "hover", mobileMenu, mobileLogo: "left", surface: "surface", panel: "surface", accent: "primary", active: "text",
    logo: "wordmark", logoText: "Brand", items: headerItems.map(item => ({ ...item, children: [...item.children] })), topBar: false, search: false, language: false, login: false, cta: "", sitemap: false, divider: true };
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
];

export function applyHeaderPreset(config: HeaderConfig, preset: HeaderPreset): HeaderConfig {
  // Presets reshape structure and color, but keep the user's own logo and menu copy.
  const base = defaultHeader();
  return { ...base, ...preset.config, logo: config.logo, logoText: config.logoText, items: config.items };
}

const options: { [K in keyof HeaderConfig]?: readonly string[] } = {
  arrangement: ["menu-right", "menu-center", "menu-follow", "logo-center", "stacked", "minimal"],
  submenu: ["none", "dropdown", "panel", "all", "bar"],
  trigger: ["hover", "click"],
  mobileMenu: ["overlay", "expand", "drawer", "split"],
  mobileLogo: ["left", "center"],
  surface: ["surface", "subtle", "primary", "secondary", "inverse", "transparent"],
  panel: ["surface", "header", "inverse"],
  accent: ["primary", "secondary", "accent"],
  active: ["text", "underline", "pill"],
  logo: ["wordmark", "symbol", "slot"],
};
const text = (value: unknown, max: number) => typeof value === "string" && value.length <= max;
export function validHeaderConfig(value: unknown): value is HeaderConfig {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  const enums = Object.entries(options).every(([key, allowed]) => allowed!.includes(v[key] as string));
  const flags = ["topBar", "search", "language", "login", "sitemap", "divider"].every(key => typeof v[key] === "boolean");
  const items = Array.isArray(v.items) && v.items.length <= 8 && v.items.every(item => item && text(item.label, 40) && Array.isArray(item.children) && item.children.length <= 12 && item.children.every((child: unknown) => text(child, 40)));
  return enums && flags && items && text(v.logoText, 40) && text(v.cta, 24);
}

// Token roles a surface paints with. The panel and accent resolve against the same live palette.
export function headerColorVars(config: HeaderConfig): Record<string, string> {
  const surface: Record<HeaderSurface, [string, string, string, string]> = {
    surface: ["var(--color-surface-default,#fff)", "var(--color-text-primary,#303039)", "var(--color-text-secondary,#6b6b78)", "var(--color-border-subtle,#e6e6ee)"],
    subtle: ["var(--color-bg-subtle,#f4f4f6)", "var(--color-text-primary,#303039)", "var(--color-text-secondary,#6b6b78)", "var(--color-border-subtle,#e6e6ee)"],
    primary: ["var(--color-primary-default,#303039)", "var(--color-primary-on,#fff)", "color-mix(in oklab,var(--color-primary-on,#fff) 72%,transparent)", "color-mix(in oklab,var(--color-primary-on,#fff) 18%,transparent)"],
    secondary: ["var(--color-secondary-default,#55556a)", "var(--color-secondary-on,#fff)", "color-mix(in oklab,var(--color-secondary-on,#fff) 72%,transparent)", "color-mix(in oklab,var(--color-secondary-on,#fff) 18%,transparent)"],
    inverse: ["var(--color-surface-inverse,#1d1d22)", "var(--color-text-inverse,#fff)", "color-mix(in oklab,var(--color-text-inverse,#fff) 66%,transparent)", "color-mix(in oklab,var(--color-text-inverse,#fff) 16%,transparent)"],
    transparent: ["transparent", "var(--color-text-inverse,#fff)", "color-mix(in oklab,var(--color-text-inverse,#fff) 78%,transparent)", "color-mix(in oklab,var(--color-text-inverse,#fff) 22%,transparent)"],
  };
  const [bg, fg, muted, line] = surface[config.surface];
  const panel = config.panel === "header" && config.surface !== "transparent" ? [bg, fg, muted, line] : config.panel === "inverse" ? surface.inverse : surface.surface;
  // A tinted or dark bar can't guarantee contrast with an arbitrary accent, so the accent there
  // becomes the bar's own text color. The chosen accent still drives panels and a lifted transparent bar.
  const chosen = `var(--color-${config.accent}-default)`, chosenOn = `var(--color-${config.accent}-on,#fff)`;
  const light = config.surface === "surface" || config.surface === "subtle";
  const accent = light ? chosen : fg;
  const accentOn = light ? chosenOn : config.surface === "transparent" ? "var(--color-text-primary,#303039)" : bg;
  return { "--hd-bg": bg, "--hd-fg": fg, "--hd-muted": muted, "--hd-line": line, "--hd-panel-bg": panel[0], "--hd-panel-fg": panel[1], "--hd-panel-muted": panel[2], "--hd-panel-line": panel[3],
    "--hd-accent": accent, "--hd-accent-on": accentOn, "--hd-accent-chosen": chosen, "--hd-accent-chosen-on": chosenOn, "--hd-panel-accent": config.panel === "inverse" ? `var(--color-${config.accent}-default)` : `var(--color-${config.accent}-text,var(--color-${config.accent}-default))` };
}
