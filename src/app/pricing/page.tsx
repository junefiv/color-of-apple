"use client";
import { useState } from "react";
import { SiteFooter } from "@/components/brand/site-footer";
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
  return <div className="graph-paper-page flex min-h-dvh flex-col"><SiteHeader /><main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
    <h1 className="text-center text-3xl font-semibold">Color of Apple Pro</h1>
    <ProPlanDetails locale={locale} billing={billing} />
    <div className="mt-6 flex justify-center"><Button onClick={() => setOpen(true)}>{locale === "ko" ? "플랜 결제하기" : "Subscribe to Pro"}</Button></div>
    <PlanUpgradeDialog open={open} onOpenChange={setOpen} />
  </main><SiteFooter /></div>;
}
