"use client";

import { useEffect, useState } from "react";
import { bleedOriginFromHex, prefersReducedMotion } from "@/lib/color-bleed";

export function ColorBleed({
  hex,
  play,
  onDone,
}: {
  hex: string;
  play: boolean;
  onDone?: () => void;
}) {
  const [origin] = useState(() => bleedOriginFromHex(hex));

  useEffect(() => {
    if (play && prefersReducedMotion()) onDone?.();
  }, [onDone, play]);

  if (!play || prefersReducedMotion()) return null;

  return (
    <div
      className="color-bleed-veil"
      data-origin={origin}
      data-testid="color-bleed-veil"
      aria-hidden="true"
      onAnimationEnd={(event) => {
        if (event.target === event.currentTarget) onDone?.();
      }}
    />
  );
}
