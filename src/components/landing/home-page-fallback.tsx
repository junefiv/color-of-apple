import type { CSSProperties } from "react";
import { LogoAppleStatic } from "@/components/brand/logo-apple";
import { AppleArtwork } from "@/components/flow/apple-artwork";
import { ko } from "@/lib/copy/ko";
import { APPLE_HEX } from "@/lib/picked-color";

export function HomePageFallback() {
  return (
    <div className="graph-paper-page flex min-h-dvh flex-col" aria-busy="true">
      <header className="flex items-center justify-between gap-4 px-5 py-4 md:px-8">
        <span className="logo inline-flex items-center gap-2 text-[var(--text-primary)]">
          <LogoAppleStatic hex={APPLE_HEX} />
          <span>Color of Apple</span>
        </span>
        <span className="shrink-0 rounded-full border border-[var(--border-default)] px-2.5 py-1 text-[11px] text-[var(--text-secondary)]">
          EN
        </span>
      </header>
      <main className="mx-auto flex min-h-[calc(100dvh-5.5rem)] w-full max-w-xl flex-1 flex-col items-center justify-center px-5 py-10">
        <div className="color-apple">
          <div className="apple-bubble" role="note">
            <p>{ko.hero.pickHint}</p>
          </div>
          <div
            className="apple-hit"
            style={{ "--apple": APPLE_HEX } as CSSProperties}
            aria-hidden
          >
            <AppleArtwork />
          </div>
        </div>
        <div className="hero-generate mt-8 flex w-full max-w-xs flex-col items-center">
          <span
            className="match-button has-color inline-flex w-full min-w-[12rem] items-center justify-center rounded-full px-6 py-4 text-base font-semibold"
            style={
              {
                "--match-fill": APPLE_HEX,
                "--match-opacity": 1,
                color: "#111111",
              } as CSSProperties
            }
          >
            {ko.hero.generate}
          </span>
        </div>
      </main>
    </div>
  );
}
