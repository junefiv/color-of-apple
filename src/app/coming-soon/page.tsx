"use client";

import { ArrowLeft, Crown } from "lucide-react";
import { useRouter } from "next/navigation";
import { ProPlanDetails } from "@/components/billing/pro-plan-details";
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
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6 sm:py-12">
        <div className="text-center">
          <p className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-default)] bg-[var(--surface)] px-3 py-1 text-xs font-semibold text-[var(--text-secondary)]">
            <Crown className="size-3.5" aria-hidden />Color of Apple Pro
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-[var(--text-primary)] sm:text-4xl">
            {isKo ? "Pro에서는 무엇이 달라지나요?" : "What changes with Pro?"}
          </h1>
          <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
            {isKo ? "더 많은 컬러북을 모으고, 광고 없이 작업하세요." : "Keep more colorbooks and work without ads."}
          </p>
        </div>
        <ProPlanDetails locale={locale} />
        <Button variant="outline" className="mx-auto mt-6 flex" onClick={goBack}>
          <ArrowLeft aria-hidden />{isKo ? "뒤로가기" : "Go back"}
        </Button>
      </main>
    </div>
  );
}
