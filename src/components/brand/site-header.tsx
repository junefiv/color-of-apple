"use client";

import Link from "next/link";
import { Wordmark } from "@/components/brand/wordmark";
import { useCopy } from "@/hooks/use-copy";
import { useMatchuStore } from "@/lib/store";

export function SiteHeader({ compact = false }: { compact?: boolean }) {
  const copy = useCopy();
  const locale = useMatchuStore((state) => state.locale);
  const setLocale = useMatchuStore((state) => state.setLocale);
  const matchedHex = useMatchuStore((state) => state.matchedHex);
  const hasMatched = useMatchuStore((state) => state.hasMatched);
  const hydrated = useMatchuStore((state) => state.hydrated);

  return (
    <header className="flex items-center justify-between gap-4 px-5 py-4 md:px-8">
      <Wordmark matchedColor={hydrated && hasMatched ? matchedHex : null} />
      <div className="flex items-center gap-3 text-xs">
        {!compact ? (
          <Link
            href="/generate"
            className="hidden text-[var(--text-tertiary)] hover:text-[var(--text-primary)] sm:inline"
          >
            {copy.nav.generate}
          </Link>
        ) : null}
        <button
          type="button"
          data-testid="locale-toggle"
          className="rounded-full border border-[var(--border-default)] px-2.5 py-1 text-[11px] text-[var(--text-secondary)]"
          onClick={() => setLocale(locale === "ko" ? "en" : "ko")}
        >
          {locale === "ko" ? "EN" : "한"}
        </button>
      </div>
    </header>
  );
}
