"use client";

import { Wordmark } from "@/components/brand/wordmark";
import { LocaleToggle } from "@/components/brand/locale-toggle";
import { AccountButton } from "@/components/auth/account-sheet";
import { GiftSupportButton } from "@/components/billing/gift-support-button";

export function SiteHeader({
  children,
  endAction,
  remakeWordmark = false,
  onRemake,
  compact = false,
}: {
  children?: React.ReactNode;
  endAction?: React.ReactNode;
  remakeWordmark?: boolean;
  onRemake?: () => void;
  compact?: boolean;
}) {
  return (
    <header
      className={
        children || compact
          ? "site-header studio-gnb flex shrink-0 items-center justify-between gap-2 overflow-visible border-b border-[var(--border-default)] px-3 py-2 md:px-4"
          : "site-header flex items-center justify-between gap-4 px-5 py-4 md:px-8"
      }
    >
      <Wordmark remake={remakeWordmark} onRemake={onRemake} />
      {children ? <div className="studio-gnb-center flex min-w-0 flex-1 items-center gap-2 overflow-visible">{children}</div> : null}
      {endAction ?? (
        <div className="studio-gnb-actions">
          <GiftSupportButton />
          <AccountButton />
          <LocaleToggle />
        </div>
      )}
    </header>
  );
}
