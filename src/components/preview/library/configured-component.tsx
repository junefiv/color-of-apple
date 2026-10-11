"use client";

import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
import { Heart, X, ChevronLeft, ChevronRight, Copy } from "lucide-react";
import { Slider } from "@base-ui/react/slider";
import { Tabs } from "@base-ui/react/tabs";
import { Select } from "@base-ui/react/select";
import { Accordion } from "@base-ui/react/accordion";
import { Dialog } from "@base-ui/react/dialog";
import { Menu } from "@base-ui/react/menu";
import { Popover } from "@base-ui/react/popover";
import { Tooltip } from "@base-ui/react/tooltip";
import type { LibraryItemId } from "./catalog";
import type { ComponentOptions, SettingValue } from "./settings";
import { KitButton, KitField, KitSwitch } from "./primitives";
import { OtpDemo } from "./input-demos";

type Props = { id: LibraryItemId; options: ComponentOptions; onOptionChange: (key: string, value: SettingValue) => void; ko: boolean };

function Resizable({ direction }: { direction: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [sizes, setSizes] = useState({ x: 50, y: 50 });
  const both = direction === "both";
  const vertical = direction === "vertical";
  const clamp = (value: number) => Math.max(20, Math.min(80, value));
  function handle(axis: "x" | "y") {
    return <div key={axis} className={`lk-resize-handle lk-resize-${axis}`} role="separator" aria-label={axis === "x" ? "Resize columns" : "Resize rows"} aria-orientation={axis === "x" ? "vertical" : "horizontal"} aria-valuemin={20} aria-valuemax={80} aria-valuenow={Math.round(sizes[axis])} tabIndex={0}
      onPointerDown={event => { event.currentTarget.setPointerCapture(event.pointerId); }}
      onPointerMove={event => {
        if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
        const rect = ref.current!.getBoundingClientRect();
        const value = axis === "x" ? (event.clientX - rect.left) / rect.width * 100 : (event.clientY - rect.top) / rect.height * 100;
        setSizes(previous => ({ ...previous, [axis]: clamp(value) }));
      }} onPointerUp={event => event.currentTarget.releasePointerCapture(event.pointerId)}
      onKeyDown={event => {
        const minus = axis === "x" ? "ArrowLeft" : "ArrowUp";
        const plus = axis === "x" ? "ArrowRight" : "ArrowDown";
        if (![minus, plus, "Home", "End"].includes(event.key)) return;
        event.preventDefault();
        setSizes(previous => ({ ...previous, [axis]: event.key === "Home" ? 20 : event.key === "End" ? 80 : clamp(previous[axis] + (event.key === minus ? -2 : 2)) }));
      }} />;
  }
  return <div ref={ref} className="lk-resizable" data-direction={direction} style={{ "--lk-split-x": `${sizes.x}%`, "--lk-split-y": `${sizes.y}%` } as CSSProperties}>
    <div className="lk-resize-pane">One</div><div className="lk-resize-pane">Two</div>{both && <><div className="lk-resize-pane">Three</div><div className="lk-resize-pane">Four</div></>}
    {(!vertical || both) && handle("x")}{(vertical || both) && handle("y")}
  </div>;
}

function Overlay({ id, options, onOptionChange, ko }: Props) {
  const container = useRef<HTMLDivElement>(null);
  const placement = String(options.placement ?? "bottom");
  const side = (placement === "start" ? "inline-start" : placement === "end" ? "inline-end" : placement) as "top" | "bottom" | "left" | "right" | "inline-start" | "inline-end";
  const [notice, setNotice] = useState("");
  const popupProps = { className: "lk-overlay lk-stack", "data-size": String(options.size ?? "medium") };
  if (id === "dialog" || id === "drawer") return <div ref={container}><Dialog.Root open={Boolean(options.open)} onOpenChange={open => onOptionChange("open", open)}>
    <Dialog.Trigger className="lk-button">{ko ? "열기" : "Open"}</Dialog.Trigger>
    <Dialog.Portal container={container}><Dialog.Backdrop className="lk-overlay-backdrop" /><Dialog.Popup className={`lk-overlay lk-modal lk-stack ${id === "drawer" ? "lk-drawer" : ""}`} data-side={options.side}>
      <header className="lk-row"><Dialog.Title>{String(options.label)}</Dialog.Title><Dialog.Close className="lk-icon-control" aria-label="Close"><X size={18} /></Dialog.Close></header>
      <Dialog.Description>{ko ? "워크스페이스 설정" : "Workspace settings"}</Dialog.Description><KitField label="Name"><input defaultValue="Apple" /></KitField>
      <Dialog.Close className="lk-button">{ko ? "완료" : "Done"}</Dialog.Close>
    </Dialog.Popup></Dialog.Portal>
  </Dialog.Root></div>;
  if (id === "menu") return <div ref={container} className="lk-stack"><Menu.Root><Menu.Trigger className="lk-button">Actions</Menu.Trigger><Menu.Portal container={container}><Menu.Positioner side={side} sideOffset={10} className="lk-positioner"><Menu.Popup {...popupProps}>
    {["Edit", "Duplicate", "Delete"].map(value => <Menu.Item key={value} className="lk-menu-item" onClick={() => setNotice(value)}>{value}</Menu.Item>)}
  </Menu.Popup></Menu.Positioner></Menu.Portal></Menu.Root><output role="status">{notice}</output></div>;
  if (id === "popover") return <div ref={container}><Popover.Root><Popover.Trigger className="lk-button">Options</Popover.Trigger><Popover.Portal container={container}><Popover.Positioner side={side} sideOffset={10} className="lk-positioner"><Popover.Popup {...popupProps}>
    <Popover.Title>{String(options.label)}</Popover.Title><Popover.Description>Apple workspace</Popover.Description><KitField label="Note"><input placeholder="Apple" /></KitField><Popover.Close className="lk-icon-control" aria-label="Close"><X size={18} /></Popover.Close>
  </Popover.Popup></Popover.Positioner></Popover.Portal></Popover.Root></div>;
  return <div ref={container}><Tooltip.Provider delay={0}><Tooltip.Root><Tooltip.Trigger className="lk-button" aria-label="Copy link"><Copy size={18} /></Tooltip.Trigger><Tooltip.Portal container={container}><Tooltip.Positioner side={side} sideOffset={10} className="lk-positioner"><Tooltip.Popup className="lk-overlay lk-tooltip-popup" data-size={options.size}>{String(options.text)}</Tooltip.Popup></Tooltip.Positioner></Tooltip.Portal></Tooltip.Root></Tooltip.Provider></div>;
}

export function ConfiguredComponent({ id, options: o, onOptionChange: set, ko }: Props) {
  const uid = useId();
  const checkbox = useRef<HTMLInputElement>(null);
  const textarea = useRef<HTMLTextAreaElement>(null);
  const selectContainer = useRef<HTMLDivElement>(null);
  const [removed, setRemoved] = useState(false);
  const [badge, setBadge] = useState(7);
  const [toast, setToast] = useState(false);
  const [pressedKey, setPressedKey] = useState(false);
  const [plan, setPlan] = useState("free");
  useEffect(() => { if (checkbox.current) checkbox.current.indeterminate = Boolean(o.indeterminate); }, [o.indeterminate]);
  useEffect(() => {
    if (id !== "textarea" || !textarea.current) return;
    const node = textarea.current;
    node.style.height = "auto"; node.style.height = `${Math.min(240, Math.max(node.scrollHeight, Number(o.rows) * 24 + 20))}px`;
  }, [id, o.value, o.rows]);
  useEffect(() => { if (!toast) return; const timer = setTimeout(() => setToast(false), 3500); return () => clearTimeout(timer); }, [toast]);
  useEffect(() => {
    if (id !== "kbd") return;
    const down = (event: KeyboardEvent) => { if (event.key.toLowerCase() === String(o.key).toLowerCase()) setPressedKey(true); };
    const up = (event: KeyboardEvent) => { if (event.key.toLowerCase() === String(o.key).toLowerCase()) setPressedKey(false); };
    const blur = () => setPressedKey(false);
    document.addEventListener("keydown", down); document.addEventListener("keyup", up); window.addEventListener("blur", blur);
    return () => { document.removeEventListener("keydown", down); document.removeEventListener("keyup", up); window.removeEventListener("blur", blur); };
  }, [id, o.key]);
  const disabled = Boolean(o.disabled);
  const words = ["Overview", "Activity", "Settings"];
  const values = ["overview", "activity", "settings"];
  switch (id) {
    case "button": return <KitButton disabled={disabled} shape={o.shape as "pill" | "square"} className="lk-main-button">Publish</KitButton>;
    case "icon-button": return <KitButton disabled={disabled} shape={o.shape as "square" | "circle"} className="lk-icon-button" aria-label={String(o.label)} title={String(o.label)}><Heart size={20} /></KitButton>;
    case "checkbox": return <label className="lk-choice"><input ref={checkbox} type="checkbox" disabled={disabled} checked={Boolean(o.checked)} onChange={event => { set("checked", event.target.checked); set("indeterminate", false); }} />Subscribe to updates</label>;
    case "radio": return <label className="lk-choice"><input type="radio" name={uid} disabled={disabled} checked={Boolean(o.checked)} onChange={event => set("checked", event.target.checked)} />Wireless</label>;
    case "switch": return <label className="lk-choice"><KitSwitch size={o.size as "small" | "medium" | "large"} disabled={disabled} checked={Boolean(o.checked)} onChange={event => set("checked", event.target.checked)} />Notifications</label>;
    case "input": return <KitField label={ko ? "이름" : "Name"}><input type={String(o.type)} value={String(o.value)} placeholder={String(o.placeholder)} disabled={disabled} readOnly={Boolean(o.readonly)} onChange={event => set("value", event.target.value)} /></KitField>;
    case "textarea": return <KitField label={ko ? "메모" : "Note"}><textarea ref={textarea} rows={Number(o.rows)} value={String(o.value)} placeholder={String(o.placeholder)} disabled={disabled} readOnly={Boolean(o.readonly)} onChange={event => set("value", event.target.value)} /></KitField>;
    case "label": return <div className="lk-stack"><label htmlFor={`${uid}-email`}>Email address{Boolean(o.required) && <span aria-hidden> *</span>}</label><input id={`${uid}-email`} type="email" required={Boolean(o.required)} /></div>;
    case "otp": return <OtpDemo key={Number(o.length)} length={Number(o.length)} disabled={disabled} ko={ko} />;
    case "radio-group": return <fieldset className="lk-radio-group" data-direction={o.direction}><legend>{String(o.label)}</legend>{["free", "pro", "team"].map(value => <label key={value} className="lk-choice"><input type="radio" name={uid} value={value} checked={plan === value} onChange={() => setPlan(value)} />{value}</label>)}</fieldset>;
    case "range": case "slider": {
      const range = id === "range";
      const value = range ? [Number(o.low), Number(o.high)] : [Number(o.value)];
      return <div className="lk-stack"><output>{value.join(" - ")}</output><Slider.Root className="lk-slider" min={Number(o.min)} max={Number(o.max)} step={Number(o.step)} value={value} disabled={disabled} onValueChange={next => {
        const values = Array.isArray(next) ? next : [next];
        if (range) { set("low", values[0]); set("high", values[1]); } else set("value", values[0]);
      }}><Slider.Control className="lk-slider-control"><Slider.Track className="lk-slider-track"><Slider.Indicator className="lk-slider-indicator" /></Slider.Track>{value.map((_, index) => <Slider.Thumb key={index} index={index} className="lk-slider-thumb" aria-label={range ? (index === 0 ? "Minimum" : "Maximum") : "Volume"} />)}</Slider.Control></Slider.Root></div>;
    }
    case "segmented": return <div className="lk-segmented" role="radiogroup" aria-label="Period">{["day", "week", "month"].map(value => <button type="button" role="radio" aria-checked={o.value === value} disabled={disabled} tabIndex={o.value === value ? 0 : -1} key={value} onClick={() => set("value", value)} onKeyDown={event => {
      const values = ["day", "week", "month"];
      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
      event.preventDefault(); const index = values.indexOf(value);
      const next = event.key === "Home" ? 0 : event.key === "End" ? 2 : (index + (event.key === "ArrowRight" ? 1 : 2)) % 3;
      set("value", values[next]); event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>("button")[next]?.focus();
    }}>{value}</button>)}</div>;
    case "select": return <div ref={selectContainer}><Select.Root value={String(o.value) || null} disabled={disabled} onValueChange={value => set("value", value ?? "")}><Select.Trigger className="lk-select-trigger"><Select.Value placeholder="Select..." /><Select.Icon><ChevronRight size={16} /></Select.Icon></Select.Trigger><Select.Portal container={selectContainer}><Select.Positioner sideOffset={8} className="lk-positioner"><Select.Popup className="lk-overlay"><Select.List>{["kiwi", "fig", "plum"].map(value => <Select.Item value={value} key={value} className="lk-menu-item"><Select.ItemText>{value}</Select.ItemText></Select.Item>)}</Select.List></Select.Popup></Select.Positioner></Select.Portal></Select.Root></div>;
    case "alert": return removed ? <KitButton onClick={() => setRemoved(false)}>Restore</KitButton> : <div className="lk-alert" data-tone={o.tone} role={o.tone === "danger" ? "alert" : "status"}><span>Your changes are live.</span>{Boolean(o.dismissible) && <button type="button" className="lk-icon-control" aria-label="Dismiss alert" onClick={() => setRemoved(true)}><X size={18} /></button>}</div>;
    case "badge": return <div className="lk-row"><span key={badge} className="lk-badge lk-jelly-badge" data-outline={o.outline} data-instant={o.instant} aria-live={o.live ? "polite" : "off"}>{badge}</span><button type="button" className="lk-icon-control" aria-label="Increase badge" title="Increase badge" onClick={() => setBadge(value => value + 1)}>+</button></div>;
    case "progress": return <div className="lk-stack"><progress aria-label="Completion" value={o.indeterminate ? undefined : Number(o.value)} max={Number(o.max)} /><output>{o.indeterminate ? "..." : `${Math.round(Number(o.value) / Number(o.max) * 100)}%`}</output></div>;
    case "skeleton": return <span className="lk-skeleton lk-shaped-skeleton" data-shape={o.shape} role="status" aria-label="Loading" />;
    case "spinner": return <span className={`lk-loading lk-loading-${o.type}`} role="status" aria-label="Loading">{o.type === "dots" ? [0, 1, 2].map(index => <i key={index} style={{ animationDelay: `${index * 150}ms` }} />) : <i />}</span>;
    case "toaster": return <div className="lk-toast-demo" data-position={o.position}><KitButton onClick={() => setToast(true)}>Show toast</KitButton>{toast && <div className="lk-alert lk-toast" role="status"><span>Saved successfully.</span><button type="button" className="lk-icon-control" aria-label="Dismiss toast" onClick={() => setToast(false)}><X size={18} /></button></div>}</div>;
    case "accordion": return <Accordion.Root multiple={!o.single} className="lk-stack">{["Colors", "Workspace"].map(title => <Accordion.Item value={title} key={title} className="lk-accordion"><Accordion.Header><Accordion.Trigger className="lk-accordion-trigger">{title}<ChevronRight size={18} /></Accordion.Trigger></Accordion.Header><Accordion.Panel className="lk-accordion-content">{title === "Colors" ? "Apple, Cushion, Ink" : "Your workspace is ready."}</Accordion.Panel></Accordion.Item>)}</Accordion.Root>;
    case "card": return o.squish ? <KitButton className="lk-squish-card"><span className="lk-stack"><strong>Apple workspace</strong><span>Project updates</span></span></KitButton> : <div className="lk-surface lk-stack"><strong>Apple workspace</strong><span>Project updates</span></div>;
    case "chip": return removed ? <KitButton onClick={() => setRemoved(false)}>Restore</KitButton> : <span className="lk-chip" data-selected={o.selected}>{o.selectable ? <button type="button" disabled={disabled} aria-pressed={Boolean(o.selected)} onClick={() => set("selected", !o.selected)}>Apple</button> : <span>Apple</span>}{Boolean(o.removable) && <button type="button" disabled={disabled} className="lk-icon-control" aria-label="Remove Apple" onClick={() => setRemoved(true)}><X size={15} /></button>}</span>;
    case "collapsible": return <details className="lk-accordion" open={Boolean(o.open)}><summary className="lk-accordion-trigger" onClick={event => { event.preventDefault(); set("open", !o.open); }}>Workspace<ChevronRight size={18} /></summary><div className="lk-accordion-content">Your workspace is ready.</div></details>;
    case "divider": return <div className="lk-divider" data-direction={o.direction}><span />{String(o.content) && <span>{String(o.content)}</span>}<span /></div>;
    case "kbd": return <button type="button" className="lk-kbd" data-pressed={pressedKey || undefined} onPointerDown={() => setPressedKey(true)} onPointerUp={() => setPressedKey(false)} onPointerCancel={() => setPressedKey(false)} onPointerLeave={() => setPressedKey(false)}><kbd>{String(o.key) || "Enter"}</kbd></button>;
    case "breadcrumbs": return <nav aria-label="Breadcrumb" className="lk-breadcrumbs"><a href="#library-home" onClick={event => { event.preventDefault(); setPlan("Home"); }}>Home</a><ChevronRight size={14} /><a href="#library-components" onClick={event => { event.preventDefault(); setPlan("Library"); }}>Library</a><ChevronRight size={14} /><span aria-current="page">{plan === "free" ? "Switch" : plan}</span></nav>;
    case "pagination": {
      const page = Number(o.page), total = Number(o.total);
      const pages = [...new Set([1, ...Array.from({ length: 5 }, (_, index) => page + index - 2).filter(value => value > 1 && value < total), total])];
      return <nav className="lk-pagination" aria-label="Pagination"><KitButton disabled={page === 1} aria-label="Previous page" onClick={() => set("page", page - 1)}><ChevronLeft size={16} /></KitButton>{pages.map((value, index) => <span key={value}>{index > 0 && value - pages[index - 1] > 1 && <span className="lk-pagination-gap">...</span>}<KitButton tone={value === page ? "primary" : "soft"} aria-current={value === page ? "page" : undefined} onClick={() => set("page", value)}>{value}</KitButton></span>)}<KitButton disabled={page === total} aria-label="Next page" onClick={() => set("page", page + 1)}><ChevronRight size={16} /></KitButton></nav>;
    }
    case "resizable": return <Resizable key={String(o.direction)} direction={String(o.direction)} />;
    case "tabs": return <Tabs.Root value={String(o.value)} onValueChange={value => set("value", String(value))}><Tabs.List className="lk-segmented" aria-label="Workspace">{values.map((value, index) => <Tabs.Tab value={value} key={value}>{words[index]}</Tabs.Tab>)}</Tabs.List>{values.map((value, index) => <Tabs.Panel value={value} key={value} className="lk-tab-panel"><strong>{words[index]}</strong><p>{["Project summary", "Three recent changes", "Notification preferences"][index]}</p></Tabs.Panel>)}</Tabs.Root>;
    case "dialog": case "drawer": case "menu": case "popover": case "tooltip": return <Overlay id={id} options={o} onOptionChange={set} ko={ko} />;
  }
}
