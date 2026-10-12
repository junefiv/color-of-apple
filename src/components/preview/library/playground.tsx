"use client";

import { useState, type Dispatch, type DragEvent, type SetStateAction } from "react";
import { revealImage } from "./reveal";
import { ArrowDown, ArrowDownLeft, ArrowDownRight, ArrowLeft, ArrowRight, ArrowUp, ArrowUpLeft, ArrowUpRight, Check, RotateCcw } from "lucide-react";
import type { LibraryItemId } from "./catalog";
import { COMPONENT_SETTINGS, VARIANT_FAMILIES, VARIANT_STEPS, defaultOptions, updateOptions, type SettingValue, type ComponentOptions } from "./settings";
import { ComponentFrame, variantStyle } from "./component-frame";
import { ComponentCodePanel } from "./code-panel";
import { usePreviewTheme } from "../theme-scope";

export type { ComponentOptions } from "./settings";

const DIRECTION_MARKS = [
  ["nw", ArrowUpLeft], ["n", ArrowUp], ["ne", ArrowUpRight],
  ["w", ArrowLeft], ["center", null], ["e", ArrowRight],
  ["sw", ArrowDownLeft], ["s", ArrowDown], ["se", ArrowDownRight],
] as const;

function DirectionPad({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return <div className="lk-option"><span>direction</span><div className="lk-direction" role="group" aria-label="direction">{DIRECTION_MARKS.map(([direction, Icon]) => <button type="button" key={direction} data-direction={direction} aria-label={direction} aria-pressed={value === direction} onClick={() => onChange(direction)}>{Icon ? <Icon size={16} /> : <span className="lk-direction-dot" />}</button>)}</div></div>;
}

function ImageDrop({ value, ko, onChange }: { value: string; ko: boolean; onChange: (value: string) => void }) {
  const [over, setOver] = useState(false);
  const take = (file?: File) => {
    if (!file || !file.type.startsWith("image/")) return;
    void readRevealImage(file).then(url => { if (url) onChange(url); });
  };
  const drop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setOver(false);
    take(Array.from(event.dataTransfer.files).find(file => file.type.startsWith("image/")));
  };
  return <div className="lk-option"><span>image</span><div className="lk-drop" data-over={over || undefined} onDragEnter={event => { event.preventDefault(); setOver(true); }} onDragOver={event => { event.preventDefault(); setOver(true); }} onDragLeave={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOver(false); }} onDrop={drop}>{value ? <img src={value} alt="" /> : null}<p>{ko ? "이미지를 여기로 끌어다 놓으세요" : "Drop an image here"}</p></div>{value ? <button type="button" className="lk-image-clear" onClick={() => onChange("")}>{ko ? "지우기" : "Clear"}</button> : null}</div>;
}

function readRevealImage(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => {
      const original = String(reader.result ?? "");
      const image = new Image();
      image.onload = () => {
        let edge = 1280;
        let quality = 0.84;
        for (let attempt = 0; attempt < 4; attempt += 1) {
          const scale = Math.min(1, edge / Math.max(image.width, image.height, 1));
          const canvas = document.createElement("canvas");
          canvas.width = Math.max(1, Math.round(image.width * scale));
          canvas.height = Math.max(1, Math.round(image.height * scale));
          const context = canvas.getContext("2d");
          if (!context) {
            resolve(revealImage(original) === original ? original : "");
            return;
          }
          context.fillStyle = "#12160e";
          context.fillRect(0, 0, canvas.width, canvas.height);
          context.drawImage(image, 0, 0, canvas.width, canvas.height);
          const url = canvas.toDataURL("image/jpeg", quality);
          if (revealImage(url) === url) {
            resolve(url);
            return;
          }
          edge = Math.round(edge * 0.72);
          quality = 0.7;
        }
        resolve("");
      };
      image.onerror = () => reject(new Error("image"));
      image.src = original;
    };
    reader.readAsDataURL(file);
  });
}

export function ComponentPlayground({ id, ko, compact = false, options: controlledOptions, onOptionsChange, onCopied }: { id: LibraryItemId; ko: boolean; compact?: boolean; options?: ComponentOptions; onOptionsChange?: Dispatch<SetStateAction<ComponentOptions>>; onCopied?: () => void }) {
  const theme = usePreviewTheme();
  const [localOptions, setLocalOptions] = useState(() => defaultOptions(id));
  const options = controlledOptions ?? localOptions;
  const setOptions = onOptionsChange ?? setLocalOptions;
  const [revision, setRevision] = useState(0);
  const set = (key: string, value: SettingValue) => setOptions(previous => updateOptions(id, previous, key, value));
  const variantLegend = id === "image-reveal" ? (ko ? "글자색" : "Text color") : "Variant";
  const variantField = options.variant ? <fieldset className="lk-option lk-variant-option"><legend>{variantLegend}</legend><div className="lk-variant-families">{VARIANT_FAMILIES.map(family => <div className="lk-variant-family" role="group" aria-label={family} key={family}><span className="lk-variant-family-label">{family[0].toUpperCase() + family.slice(1)}</span><div className="lk-variant-swatches">{VARIANT_STEPS.map(step => {
    const value = `${family}-${step}`;
    return <button type="button" key={value} data-variant={value} style={variantStyle(value, theme)} title={value} aria-label={value} aria-pressed={options.variant === value} onClick={() => set("variant", value)}><span>{options.variant === value && <Check size={14} strokeWidth={2.5} aria-hidden />}</span></button>;
  })}</div></div>)}</div></fieldset> : null;
  return <div className="library-kit lk-component-scope lk-playground" data-compact={compact || undefined}>
    <div className="lk-preview-panel">
      {!compact && <button type="button" className="lk-reset lk-preview-reset" title={ko ? "설정 초기화" : "Reset settings"} aria-label={ko ? "설정 초기화" : "Reset settings"} onClick={() => { setOptions(defaultOptions(id)); setRevision(value => value + 1); }}><RotateCcw size={13} /></button>}
      <div className="lk-preview-stage"><ComponentFrame key={revision} id={id} options={options} onOptionChange={set} ko={ko} /></div></div>
    {!compact && <div className="lk-controls" data-has-variant={Boolean(options.variant)} aria-label={ko ? "컴포넌트 설정" : "Component settings"}>
      {id === "image-reveal" && variantField}
      <div className="lk-other-settings">{COMPONENT_SETTINGS[id].filter(setting => setting.key !== "variant").map(setting => {
        const { key, kind } = setting;
        if (kind === "boolean") return <label className="lk-option-toggle" key={key}><span>{key}</span><input type="checkbox" checked={Boolean(options[key])} onChange={event => set(key, event.target.checked)} /></label>;
        if (kind === "number") return <label className="lk-option lk-option-label" key={key}><span>{key}</span><input type="number" min={setting.min} max={setting.max} step={1} value={Number(options[key])} onChange={event => set(key, event.target.valueAsNumber)} /></label>;
        if (kind === "image") return <ImageDrop key={key} value={String(options[key] ?? "")} ko={ko} onChange={url => set(key, url)} />;
        if (kind === "direction") return <DirectionPad key={key} value={String(options[key] ?? "")} onChange={value => set(key, value)} />;
        return <label className="lk-option lk-option-label" key={key}><span>{key}</span>{kind === "select" ? <select value={String(options[key])} onChange={event => set(key, event.target.value)}>{setting.values!.map(value => <option key={value} value={value}>{value || "Select..."}</option>)}</select> : <input type="text" value={String(options[key])} onChange={event => set(key, event.target.value)} />}</label>;
      })}</div>
      {id !== "image-reveal" && variantField}
    </div>}
    {!compact && <ComponentCodePanel id={id} options={options} theme={theme} ko={ko} onCopied={onCopied} />}
  </div>;
}
