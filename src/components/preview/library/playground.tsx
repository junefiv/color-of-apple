"use client";

import { useRef, useEffect, useState, type CSSProperties } from "react";
import { Copy, RotateCcw, Heart } from "lucide-react";
import type { LibraryItemId } from "./catalog";
import { LibraryDemo } from "./demos";
import { KitButton, KitField } from "./primitives";
import { OtpDemo } from "./input-demos";

// Plain serializable options can later drive code, CDN, or prompt exports.
export type ComponentOptions = {
  density: string; variant: string; size: string; shape: string; disabled: boolean; block: boolean;
  checked: boolean; indeterminate: boolean; type: string; value: number; label: string;
};
const defaults: ComponentOptions = { density: "comfortable", variant: "primary", size: "medium", shape: "rounded", disabled: false, block: false, checked: false, indeterminate: false, type: "text", value: 60, label: "Apple" };
const actions = new Set(["button", "icon-button", "button-group"]);
const fields = new Set(["input", "textarea", "select", "slider"]);

function MixedCheckbox({ options, onChange }: { options: ComponentOptions; onChange: (value: boolean) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { if (ref.current) ref.current.indeterminate = options.indeterminate; }, [options.indeterminate]);
  return <label className="lk-choice"><input ref={ref} type="checkbox" checked={options.checked} onChange={event => onChange(event.target.checked)} />{options.label}</label>;
}

export function ComponentPlayground({ id, ko }: { id: LibraryItemId; ko: boolean }) {
  const [options, setOptions] = useState<ComponentOptions>(defaults);
  const [revision, setRevision] = useState(0);
  const set = <K extends keyof ComponentOptions>(key: K, value: ComponentOptions[K]) => setOptions(previous => ({ ...previous, [key]: value }));
  const action = actions.has(id);
  const field = fields.has(id);
  const selection = id === "checkbox";
  const sized = action || field || selection || ["tag", "avatar", "spinner"].includes(id);
  const shaped = action || ["input", "textarea", "card", "tag", "avatar", "skeleton"].includes(id);
  const colored = action || field || selection || ["tag", "progress", "spinner", "alert", "card"].includes(id);
  const disableable = action || field || selection || ["date", "login", "signup", "settings"].includes(id);
  const blockable = action && id !== "icon-button" || ["input", "textarea", "select", "card", "progress"].includes(id);
  function choice<K extends keyof ComponentOptions>(key: K, values: string[]) {
    return <fieldset className="lk-option"><legend>{key}</legend><div className="lk-option-values">{values.map(value => <button type="button" key={value} aria-pressed={options[key] === value} onClick={() => set(key, value as ComponentOptions[K])}>{value}</button>)}</div></fieldset>;
  }
  function toggle(key: "disabled" | "block" | "checked" | "indeterminate") {
    return <label className="lk-option-toggle"><span>{key}</span><input type="checkbox" role="switch" checked={options[key]} onChange={event => set(key, event.target.checked)} /></label>;
  }
  const tone = options.variant as "primary" | "soft" | "danger";
  let preview = <LibraryDemo key={revision} id={id} ko={ko} />;
  if (action) preview = <div className="lk-row">{(id === "button-group" ? [options.label, "Cushion", "Ink"] : [options.label]).map(label => <KitButton key={label} tone={tone} aria-label={id === "icon-button" ? options.label : undefined}>{id === "icon-button" ? <Heart size={18} /> : label}</KitButton>)}</div>;
  if (id === "input") preview = options.type === "otp" ? <div className="lk-stack"><span>{options.label}</span><OtpDemo key={revision} ko={ko} /></div> : <KitField label={options.label}><input key={`${revision}-${options.type}`} type={options.type} placeholder={options.type === "number" ? "42" : "Type something…"} /></KitField>;
  if (id === "select") preview = <KitField label={options.label}><select key={revision} defaultValue="Cushion">{["Apple", "Cushion", "Ink"].map(item => <option key={item}>{item}</option>)}</select></KitField>;
  if (id === "textarea") preview = <KitField label={options.label}><textarea key={revision} rows={3} placeholder={ko ? "생각을 남겨보세요" : "Leave a thought"} /></KitField>;
  if (selection) preview = options.type === "radio" ? <fieldset className="lk-stack"><legend>{options.label}</legend>{["Apple", "Cushion", "Ink"].map((label, i) => <label key={label} className="lk-choice"><input type="radio" name={`playground-${id}`} checked={options.value === i} onChange={() => set("value", i)} />{label}</label>)}</fieldset> : options.type === "switch" ? <label className="lk-choice"><input className="lk-switch" role="switch" type="checkbox" checked={options.checked} onChange={event => set("checked", event.target.checked)} />{options.label}</label> : <MixedCheckbox options={options} onChange={value => setOptions(previous => ({ ...previous, checked: value, indeterminate: false }))} />;
  if (id === "slider") preview = <KitField label={`${options.label} · ${options.value}`}><input type="range" min={0} max={100} value={options.value} style={{ "--lk-range-progress": `${options.value}%` } as CSSProperties} onChange={event => set("value", Number(event.target.value))} /></KitField>;
  if (id === "progress") preview = <div className="lk-stack"><span>{options.label}{!options.indeterminate && ` · ${options.value}%`}</span><progress aria-label={options.label} max={100} value={options.indeterminate ? undefined : options.value} /></div>;
  return <div className="lk-playground">
    <div className="lk-controls" aria-label={ko ? "컴포넌트 설정" : "Component settings"}>
      <div className="lk-controls-heading"><span>{ko ? "설정" : "Customize"}</span><button type="button" className="lk-reset" aria-label={ko ? "설정 초기화" : "Reset settings"} onClick={() => { setOptions(defaults); setRevision(value => value + 1); }}><RotateCcw size={13} /></button></div>
      {choice("density", ["compact", "comfortable"])}
      {colored && choice("variant", ["primary", "soft", "danger"])}
      {sized && choice("size", ["small", "medium", "large"])}
      {shaped && choice("shape", ["rounded", "pill", "square"])}
      {id === "input" && choice("type", ["text", "number", "otp"])}
      {selection && <fieldset className="lk-option"><legend>type</legend><div className="lk-option-values">{["checkbox", "radio", "switch"].map(value => <button key={value} type="button" aria-pressed={(options.type === "text" ? "checkbox" : options.type) === value} onClick={() => setOptions(previous => ({ ...previous, type: value, indeterminate: false, value: 0 }))}>{value}</button>)}</div></fieldset>}
      {(action || field || selection || id === "progress") && <label className="lk-option lk-option-label"><span>label</span><input value={options.label} onChange={event => set("label", event.target.value)} /></label>}
      {disableable && toggle("disabled")}{blockable && toggle("block")}
      {selection && options.type !== "radio" && toggle("checked")}
      {(selection && !["radio", "switch"].includes(options.type) || id === "progress") && toggle("indeterminate")}
      {["slider", "progress"].includes(id) && <label className="lk-option"><span>value <output>{options.value}</output></span><input type="range" min={0} max={100} value={options.value} disabled={id === "progress" && options.indeterminate} onChange={event => set("value", Number(event.target.value))} /></label>}
      {!colored && !sized && !shaped && !disableable && <p className="lk-control-note">{ko ? "미리보기에서 직접 눌러 동작을 확인하세요." : "Interact with the preview to explore its behavior."}</p>}
    </div>
    <div className="lk-preview-panel"><div className="lk-preview-caption"><span><i /> LIVE PREVIEW</span><span>{ko ? "직접 사용해 보세요" : "Try it out"}</span></div>
      <div className="lk-preview-stage"><fieldset disabled={options.disabled} className="lk-configured" data-density={options.density} data-size={sized ? options.size : undefined} data-shape={shaped ? options.shape : undefined} data-variant={colored ? options.variant : undefined} data-block={blockable && options.block || undefined}>{preview}</fieldset></div>
      <footer className="lk-export-bar"><span>{ko ? "내 모양을 그대로 가져가기" : "Take your configuration with you"}</span><button type="button" disabled title={ko ? "복사 기능은 준비 중이에요" : "Copy export is coming soon"}><Copy size={13} />{ko ? "복사 · 준비 중" : "Copy · soon"}</button></footer>
    </div>
  </div>;
}
