"use client";

import { AppleArtwork } from "@/components/flow/apple-artwork";
import { useAppleEyeLook } from "@/hooks/use-apple-eye-look";
import { useAppleHop } from "@/hooks/use-apple-hop";
import { APPLE_HEX } from "@/lib/picked-color";

export function ComingSoonApple() {
  const { look, leftEyeRef, rightEyeRef } = useAppleEyeLook();
  const { hopping } = useAppleHop(true);

  return (
    <div className="color-apple coming-soon-character" aria-label="Coming soon">
      <div className="apple-bubble coming-soon-bubble" role="note">
        <p>Coming soon</p>
      </div>
      <div
        className="apple-hit coming-soon-apple"
        data-hop={hopping ? "true" : "false"}
        style={{ "--apple": APPLE_HEX } as React.CSSProperties}
        aria-hidden
      >
        <AppleArtwork look={look} leftEyeRef={leftEyeRef} rightEyeRef={rightEyeRef} />
      </div>
    </div>
  );
}
