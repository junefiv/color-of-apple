"use client";

import { SiteHeader } from "@/components/brand/site-header";
import { Hero } from "@/components/landing/hero";
import Link from "next/link";
import { useMatchuStore } from "@/lib/store";

export default function HomeClient() {
  const isKo = useMatchuStore((state) => state.locale) === "ko";
  return (
    <div className="home-screen graph-paper-page flex h-dvh flex-col overflow-hidden">
      <SiteHeader />
      <main className="min-h-0 flex-1">
        <Hero />
      </main>
      <footer className="shrink-0 border-t border-[var(--border-default)] px-4 py-2 text-xs text-[var(--text-secondary)]">
        <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2" aria-label={isKo ? "서비스 정보" : "Service information"}>
          <Link className="underline underline-offset-4" href="/pricing">{isKo ? "플랜" : "Plans"}</Link>
          <Link className="underline underline-offset-4" href="/terms">{isKo ? "이용약관" : "Terms"}</Link>
          <Link className="underline underline-offset-4" href="/privacy">{isKo ? "개인정보 처리방침" : "Privacy"}</Link>
          <Link className="underline underline-offset-4" href="/refund-policy">{isKo ? "환불 정책" : "Refunds"}</Link>
          <a className="underline underline-offset-4" href="mailto:dasawafa@gmail.com">{isKo ? "문의" : "Contact"}</a>
        </nav>
      </footer>
    </div>
  );
}
