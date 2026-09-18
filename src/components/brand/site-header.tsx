"use client";

import { Wordmark } from "@/components/brand/wordmark";
import { useMatchuStore } from "@/lib/store";

export function SiteHeader({ children }: { children?: React.ReactNode }) {
  const locale = useMatchuStore((state) => state.locale);
  const setLocale = useMatchuStore((state) => state.setLocale);
  const matchedHex = useMatchuStore((state) => state.matchedHex);
  const hasMatched = useMatchuStore((state) => state.hasMatched);
  const hydrated = useMatchuStore((state) => state.hydrated);

  return (
    <header
      className={
        children
          ? "studio-gnb flex shrink-0 items-center gap-2 border-b border-[var(--border-default)] px-3 py-2 md:px-4"
          : "flex items-center justify-between gap-4 px-5 py-4 md:px-8"
      }
    >
      <Wordmark matchedColor={hydrated && hasMatched ? matchedHex : null} />
      {children ? <div className="flex min-w-0 flex-1 items-center gap-2 overflow-visible">{children}</div> : null}
      <button
        type="button"
        data-testid="locale-toggle"
        className="shrink-0 rounded-full border border-[var(--border-default)] px-2.5 py-1 text-[11px] text-[var(--text-secondary)]"
        onClick={() => setLocale(locale === "ko" ? "en" : "ko")}
      >
        {locale === "ko" ? "EN" : "한"}
      </button>
    </header>
  );
}
