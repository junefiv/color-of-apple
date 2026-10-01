"use client";

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type RefObject } from "react";
import { createPortal } from "react-dom";
import { HexColorPicker } from "react-colorful";
import { MatchButton } from "@/components/flow/match-button";

type ActionSide = "bottom" | "top" | "right" | "left";

const ACTION_GAP = 12;
const ACTION_HEIGHT = 76;
const ACTION_WIDTH = 240;

function chooseActionSide(rect: DOMRect): ActionSide {
  const bottom = window.innerHeight - rect.bottom - ACTION_GAP;
  const top = rect.top - ACTION_GAP;
  const right = window.innerWidth - rect.right - ACTION_GAP;
  const left = rect.left - ACTION_GAP;
  if (bottom >= ACTION_HEIGHT) return "bottom";
  if (top >= ACTION_HEIGHT) return "top";
  if (right >= ACTION_WIDTH) return "right";
  if (left >= ACTION_WIDTH) return "left";
  const spaces: Array<[ActionSide, number]> = [
    ["bottom", bottom],
    ["top", top],
    ["right", right],
    ["left", left],
  ];
  return spaces.reduce((best, item) => (item[1] > best[1] ? item : best))[0];
}

export function ColorPickerPopover({
  anchorRef,
  color,
  title,
  actionLabel,
  onChange,
  onAction,
  onDismiss,
}: {
  anchorRef: RefObject<HTMLElement | null>;
  color: string;
  title: string;
  actionLabel?: string;
  onChange: (hex: string) => void;
  onAction?: (hex: string) => void;
  onDismiss: () => void;
}) {
  const popupRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const selecting = useRef(false);
  const onDismissRef = useRef(onDismiss);
  const [ready, setReady] = useState(false);
  const [side, setSide] = useState<ActionSide>("bottom");
  onDismissRef.current = onDismiss;
  const [position, setPosition] = useState<CSSProperties>({ top: 0, left: 0 });
  const showAction = Boolean(actionLabel && ready);

  useLayoutEffect(() => {
    function positionPopup() {
      const rect = anchorRef.current?.getBoundingClientRect();
      if (!rect) return;
      const width = Math.min(ACTION_WIDTH, window.innerWidth - 16);
      const reserved = 320;
      const left = rect.left >= width + 16 ? rect.left - width - 12 : Math.min(rect.right + 12, window.innerWidth - width - 8);
      setPosition({
        width,
        left: Math.max(8, left),
        top: Math.max(8, Math.min(rect.top, window.innerHeight - reserved)),
      });
    }
    positionPopup();
    window.addEventListener("resize", positionPopup);
    window.addEventListener("scroll", positionPopup, true);
    return () => {
      window.removeEventListener("resize", positionPopup);
      window.removeEventListener("scroll", positionPopup, true);
    };
  }, [anchorRef]);

  useLayoutEffect(() => {
    if (!showAction) return;
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    setSide(chooseActionSide(rect));
  }, [showAction, position]);

  useEffect(() => {
    function outside(event: PointerEvent) {
      if (!event.composedPath().some((node) => node === anchorRef.current || node === popupRef.current)) onDismissRef.current();
    }
    function release() {
      if (!selecting.current) return;
      selecting.current = false;
      setReady(true);
    }
    function escape(event: KeyboardEvent) {
      if (event.key === "Escape") onDismissRef.current();
    }
    document.addEventListener("pointerdown", outside, true);
    document.addEventListener("pointerup", release);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", outside, true);
      document.removeEventListener("pointerup", release);
      document.removeEventListener("keydown", escape);
    };
  }, [anchorRef]);

  return createPortal(
    <div ref={popupRef} className="primary-apple-popover" style={position} role="dialog" aria-label={title}>
      <div ref={cardRef} className="primary-apple-picker-card">
        <p>{title}</p>
        <div
          onPointerDownCapture={() => {
            selecting.current = true;
            setReady(false);
          }}
          onKeyUp={(event) => {
            if (event.key.startsWith("Arrow")) setReady(true);
          }}
        >
          <HexColorPicker color={color} onChange={(value) => onChange(value.toUpperCase())} />
        </div>
        <span className="token-name">{color.toUpperCase()}</span>
      </div>
      {showAction ? (
        <div className={`primary-apple-generate-tip is-${side}`}>
          <MatchButton hex={color} label={actionLabel!} onClick={() => onAction?.(color)} />
        </div>
      ) : null}
    </div>,
    document.body,
  );
}
