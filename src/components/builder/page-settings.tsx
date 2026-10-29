"use client";

import { useRef } from "react";
import type { PageFrame } from "@/lib/page-layout";
import { ImagePicker } from "./image-picker";
import { useSettingsFocus, type EditFocus } from "./settings-focus";

// Parts clicked on the column's side panel → this panel's aside section.
const sections: Record<string, string> = { "aside-logo": "aside", "aside-title": "aside", "aside-text": "aside", "aside-qr": "aside", "aside-stores": "aside", "aside-cta": "aside", backdrop: "backdrop" };

const widths: Record<Exclude<PageFrame["mode"], "full">, number[]> = { contained: [960, 1080, 1200, 1280], column: [390, 430, 480, 600] };
const backdrops: { value: PageFrame["backdrop"]; label: string; swatch: string }[] = [
  { value: "subtle", label: "은은한", swatch: "var(--color-bg-subtle,#f4f4f6)" },
  { value: "surface", label: "기본", swatch: "var(--color-surface-default,#fff)" },
  { value: "primary", label: "Primary", swatch: "var(--color-primary-default)" },
  { value: "inverse", label: "다크", swatch: "var(--color-surface-inverse,#1d1d22)" },
];

// Page-level width settings, shown when no layer is selected (click the page background or "페이지").
export function PageSettings({ page, onChange, brand, focus }: { page: PageFrame; onChange: (patch: Partial<PageFrame>) => void; brand: string; focus?: EditFocus }) {
  const root = useRef<HTMLDivElement>(null);
  useSettingsFocus(root, focus, sections);
  const pick = (mode: PageFrame["mode"]) => onChange(mode === "full" ? { mode } : { mode, maxWidth: page.mode === mode ? page.maxWidth : mode === "column" ? 480 : 1200 });
  return <div className="lb-hd-settings lb-page-settings" ref={root}>
    <section><strong>PC 페이지 폭</strong><p>레이어를 고르지 않은 상태예요. 화면을 다 채울지, 가운데 컨테이너에 담을지, 모바일 화면을 PC 가운데 세울지 정하세요.</p>
      <div className="lb-page-modes" role="radiogroup" aria-label="PC 페이지 폭">
        {([["full", "화면 가득", "100vw 그대로"], ["contained", "가운데 컨테이너", "배경은 끝까지 · 내용은 가운데"], ["column", "모바일 퍼스트", "폰 화면을 PC 가운데에"]] as const).map(([mode, label, note]) =>
          <button key={mode} type="button" role="radio" aria-checked={page.mode === mode} onClick={() => pick(mode)}><i data-mode={mode} aria-hidden><b /></i>{label}<small>{note}</small></button>)}</div></section>
    {page.mode !== "full" && <section><strong>{page.mode === "column" ? "컬럼 너비" : "컨테이너 최대 너비"}</strong>
      <div className="lb-hd-segment lb-page-widths">{widths[page.mode].map(w => <button key={w} type="button" aria-checked={page.maxWidth === w} role="radio" onClick={() => onChange({ maxWidth: w })}>{w}</button>)}</div>
      <label className="lb-field">직접 입력<span className="lb-range"><input type="range" min={page.mode === "column" ? 320 : 640} max={1440} step={10} value={page.maxWidth} onChange={e => onChange({ maxWidth: Number(e.target.value) })} /><output>{page.maxWidth}px</output></span></label>
      {page.mode === "contained" && <p>점선이 컨테이너 경계예요. 레이어를 골라 &lsquo;컨테이너 무시&rsquo;를 켜면 그 레이어만 끝까지 채워요.</p>}</section>}
    {page.mode === "column" && <section data-part="backdrop"><strong>컬럼 바깥</strong>
      <div className="lb-hd-swatches" role="radiogroup" aria-label="컬럼 바깥 배경">{backdrops.map(b => <button key={b.value} type="button" role="radio" aria-checked={page.backdrop === b.value} onClick={() => onChange({ backdrop: b.value })}><i style={{ background: b.swatch }} />{b.label}</button>)}</div>
      <label className="lb-check"><input type="checkbox" checked={page.aside} onChange={e => onChange({ aside: e.target.checked })} />왼쪽에 브랜드 안내 패널</label>
      <p>PC 화면도 모바일 배치를 그대로 보여 줘요. 여기서 고친 배치는 모바일에 함께 적용돼요.</p></section>}
    {page.mode === "column" && page.aside && <section data-part="aside"><strong>바깥 안내 패널</strong><p>미리보기의 패널 글자나 로고를 누르면 여기로 와요. 로고 자리에 이미지를 끌어다 놓아도 돼요.</p>
      <label className="lb-field">로고 이름<input data-field="aside-logo" value={page.asideLogo} maxLength={40} placeholder={`비우면 헤더 로고 · ${brand}`} onChange={e => onChange({ asideLogo: e.target.value })} /></label>
      <ImagePicker label="로고 이미지" value={page.asideImage} max={600} onChange={asideImage => onChange({ asideImage })} />
      <label className="lb-field">큰 문구<textarea data-field="aside-title" rows={2} value={page.asideTitle} maxLength={80} placeholder="비우면 숨김" onChange={e => onChange({ asideTitle: e.target.value })} /></label>
      <label className="lb-field">설명<textarea data-field="aside-text" rows={2} value={page.asideText} maxLength={160} placeholder="비우면 숨김" onChange={e => onChange({ asideText: e.target.value })} /></label>
      <label className="lb-field">버튼<input data-field="aside-cta" value={page.asideCta} maxLength={24} placeholder="비우면 숨김 · 예: 앱 다운로드" onChange={e => onChange({ asideCta: e.target.value })} /></label>
      <div className="lb-hd-checks"><label className="lb-check"><input data-field="aside-qr" type="checkbox" checked={page.asideQr} onChange={e => onChange({ asideQr: e.target.checked })} />QR 코드</label>
        <label className="lb-check"><input data-field="aside-stores" type="checkbox" checked={page.asideStores} onChange={e => onChange({ asideStores: e.target.checked })} />앱 스토어 배지</label></div>
      <div className="lb-hd-segment" role="radiogroup" aria-label="패널 정렬">{([["start", "왼쪽 정렬"], ["center", "가운데 정렬"]] as const).map(([v, label]) => <button key={v} type="button" role="radio" aria-checked={page.asideAlign === v} onClick={() => onChange({ asideAlign: v })}>{label}</button>)}</div></section>}
  </div>;
}
