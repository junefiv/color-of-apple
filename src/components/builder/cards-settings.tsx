"use client";

import { useEffect, useRef, useState } from "react";
import { cardItem, type CardItem, type CardsConfig } from "@/lib/cards-config";
import type { HeaderIcon } from "@/lib/header-config";
import { accents } from "./header-settings";
import { IconOptions } from "./icons";
import { ImagePicker } from "./image-picker";
import { useSettingsFocus, type EditFocus } from "./settings-focus";
import { ItemList, Range, Segment, SurfaceSwatches } from "./settings-kit";

const sections: Record<string, string> = { frame: "layout", eyebrow: "heading", title: "heading", desc: "heading", more: "heading", items: "items", card: "items", layout: "layout" };

export function CardsSettings({ config, onChange, focus }: { config: CardsConfig; onChange: (next: CardsConfig) => void; focus?: EditFocus }) {
  const root = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(-1);
  // Clicking a card in the preview opens that card's editor.
  useEffect(() => { if (focus?.part.startsWith("card:")) setOpen(Number(focus.part.slice(5))); }, [focus]);
  useSettingsFocus(root, focus, sections);
  const set = (patch: Partial<CardsConfig>) => onChange({ ...config, ...patch });
  const setItem = (i: number, patch: Partial<CardItem>) => set({ items: config.items.map((item, j) => j === i ? { ...item, ...patch } : item) });
  const text = (key: "eyebrow" | "title" | "more", label: string, max: number) => <label className="lb-field">{label}<input data-field={key} value={config[key]} maxLength={max} placeholder="비우면 숨김" onChange={e => set({ [key]: e.target.value })} /></label>;
  const showMedia = config.variant !== "board" && config.variant !== "stats";
  return <div className="lb-hd-settings" ref={root}>
    <section data-part="heading"><strong>섹션 제목</strong>
      {text("eyebrow", "작은 머리말", 40)}{text("title", "제목", 80)}
      <label className="lb-field">설명<textarea data-field="desc" rows={2} value={config.desc} maxLength={200} placeholder="비우면 숨김" onChange={e => set({ desc: e.target.value })} /></label>
      {text("more", "더보기 링크", 24)}
      <Segment label="제목 정렬" value={config.headAlign} options={[["start", "왼쪽"], ["center", "가운데"], ["split", "제목 · 더보기 양끝"]]} onChange={headAlign => set({ headAlign })} /></section>
    <section data-part="layout"><strong>카드 배치</strong>
      <label className="lb-field">모양<select value={config.variant} onChange={e => set({ variant: e.target.value as CardsConfig["variant"] })}>
        <option value="grid">그리드</option><option value="slider">슬라이더 · 다음 카드 살짝</option><option value="list">가로 리스트</option><option value="board">게시판 줄 목록</option><option value="stats">숫자 통계</option><option value="stagger">오프셋 그리드</option></select></label>
      {config.variant !== "list" && config.variant !== "board" && <Range label={config.variant === "slider" ? "한 화면 카드 수" : "PC 열 수"} value={config.columns} min={1} max={6} unit="열" onChange={columns => set({ columns })} />}
      {config.variant === "slider" && <Segment label="넘김 표시" value={config.nav} options={[["arrows", "화살표"], ["dots", "점"], ["both", "둘 다"]]} onChange={nav => set({ nav })} />}
      <Range label="카드 사이 간격" value={config.gap} min={0} max={120} step={4} onChange={gap => set({ gap })} /></section>
    <section data-part="card"><strong>카드 모양</strong>
      {showMedia && <div className="lb-two-fields"><label className="lb-field">이미지<select value={config.media} onChange={e => set({ media: e.target.value as CardsConfig["media"] })}><option value="top">위</option><option value="left">왼쪽</option><option value="background">배경 + 글 겹침</option><option value="icon">아이콘</option><option value="none">없음</option></select></label>
        <label className="lb-field">비율<select value={config.ratio} onChange={e => set({ ratio: e.target.value as CardsConfig["ratio"] })}><option value="4:3">4:3</option><option value="1:1">1:1</option><option value="3:4">3:4 세로</option><option value="16:9">16:9</option></select></label></div>}
      <div className="lb-two-fields"><label className="lb-field">카드 배경<select value={config.card} onChange={e => set({ card: e.target.value as CardsConfig["card"] })}><option value="none">없음</option><option value="surface">흰 카드</option><option value="subtle">은은한</option><option value="outline">테두리</option><option value="inverse">다크</option></select></label>
        <label className="lb-field">마우스 올리면<select value={config.hover} onChange={e => set({ hover: e.target.value as CardsConfig["hover"] })}><option value="lift">살짝 뜸</option><option value="zoom">이미지 확대</option><option value="none">없음</option></select></label></div>
      <Range label="모서리 둥글기" value={config.radius} min={0} max={40} onChange={radius => set({ radius })} />
      <label className="lb-check"><input type="checkbox" checked={config.meta} onChange={e => set({ meta: e.target.checked })} />카테고리 · 날짜 표시</label></section>
    <section data-part="color"><strong>색상</strong>
      <SurfaceSwatches label="섹션 배경" value={config.surface} onChange={surface => set({ surface })} />
      <label className="lb-field">강조 컬러<select value={config.accent} onChange={e => set({ accent: e.target.value as CardsConfig["accent"] })}>{accents.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}</select></label></section>
    <section data-part="items"><strong>카드 {config.items.length}개</strong>
      <ItemList items={config.items} open={open} onOpen={setOpen} title={item => item.title} field={i => `card:${i}`} max={12} addLabel="카드 추가"
        onAdd={() => { set({ items: [...config.items, cardItem(config.items.length)] }); setOpen(config.items.length); }} onRemove={i => set({ items: config.items.filter((_, j) => j !== i) })}
        render={(item, i) => <>
          <label className="lb-field">제목<input data-field={`card:${i}`} value={item.title} maxLength={60} onChange={e => setItem(i, { title: e.target.value })} /></label>
          <label className="lb-field">설명<textarea rows={2} value={item.text} maxLength={160} onChange={e => setItem(i, { text: e.target.value })} /></label>
          <div className="lb-two-fields"><label className="lb-field">카테고리<input value={item.tag} maxLength={20} onChange={e => setItem(i, { tag: e.target.value })} /></label>
            {config.variant === "stats" ? <label className="lb-field">숫자<input value={item.value} maxLength={16} onChange={e => setItem(i, { value: e.target.value })} /></label>
              : <label className="lb-field">아이콘<select value={item.icon} onChange={e => setItem(i, { icon: e.target.value as HeaderIcon })}><option value="">기본</option><IconOptions /></select></label>}</div>
          {showMedia && config.media !== "icon" && config.media !== "none" && <ImagePicker label="이미지" value={item.image} max={1200} onChange={image => setItem(i, { image })} />}</>} /></section>
    <section data-part="mobile"><strong>모바일</strong>
      <Segment label="폰에서는" value={config.mobileMode} options={[["stack", "1열로 쌓기"], ["two", "2열"], ["swipe", "옆으로 넘기기"]]} onChange={mobileMode => set({ mobileMode })} /></section>
  </div>;
}
