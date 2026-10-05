"use client";

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
  return (
    <section className="palette-control-card" aria-label={locale === "ko" ? "팔레트 설정" : "Palette settings"}>
      <div className="palette-control-comment">
        <PrimaryApplePicker hex={theme.primary.default} locale={locale} savedProject={savedProject} onGenerate={onGenerate} />
        <AppleCommentBubble
          theme={commentTheme}
          resetNonce={resetNonce}
          locale={locale}
          prompt={savedProject
            ? (locale === "ko" ? "저를 클릭하면 이 Primary로 새 팔레트를 만들어요!" : "Click me to create a new palette from this Primary!")
            : (locale === "ko" ? "저를 클릭해서 새로운 Primary 컬러를 선택하세요!" : "Click me to choose a new Primary color!")}
        />
      </div>
    </section>
  );
}
