"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { cushionContour } from "@/lib/ui-kit/cushion-contour";
import { useMatchuStore } from "@/lib/store";

const concepts = [
  { id: "cushion", name: "Cushion", ko: "폭신하게 눌렀다 놓기", en: "Soft press, gentle rebound" },
  { id: "ink", name: "Ink", ko: "누르고 쓰는 자리에 잉크가 퍼져요", en: "Ink blooms where you press and type" },
] as const;

export { cushionContour } from "@/lib/ui-kit/cushion-contour";

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
