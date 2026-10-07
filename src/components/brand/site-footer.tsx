"use client";

import Link from "next/link";
import { useMatchuStore } from "@/lib/store";

export function SiteFooter() {
  const isKo = useMatchuStore(state => state.locale) === "ko";
  return <footer className="shrink-0 border-t bg-background px-4 py-5 text-sm text-foreground">
    <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-3 underline underline-offset-4" aria-label={isKo ? "서비스 정보" : "Service information"}>
      <Link href="/pricing">{isKo ? "플랜" : "Plans"}</Link>
      <Link href="/terms">{isKo ? "이용약관" : "Terms"}</Link>
      <Link href="/privacy">{isKo ? "개인정보 처리방침" : "Privacy"}</Link>
      <Link href="/refund-policy">{isKo ? "환불 정책" : "Refunds"}</Link>
      <a href="mailto:dasawafa@gmail.com">{isKo ? "문의" : "Contact"}</a>
    </nav>
  </footer>;
}
