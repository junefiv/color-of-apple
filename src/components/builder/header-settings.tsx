"use client";

import { useRef, useState } from "react";
import { headerTexts } from "@/lib/component-texts";
import { TextOverrides } from "./text-overrides";
import { ChevronDown, ChevronRight, Plus, Trash2 } from "lucide-react";
import { useSettingsFocus, type EditFocus } from "./settings-focus";
import { ImagePicker } from "./image-picker";
import { IconOptions } from "./icons";
import { subItem, type HeaderAccent, type HeaderConfig, type HeaderIcon, type HeaderSubItem, type HeaderSurface } from "@/lib/header-config";

export const surfaces: { value: HeaderSurface; label: string; swatch: string }[] = [
  { value: "surface", label: "기본", swatch: "var(--color-surface-default,#fff)" },
  { value: "subtle", label: "은은한", swatch: "var(--color-bg-subtle,#f4f4f6)" },
  { value: "primary", label: "Primary", swatch: "var(--color-primary-default)" },
  { value: "secondary", label: "Secondary", swatch: "var(--color-secondary-default)" },
  { value: "inverse", label: "다크", swatch: "var(--color-surface-inverse,#1d1d22)" },
  { value: "transparent", label: "투명", swatch: "repeating-conic-gradient(#e4e4ea 0 25%,#fff 0 50%) 0 0/8px 8px" },
];
export const accents: { value: HeaderAccent; label: string }[] = [{ value: "primary", label: "Primary" }, { value: "secondary", label: "Secondary" }, { value: "accent", label: "Accent" }];
const promoFrames = new Set<HeaderConfig["submenu"]>(["panel", "mega", "tabs", "side"]);

// Parts clicked on the header artboard → the settings section that edits them.
const sections: Record<string, string> = { frame: "color", logo: "logo", menu: "menu", utility: "utility", cta: "utility", promo: "submenu" };
// Comma lists are committed on blur so a trailing comma survives while typing the next entry.
const commaList = (value: string, max: number) => value.split(",").map(s => s.trim()).filter(Boolean).slice(0, 12).map(s => s.slice(0, max));

export function HeaderSettings({ config, onChange, preview, onPreview, focus }: { config: HeaderConfig; onChange: (next: HeaderConfig) => void; preview: boolean; onPreview: (open: boolean) => void; focus?: EditFocus }) {
  const root = useRef<HTMLDivElement>(null);
  const [openChild, setOpenChild] = useState("");
  useSettingsFocus(root, focus, sections);
  const set = (patch: Partial<HeaderConfig>) => onChange({ ...config, ...patch });
  const setItem = (index: number, patch: Partial<HeaderConfig["items"][number]>) => set({ items: config.items.map((item, i) => i === index ? { ...item, ...patch } : item) });
  const setChild = (i: number, j: number, patch: Partial<HeaderSubItem>) => setItem(i, { children: config.items[i].children.map((child, k) => k === j ? { ...child, ...patch } : child) });
  const check = (key: "topBar" | "search" | "language" | "login" | "sitemap" | "divider" | "dim" | "promo", label: string) =>
    <label className="lb-check"><input type="checkbox" checked={config[key]} onChange={e => set({ [key]: e.target.checked })} />{label}</label>;
  const side = config.placement !== "top";

  return <div className="lb-hd-settings" ref={root}>
    <section data-part="placement"><strong>위치</strong><p>PC 미리보기에서 헤더 핸들을 잡고 화면 왼쪽·오른쪽 끝으로 끌면 사이드 내비가 되고, 페이지 안으로 다시 끌어 놓으면 상단 헤더로 돌아와요. 폰에서는 항상 상단 바예요.</p>
      <div className="lb-hd-segment" role="radiogroup" aria-label="헤더 위치">{([["top", "상단"], ["left", "왼쪽 사이드"], ["right", "오른쪽 사이드"]] as const).map(([value, label]) =>
        <button key={value} type="button" role="radio" aria-checked={config.placement === value} onClick={() => set({ placement: value })}>{label}</button>)}</div></section>

    <section data-part="logo"><strong>로고와 메뉴 배치</strong>
      {!side && <label className="lb-field">배치<select value={config.arrangement} onChange={e => set({ arrangement: e.target.value as HeaderConfig["arrangement"] })}>
        <option value="menu-right">로고 왼쪽 · 메뉴 오른쪽</option><option value="menu-center">로고 왼쪽 · 메뉴 가운데</option><option value="menu-follow">로고 옆에 메뉴</option>
        <option value="logo-center">메뉴 · 가운데 로고 · 버튼</option><option value="stacked">로고 위 · 메뉴 아래</option><option value="minimal">로고 + 햄버거만</option></select></label>}
      <div className="lb-two-fields"><label className="lb-field">로고<select value={config.logo} onChange={e => set({ logo: e.target.value as HeaderConfig["logo"] })}><option value="wordmark">워드마크</option><option value="symbol">심볼 + 이름</option><option value="slot">이미지 자리</option></select></label>
        <label className="lb-field">로고 이름<input data-field="logo" value={config.logoText} maxLength={40} disabled={config.logo === "slot"} onChange={e => set({ logoText: e.target.value })} /></label></div>
      {config.logo === "slot" && <ImagePicker label="로고 이미지" value={config.logoImage ?? ""} max={600} onChange={logoImage => set({ logoImage })} />}</section>

    <section data-part="submenu"><strong>하위 메뉴</strong>
      <label className="lb-field">열리는 틀<select value={config.submenu} onChange={e => set({ submenu: e.target.value as HeaderConfig["submenu"] })}>
        <option value="none">없음 · 1단 메뉴</option>
        <optgroup label="항목 아래"><option value="dropdown">드롭다운</option><option value="bubble">말풍선 드롭다운</option><option value="bar">가로 서브바 한 줄</option></optgroup>
        <optgroup label="전체 폭 패널"><option value="panel">선택 항목 패널</option><option value="all">모든 하위 펼침</option><option value="mega">메가메뉴 · 3단 열</option><option value="tabs">패널 속 세로 탭</option><option value="cards">썸네일 카드</option></optgroup>
        <optgroup label="옆"><option value="side">옆에서 밀려 나오는 패널</option></optgroup></select></label>
      {config.submenu !== "none" && <>
        <div className="lb-two-fields"><label className="lb-field">항목 모양<select value={config.subStyle} onChange={e => set({ subStyle: e.target.value as HeaderConfig["subStyle"] })}><option value="text">글자만</option><option value="desc">아이콘 + 설명</option><option value="thumb">이미지 + 이름</option></select></label>
          <label className="lb-field">열림 효과<select value={config.motion} onChange={e => set({ motion: e.target.value as HeaderConfig["motion"] })}><option value="none">바로</option><option value="fade">서서히</option><option value="slide">미끄러지듯</option><option value="reveal">위에서 펼쳐짐</option></select></label></div>
        <label className="lb-field">여는 동작<select value={config.trigger} onChange={e => set({ trigger: e.target.value as HeaderConfig["trigger"] })}><option value="hover">마우스를 올리면</option><option value="click">클릭하면</option></select></label>
        <div className="lb-hd-checks">{check("dim", "열리면 페이지 어둡게")}<label className="lb-check"><input type="checkbox" checked={preview} onChange={e => onPreview(e.target.checked)} />첫 메뉴 펼쳐 두고 보기</label></div>
        {promoFrames.has(config.submenu) && <div className="lb-hd-promo">{check("promo", "프로모션 카드")}
          {config.promo && <><label className="lb-field">제목<input data-field="promo" value={config.promoTitle} maxLength={40} onChange={e => set({ promoTitle: e.target.value })} /></label>
            <label className="lb-field">설명<input value={config.promoText} maxLength={80} onChange={e => set({ promoText: e.target.value })} /></label>
            <label className="lb-field">링크 문구<input value={config.promoCta} maxLength={24} placeholder="비우면 숨김" onChange={e => set({ promoCta: e.target.value })} /></label>
            <ImagePicker label="카드 이미지" value={config.promoImage} max={1200} onChange={promoImage => set({ promoImage })} /></>}</div>}
      </>}</section>

    <section data-part="color"><strong>색상</strong><p>팔레트 토큰을 그대로 씁니다. 컬러를 바꾸면 헤더도 같이 바뀌어요. 진한 배경에서는 강조색 대신 배경 위 글자색을 써서 대비를 지켜요.</p>
      <div className="lb-hd-swatches" role="radiogroup" aria-label="헤더 배경">{surfaces.map(s => <button key={s.value} type="button" role="radio" aria-checked={config.surface === s.value} onClick={() => set({ surface: s.value })}><i style={{ background: s.swatch }} />{s.label}</button>)}</div>
      <div className="lb-two-fields"><label className="lb-field">강조 컬러<select value={config.accent} onChange={e => set({ accent: e.target.value as HeaderAccent })}>{accents.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}</select></label>
        <label className="lb-field">현재 메뉴 표시<select value={config.active} onChange={e => set({ active: e.target.value as HeaderConfig["active"] })}><option value="text">글자색</option><option value="underline">{side ? "왼쪽 막대" : "밑줄"}</option><option value="pill">배경 알약</option></select></label></div>
      <label className="lb-field">펼침 패널<select value={config.panel} onChange={e => set({ panel: e.target.value as HeaderConfig["panel"] })}><option value="surface">밝은 표면</option><option value="header">헤더와 같은 색</option><option value="inverse">다크</option></select></label>
      {check("divider", side ? "사이드 경계선" : "헤더 아래 구분선")}</section>

    <section data-part="utility"><strong>유틸리티</strong>
      <div className="lb-hd-checks">{check("topBar", "상단 유틸 바")}{check("search", "검색")}{check("language", "언어")}{check("login", "로그인")}{check("sitemap", "PC 전체메뉴 버튼")}</div>
      <label className="lb-field">강조 버튼<input data-field="cta" value={config.cta} maxLength={24} placeholder="비우면 숨김 · 예: 예약하기" onChange={e => set({ cta: e.target.value })} /></label>
      <TextOverrides defs={headerTexts} texts={config.texts} onChange={texts => set({ texts })} /></section>

    <section data-part="menu"><strong>메뉴 항목</strong><p>하위 메뉴를 펼쳐 설명, 아이콘, 배지, 이미지, 3단 메뉴를 넣을 수 있어요.</p>
      {config.items.map((item, i) => <div className="lb-hd-item" key={i}><input aria-label={`메뉴 ${i + 1} 이름`} data-field={i === 0 ? "menu" : undefined} value={item.label} maxLength={40} onChange={e => setItem(i, { label: e.target.value })} />
        <button type="button" aria-label={`메뉴 ${i + 1} 삭제`} onClick={() => set({ items: config.items.filter((_, j) => j !== i) })}><Trash2 size={12} /></button>
        <ul className="lb-hd-children">{item.children.map((child, j) => {
          const key = `${i}-${j}`, open = openChild === key;
          return <li key={j}><div className="lb-hd-child-row"><button type="button" aria-label={open ? "하위 메뉴 접기" : "하위 메뉴 펼치기"} aria-expanded={open} onClick={() => setOpenChild(open ? "" : key)}>{open ? <ChevronDown size={11} /> : <ChevronRight size={11} />}</button>
            <input aria-label={`${item.label} 하위 ${j + 1}`} value={child.label} maxLength={40} onChange={e => setChild(i, j, { label: e.target.value })} />
            <button type="button" aria-label={`${child.label} 삭제`} onClick={() => setItem(i, { children: item.children.filter((_, k) => k !== j) })}><Trash2 size={11} /></button></div>
            {open && <div className="lb-hd-child-detail">
              <label className="lb-field">설명<input value={child.desc} maxLength={80} placeholder="아이콘 + 설명 모양에서 보여요" onChange={e => setChild(i, j, { desc: e.target.value })} /></label>
              <div className="lb-two-fields"><label className="lb-field">아이콘<select value={child.icon} onChange={e => setChild(i, j, { icon: e.target.value as HeaderIcon })}><option value="">기본 화살표</option><IconOptions /></select></label>
                <label className="lb-field">배지<input value={child.badge} maxLength={12} placeholder="예: NEW" onChange={e => setChild(i, j, { badge: e.target.value })} /></label></div>
              <label className="lb-field">3단 메뉴<input key={child.items.join("|")} defaultValue={child.items.join(", ")} placeholder="쉼표로 구분 · 비우면 없음" onKeyDown={e => { if (e.key === "Enter") e.currentTarget.blur(); }}
                onBlur={e => { const items = commaList(e.target.value, 40); if (items.join("|") !== child.items.join("|")) setChild(i, j, { items }); }} /></label>
              <ImagePicker label="이미지" value={child.image} max={600} onChange={image => setChild(i, j, { image })} /></div>}</li>;
        })}</ul>
        {item.children.length < 12 && <button type="button" className="lb-hd-add lb-hd-add-child" onClick={() => { setItem(i, { children: [...item.children, subItem(`하위 ${item.children.length + 1}`)] }); setOpenChild(`${i}-${item.children.length}`); }}><Plus size={11} />하위 메뉴</button>}</div>)}
      {config.items.length < 8 && <button type="button" className="lb-hd-add" onClick={() => set({ items: [...config.items, { label: `메뉴 ${config.items.length + 1}`, children: [] }] })}><Plus size={12} />메뉴 추가</button>}</section>

    <section data-part="mobile"><strong>모바일</strong><p>375px에서는 햄버거로 바뀝니다. 폰 프레임에서 눌러 확인하세요.</p>
      <label className="lb-field">메뉴를 열면<select value={config.mobileMenu} onChange={e => set({ mobileMenu: e.target.value as HeaderConfig["mobileMenu"] })}>
        <option value="overlay">전체 화면 · 아코디언</option><option value="drawer">옆에서 서랍 · 아코디언</option><option value="expand">헤더 아래로 펼침</option><option value="split">왼쪽 대메뉴 · 오른쪽 하위</option></select></label>
      <label className="lb-field">모바일 로고<select value={config.mobileLogo} onChange={e => set({ mobileLogo: e.target.value as HeaderConfig["mobileLogo"] })}><option value="left">왼쪽</option><option value="center">가운데</option></select></label></section>
  </div>;
}
