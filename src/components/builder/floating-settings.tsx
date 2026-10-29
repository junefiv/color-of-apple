"use client";

import { useRef, useState } from "react";
import { floatingTexts } from "@/lib/component-texts";
import { TextOverrides } from "./text-overrides";
import type { FloatingConfig } from "@/lib/floating-config";
import type { HeaderIcon } from "@/lib/header-config";
import { IconOptions } from "./icons";
import { useSettingsFocus, type EditFocus } from "./settings-focus";
import { ItemList, Segment } from "./settings-kit";

const sections: Record<string, string> = { frame: "kind", label: "label", items: "items" };
const kindOptions = <><option value="rail">세로 퀵메뉴</option><option value="top">맨 위로 버튼</option><option value="fab">원형 버튼</option><option value="pill">알약 버튼</option><option value="chat">채팅 상담</option><option value="tabbar">하단 탭바</option></>;

export function FloatingSettings({ config, onChange, focus }: { config: FloatingConfig; onChange: (next: FloatingConfig) => void; focus?: EditFocus }) {
  const root = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(-1);
  useSettingsFocus(root, focus, sections);
  const set = (patch: Partial<FloatingConfig>) => onChange({ ...config, ...patch });
  const setItem = (i: number, patch: Partial<FloatingConfig["items"][number]>) => set({ items: config.items.map((item, j) => j === i ? { ...item, ...patch } : item) });
  const usesItems = [config.kind, config.mobileKind].some(k => k === "rail" || k === "tabbar");
  return <div className="lb-hd-settings" ref={root}>
    <section data-part="kind"><strong>모양과 위치</strong>
      <div className="lb-two-fields"><label className="lb-field">PC<select value={config.kind} onChange={e => set({ kind: e.target.value as FloatingConfig["kind"] })}>{kindOptions}</select></label>
        <label className="lb-field">모바일<select value={config.mobileKind} onChange={e => set({ mobileKind: e.target.value as FloatingConfig["mobileKind"] })}>{kindOptions}<option value="hidden">숨김</option></select></label></div>
      <Segment label="가로 위치" value={config.side} options={[["right", "오른쪽"], ["left", "왼쪽"]]} onChange={side => set({ side })} />
      <Segment label="세로 위치" value={config.vertical} options={[["bottom", "아래"], ["center", "가운데"]]} onChange={vertical => set({ vertical })} />
      <Segment label="색" value={config.surface} options={[["primary", "Primary"], ["surface", "흰색"], ["inverse", "다크"]]} onChange={surface => set({ surface })} />
      <Segment label="모서리" value={config.shape} options={[["circle", "원"], ["rounded", "둥근 사각"], ["pill", "알약"]]} onChange={shape => set({ shape })} /></section>
    <section data-part="label"><strong>문구</strong>
      <label className="lb-field">버튼 문구<input data-field="label" value={config.label} maxLength={30} onChange={e => set({ label: e.target.value })} /></label>
      <label className="lb-field">배지<input value={config.badge} maxLength={10} placeholder="예: D-3 · 비우면 숨김" onChange={e => set({ badge: e.target.value })} /></label>
      <TextOverrides defs={floatingTexts} texts={config.texts} onChange={texts => set({ texts })} /></section>
    {usesItems && <section data-part="items"><strong>메뉴 항목</strong>
      <ItemList items={config.items} open={open} onOpen={setOpen} title={item => item.label} field={i => `item:${i}`} max={6} addLabel="항목 추가"
        onAdd={() => { set({ items: [...config.items, { label: "새 메뉴", icon: "star" }] }); setOpen(config.items.length); }} onRemove={i => set({ items: config.items.filter((_, j) => j !== i) })}
        render={(item, i) => <div className="lb-two-fields"><label className="lb-field">이름<input value={item.label} maxLength={20} onChange={e => setItem(i, { label: e.target.value })} /></label>
          <label className="lb-field">아이콘<select value={item.icon} onChange={e => setItem(i, { icon: e.target.value as HeaderIcon })}><option value="">기본</option><IconOptions /></select></label></div>} /></section>}
  </div>;
}
