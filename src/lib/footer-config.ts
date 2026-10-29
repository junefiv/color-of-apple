import { int, listOf, oneOf, record, text } from "./config-check";
import { validImageData } from "./image-data";
import type { SectionSurface } from "./section-surface";

// Footer options from the survey (docs/component-patterns.md §2): info block, sitemap columns that
// reuse the header menu, a CTA/slogan/newsletter lead on top, and a one-line minimal variant.
export type FooterConfig = {
  layout: "info" | "columns" | "minimal" | "poster";
  surface: Exclude<SectionSurface, "transparent">;
  lead: "none" | "cta" | "slogan" | "newsletter";
  leadTitle: string;
  leadText: string;
  leadCta: string;
  logoText: string;
  logoImage: string;
  info: string;
  legal: string[];
  copyright: string;
  sitemap: boolean;
  sns: boolean;
  familySite: boolean;
  backToTop: boolean;
  mobileColumns: "stack" | "two" | "accordion";
};

export function defaultFooter(): FooterConfig {
  return { layout: "columns", surface: "inverse", lead: "none", leadTitle: "함께 만들어 갈 다음 이야기", leadText: "궁금한 점을 남겨 주시면 빠르게 연락드릴게요.", leadCta: "문의하기",
    logoText: "Brand", logoImage: "", info: "(주)브랜드 · 대표 홍길동 · 사업자등록번호 000-00-00000\n서울특별시 중구 세종대로 00, 10층\n대표전화 02-000-0000 · hello@brand.kr",
    legal: ["이용약관", "개인정보처리방침", "이메일무단수집거부"], copyright: "© 2026 Brand. All rights reserved.", sitemap: true, sns: true, familySite: false, backToTop: true, mobileColumns: "accordion" };
}

export type FooterPreset = { key: string; name: string; note: string; config: Partial<FooterConfig> };
export const footerPresets: FooterPreset[] = [
  { key: "info", name: "정보형", note: "로고 · 정책 링크 · 사업자 정보", config: { layout: "info", surface: "subtle", lead: "none", sitemap: false, familySite: false, mobileColumns: "stack" } },
  { key: "columns", name: "사이트맵 열", note: "헤더 메뉴를 열로 · 모바일 아코디언", config: { layout: "columns", surface: "inverse", lead: "none", sitemap: true, familySite: true, mobileColumns: "accordion" } },
  { key: "cta", name: "CTA 얹은 푸터", note: "위에 문의 블록 · 아래 정보", config: { layout: "columns", surface: "surface", lead: "cta", sitemap: true, mobileColumns: "two" } },
  { key: "brand", name: "브랜드 컬러", note: "Primary 배경 · 슬로건", config: { layout: "columns", surface: "primary", lead: "slogan", leadTitle: "Your next favorite brand", sitemap: true, mobileColumns: "accordion" } },
  { key: "newsletter", name: "뉴스레터", note: "이메일 구독 입력 · 정보", config: { layout: "info", surface: "subtle", lead: "newsletter", leadTitle: "새 소식을 메일로 받아보세요", leadCta: "구독하기", sitemap: false, mobileColumns: "stack" } },
  { key: "minimal", name: "한 줄", note: "© · 링크 · SNS · 맨 위로", config: { layout: "minimal", surface: "surface", lead: "none", sitemap: false, familySite: false } },
  { key: "poster", name: "대형 워드마크", note: "아래를 가득 채우는 이름", config: { layout: "poster", surface: "inverse", lead: "slogan", leadTitle: "Thoughts become worlds", sitemap: true, mobileColumns: "two" } },
];
export function applyFooterPreset(config: FooterConfig, preset: FooterPreset): FooterConfig {
  // Presets reshape structure and color but keep the user's own brand and company copy.
  const { logoText, logoImage, info, legal, copyright, leadText } = config;
  return { ...defaultFooter(), ...preset.config, logoText, logoImage, info, legal, copyright, leadText };
}
export const withFooterDefaults = (config: Partial<FooterConfig> | undefined): FooterConfig => ({ ...defaultFooter(), ...config });

export function validFooterConfig(value: unknown): value is FooterConfig {
  if (!record(value)) return false;
  const v = value;
  return oneOf(v.layout, ["info", "columns", "minimal", "poster"]) && oneOf(v.surface, ["surface", "subtle", "primary", "secondary", "inverse"]) && oneOf(v.lead, ["none", "cta", "slogan", "newsletter"])
    && oneOf(v.mobileColumns, ["stack", "two", "accordion"]) && text(v.leadTitle, 60) && text(v.leadText, 120) && text(v.leadCta, 24) && text(v.logoText, 40) && validImageData(v.logoImage)
    && text(v.info, 400) && listOf(v.legal, 8, item => text(item, 30)) && text(v.copyright, 80) && ["sitemap", "sns", "familySite", "backToTop"].every(key => typeof v[key] === "boolean")
    && (v.padding === undefined || int(v.padding, 16, 200));
}
