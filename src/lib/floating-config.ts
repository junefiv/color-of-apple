import { listOf, oneOf, record, text } from "./config-check";
import { headerIcons, type HeaderIcon } from "./header-config";

// Floating layers from the survey (§8). They sit above the page, not in its flow, and most of them
// change shape on a phone: a side rail becomes a bottom tab bar, a pill becomes a full-width bar.
export type FloatingKind = "top" | "rail" | "fab" | "pill" | "chat" | "tabbar";
export type FloatingConfig = {
  kind: FloatingKind;
  mobileKind: FloatingKind | "hidden";
  side: "right" | "left";
  vertical: "bottom" | "center";
  items: { label: string; icon: HeaderIcon }[];
  label: string;
  badge: string;
  surface: "primary" | "surface" | "inverse";
  shape: "circle" | "rounded" | "pill";
};

export function defaultFloating(): FloatingConfig {
  return { kind: "rail", mobileKind: "tabbar", side: "right", vertical: "center", surface: "surface", shape: "rounded", label: "빠른 상담", badge: "",
    items: [{ label: "상담 신청", icon: "phone" }, { label: "오시는 길", icon: "map" }, { label: "이벤트", icon: "gift" }, { label: "공지사항", icon: "book" }] };
}

export type FloatingPreset = { key: string; name: string; note: string; config: Partial<FloatingConfig> };
export const floatingPresets: FloatingPreset[] = [
  { key: "rail", name: "우측 퀵메뉴", note: "세로 아이콘 메뉴 · 모바일 하단 탭바", config: { kind: "rail", mobileKind: "tabbar", side: "right", vertical: "center", surface: "surface", shape: "rounded" } },
  { key: "top", name: "맨 위로", note: "오른쪽 아래 작은 원형 버튼", config: { kind: "top", mobileKind: "top", side: "right", vertical: "bottom", surface: "surface", shape: "circle" } },
  { key: "fab", name: "원형 빠른 신청", note: "큰 원 버튼 · 모바일 작게", config: { kind: "fab", mobileKind: "fab", side: "right", vertical: "bottom", surface: "primary", shape: "circle", label: "빠른 신청" } },
  { key: "pill", name: "필 CTA + 배지", note: "PC 알약 버튼 · 모바일 하단 바", config: { kind: "pill", mobileKind: "pill", side: "right", vertical: "bottom", surface: "primary", shape: "pill", label: "무료 상담 받기", badge: "D-3" } },
  { key: "chat", name: "채팅 상담", note: "말풍선 인사 + 채팅 버튼", config: { kind: "chat", mobileKind: "chat", side: "right", vertical: "bottom", surface: "inverse", shape: "pill", label: "무엇을 도와드릴까요?" } },
  { key: "tabbar", name: "앱 탭바", note: "모바일 하단 탭바 · PC 숨김", config: { kind: "tabbar", mobileKind: "tabbar", vertical: "bottom", surface: "surface", shape: "rounded" } },
];
export function applyFloatingPreset(config: FloatingConfig, preset: FloatingPreset): FloatingConfig {
  return { ...defaultFloating(), items: config.items, ...preset.config };
}
export const withFloatingDefaults = (config: Partial<FloatingConfig> | undefined): FloatingConfig => ({ ...defaultFloating(), ...config });

const kinds = ["top", "rail", "fab", "pill", "chat", "tabbar"];
export function validFloatingConfig(value: unknown): value is FloatingConfig {
  if (!record(value)) return false;
  const v = value;
  const item = (i: unknown) => record(i) && text(i.label, 20) && oneOf(i.icon, ["", ...headerIcons]);
  return oneOf(v.kind, kinds) && oneOf(v.mobileKind, [...kinds, "hidden"]) && oneOf(v.side, ["right", "left"]) && oneOf(v.vertical, ["bottom", "center"])
    && listOf(v.items, 6, item) && text(v.label, 30) && text(v.badge, 10) && oneOf(v.surface, ["primary", "surface", "inverse"]) && oneOf(v.shape, ["circle", "rounded", "pill"]);
}
