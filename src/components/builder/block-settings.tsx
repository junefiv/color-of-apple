"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { sectionOf, type BlockSpec, type Config, type Field } from "@/lib/block-schema";
import type { HeaderIcon } from "@/lib/header-config";
import { accents } from "./header-settings";
import { IconOptions } from "./icons";
import { ImagePicker } from "./image-picker";
import { useSettingsFocus, type EditFocus } from "./settings-focus";
import { ItemList, Range, Segment, SurfaceSwatches } from "./settings-kit";

// Settings panel for any schema-described block. Inputs carry data-field with the same key the
// preview marks with data-edit, so clicking a part in the preview lands on its input.
export function BlockSettings({ spec, config, onChange, focus }: { spec: BlockSpec; config: Config; onChange: (next: Config) => void; focus?: EditFocus }) {
  const root = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState<Record<string, number>>({});
  const sections = useMemo(() => {
    const map: Record<string, string> = { frame: spec.sections.find(s => !s.fields.some(f => f.type === "list"))?.part ?? spec.sections[0].part };
    for (const s of spec.sections) for (const f of s.fields) map[f.key] = s.part;
    return map;
  }, [spec]);
  // Clicking a list item in the preview ("items:2") opens that item's editor.
  useEffect(() => {
    if (!focus) return;
    const [key, index] = focus.part.split(":");
    if (index !== undefined && sectionOf(spec, focus.part)) setOpen(o => ({ ...o, [key]: Number(index) }));
  }, [focus, spec]);
  useSettingsFocus(root, focus, sections);
  const set = (key: string, value: unknown) => onChange({ ...config, [key]: value });

  function field(f: Field, value: unknown, change: (v: unknown) => void, fieldId: string) {
    switch (f.type) {
      case "text": return f.multiline
        ? <label key={f.key} className="lb-field">{f.label}<textarea data-field={fieldId} rows={3} value={String(value ?? "")} maxLength={f.max} placeholder={f.placeholder} onChange={e => change(e.target.value)} /></label>
        : <label key={f.key} className="lb-field">{f.label}<input data-field={fieldId} value={String(value ?? "")} maxLength={f.max} placeholder={f.placeholder} onChange={e => change(e.target.value)} /></label>;
      case "select": return <label key={f.key} className="lb-field">{f.label}<select data-field={fieldId} value={String(value)} onChange={e => change(e.target.value)}>{f.options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></label>;
      case "segment": return <Segment key={f.key} label={f.label} value={String(value)} options={f.options} onChange={change} />;
      case "range": return <Range key={f.key} label={f.label} value={Number(value)} min={f.min} max={f.max} step={f.step} unit={f.unit} onChange={change} />;
      case "check": return <label key={f.key} className="lb-check"><input data-field={fieldId} type="checkbox" checked={Boolean(value)} onChange={e => change(e.target.checked)} />{f.label}</label>;
      case "image": return <ImagePicker key={f.key} label={f.label} value={String(value ?? "")} max={f.max ?? 1600} field={fieldId} onChange={change} />;
      case "surface": return <SurfaceSwatches key={f.key} label={f.label} value={String(value)} onChange={change} />;
      case "accent": return <label key={f.key} className="lb-field">{f.label}<select value={String(value)} onChange={e => change(e.target.value)}>{accents.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}</select></label>;
      case "icon": return <label key={f.key} className="lb-field">{f.label}<select value={String(value ?? "")} onChange={e => change(e.target.value as HeaderIcon)}><option value="">없음</option><IconOptions /></select></label>;
      case "list": {
        const items = Array.isArray(value) ? (value as Config[]) : [];
        const setItem = (i: number, key: string, v: unknown) => change(items.map((item, j) => j === i ? { ...item, [key]: v } : item));
        return <div key={f.key} className="lb-block-list"><small>{f.label} {items.length}개</small>
          <ItemList items={items} open={open[f.key] ?? -1} onOpen={i => setOpen(o => ({ ...o, [f.key]: i }))} title={item => String(item[f.title] ?? "")} field={i => `${f.key}:${i}`} max={f.max} addLabel={f.add}
            onAdd={() => { change([...items, f.make(items.length)]); setOpen(o => ({ ...o, [f.key]: items.length })); }}
            onRemove={i => { if (items.length > (f.min ?? 0)) change(items.filter((_, j) => j !== i)); }}
            render={(item, i) => <>{f.item.map((sub, k) => field(sub, item[sub.key], v => setItem(i, sub.key, v), k === 0 ? `${f.key}:${i}` : `${f.key}:${i}:${sub.key}`))}</>} /></div>;
      }
    }
  }

  return <div className="lb-hd-settings" ref={root}>
    {spec.sections.filter(s => !s.show || s.show(config)).map(s => <section key={s.part} data-part={s.part}><strong>{s.title}</strong>{s.note && <p>{s.note}</p>}
      {s.fields.map(f => field(f, config[f.key], v => set(f.key, v), f.key))}</section>)}
  </div>;
}
