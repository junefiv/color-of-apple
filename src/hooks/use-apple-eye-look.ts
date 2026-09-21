"use client";

import { useEffect, useRef, useState } from "react";
import { DEFAULT_APPLE_LOOK } from "@/components/flow/apple-artwork";

function pupilOffset(rect: DOMRect | undefined, mouse: { x: number; y: number }, max = 5.5, sensitivity = 36) {
  if (!rect) return { x: 0, y: 0 };
  const dx = mouse.x - (rect.left + rect.width / 2);
  const dy = mouse.y - (rect.top + rect.height / 2);
  const distance = Math.hypot(dx, dy) || 1;
  const travel = Math.min(max, distance / sensitivity);
  return { x: (dx / distance) * travel, y: (dy / distance) * travel };
}

export function useAppleEyeLook(options?: { max?: number; sensitivity?: number }) {
  const max = options?.max ?? 5.5;
  const sensitivity = options?.sensitivity ?? 36;
  const leftEyeRef = useRef<SVGEllipseElement>(null);
  const rightEyeRef = useRef<SVGEllipseElement>(null);
  const [look, setLook] = useState(DEFAULT_APPLE_LOOK);

  useEffect(() => {
    function onMove(event: PointerEvent) {
      const mouse = { x: event.clientX, y: event.clientY };
      setLook({
        left: pupilOffset(leftEyeRef.current?.getBoundingClientRect(), mouse, max, sensitivity),
        right: pupilOffset(rightEyeRef.current?.getBoundingClientRect(), mouse, max, sensitivity),
      });
    }

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [max, sensitivity]);

  return { look, leftEyeRef, rightEyeRef };
}
