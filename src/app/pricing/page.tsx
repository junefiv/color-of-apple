"use client";
import { useState } from "react";
import Link from "next/link";
import { PlanUpgradeDialog } from "@/components/billing/plan-upgrade-dialog";
import { ProPlanDetails } from "@/components/billing/pro-plan-details";
import { SiteHeader } from "@/components/brand/site-header";
import { Button } from "@/components/ui/button";
import { useBillingConfiguration } from "@/lib/billing/client";
import { useMatchuStore } from "@/lib/store";

export default function PricingPage() {
  const locale = useMatchuStore(state => state.locale);
  const billing = useBillingConfiguration();
  const [open, setOpen] = useState(false);
  return <div className="graph-paper-page min-h-dvh"><SiteHeader /><main className="mx-auto max-w-3xl px-4 py-10">
    <h1 className="text-center text-3xl font-semibold">Color of Apple Pro</h1>
    <ProPlanDetails locale={locale} billing={billing} />
    <div className="mt-6 flex justify-center"><Button onClick={() => setOpen(true)}>{locale === "ko" ? "플랜 결제하기" : "Subscribe to Pro"}</Button></div>
    <nav className="mt-5 flex flex-wrap justify-center gap-4 text-xs underline" aria-label="Legal policies"><Link href="/terms">Terms / 이용약관</Link><Link href="/privacy">Privacy / 개인정보</Link><Link href="/refund-policy">Refunds / 환불 정책</Link></nav>
    <PlanUpgradeDialog open={open} onOpenChange={setOpen} />
  </main></div>;
}
