"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { AppleArtwork } from "@/components/flow/apple-artwork";
import { useAppleEyeLook } from "@/hooks/use-apple-eye-look";
import { createPortal } from "react-dom";
import { HexColorPicker } from "react-colorful";
import { useCopy } from "@/hooks/use-copy";
import { APPLE_HEX, isHexColor, normalizeHex } from "@/lib/picked-color";

const TIP_WIDTH = 232;
const TIP_HEIGHT = 228;
const TIP_GAP = 16;

function placeTip(anchor: DOMRect) {
  const rightSpace = window.innerWidth - anchor.right;
  const belowSpace = window.innerHeight - anchor.bottom;
  let place: "right" | "left" | "bottom" = "right";
  let left = anchor.right + TIP_GAP;
  let top = anchor.top + anchor.height * 0.18;

  if (rightSpace < TIP_WIDTH + TIP_GAP && anchor.left > TIP_WIDTH + TIP_GAP) {
    place = "left";
    left = anchor.left - TIP_WIDTH - TIP_GAP;
  } else if (rightSpace < TIP_WIDTH + TIP_GAP) {
    place = "bottom";
    left = anchor.left + (anchor.width - TIP_WIDTH) / 2;
    top = belowSpace > TIP_HEIGHT + TIP_GAP ? anchor.bottom + TIP_GAP : Math.max(8, anchor.top - TIP_HEIGHT - TIP_GAP);
  }

  left = Math.min(Math.max(8, left), window.innerWidth - TIP_WIDTH - 8);
  top = Math.min(Math.max(8, top), window.innerHeight - TIP_HEIGHT - 8);

  return { top, left, place };
}

export function ColorApple({
  hex,
  onChange,
}: {
  hex: string;
  onChange: (value: string) => void;
}) {
  const copy = useCopy();
  const appleRef = useRef<HTMLButtonElement>(null);
  const tipRef = useRef<HTMLDivElement>(null);
  const { look, leftEyeRef, rightEyeRef } = useAppleEyeLook();
  const [open, setOpen] = useState(false);
  const [tip, setTip] = useState({ top: 0, left: 0, place: "right" as "right" | "left" | "bottom" });
  const fill = isHexColor(hex) ? normalizeHex(hex) : APPLE_HEX;

  function commit(next: string) {
    onChange(next.toUpperCase());
  }

  useLayoutEffect(() => {
    if (!open) return;

    function update() {
      const anchor = appleRef.current?.getBoundingClientRect();
      if (!anchor) return;
      setTip(placeTip(anchor));
    }

    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    function isInside(event: Event) {
      return event.composedPath().some((node) => node === appleRef.current || node === tipRef.current);
    }

    function onPointerDown(event: PointerEvent) {
      if (!isInside(event)) setOpen(false);
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", onPointerDown, true);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown, true);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div className="color-apple">
      <div className="apple-bubble" role="note">
        <p>{copy.hero.pickHint}</p>
      </div>

      <button
        ref={appleRef}
        type="button"
        className="apple-hit"
        data-testid="color-apple"
        aria-label={copy.hero.appleLabel}
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen((value) => !value)}
        style={{ "--apple": fill } as React.CSSProperties}
      >
        <AppleArtwork look={look} leftEyeRef={leftEyeRef} rightEyeRef={rightEyeRef} />
      </button>

      {open
        ? createPortal(
            <div
              ref={tipRef}
              className={`color-picker-tip is-${tip.place}`}
              role="dialog"
              aria-label={copy.hero.hexLabel}
              style={{ top: tip.top, left: tip.left }}
            >
              <HexColorPicker className="matchu-color-picker" color={fill} onChange={commit} />
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
