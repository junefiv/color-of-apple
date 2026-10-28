"use client";

import { Plus, Trash2 } from "lucide-react";
import { applyHeaderPreset, headerPresets, type HeaderAccent, type HeaderConfig, type HeaderSurface } from "@/lib/header-config";

const surfaces: { value: HeaderSurface; label: string; swatch: string }[] = [
  { value: "surface", label: "기본", swatch: "var(--color-surface-default,#fff)" },
  { value: "subtle", label: "은은한", swatch: "var(--color-bg-subtle,#f4f4f6)" },
  { value: "primary", label: "Primary", swatch: "var(--color-primary-default)" },
  { value: "secondary", label: "Secondary", swatch: "var(--color-secondary-default)" },
  { value: "inverse", label: "다크", swatch: "var(--color-surface-inverse,#1d1d22)" },
  { value: "transparent", label: "투명", swatch: "repeating-conic-gradient(#e4e4ea 0 25%,#fff 0 50%) 0 0/8px 8px" },
];
const accents: { value: HeaderAccent; label: string }[] = [{ value: "primary", label: "Primary" }, { value: "secondary", label: "Secondary" }, { value: "accent", label: "Accent" }];

export function HeaderSettings({ config, onChange, preview, onPreview }: { config: HeaderConfig; onChange: (next: HeaderConfig) => void; preview: boolean; onPreview: (open: boolean) => void }) {
  const set = (patch: Partial<HeaderConfig>) => onChange({ ...config, ...patch });
  const setItem = (index: number, patch: Partial<HeaderConfig["items"][number]>) => set({ items: config.items.map((item, i) => i === index ? { ...item, ...patch } : item) });
  const check = (key: "topBar" | "search" | "language" | "login" | "sitemap" | "divider", label: string) =>
    <label className="lb-check"><input type="checkbox" checked={config[key]} onChange={e => set({ [key]: e.target.checked })} />{label}</label>;

  return <div className="lb-hd-settings">
    <section><strong>헤더 스타일</strong><p>실제 사이트 헤더에서 추린 구조예요. 고른 뒤 아래에서 자유롭게 바꾸세요.</p>
      <div className="lb-hd-presets">{headerPresets.map(preset => <button key={preset.key} type="button" title={preset.note} onClick={() => onChange(applyHeaderPreset(config, preset))}>{preset.name}<small>{preset.note}</small></button>)}</div></section>

    <section><strong>로고와 메뉴 배치</strong>
      <label className="lb-field">배치<select value={config.arrangement} onChange={e => set({ arrangement: e.target.value as HeaderConfig["arrangement"] })}>
        <option value="menu-right">로고 왼쪽 · 메뉴 오른쪽</option><option value="menu-center">로고 왼쪽 · 메뉴 가운데</option><option value="menu-follow">로고 옆에 메뉴</option>
        <option value="logo-center">메뉴 · 가운데 로고 · 버튼</option><option value="stacked">로고 위 · 메뉴 아래</option><option value="minimal">로고 + 햄버거만</option></select></label>
      <div className="lb-two-fields"><label className="lb-field">로고<select value={config.logo} onChange={e => set({ logo: e.target.value as HeaderConfig["logo"] })}><option value="wordmark">워드마크</option><option value="symbol">심볼 + 이름</option><option value="slot">이미지 자리</option></select></label>
        <label className="lb-field">로고 이름<input value={config.logoText} maxLength={40} disabled={config.logo === "slot"} onChange={e => set({ logoText: e.target.value })} /></label></div></section>

    <section><strong>하위 메뉴</strong>
      <label className="lb-field">열리는 방식<select value={config.submenu} onChange={e => set({ submenu: e.target.value as HeaderConfig["submenu"] })}>
        <option value="none">없음 · 1단 메뉴</option><option value="dropdown">항목 아래 드롭다운</option><option value="panel">전체 폭 패널 · 선택 항목</option>
        <option value="all">전체 폭 패널 · 모든 하위 펼침</option><option value="bar">가로 서브바 한 줄</option></select></label>
      {config.submenu !== "none" && <><label className="lb-field">여는 동작<select value={config.trigger} onChange={e => set({ trigger: e.target.value as HeaderConfig["trigger"] })}><option value="hover">마우스를 올리면</option><option value="click">클릭하면</option></select></label>
        <label className="lb-check"><input type="checkbox" checked={preview} onChange={e => onPreview(e.target.checked)} />첫 메뉴 펼쳐 두고 보기</label></>}</section>

    <section><strong>색상</strong><p>팔레트 토큰을 그대로 씁니다. 컬러를 바꾸면 헤더도 같이 바뀌어요. 진한 배경에서는 강조색 대신 배경 위 글자색을 써서 대비를 지켜요.</p>
      <div className="lb-hd-swatches" role="radiogroup" aria-label="헤더 배경">{surfaces.map(s => <button key={s.value} type="button" role="radio" aria-checked={config.surface === s.value} onClick={() => set({ surface: s.value })}><i style={{ background: s.swatch }} />{s.label}</button>)}</div>
      <div className="lb-two-fields"><label className="lb-field">강조 컬러<select value={config.accent} onChange={e => set({ accent: e.target.value as HeaderAccent })}>{accents.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}</select></label>
        <label className="lb-field">현재 메뉴 표시<select value={config.active} onChange={e => set({ active: e.target.value as HeaderConfig["active"] })}><option value="text">글자색</option><option value="underline">밑줄</option><option value="pill">배경 알약</option></select></label></div>
      <label className="lb-field">펼침 패널<select value={config.panel} onChange={e => set({ panel: e.target.value as HeaderConfig["panel"] })}><option value="surface">밝은 표면</option><option value="header">헤더와 같은 색</option><option value="inverse">다크</option></select></label>
      {check("divider", "헤더 아래 구분선")}</section>

    <section><strong>유틸리티</strong>
      <div className="lb-hd-checks">{check("topBar", "상단 유틸 바")}{check("search", "검색")}{check("language", "언어")}{check("login", "로그인")}{check("sitemap", "PC 전체메뉴 버튼")}</div>
      <label className="lb-field">강조 버튼<input value={config.cta} maxLength={24} placeholder="비우면 숨김 · 예: 예약하기" onChange={e => set({ cta: e.target.value })} /></label></section>

    <section><strong>메뉴 항목</strong><p>하위 메뉴는 쉼표로 구분하세요.</p>
      {config.items.map((item, i) => <div className="lb-hd-item" key={i}><input aria-label={`메뉴 ${i + 1} 이름`} value={item.label} maxLength={40} onChange={e => setItem(i, { label: e.target.value })} />
        <button type="button" aria-label={`메뉴 ${i + 1} 삭제`} onClick={() => set({ items: config.items.filter((_, j) => j !== i) })}><Trash2 size={12} /></button>
        {/* Committed on blur so a trailing comma survives while typing the next entry. */}
        <input key={`${i}-${item.children.join("|")}`} aria-label={`메뉴 ${i + 1} 하위 메뉴`} defaultValue={item.children.join(", ")} placeholder="하위 메뉴 없음"
          onKeyDown={e => { if (e.key === "Enter") e.currentTarget.blur(); }}
          onBlur={e => { const children = e.target.value.split(",").map(s => s.trim()).filter(Boolean).slice(0, 12).map(s => s.slice(0, 40)); if (children.join("|") !== item.children.join("|")) setItem(i, { children }); }} /></div>)}
      {config.items.length < 8 && <button type="button" className="lb-hd-add" onClick={() => set({ items: [...config.items, { label: `메뉴 ${config.items.length + 1}`, children: [] }] })}><Plus size={12} />메뉴 추가</button>}</section>

    <section><strong>모바일</strong><p>375px에서는 햄버거로 바뀝니다. 폰 프레임에서 눌러 확인하세요.</p>
      <label className="lb-field">메뉴를 열면<select value={config.mobileMenu} onChange={e => set({ mobileMenu: e.target.value as HeaderConfig["mobileMenu"] })}>
        <option value="overlay">전체 화면 · 아코디언</option><option value="drawer">옆에서 서랍 · 아코디언</option><option value="expand">헤더 아래로 펼침</option><option value="split">왼쪽 대메뉴 · 오른쪽 하위</option></select></label>
      <label className="lb-field">모바일 로고<select value={config.mobileLogo} onChange={e => set({ mobileLogo: e.target.value as HeaderConfig["mobileLogo"] })}><option value="left">왼쪽</option><option value="center">가운데</option></select></label></section>
  </div>;
}
