"use client";

import Link from "next/link";
import { useMatchuStore } from "@/lib/store";

export function SiteFooter({ variant = "document" }: { variant?: "document" | "home" }) {
  const isKo = useMatchuStore(state => state.locale) === "ko";
  const isHome = variant === "home";
  const linkClass = isHome ? "inline-flex min-h-9 items-center justify-center rounded-lg bg-black px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-neutral-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black" : "underline underline-offset-4";
  return <footer className={isHome ? "shrink-0 px-4 pb-4 pt-2" : "shrink-0 border-t bg-background px-4 py-5 text-sm text-foreground"}>
    <nav className={`flex flex-wrap items-center justify-center ${isHome ? "gap-2" : "gap-x-5 gap-y-3"}`} aria-label={isKo ? "서비스 정보" : "Service information"}>
      <Link className={linkClass} href="/pricing">{isKo ? "플랜" : "Plans"}</Link>
      <Link className={linkClass} href="/terms">{isKo ? "이용약관" : "Terms"}</Link>
      <Link className={linkClass} href="/privacy">{isKo ? "개인정보 처리방침" : "Privacy"}</Link>
      <Link className={linkClass} href="/refund-policy">{isKo ? "환불 정책" : "Refunds"}</Link>
      <Link className={linkClass} href="/about">About us</Link>
      <Link className={linkClass} href="/contact">Contact us</Link>
    </nav>
  </footer>;
}
