"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { ComingSoonApple } from "@/components/coming-soon/coming-soon-apple";
import { SiteHeader } from "@/components/brand/site-header";
import { Button } from "@/components/ui/button";
import { useMatchuStore } from "@/lib/store";

export default function ComingSoonPage() {
  const router = useRouter();
  const locale = useMatchuStore((state) => state.locale);
  const isKo = locale === "ko";

  function goBack() {
    if (window.history.length > 1) router.back();
    else router.push("/");
  }

  return (
    <div className="graph-paper-page flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center px-5 py-12 text-center">
        <ComingSoonApple />
        <p className="mt-9 text-xs font-semibold tracking-[0.18em] text-[var(--text-tertiary)] uppercase">Color of Apple Pro</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[var(--text-primary)]">
          {isKo ? "조금만 기다려 주세요" : "We’re polishing the last details"}
        </h1>
        <p className="mt-3 max-w-sm text-sm leading-6 text-[var(--text-secondary)]">
          {isKo
            ? "월 990원 Pro 플랜과 결제 기능을 준비하고 있어요. 프로젝트 무제한과 광고 제거 기능으로 곧 만나요."
            : "The ₩990/month Pro plan is on its way with unlimited projects and no ads."}
        </p>
        <Button variant="outline" className="mt-7" onClick={goBack}>
          <ArrowLeft aria-hidden />{isKo ? "뒤로가기" : "Go back"}
        </Button>
      </main>
    </div>
  );
}
