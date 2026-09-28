"use client";

import Image from "next/image";
import { RefreshCw } from "lucide-react";
import { useCopy } from "@/hooks/use-copy";
import { useMatchuStore } from "@/lib/store";

export function LocaleToggle() {
  const copy = useCopy();
  const locale = useMatchuStore((state) => state.locale);
  const setLocale = useMatchuStore((state) => state.setLocale);
  const nextLocale = locale === "ko" ? "en" : "ko";

  return (
    <button
      type="button"
      data-testid="locale-toggle"
      data-locale={locale}
      className="locale-toggle"
      aria-label={locale === "ko" ? copy.otherLocaleName : copy.localeName}
      onClick={() => setLocale(nextLocale)}
    >
      <span key={locale} className="locale-toggle-motion" aria-hidden>
        <span className="locale-flag locale-flag-ko">
          <Image src="/emoji/flag-ko.png" alt="" width={24} height={24} />
        </span>
        <RefreshCw className="locale-recycle" strokeWidth={2.2} />
        <span className="locale-flag locale-flag-en">
          <Image src="/emoji/flag-us.png" alt="" width={24} height={24} />
        </span>
      </span>
    </button>
  );
}
