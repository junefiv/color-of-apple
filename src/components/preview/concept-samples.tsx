"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useMatchuStore } from "@/lib/store";

const concepts = [
  { id: "cushion", name: "Cushion", ko: "폭신하게 눌렀다 놓기", en: "Soft press, gentle rebound" },
  { id: "ink", name: "Ink", ko: "누르고 쓰는 자리에 잉크가 퍼져요", en: "Ink blooms where you press and type" },
] as const;

// Move the entire flat outline inward near the press, including both rounded ends.
export function cushionContour(xPercent: number, yPercent: number, pressed: boolean, width = 180, height = 52, maxDepth = 3.5, cornerRadius = height / 2 - 1) {
  const pressX = Math.max(0, Math.min(100, xPercent)) / 100 * width;
  const pressY = Math.max(0, Math.min(100, yPercent)) / 100 * height;
  const radius = Math.min(cornerRadius, height / 2 - 1, width / 2 - 1);
  const left = radius + 1, right = width - left, top = radius + 1, bottom = height - top;
  const horizontal = right - left, vertical = bottom - top, quarter = Math.PI * radius / 2;
  const arcPoint = (x: number, y: number, angle: number) => ({ x: x + radius * Math.cos(angle), y: y + radius * Math.sin(angle), nx: -Math.cos(angle), ny: -Math.sin(angle) });
  const segments = [
    { length: horizontal, at: (d: number) => ({ x: left + d, y: 1, nx: 0, ny: 1 }) },
    { length: quarter, at: (d: number) => arcPoint(right, top, -Math.PI / 2 + d / radius) },
    { length: vertical, at: (d: number) => ({ x: width - 1, y: top + d, nx: -1, ny: 0 }) },
    { length: quarter, at: (d: number) => arcPoint(right, bottom, d / radius) },
    { length: horizontal, at: (d: number) => ({ x: right - d, y: height - 1, nx: 0, ny: -1 }) },
    { length: quarter, at: (d: number) => arcPoint(left, bottom, Math.PI / 2 + d / radius) },
    { length: vertical, at: (d: number) => ({ x: 1, y: bottom - d, nx: 1, ny: 0 }) },
    { length: quarter, at: (d: number) => arcPoint(left, top, Math.PI + d / radius) },
  ];
  const perimeter = segments.reduce((total, segment) => total + segment.length, 0);
  const count = vertical > 0 ? 96 : 48;
  const points = Array.from({ length: count }, (_, index) => {
    let distance = index / count * perimeter;
    let segment = segments[segments.length - 1];
    for (const candidate of segments) {
      if (distance < candidate.length) { segment = candidate; break; }
      distance -= candidate.length;
    }
    const { x, y, nx, ny } = segment.at(distance);
    const depth = pressed ? maxDepth * Math.exp(-(((x - pressX) / 24) ** 2 + ((y - pressY) / (height * .58)) ** 2)) : 0;
    return { x: x + nx * depth, y: y + ny * depth };
  });
  const point = (index: number) => points[(index + points.length) % points.length];
  const curves = points.map((current, index) => {
    const previous = point(index - 1), next = point(index + 1), following = point(index + 2);
    return `C ${current.x + (next.x - previous.x) / 6} ${current.y + (next.y - previous.y) / 6} ${next.x - (following.x - current.x) / 6} ${next.y - (following.y - current.y) / 6} ${next.x} ${next.y}`;
  }).join(" ");
  return `M ${points[0].x} ${points[0].y} ${curves} Z`;
}

function ConceptSample({ concept, isKo }: { concept: typeof concepts[number]; isKo: boolean }) {
  const [pressed, setPressed] = useState(false);
  const [value, setValue] = useState("");
  const [origin, setOrigin] = useState({ x: 50, y: 50 });
  const [inkClick, setInkClick] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const restoreTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const markId = useRef(0);
  const pendingInk = useRef<{ prefix: string; x: number } | null>(null);
  const [inputWidth, setInputWidth] = useState(240);
  const [typing, setTyping] = useState(false);
  const [typingX, setTypingX] = useState(50);
  const [inkMarks, setInkMarks] = useState<{ id: number; x: number }[]>([]);
  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;
    const observer = new ResizeObserver(() => setInputWidth(input.getBoundingClientRect().width));
    observer.observe(input);
    return () => { observer.disconnect(); if (restoreTimer.current) clearTimeout(restoreTimer.current); };
  }, []);
  const inputId = `concept-${concept.id}-input`;
  return <article className="concept-sample" data-concept={concept.id}>
    <header><span className="concept-number">0{concepts.indexOf(concept) + 1}</span><h4>{concept.name}</h4><p>{isKo ? concept.ko : concept.en}</p></header>
    <div className="concept-button-stage">
      <button type="button" className="concept-button" data-pressed={pressed || undefined}
        style={{ "--press-x": `${origin.x}%`, "--press-y": `${origin.y}%`, "--cushion-rest": `path("${cushionContour(50, 50, false)}")`, "--cushion-pressed": `path("${cushionContour(origin.x, origin.y, true)}")` } as CSSProperties}
        onPointerDown={(event) => {
          if (event.button !== 0) return;
          const rect = event.currentTarget.getBoundingClientRect();
          setOrigin({ x: (event.clientX - rect.left) / rect.width * 100, y: (event.clientY - rect.top) / rect.height * 100 });
          event.currentTarget.setPointerCapture(event.pointerId);
          setPressed(true);
        }}
        onPointerUp={() => setPressed(false)} onPointerCancel={() => setPressed(false)} onLostPointerCapture={() => setPressed(false)} onBlur={() => setPressed(false)}
        onKeyDown={(event) => { if (!event.repeat && (event.key === "Enter" || event.key === " ")) { setOrigin({ x: 50, y: 50 }); setPressed(true); } }}
        onKeyUp={(event) => { if (event.key === "Enter" || event.key === " ") setPressed(false); }}
        onClick={() => { if (concept.id === "ink") setInkClick((click) => click + 1); }}>
        <span className="concept-button-surface">
          {concept.id === "cushion" ? <svg className="concept-cushion-outline" viewBox="0 0 180 52" aria-hidden="true"><path d={cushionContour(50, 50, false)} /></svg> : inkClick > 0 ? <span key={inkClick} className="concept-ink-spread" aria-hidden /> : null}
          <span className="concept-button-label">{isKo ? "눌러보기" : "Press me"}</span>
        </span>
      </button>
    </div>
    <label className="concept-input-label" htmlFor={inputId}>{isKo ? "직접 입력해보세요" : "Try typing"}</label>
    <div className="concept-input-shell" data-typing={typing || undefined}
      style={{ "--cushion-rest": `path("${cushionContour(50, 50, false, inputWidth, 44, 2.4, 8)}")`, "--cushion-pressed": `path("${cushionContour(typingX, 50, true, inputWidth, 44, 2.4, 8)}")` } as CSSProperties}>
      {concept.id === "cushion" ? <svg className="concept-cushion-outline concept-input-outline" viewBox={`0 0 ${inputWidth} 44`} aria-hidden="true"><path d={cushionContour(50, 50, false, inputWidth, 44, 2.4, 8)} /></svg> : <span className="concept-input-ink-layer" aria-hidden="true">{inkMarks.map((mark) => <span key={mark.id} className="concept-ink-spread" style={{ "--press-x": `${mark.x}px`, "--press-y": "50%" } as CSSProperties} />)}</span>}
      <input ref={inputRef} id={inputId} className="concept-input" autoComplete="off" value={value} onChange={(event) => {
        const input = event.currentTarget;
        const nextValue = input.value;
        setValue(nextValue);
        if ((event.nativeEvent as InputEvent).inputType?.startsWith("delete") || !nextValue) { pendingInk.current = null; return; }
        if (nextValue === value) return;
        const style = getComputedStyle(input);
        const context = document.createElement("canvas").getContext("2d");
        if (!context) return;
        context.font = style.font;
        const prefix = nextValue.slice(0, input.selectionStart ?? nextValue.length);
        const lastCharacter = Array.from(prefix).at(-1) ?? "";
        const x = Math.max(8, Math.min(inputWidth - 8, parseFloat(style.paddingLeft) + context.measureText(prefix).width - context.measureText(lastCharacter).width / 2 - input.scrollLeft));
        if (concept.id === "ink") {
          const previous = pendingInk.current;
          pendingInk.current = { prefix, x };
          // Composing the same character only updates its position; the next character releases its ink.
          if (previous && prefix.startsWith(previous.prefix) && prefix.length > previous.prefix.length) {
            setInkMarks([{ id: ++markId.current, x: previous.x }]);
          }
        } else {
          setTypingX(x / inputWidth * 100);
          setTyping(true);
          if (restoreTimer.current) clearTimeout(restoreTimer.current);
          restoreTimer.current = setTimeout(() => setTyping(false), 150);
        }
      }} placeholder={isKo ? "여기에 글자를 남겨보세요" : "Leave a little imprint"} />
    </div>
    <small className="concept-sample-note">{concept.id === "cushion" ? (isKo ? "가운데와 상하좌우 가장자리를 길게 눌러보세요." : "Hold the center or any of the four edges to compare.") : (isKo ? "버튼을 누르고, 입력창을 선택해보세요." : "Press the button, then focus the field.")}</small>
  </article>;
}

export function ConceptSamples() {
  const isKo = useMatchuStore((state) => state.locale) === "ko";
  return <section className="kit-span-full concept-lab" aria-label={isKo ? "UI 콘셉트 맛보기" : "UI concept samples"}>
    <div className="concept-lab-heading"><div><span>UI TASTING / 01</span><h3>{isKo ? "두 가지 감촉, 작은 맛보기." : "Two textures. A small taste."}</h3></div><p>{isKo ? "각각 버튼 하나, 입력창 하나." : "One button. One input. Each."}</p></div>
    <div className="concept-samples-grid">{concepts.map((concept) => <ConceptSample key={concept.id} concept={concept} isKo={isKo} />)}</div>
  </section>;
}
