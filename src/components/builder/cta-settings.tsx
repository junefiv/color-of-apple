"use client";

import { useRef, useState } from "react";
import type { CtaConfig, CtaContact } from "@/lib/cta-config";
import type { HeaderIcon } from "@/lib/header-config";
import { accents } from "./header-settings";
import { IconOptions } from "./icons";
import { ImagePicker } from "./image-picker";
import { useSettingsFocus, type EditFocus } from "./settings-focus";
import { ItemList, Range, Segment, SurfaceSwatches } from "./settings-kit";

const sections: Record<string, string> = { frame: "layout", eyebrow: "copy", title: "copy", text: "copy", countdown: "copy", buttons: "buttons", image: "layout", contacts: "contacts" };

export function CtaSettings({ config, onChange, focus }: { config: CtaConfig; onChange: (next: CtaConfig) => void; focus?: EditFocus }) {
  const root = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(-1);
  useSettingsFocus(root, focus, sections);
  const set = (patch: Partial<CtaConfig>) => onChange({ ...config, ...patch });
  const setContact = (i: number, patch: Partial<CtaContact>) => set({ contacts: config.contacts.map((c, j) => j === i ? { ...c, ...patch } : c) });
  const text = (key: "eyebrow" | "title" | "primary" | "secondary" | "countdownLabel", label: string, max: number, field = key as string) => <label className="lb-field">{label}<input data-field={field} value={config[key]} maxLength={max} placeholder="비우면 숨김" onChange={e => set({ [key]: e.target.value })} /></label>;
  return <div className="lb-hd-settings" ref={root}>
    <section data-part="layout"><strong>구성</strong>
      <Segment label="배치" value={config.layout} options={[["center", "가운데"], ["inline", "한 줄"], ["split", "분할"], ["cards", "연락 카드"]]} onChange={layout => set({ layout })} />
      <label className="lb-check"><input type="checkbox" checked={config.boxed} onChange={e => set({ boxed: e.target.checked })} />둥근 박스로 감싸기</label>
      <ImagePicker label={config.layout === "split" ? "오른쪽 이미지" : "배경 이미지"} value={config.image} max={1800} field="image" onChange={image => set({ image })} /></section>
    <section data-part="copy"><strong>문구</strong>
      {text("eyebrow", "작은 머리말", 40)}{text("title", "제목", 80)}
      <label className="lb-field">설명<textarea data-field="text" rows={2} value={config.text} maxLength={200} placeholder="비우면 숨김" onChange={e => set({ text: e.target.value })} /></label>
      <label className="lb-check"><input data-field="countdown" type="checkbox" checked={config.countdown} onChange={e => set({ countdown: e.target.checked })} />마감 카운트다운</label>
      {config.countdown && text("countdownLabel", "카운트다운 문구", 30)}</section>
    <section data-part="buttons"><strong>버튼</strong>
      <div className="lb-two-fields">{text("primary", "주 버튼", 24, "buttons")}{text("secondary", "보조 버튼", 24)}</div>
      <Range label="모서리 둥글기" value={config.buttonRadius} min={0} max={40} onChange={buttonRadius => set({ buttonRadius })} /></section>
    <section data-part="color"><strong>색상</strong><p>배경 이미지가 있으면 글자는 밝게 반전돼요.</p>
      <SurfaceSwatches label="CTA 배경" value={config.surface} onChange={surface => set({ surface })} />
      <label className="lb-field">강조 컬러<select value={config.accent} onChange={e => set({ accent: e.target.value as CtaConfig["accent"] })}>{accents.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}</select></label></section>
    {config.layout === "cards" && <section data-part="contacts"><strong>연락 카드</strong>
      <ItemList items={config.contacts} open={open} onOpen={setOpen} title={c => c.label} field={i => `contact:${i}`} max={6} addLabel="연락 수단 추가"
        onAdd={() => { set({ contacts: [...config.contacts, { label: "새 연락 수단", value: "", icon: "" }] }); setOpen(config.contacts.length); }} onRemove={i => set({ contacts: config.contacts.filter((_, j) => j !== i) })}
        render={(c, i) => <><div className="lb-two-fields"><label className="lb-field">이름<input value={c.label} maxLength={30} onChange={e => setContact(i, { label: e.target.value })} /></label>
          <label className="lb-field">아이콘<select value={c.icon} onChange={e => setContact(i, { icon: e.target.value as HeaderIcon })}><option value="">기본</option><IconOptions /></select></label></div>
          <label className="lb-field">내용<input value={c.value} maxLength={60} onChange={e => setContact(i, { value: e.target.value })} /></label></>} /></section>}
  </div>;
}
