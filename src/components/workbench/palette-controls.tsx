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
          prompt={savedProject
            ? (locale === "ko" ? "저를 클릭하면 이 Primary로 새 팔레트를 만들어요!" : "Click me to create a new palette from this Primary!")
            : (locale === "ko" ? "저를 클릭해서 새로운 Primary 컬러로 바꿔보세요!" : "Click me to change a new Primary color!")}
        />
      </div>
    </section>
  );
}
