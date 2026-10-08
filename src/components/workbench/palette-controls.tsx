"use client";

import { useCallback, useState } from "react";
import type { SemanticTokens } from "@/lib/color-engine";
import { PrimaryApplePicker } from "./primary-apple-picker";
import { AppleCommentBubble } from "./apple-comment-bubble";

export function PaletteControls({ theme, commentTheme, locale, savedProject, resetNonce, onGenerate }: {
  theme: SemanticTokens;
  commentTheme: SemanticTokens;
  locale: "ko" | "en";
  savedProject: boolean;
  resetNonce: number;
  onGenerate: (hex: string) => void;
}) {
  const [hopNonce, setHopNonce] = useState(0);
  const [appleHopping, setAppleHopping] = useState(false);
  const registerHop = useCallback(() => setHopNonce((value) => value + 1), []);

  return (
    <section className="palette-control-card" aria-label={locale === "ko" ? "팔레트 설정" : "Palette settings"}>
      <div className="palette-control-comment">
        <PrimaryApplePicker
          hex={theme.primary.default}
          locale={locale}
          savedProject={savedProject}
          onGenerate={onGenerate}
          onHop={registerHop}
          onHoppingChange={setAppleHopping}
        />
        <AppleCommentBubble
          theme={commentTheme}
          resetNonce={resetNonce}
          hopNonce={hopNonce}
          wobble={appleHopping}
          locale={locale}
          prompt={locale === "ko" ? "저를 클릭해서 색을 고르고, Generate를 누르면 새 팔레트가 만들어져요!" : "Click me to pick a color, then press Generate for a new palette!"}
        />
      </div>
    </section>
  );
}
