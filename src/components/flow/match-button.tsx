"use client";

import { chooseOnColor } from "@/lib/color-engine";
import { FALLBACK_HEX, isHexColor } from "@/lib/picked-color";

export function MatchButton({
  hex,
  label,
  onClick,
  disabled,
  pressed,
}: {
  hex: string;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  pressed?: boolean;
}) {
  const ready = isHexColor(hex);
  const fill = ready ? hex : FALLBACK_HEX;

  return (
    <button
      type="button"
      data-testid="match-button"
      className={`match-button ${pressed ? "is-pressed" : ""} ${ready ? "has-color" : ""}`}
      style={
        {
          "--match-fill": fill,
          "--match-opacity": disabled ? 0.38 : 1,
          color: chooseOnColor(fill),
        } as React.CSSProperties
      }
      disabled={disabled}
      onClick={onClick}
    >
      {label}
    </button>
  );
}
