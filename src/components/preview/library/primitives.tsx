"use client";

import { isValidElement, useEffect, useId, useRef, useState, type ButtonHTMLAttributes, type CSSProperties, type ReactNode } from "react";
import { cushionContour } from "../concept-samples";

function useSurfaceSize<T extends HTMLElement>(initialWidth = 180, initialHeight = 52) {
  const ref = useRef<T>(null);
  const [size, setSize] = useState({ width: initialWidth, height: initialHeight });
  useEffect(() => {
    if (!ref.current || typeof ResizeObserver === "undefined") return;
    const element = ref.current;
    const measure = () => { const rect = element.getBoundingClientRect(); if (rect.width && rect.height) setSize(previous => previous.width === rect.width && previous.height === rect.height ? previous : { width: rect.width, height: rect.height }); };
    measure(); const observer = new ResizeObserver(measure); observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return { ref, size };
}

export function KitButton({ children, className = "", tone = "primary", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { tone?: "primary" | "soft" | "danger" }) {
  const [press, setPress] = useState(false);
  const [point, setPoint] = useState({ x: 50, y: 50 });
  const [pulse, setPulse] = useState(0);
  const { ref, size } = useSurfaceSize<HTMLButtonElement>();
  return <button {...props} ref={ref} type={props.type ?? "button"} className={`lk-button ${className}`} data-tone={tone} data-pressed={press || undefined}
    style={{ ...props.style, "--press-x": `${point.x}%`, "--press-y": `${point.y}%`, "--lk-rest": `path("${cushionContour(50, 50, false, size.width, size.height)}")`, "--lk-pressed": `path("${cushionContour(point.x, point.y, true, size.width, size.height)}")` } as CSSProperties}
    onPointerDown={event => { if (event.button !== 0) return; const rect = event.currentTarget.getBoundingClientRect(); setPoint({ x: (event.clientX - rect.left) / rect.width * 100, y: (event.clientY - rect.top) / rect.height * 100 }); setPress(true); event.currentTarget.setPointerCapture(event.pointerId); props.onPointerDown?.(event); }}
    onPointerUp={event => { setPress(false); props.onPointerUp?.(event); }} onPointerCancel={() => setPress(false)} onLostPointerCapture={() => setPress(false)}
    onBlur={event => { setPress(false); props.onBlur?.(event); }}
    onKeyDown={event => { if (!event.repeat && (event.key === " " || event.key === "Enter")) { setPoint({ x: 50, y: 50 }); setPress(true); } props.onKeyDown?.(event); }}
    onKeyUp={event => { setPress(false); props.onKeyUp?.(event); }} onClick={event => { setPulse(p => p + 1); props.onClick?.(event); }}>
    <svg className="lk-contour" viewBox={`0 0 ${size.width} ${size.height}`} preserveAspectRatio="none" aria-hidden><path d={cushionContour(50, 50, false, size.width, size.height)} /></svg>
    {pulse > 0 && <span key={pulse} className="lk-ripple" aria-hidden />}
    <span className="lk-button-content">{children}</span>
  </button>;
}

export function KitDialog({ trigger, title, children, variant = "modal", danger = false, onConfirm }: { trigger: string; title: string; children: ReactNode; variant?: "modal" | "side-panel" | "bottom-sheet"; danger?: boolean; onConfirm?: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const id = useId();
  return <><KitButton tone={danger ? "danger" : "primary"} onClick={() => ref.current?.showModal()}>{trigger}</KitButton>
    <dialog ref={ref} className={`lk-dialog lk-dialog-${variant}`} aria-labelledby={id} onClick={event => { const rect = event.currentTarget.getBoundingClientRect(); if (event.target === event.currentTarget && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) ref.current?.close(); }}>
      <header className="lk-row"><h4 id={id}>{title}</h4><KitButton tone="soft" aria-label="Close" onClick={() => ref.current?.close()}>×</KitButton></header>
      <div className="lk-stack">{children}</div>
      <div className="lk-row lk-dialog-actions"><KitButton tone="soft" onClick={() => ref.current?.close()}>Close</KitButton>{onConfirm && <KitButton tone={danger ? "danger" : "primary"} onClick={() => { onConfirm(); ref.current?.close(); }}>Confirm</KitButton>}</div>
    </dialog></>;
}

export function KitAvatar({ name = "Apple", index = 0 }: { name?: string; index?: number }) {
  return <span className="lk-avatar" data-index={index % 3} title={name} aria-label={name}>{name.slice(0, 1)}</span>;
}

export function KitField({ label, children }: { label: string; children: ReactNode }) {
  const [mark, setMark] = useState({ id: 0, x: 20, y: 20 });
  const [typing, setTyping] = useState(false);
  const [typingX, setTypingX] = useState(50);
  const [typingTick, setTypingTick] = useState(0);
  const [size, setSize] = useState({ width: 240, height: 44 });
  const wrap = useRef<HTMLSpanElement>(null);
  const pendingInk = useRef<{ prefix: string; x: number } | null>(null);
  const deform = isValidElement<{ type?: string }>(children) && (children.type === "textarea" || (children.type === "input" && ["text", "email", "password", "search", "number"].includes(children.props.type ?? "text")));
  useEffect(() => {
    const input = wrap.current?.querySelector("input, textarea");
    if (!input || !deform || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => { const rect = input.getBoundingClientRect(); if (rect.width && rect.height) setSize({ width: rect.width, height: rect.height }); });
    observer.observe(input); return () => observer.disconnect();
  }, [deform]);
  useEffect(() => { if (!typingTick) return; const timer = setTimeout(() => setTyping(false), 150); return () => clearTimeout(timer); }, [typingTick]);
  return <label className="lk-field">{label}<span ref={wrap} className="lk-input-wrap" data-typing={typing || undefined} data-deform={deform || undefined}
    style={{ "--lk-field-rest": `path("${cushionContour(50, 50, false, size.width, size.height, 2.4, 8)}")`, "--lk-field-pressed": `path("${cushionContour(typingX, 50, true, size.width, size.height, 2.4, 8)}")` } as CSSProperties}
    onInput={event => {
    const input = event.target;
    if (!(input instanceof HTMLInputElement || input instanceof HTMLTextAreaElement)) return;
    if (input instanceof HTMLInputElement && !["text", "email", "password", "search", "number"].includes(input.type)) return;
    if ((event.nativeEvent as InputEvent).inputType?.startsWith("delete") || !input.value) { pendingInk.current = null; return; }
    const rect = input.getBoundingClientRect();
    const width = rect.width || size.width;
    const prefix = input.value.slice(0, input.selectionStart ?? input.value.length);
    const computed = getComputedStyle(input);
    const context = document.createElement("canvas").getContext("2d");
    if (!context) return;
    context.font = computed.font;
    const measured = input instanceof HTMLInputElement && input.type === "password" ? "•".repeat(prefix.length) : prefix;
    const last = Array.from(measured).at(-1) ?? "";
    const x = Math.max(8, Math.min(width - 8, (parseFloat(computed.paddingLeft) || 13) + context.measureText(measured).width - context.measureText(last).width / 2 - input.scrollLeft));
    const previous = pendingInk.current;
    pendingInk.current = { prefix, x };
    // Match the basic Ink sample: composing a character doesn't repeatedly spill ink.
    if (previous && prefix.startsWith(previous.prefix) && prefix.length > previous.prefix.length) setMark(mark => ({ id: mark.id + 1, x: previous.x, y: Math.min(22, rect.height / 2 || 22) }));
    setTypingX(x / width * 100);
    setTypingTick(tick => tick + 1);
    setTyping(true);
  }}>{deform && <svg className="lk-field-contour" viewBox={`0 0 ${size.width} ${size.height}`} preserveAspectRatio="none" aria-hidden><path d={cushionContour(50, 50, false, size.width, size.height, 2.4, 8)} /></svg>}{children}{mark.id > 0 && <span key={mark.id} className="lk-typing-mark" style={{ left: mark.x, top: mark.y }} aria-hidden />}</span></label>;
}

export function KitAccordion({ title, children }: { title: string; children: ReactNode }) {
  const { ref, size } = useSurfaceSize<HTMLElement>(240, 52);
  const [point, setPoint] = useState({ x: 50, y: 50 });
  const [pressed, setPressed] = useState(false);
  const [pulse, setPulse] = useState(0);
  return <details className="lk-accordion"><summary ref={ref} className="lk-accordion-trigger" data-pressed={pressed || undefined}
    style={{ "--press-x": `${point.x}%`, "--press-y": `${point.y}%`, "--lk-rest": `path("${cushionContour(50, 50, false, size.width, size.height, 3.5, 8)}")`, "--lk-pressed": `path("${cushionContour(point.x, point.y, true, size.width, size.height, 3.5, 8)}")` } as CSSProperties}
    onPointerDown={event => { if (event.button !== 0) return; const rect = event.currentTarget.getBoundingClientRect(); setPoint({ x: (event.clientX - rect.left) / rect.width * 100, y: (event.clientY - rect.top) / rect.height * 100 }); setPressed(true); event.currentTarget.setPointerCapture(event.pointerId); }}
    onPointerUp={() => setPressed(false)} onPointerCancel={() => setPressed(false)} onLostPointerCapture={() => setPressed(false)} onBlur={() => setPressed(false)}
    onKeyDown={event => { if (event.key === " " || event.key === "Enter") { setPoint({ x: 50, y: 50 }); setPressed(true); } }} onKeyUp={() => setPressed(false)} onClick={() => setPulse(pulse => pulse + 1)}>
    <svg className="lk-contour" viewBox={`0 0 ${size.width} ${size.height}`} preserveAspectRatio="none" aria-hidden><path d={cushionContour(50, 50, false, size.width, size.height, 3.5, 8)} /></svg>
    {pulse > 0 && <span key={pulse} className="lk-ripple" aria-hidden />}<span className="lk-accordion-title">{title}</span><span className="lk-accordion-chevron" aria-hidden>+</span>
  </summary><div className="lk-accordion-content">{children}</div></details>;
}

export function KitArt({ index = 0, label = "Color study" }: { index?: number; label?: string }) {
  return <svg className="lk-art" viewBox="0 0 240 140" role="img" aria-label={label}><rect width="240" height="140" fill="var(--lk-wash)" />
    <circle cx={70 + index * 20} cy="67" r="42" fill="var(--lk-primary)" /><rect x="115" y="35" width="75" height="75" rx={index % 2 ? 4 : 28} fill="var(--lk-secondary)" transform={`rotate(${index % 2 ? 12 : -8} 150 75)`} /><circle cx="100" cy="104" r="22" fill="var(--lk-accent)" /></svg>;
}
