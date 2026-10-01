"use client";

import { useEffect, useRef, useState } from "react";
import { AppleArtwork } from "@/components/flow/apple-artwork";
import { useAppleEyeLook } from "@/hooks/use-apple-eye-look";
import { ColorPickerPopover } from "@/components/flow/color-picker-popover";
import { useAppleHop } from "@/hooks/use-apple-hop";
import { useCopy } from "@/hooks/use-copy";
import { chooseOnColor } from "@/lib/color-engine";
import { APPLE_HEX, isHexColor, normalizeHex } from "@/lib/picked-color";
import { trackProductEvent } from "@/lib/analytics";

export function ColorApple({
  hex,
  onChange,
  onGenerate,
}: {
  hex: string;
  onChange: (value: string) => void;
  onGenerate?: (value: string) => void;
}) {
  const copy = useCopy();
  const appleRef = useRef<HTMLButtonElement>(null);
  const trackedSelectionRef = useRef(false);
  const { look, leftEyeRef, rightEyeRef } = useAppleEyeLook();
  const [open, setOpen] = useState(false);
  const { hopping, hopId, playHop } = useAppleHop(!open);
  const fill = isHexColor(hex) ? normalizeHex(hex) : APPLE_HEX;
  const lastSettledColor = useRef(fill);
  useEffect(() => {
    if (open || fill === lastSettledColor.current) return;
    lastSettledColor.current = fill;
    playHop();
  }, [fill, open, playHop]);

  function commit(next: string) {
    if (!trackedSelectionRef.current) {
      trackedSelectionRef.current = true;
      void trackProductEvent("color_picked", { source: "apple_picker" });
    }
    onChange(next.toUpperCase());
  }

  return (
    <div className="color-apple">
      <div className="apple-bubble" role="note">
        <p>{copy.hero.pickHint}</p>
      </div>

      <button
        ref={appleRef}
        type="button"
        className="apple-hit"
        data-hop={hopping ? "true" : "false"}
        data-testid="color-apple"
        aria-label={copy.hero.appleLabel}
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen((value) => {
          if (!value) trackedSelectionRef.current = false;
          return !value;
        })}
        style={{ "--apple": fill, "--apple-ink": chooseOnColor(fill) } as React.CSSProperties}
      >
        <AppleArtwork key={hopId} hex={fill} look={look} leftEyeRef={leftEyeRef} rightEyeRef={rightEyeRef} />
      </button>

      {open ? (
        <ColorPickerPopover
          anchorRef={appleRef}
          color={fill}
          title={copy.hero.hexLabel}
          actionLabel="Generate Color Palette"
          onChange={commit}
          onAction={(next) => {
            commit(next);
            onGenerate?.(next);
            setOpen(false);
          }}
          onDismiss={() => setOpen(false)}
        />
      ) : null}
    </div>
  );
}
