"use client";

import { ChevronDown, ChevronRight, Plus, Trash2 } from "lucide-react";
import type { ReactNode } from "react";
import type { SectionSurface } from "@/lib/section-surface";
import { surfaces } from "./header-settings";

// Building blocks shared by the component settings panels.
export function SurfaceSwatches({ value, onChange, label, allow = ["surface", "subtle", "primary", "secondary", "inverse"] }: { value: string; onChange: (surface: Exclude<SectionSurface, "transparent">) => void; label: string; allow?: string[] }) {
  return <div className="lb-hd-swatches" role="radiogroup" aria-label={label}>{surfaces.filter(s => allow.includes(s.value)).map(s =>
    <button key={s.value} type="button" role="radio" aria-checked={value === s.value} onClick={() => onChange(s.value as Exclude<SectionSurface, "transparent">)}><i style={{ background: s.swatch }} />{s.label}</button>)}</div>;
}

export function Range({ label, value, min, max, step = 1, unit = "px", onChange }: { label: string; value: number; min: number; max: number; step?: number; unit?: string; onChange: (n: number) => void }) {
  return <label className="lb-field">{label}<span className="lb-range"><input type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(Number(e.target.value))} /><output>{value}{unit}</output></span></label>;
}

export function Segment<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: readonly (readonly [T, string])[]; onChange: (v: T) => void }) {
  return <div className="lb-field">{label}<div className="lb-hd-segment" role="radiogroup" aria-label={label} style={{ gridTemplateColumns: `repeat(${options.length},1fr)` }}>
    {options.map(([v, text]) => <button key={v} type="button" role="radio" aria-checked={value === v} onClick={() => onChange(v)}>{text}</button>)}</div></div>;
}

// A collapsible list of editable rows (cards, contacts, quick-menu items).
export function ItemList<T>({ items, open, onOpen, title, render, onAdd, onRemove, max, addLabel, field }: {
  items: T[]; open: number; onOpen: (i: number) => void; title: (item: T, i: number) => string; render: (item: T, i: number) => ReactNode;
  onAdd: () => void; onRemove: (i: number) => void; max: number; addLabel: string; field: (i: number) => string;
}) {
  return <><ul className="lb-hd-children lb-item-list">{items.map((item, i) => <li key={i}>
    <div className="lb-hd-child-row"><button type="button" aria-expanded={open === i} aria-label={open === i ? "접기" : "펼치기"} onClick={() => onOpen(open === i ? -1 : i)}>{open === i ? <ChevronDown size={11} /> : <ChevronRight size={11} />}</button>
      <button type="button" className="lb-item-title" data-field={open === i ? undefined : field(i)} onClick={() => onOpen(open === i ? -1 : i)}>{title(item, i) || `${i + 1}번`}</button>
      {items.length > 1 && <button type="button" aria-label={`${i + 1}번 삭제`} onClick={() => onRemove(i)}><Trash2 size={11} /></button>}</div>
    {open === i && <div className="lb-hd-child-detail">{render(item, i)}</div>}</li>)}</ul>
    {items.length < max && <button type="button" className="lb-hd-add lb-hd-add-child" onClick={onAdd}><Plus size={11} />{addLabel}</button>}</>;
}
