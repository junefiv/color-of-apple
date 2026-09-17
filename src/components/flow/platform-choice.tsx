"use client";

import { chooseOnColor } from "@/lib/color-engine";
import type { PreviewTarget } from "@/lib/color-engine";

export function PlatformChoice({
  hex,
  value,
  onChange,
  options,
}: {
  hex: string;
  value: PreviewTarget;
  onChange: (value: PreviewTarget) => void;
  options: Array<{ id: "web" | "app"; label: string }>;
}) {
  return (
    <div className="platform-choice" role="radiogroup">
      {options.map((option) => {
        const active = value === option.id;
        return (
          <button
            key={option.id}
            type="button"
            role="radio"
            aria-checked={active}
            className="platform-card"
            data-active={active ? "true" : "false"}
            style={{
              "--platform-fill": hex,
              "--platform-ink": chooseOnColor(hex),
            } as React.CSSProperties}
            onClick={() => onChange(value === option.id ? "both" : option.id)}
          >
            <span className="platform-card-label">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
