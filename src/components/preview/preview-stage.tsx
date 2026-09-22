"use client";

import { useEffect, useRef, useState } from "react";
import { useColorSystem } from "@/hooks/use-color-system";
import { useCopy } from "@/hooks/use-copy";
import { interpolate } from "@/lib/copy";
import { useMatchuStore } from "@/lib/store";

export type TokenRole = "primary" | "secondary" | "accent" | "surface" | "background" | "text";

const ROLES: Array<[TokenRole, string, string]> = [
  ["primary", "Primary", "var(--color-primary-default)"],
  ["secondary", "Secondary", "var(--color-secondary-default)"],
  ["accent", "Accent", "var(--color-accent-default)"],
  ["surface", "Surface", "var(--color-surface-default)"],
  ["background", "Background", "var(--color-bg-canvas)"],
  ["text", "Text", "var(--color-text-primary)"],
];

const EMPTY: Record<TokenRole, number> = {
  primary: 0,
  secondary: 0,
  accent: 0,
  surface: 0,
  background: 0,
  text: 0,
};

export function PreviewStage({
  toolbar,
  scenes,
  active,
  onScene,
  children,
}: {
  toolbar: string;
  scenes: Array<[string, string]>;
  active: string;
  onScene: (id: string) => void;
  children: React.ReactNode;
}) {
  const copy = useCopy();
  const canvasRef = useRef<HTMLDivElement>(null);
  const [counts, setCounts] = useState(EMPTY);
  const [focus, setFocus] = useState<TokenRole | null>(null);
  const input = useMatchuStore((state) => state.input);
  const selectedPaletteId = useMatchuStore((state) => state.selectedPaletteId);
  const result = useColorSystem(input, selectedPaletteId);
  const failCount = result.accessibility.light.failCount;

  useEffect(() => {
    const root = canvasRef.current;
    if (!root) return;

    function tally() {
      if (!root) return;
      const next = { ...EMPTY };
      for (const [role] of ROLES) {
        next[role] = root.querySelectorAll(`[data-token="${role}"]`).length;
      }
      setCounts(next);
    }

    tally();
    const frame = window.requestAnimationFrame(tally);
    const later = window.setTimeout(tally, 50);
    const observer = new MutationObserver(tally);
    observer.observe(root, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["data-token"],
    });
    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(later);
      observer.disconnect();
    };
  }, [active, toolbar]);

  return (
    <div className="preview-viewport preview-stage" data-token-focus={focus ?? undefined}>
      <div className="preview-toolbar" data-token="surface">
        <span data-token="text">{toolbar}</span>
        <span data-token="text">
          {failCount
            ? interpolate(copy.preview.contrastWarn, { count: failCount })
            : copy.preview.contrastOk}
        </span>
      </div>
      <div className="preview-stage-body">
        <nav className="preview-scenes" data-token="surface" aria-label="Scenes">
          {scenes.map(([id, label]) => (
            <button
              key={id}
              type="button"
              data-active={active === id}
              data-token={active === id ? "primary" : "text"}
              onClick={() => onScene(id)}
            >
              {label}
            </button>
          ))}
        </nav>
        <div ref={canvasRef} className="preview-canvas-slot">
          {children}
        </div>
      </div>
      <div className="preview-usage" data-token="surface">
        <span className="mr-1 text-[10px] tracking-wide" data-token="text">
          {copy.preview.usage}
        </span>
        {ROLES.map(([role, label, color]) => (
          <button
            key={role}
            type="button"
            data-on={focus === role}
            data-token={role}
            onClick={() => setFocus((current) => (current === role ? null : role))}
          >
            <i style={{ background: color }} />
            {label} {counts[role]}곳
          </button>
        ))}
        {focus ? (
          <button type="button" data-token="text" onClick={() => setFocus(null)}>
            {copy.preview.highlightOff}
          </button>
        ) : null}
      </div>
    </div>
  );
}
