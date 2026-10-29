"use client";

import { useRef } from "react";
import { footerTexts } from "@/lib/component-texts";
import { TextOverrides } from "./text-overrides";
import type { FooterConfig } from "@/lib/footer-config";
import { ImagePicker } from "./image-picker";
import { useSettingsFocus, type EditFocus } from "./settings-focus";
import { Segment, SurfaceSwatches } from "./settings-kit";

const sections: Record<string, string> = { frame: "layout", brand: "brand", info: "brand", legal: "brand", lead: "lead", sitemap: "layout", sns: "extras", extras: "extras" };
const commaList = (value: string) => value.split(",").map(s => s.trim()).filter(Boolean).slice(0, 8).map(s => s.slice(0, 30));

export function FooterSettings({ config, onChange, focus }: { config: FooterConfig; onChange: (next: FooterConfig) => void; focus?: EditFocus }) {
  const root = useRef<HTMLDivElement>(null);
  useSettingsFocus(root, focus, sections);
  const set = (patch: Partial<FooterConfig>) => onChange({ ...config, ...patch });
  const check = (key: "sitemap" | "sns" | "familySite" | "backToTop", label: string) => <label className="lb-check"><input type="checkbox" checked={config[key]} onChange={e => set({ [key]: e.target.checked })} />{label}</label>;
  return <div className="lb-hd-settings" ref={root}>
    <section data-part="layout"><strong>구성</strong>
      <Segment label="배치" value={config.layout} options={[["info", "정보형"], ["columns", "사이트맵"], ["minimal", "한 줄"], ["poster", "워드마크"]]} onChange={layout => set({ layout })} />
      {config.layout !== "info" && config.layout !== "minimal" && check("sitemap", "헤더 메뉴를 열로 보여 주기")}
      <SurfaceSwatches label="푸터 배경" value={config.surface} onChange={surface => set({ surface })} /></section>
    <section data-part="lead"><strong>위에 얹는 블록</strong>
      <Segment label="종류" value={config.lead} options={[["none", "없음"], ["cta", "문의"], ["slogan", "슬로건"], ["newsletter", "구독"]]} onChange={lead => set({ lead })} />
      {config.lead !== "none" && <><label className="lb-field">제목<input data-field="lead" value={config.leadTitle} maxLength={60} onChange={e => set({ leadTitle: e.target.value })} /></label>
        {config.lead !== "slogan" && <label className="lb-field">설명<input value={config.leadText} maxLength={120} onChange={e => set({ leadText: e.target.value })} /></label>}
        {(config.lead === "cta" || config.lead === "newsletter") && <label className="lb-field">버튼 문구<input value={config.leadCta} maxLength={24} onChange={e => set({ leadCta: e.target.value })} /></label>}</>}</section>
    <section data-part="brand"><strong>브랜드와 정보</strong>
      <label className="lb-field">로고 이름<input data-field="brand" value={config.logoText} maxLength={40} onChange={e => set({ logoText: e.target.value })} /></label>
      <ImagePicker label="로고 이미지" value={config.logoImage} max={600} onChange={logoImage => set({ logoImage })} />
      <label className="lb-field">회사 정보<textarea data-field="info" rows={4} value={config.info} maxLength={400} onChange={e => set({ info: e.target.value })} /></label>
      <label className="lb-field">정책 링크<input data-field="legal" key={config.legal.join("|")} defaultValue={config.legal.join(", ")} placeholder="쉼표로 구분" onKeyDown={e => { if (e.key === "Enter") e.currentTarget.blur(); }}
        onBlur={e => { const legal = commaList(e.target.value); if (legal.join("|") !== config.legal.join("|")) set({ legal }); }} /></label>
      <label className="lb-field">저작권 문구<input value={config.copyright} maxLength={80} onChange={e => set({ copyright: e.target.value })} /></label></section>
    <section data-part="extras"><strong>부가 요소</strong>
      <div className="lb-hd-checks">{check("sns", "SNS 아이콘")}{check("familySite", "패밀리 사이트")}{check("backToTop", "맨 위로 버튼")}</div>
      <TextOverrides defs={footerTexts} texts={config.texts} onChange={texts => set({ texts })} /></section>
    <section data-part="mobile"><strong>모바일</strong>
      <Segment label="사이트맵 열" value={config.mobileColumns} options={[["accordion", "아코디언"], ["two", "2열"], ["stack", "1열"]]} onChange={mobileColumns => set({ mobileColumns })} /></section>
  </div>;
}
