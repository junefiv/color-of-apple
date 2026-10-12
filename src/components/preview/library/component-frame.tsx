"use client";
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type HTMLAttributes, type ReactNode } from "react";
import type { LibraryItemId } from "./catalog";
import type { ComponentOptions, SettingValue } from "./settings";
import { componentSources, variantColors } from "./code";
import { mountFold } from "./fold-motion";
import { mountGlass } from "./glass-motion";
import { mountReveal } from "./reveal-motion";
import { revealDirection, revealIndex, revealSpan, revealStep } from "./reveal";
import { playSlime } from "./slime-motion";
import { usePreviewTheme } from "../theme-scope";
export function variantStyle(value: string, theme: CSSProperties = {}): CSSProperties {
  const { fill, ink } = variantColors(value, theme);
  return { background: fill, color: ink };
}
export function ComponentFrame({ id, options, onOptionChange, ko = false }: {
  id: LibraryItemId; options: ComponentOptions; onOptionChange?: (key: string, value: SettingValue) => void; ko?: boolean;
}) {
  const theme = usePreviewTheme();
  const source = componentSources(id, options, ko, theme);
  if (id === "slime-toggle") return <SlimeFrame source={source} options={options} onOptionChange={onOptionChange} ko={ko} />;
  if (id === "glass-drop") return <GlassFrame source={source} options={options} />;
  if (id === "image-reveal") return <RevealFrame source={source} />;
  return <FoldFrame source={source} options={options} />;
}

function Configured({ fitKey, children, ...props }: { fitKey: string; children: ReactNode } & HTMLAttributes<HTMLDivElement>) {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const host = ref.current;
    const item = host?.querySelector(":scope > :not(style)") as HTMLElement | null;
    if (!host || !item) return;
    const fit = () => {
      item.style.fontSize = "";
      const available = host.clientWidth;
      const word = item.querySelector(":scope > b");
      const needed = Math.max(item.scrollWidth, word?.scrollWidth ?? 0);
      if (available < 8 || needed <= available + 1) return;
      const base = parseFloat(getComputedStyle(item).fontSize) || 16;
      item.style.fontSize = Math.max(12, base * available / needed).toFixed(2) + "px";
    };
    fit();
    const observer = typeof ResizeObserver === "function" ? new ResizeObserver(fit) : null;
    observer?.observe(host);
    window.addEventListener("resize", fit);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", fit);
      item.style.fontSize = "";
    };
  }, [fitKey]);
  return <div ref={ref} {...props} className="lk-configured">{children}</div>;
}

function FoldFrame({ source, options }: { source: ReturnType<typeof componentSources>; options: ComponentOptions }) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (buttonRef.current) return mountFold(buttonRef.current);
  }, [source.scope]);
  return <Configured fitKey={String(options.label) + source.scope + String(options.block)} data-size={options.size} data-variant={options.variant} data-block={options.block || undefined}>
    <style>{source.css}</style>
    <button ref={buttonRef} type="button" className={source.scope} disabled={Boolean(options.disabled)}><b>{String(options.label)}</b></button>
  </Configured>;
}

function SlimeFrame({ source, options, onOptionChange, ko }: {
  source: ReturnType<typeof componentSources>;
  options: ComponentOptions;
  onOptionChange?: (key: string, value: SettingValue) => void;
  ko: boolean;
}) {
  const [on, setOn] = useState(Boolean(options.on));
  const thumbRef = useRef<HTMLSpanElement>(null);
  const first = useRef(true);
  useEffect(() => { setOn(Boolean(options.on)); }, [options.on]);
  useLayoutEffect(() => {
    const thumb = thumbRef.current;
    if (!thumb) return;
    const animate = !first.current;
    first.current = false;
    playSlime(thumb, on, animate);
  }, [on]);
  return <Configured fitKey={source.scope + String(on)} data-size={options.size} data-variant={options.variant}>
    <style>{source.css}</style>
    <button type="button" role="switch" aria-checked={on} aria-label={ko ? "슬라임 토글" : "Slime toggle"} className={source.scope} onClick={() => {
      const next = !on;
      setOn(next);
      onOptionChange?.("on", next);
    }}><span ref={thumbRef} /></button>
  </Configured>;
}

function RevealFrame({ source }: { source: ReturnType<typeof componentSources> }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const columns = Number(source.settings.columns);
  const rows = Number(source.settings.rows);
  const count = columns * rows;
  const image = String(source.settings.image);
  const direction = revealDirection(source.settings.direction);
  const span = revealSpan(direction, columns, rows);
  useLayoutEffect(() => {
    if (rootRef.current) return mountReveal(rootRef.current);
  }, [columns, rows, image, source.settings.fit]);
  const vars = {
    "--cols": columns,
    "--rows": rows,
    "--n": span,
    "--reveal-step": revealStep(span) + "ms",
    "--reveal-ink": String(source.settings.color),
    "--reveal-image": "url('" + image + "')",
  } as CSSProperties;
  return <Configured fitKey={String(source.settings.label) + direction + String(source.settings.color) + columns + "x" + rows} data-block>
    <style>{source.css}</style>
    <div ref={rootRef} tabIndex={0} className={source.scope} data-fit={String(source.settings.fit)} data-image={image} style={vars}>
      <p>{String(source.settings.label)}</p>
      <div data-tiles aria-hidden="true">{Array.from({ length: count }, (_, index) => {
        const x = index % columns;
        const y = Math.floor(index / columns);
        const cell = { "--i": revealIndex(direction, x, y, columns, rows), "--x": x, "--y": y } as CSSProperties;
        return <span data-cell key={index} style={cell} />;
      })}</div>
    </div>
  </Configured>;
}

function GlassFrame({ source, options }: { source: ReturnType<typeof componentSources>; options: ComponentOptions }) {
  const rootRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (rootRef.current) return mountGlass(rootRef.current);
  }, [source.scope]);
  const label = String(options.label);
  return <Configured fitKey={label + source.scope} data-size={options.size} data-variant={options.variant} data-block>
    <style>{source.css}</style>
    <button ref={rootRef} type="button" className={source.scope} data-glass>
      <b>{label}</b>
      <span data-drop aria-hidden="true"><span data-lens><b>{label}</b></span></span>
    </button>
  </Configured>;
}
