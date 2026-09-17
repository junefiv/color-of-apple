"use client";

import { createPortal } from "react-dom";
import { washBarGradient } from "@/lib/space-palettes";

const WASH_MS = 1600;

export function PaletteWash({
  colors,
  onDone,
}: {
  colors: string[];
  onDone: () => void;
}) {
  function finish(event: React.AnimationEvent<HTMLDivElement>) {
    if (event.target !== event.currentTarget) return;
    onDone();
  }

  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="palette-wash-root" data-testid="palette-wash">
      <div
        className="palette-wash-band"
        style={{
          backgroundImage: washBarGradient(colors),
          ["--palette-wash-ms" as string]: `${WASH_MS}ms`,
        }}
        onAnimationEnd={finish}
      />
    </div>,
    document.body,
  );
}
