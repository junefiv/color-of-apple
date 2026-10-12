"use client";

import { useEffect, useRef } from "react";

const LINE_HEIGHT = 18;
const PAD = 16;

export function ProtectedCodeView({ code, label, className, tone = "light" }: {
  code: string;
  label: string;
  className?: string;
  tone?: "light" | "dark";
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const spacerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const scroll = scrollRef.current;
    const canvas = canvasRef.current;
    const spacer = spacerRef.current;
    if (!scroll || !canvas || !spacer) return;
    let context: CanvasRenderingContext2D | null = null;
    try { context = canvas.getContext("2d"); } catch { context = null; }
    if (!context) return;
    const lines = code.split("\n");
    const font = "11px ui-monospace, SFMono-Regular, Menlo, monospace";
    const background = tone === "dark" ? "#1b1d20" : "#f4f4f5";
    const foreground = tone === "dark" ? "#f8f8f9" : "#252525";
    context.font = font;
    let contentWidth = scroll.clientWidth;
    for (const line of lines) contentWidth = Math.max(contentWidth, context.measureText(line).width + PAD * 2);
    spacer.style.width = contentWidth + "px";
    spacer.style.height = Math.max(LINE_HEIGHT, lines.length * LINE_HEIGHT + PAD) + "px";
    const draw = () => {
      const width = scroll.clientWidth;
      const height = scroll.clientHeight;
      const pixelRatio = window.devicePixelRatio || 1;
      canvas.width = Math.max(1, Math.floor(width * pixelRatio));
      canvas.height = Math.max(1, Math.floor(height * pixelRatio));
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      context.font = font;
      context.fillStyle = background;
      context.fillRect(0, 0, width, height);
      context.fillStyle = foreground;
      const start = Math.max(0, Math.floor(scroll.scrollTop / LINE_HEIGHT) - 1);
      const visible = Math.ceil(height / LINE_HEIGHT) + 3;
      for (let index = start; index < Math.min(lines.length, start + visible); index += 1) {
        context.fillText(lines[index] ?? "", PAD - scroll.scrollLeft, index * LINE_HEIGHT - scroll.scrollTop + LINE_HEIGHT);
      }
    };
    draw();
    scroll.addEventListener("scroll", draw);
    const observer = new ResizeObserver(draw);
    observer.observe(scroll);
    return () => {
      scroll.removeEventListener("scroll", draw);
      observer.disconnect();
    };
  }, [code, tone]);
  const frameClass = className ? "protected-code-frame " + className : "protected-code-frame";
  return <div className={frameClass} onContextMenu={(event) => event.preventDefault()}>
    <div ref={scrollRef} className="protected-code" role="img" aria-label={label}>
      <div ref={spacerRef} aria-hidden="true" />
    </div>
    <canvas ref={canvasRef} aria-hidden="true" />
  </div>;
}
