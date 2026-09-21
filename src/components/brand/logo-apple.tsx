"use client";

import type { CSSProperties } from "react";
import { AppleArtwork } from "@/components/flow/apple-artwork";
import { useAppleEyeLook } from "@/hooks/use-apple-eye-look";
import { APPLE_HEX, isHexColor, normalizeHex } from "@/lib/picked-color";

export function LogoApple({ hex }: { hex: string }) {
  const { look, leftEyeRef, rightEyeRef } = useAppleEyeLook({ max: 4.2, sensitivity: 42 });
  const fill = isHexColor(hex) ? normalizeHex(hex) : APPLE_HEX;

  return (
    <span className="logo-apple" style={{ "--apple": fill } as CSSProperties} aria-hidden>
      <AppleArtwork look={look} leftEyeRef={leftEyeRef} rightEyeRef={rightEyeRef} />
    </span>
  );
}

export function LogoAppleStatic({ hex = APPLE_HEX }: { hex?: string }) {
  const fill = isHexColor(hex) ? normalizeHex(hex) : APPLE_HEX;

  return (
    <span className="logo-apple" style={{ "--apple": fill } as CSSProperties} aria-hidden>
      <AppleArtwork />
    </span>
  );
}
