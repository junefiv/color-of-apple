"use client";

import { useRef } from "react";
import { type HeroButtonColor, type HeroConfig, type HeroHeight, type HeroSurface } from "@/lib/hero-config";
import type { HeaderAccent } from "@/lib/header-config";
import { accents, surfaces } from "./header-settings";
import { ImagePicker } from "./image-picker";
import { useSettingsFocus, type EditFocus } from "./settings-focus";

const heightOptions = <><option value="screen">화면 가득</option><option value="large">크게 · 80%</option><option value="medium">중간 · 60%</option><option value="band">띠 배너</option><option value="custom">직접 지정 · 아래 가장자리를 끌어도 돼요</option></>;
// Parts clicked on the hero artboard → the settings section that edits them.
const sections: Record<string, string> = { frame: "layout", media: "layout", eyebrow: "copy", title: "copy", body: "copy", primary: "button", secondary: "button", nav: "slides", card: "slides", ticker: "slides" };
const buttonColors: { value: HeroButtonColor; label: string; swatch: string }[] = [
  { value: "auto", label: "자동", swatch: "linear-gradient(135deg,#fff 50%,#1d1d22 50%)" },
  { value: "primary", label: "Primary", swatch: "var(--color-primary-default)" },
  { value: "secondary", label: "Secondary", swatch: "var(--color-secondary-default)" },
  { value: "accent", label: "Accent", swatch: "var(--color-accent-default)" },
  { value: "light", label: "흰색", swatch: "var(--color-surface-default,#fff)" },
  { value: "dark", label: "다크", swatch: "var(--color-surface-inverse,#1d1d22)" },
];

export function HeroSettings({ config, onChange, focus }: { config: HeroConfig; onChange: (next: HeroConfig) => void; focus?: EditFocus }) {
  const root = useRef<HTMLDivElement>(null);
  useSettingsFocus(root, focus, sections);
  const set = (patch: Partial<HeroConfig>) => onChange({ ...config, ...patch });
  const onMedia = config.layout === "overlay" || config.layout === "band";
  const text = (key: "eyebrow" | "title" | "primary" | "secondary", label: string, max: number, placeholder = "") =>
    <label className="lb-field">{label}<input data-field={key} value={config[key]} maxLength={max} placeholder={placeholder} onChange={e => set({ [key]: e.target.value })} /></label>;

  return <div className="lb-hd-settings" ref={root}>
    <section data-part="layout"><strong>구성</strong>
      <label className="lb-field">배치<select value={config.layout} onChange={e => set({ layout: e.target.value as HeroConfig["layout"] })}>
        <option value="overlay">비주얼 위에 카피</option><option value="split">카피 · 비주얼 좌우 분할</option><option value="text">텍스트만</option><option value="color">브랜드 컬러 단색</option><option value="band">띠 배너</option></select></label>
      <div className="lb-two-fields">{config.layout !== "text" && config.layout !== "color" && <label className="lb-field">비주얼<select data-field="media" value={config.media} onChange={e => set({ media: e.target.value as HeroConfig["media"] })}><option value="image">이미지</option><option value="video">비디오</option></select></label>}
        <label className="lb-field">카피 정렬<select value={config.align} onChange={e => set({ align: e.target.value as HeroConfig["align"] })}><option value="start">왼쪽</option><option value="center">가운데</option><option value="end">오른쪽</option></select></label></div>
      {config.layout !== "text" && config.layout !== "color" && <>
        <ImagePicker label={config.media === "video" ? "포스터 이미지" : "이미지"} value={config.image} max={1800} field="image" onChange={image => set({ image })} />
        <label className="lb-field">채우는 방식<select value={config.imageFit} onChange={e => set({ imageFit: e.target.value as HeroConfig["imageFit"] })}><option value="cover">박스를 가득 채우기 · 넘치면 잘림</option><option value="contain">원본 비율 유지 · 남는 곳은 여백</option></select></label></>}
      {onMedia && <label className="lb-field">글자 아래 막<select value={config.scrim} onChange={e => set({ scrim: e.target.value as HeroConfig["scrim"] })}><option value="gradient">아래에서 그라데이션</option><option value="solid">전체를 어둡게</option><option value="none">없음</option></select></label>}
      <label className="lb-field">PC 높이<select value={config.height} onChange={e => set({ height: e.target.value as HeroHeight })}>{heightOptions}</select></label>
      {config.height === "custom" && <label className="lb-field">PC 높이 px<input key={config.heightPx} type="number" min={160} max={1440} defaultValue={config.heightPx} onKeyDown={e => { if (e.key === "Enter") e.currentTarget.blur(); }}
        onBlur={e => { const v = Math.max(160, Math.min(1440, Math.round(Number(e.target.value) || config.heightPx))); if (v !== config.heightPx) set({ heightPx: v }); else e.target.value = String(v); }} /></label>}</section>

    <section data-part="copy"><strong>문구</strong>
      {text("eyebrow", "작은 머리말", 40, "비우면 숨김")}
      {text("title", "제목", 80)}
      <label className="lb-field">설명<textarea data-field="body" rows={3} value={config.body} maxLength={200} placeholder="비우면 숨김" onChange={e => set({ body: e.target.value })} /></label></section>

    <section data-part="button"><strong>버튼</strong><p>문구를 비우면 그 버튼은 숨겨져요. 보조 버튼은 같은 둥글기의 테두리 버튼이에요.</p>
      <div className="lb-two-fields">{text("primary", "주 버튼", 24, "비우면 숨김")}{text("secondary", "보조 버튼", 24, "비우면 숨김")}</div>
      <label className="lb-field">모서리 둥글기<span className="lb-range"><input type="range" min={0} max={40} value={config.buttonRadius} onChange={e => set({ buttonRadius: Number(e.target.value) })} /><output>{config.buttonRadius >= 28 ? "알약" : `${config.buttonRadius}px`}</output></span></label>
      <div className="lb-hd-swatches" role="radiogroup" aria-label="주 버튼 색">{buttonColors.map(c => <button key={c.value} type="button" role="radio" aria-checked={config.buttonColor === c.value} onClick={() => set({ buttonColor: c.value })}><i style={{ background: c.swatch }} />{c.label}</button>)}</div>
      <label className="lb-field">주 버튼 모양<select value={config.buttonStyle} onChange={e => set({ buttonStyle: e.target.value as HeroConfig["buttonStyle"] })}><option value="solid">채움</option><option value="outline">테두리</option></select></label>
      {config.buttonColor === "auto" && <p>자동은 배경에 맞춰 대비가 지켜지는 색을 골라요. 밝은 배경에서는 강조 컬러를 씁니다.</p>}</section>

    <section data-part="slides"><strong>슬라이드</strong>
      <div className="lb-two-fields"><label className="lb-field">장 수<select value={config.slides} onChange={e => set({ slides: Number(e.target.value) })}>{[1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n === 1 ? "1 · 단일" : n}</option>)}</select></label>
        <label className="lb-field">표시<select data-field="nav" value={config.nav} disabled={config.slides < 2} onChange={e => set({ nav: e.target.value as HeroConfig["nav"] })}><option value="none">없음</option><option value="dots">점</option><option value="fraction">숫자 01 / 04</option><option value="progress">진행 바</option><option value="thumbs">썸네일</option></select></label></div>
      <div className="lb-hd-checks"><label className="lb-check"><input data-field="card" type="checkbox" checked={config.card} onChange={e => set({ card: e.target.checked })} />공지 카드 얹기</label>
        <label className="lb-check"><input data-field="ticker" type="checkbox" checked={config.ticker} onChange={e => set({ ticker: e.target.checked })} />아래 티커 띠</label></div></section>

    <section data-part="color"><strong>색상</strong><p>{onMedia ? "비주얼 위에서는 글자가 밝게 반전돼 어떤 팔레트에서도 읽혀요. 강조 컬러는 썸네일 표시와 자동 버튼에 쓰입니다." : "팔레트 토큰을 그대로 씁니다. 진한 배경에서는 자동 버튼이 배경과 반전돼 대비를 지켜요."}</p>
      {!onMedia && <div className="lb-hd-swatches" role="radiogroup" aria-label="히어로 배경">{surfaces.filter(s => s.value !== "transparent").map(s => <button key={s.value} type="button" role="radio" aria-checked={config.surface === s.value} onClick={() => set({ surface: s.value as HeroSurface })}><i style={{ background: s.swatch }} />{s.label}</button>)}</div>}
      <label className="lb-field">강조 컬러<select value={config.accent} onChange={e => set({ accent: e.target.value as HeaderAccent })}>{accents.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}</select></label></section>

    <section data-part="mobile"><strong>모바일</strong><p>썸네일 표시는 폰에서 점으로 바뀌고, 공지 카드는 카피 아래로 내려가요.</p>
      <label className="lb-field">모바일 높이<select value={config.mobileHeight} onChange={e => set({ mobileHeight: e.target.value as HeroHeight })}>{heightOptions}</select></label>
      {config.mobileHeight === "custom" && <label className="lb-field">모바일 높이 px<input key={config.mobileHeightPx} type="number" min={160} max={1440} defaultValue={config.mobileHeightPx} onKeyDown={e => { if (e.key === "Enter") e.currentTarget.blur(); }}
        onBlur={e => { const v = Math.max(160, Math.min(1440, Math.round(Number(e.target.value) || config.mobileHeightPx))); if (v !== config.mobileHeightPx) set({ mobileHeightPx: v }); else e.target.value = String(v); }} /></label>}
      {config.layout === "split" && <label className="lb-check"><input type="checkbox" checked={config.mediaFirst} onChange={e => set({ mediaFirst: e.target.checked })} />모바일에서 비주얼을 위로</label>}</section>
  </div>;
}
