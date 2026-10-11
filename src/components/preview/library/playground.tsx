"use client";

import { useState, type CSSProperties } from "react";
import { Check, RotateCcw } from "lucide-react";
import type { LibraryItemId } from "./catalog";
import { COMPONENT_SETTINGS, VARIANT_FAMILIES, VARIANT_STEPS, defaultOptions, updateOptions, type SettingValue } from "./settings";
import { ConfiguredComponent } from "./configured-component";
import { KitSwitch } from "./primitives";
export type { ComponentOptions } from "./settings";

function variantStyle(value: string): CSSProperties {
  return { "--lk-primary": `var(--color-${value}, var(--color-primary-default, #b64d50))`, "--lk-on": `var(--color-${value}-on, #fff)` } as CSSProperties;
}

// Existing effects are owned by individual components, not a catalog-wide theme.
const COMPONENT_EFFECTS: Partial<Record<LibraryItemId, "cushion" | "ink">> = {
  button: "cushion", "icon-button": "cushion", range: "cushion", slider: "cushion",
  input: "ink", textarea: "ink", otp: "ink",
};

export function ComponentPlayground({ id, ko, compact = false }: { id: LibraryItemId; ko: boolean; compact?: boolean }) {
  const [options, setOptions] = useState(() => defaultOptions(id));
  const [revision, setRevision] = useState(0);
  const set = (key: string, value: SettingValue) => setOptions(previous => updateOptions(id, previous, key, value));
  return <div className="library-kit lk-component-scope lk-playground" data-library={COMPONENT_EFFECTS[id]} data-compact={compact || undefined}>
    <div className="lk-preview-panel">
      {!compact && <button type="button" className="lk-reset lk-preview-reset" title={ko ? "설정 초기화" : "Reset settings"} aria-label={ko ? "설정 초기화" : "Reset settings"} onClick={() => { setOptions(defaultOptions(id)); setRevision(value => value + 1); }}><RotateCcw size={13} /></button>}
      <div className="lk-preview-stage"><div className="lk-configured" style={options.variant ? variantStyle(String(options.variant)) : undefined} data-size={options.size} data-shape={options.shape} data-variant={options.variant} data-block={options.block || undefined} data-component-kind={id}>
      <ConfiguredComponent key={revision} id={id} options={options} onOptionChange={set} ko={ko} />
    </div></div></div>
    {!compact && <div className="lk-controls" data-has-variant={Boolean(options.variant)} aria-label={ko ? "컴포넌트 설정" : "Component settings"}>
      <div className="lk-other-settings">{COMPONENT_SETTINGS[id].filter(setting => setting.key !== "variant").map(setting => {
        const { key, kind } = setting;
        if (kind === "boolean") return <label className="lk-option-toggle" key={key}><span>{key}</span><KitSwitch checked={Boolean(options[key])} onChange={event => set(key, event.target.checked)} /></label>;
        return <label className="lk-option lk-option-label" key={key}><span>{key}</span>{kind === "select" ? <select value={String(options[key])} onChange={event => set(key, event.target.value)}>{setting.values!.map(value => <option key={value} value={value}>{value || "Select..."}</option>)}</select> : kind === "color" ? <div className="lk-row"><input type="color" aria-label="accent" value={String(options[key]) || "#0077cc"} onChange={event => set(key, event.target.value)} /><button type="button" className="lk-reset" title="Use palette accent" aria-label="Use palette accent" onClick={() => set(key, "")}><RotateCcw size={13} /></button></div> : <input type={kind === "number" ? "number" : "text"} value={String(options[key])} min={setting.min} max={key === "page" ? Number(options.total) : setting.max} step={key === "step" ? "any" : 1} onChange={event => {
          if (kind !== "number") { set(key, event.target.value); return; }
          const value = event.currentTarget.valueAsNumber;
          if (!Number.isFinite(value)) return;
          set(key, Math.max(setting.min ?? -Infinity, Math.min(setting.max ?? Infinity, value)));
        }} />}</label>;
      })}</div>
      {options.variant && <fieldset className="lk-option lk-variant-option"><legend>Variant</legend><div className="lk-variant-families">{VARIANT_FAMILIES.map(family => <div className="lk-variant-family" role="group" aria-label={family} key={family}><span className="lk-variant-family-label">{family[0].toUpperCase() + family.slice(1)}</span><div className="lk-variant-swatches">{VARIANT_STEPS.map(step => {
        const value = `${family}-${step}`;
        return <button type="button" key={value} data-variant={value} style={variantStyle(value)} title={value} aria-label={value} aria-pressed={options.variant === value} onClick={() => set("variant", value)}><span>{options.variant === value && <Check size={14} strokeWidth={2.5} aria-hidden />}</span></button>;
      })}</div></div>)}</div></fieldset>}
    </div>}
  </div>;
}
