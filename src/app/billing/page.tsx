"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { PlanUpgradeDialog } from "@/components/billing/plan-upgrade-dialog";
import { SiteHeader } from "@/components/brand/site-header";
import { Button } from "@/components/ui/button";
import { billingErrorMessage, billingRequest, useBillingConfiguration, visitCustomerPortal } from "@/lib/billing/client";
import type { BillingStatus } from "@/lib/billing/types";
import { useMatchuStore } from "@/lib/store";

export default function BillingPage() {
  const { user, loading, signIn } = useAuth();
  const locale = useMatchuStore(state => state.locale);
  const isKo = locale === "ko";
  const config = useBillingConfiguration();
  const [status, setStatus] = useState<BillingStatus | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  async function refresh() {
    if (!user) return;
    setBusy(true); setMessage("");
    try { setStatus(await billingRequest<BillingStatus>("status", user)); }
    catch (error) { setMessage(billingErrorMessage(error, locale)); }
    finally { setBusy(false); }
  }
  useEffect(() => {
    setStatus(null);
    if (user && config.enabled) void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, config.enabled]);
  async function portal() {
    if (!user) return;
    setBusy(true); setMessage("");
    try { visitCustomerPortal((await billingRequest<{ url: string }>("portal", user, {})).url); }
    catch (error) { setMessage(billingErrorMessage(error, locale)); setBusy(false); }
  }
  function date(value: string) { return new Date(value).toLocaleString(isKo ? "ko-KR" : "en-US"); }
  return <div className="graph-paper-page min-h-dvh"><SiteHeader />
    <main className="mx-auto max-w-xl px-4 py-10">
      <h1 className="text-2xl font-semibold">{isKo ? "구독 관리" : "Manage subscription"}</h1>
      {config.enabled && config.environment === "sandbox" ? <p className="mt-3 text-sm text-muted-foreground">{isKo ? "테스트 구독입니다. 실제 결제와 실제 Pro 권한에 영향을 주지 않아요." : "Test subscription. Real payments and live Pro access are unaffected."}</p> : null}
      <section className="mt-5 space-y-3 rounded-2xl border bg-background p-5">
        <p className="font-semibold">{isKo ? "현재 플랜" : "Current plan"}: {status?.plan === "pro" ? "Pro" : "Free"}</p>
        {status?.subscriptionStatus ? <p className="text-sm">{isKo ? "구독 상태" : "Subscription status"}: {({ active: isKo ? "이용 중" : "Active", past_due: isKo ? "결제 지연" : "Past due", canceled: isKo ? "해지 완료" : "Canceled", paused: isKo ? "일시 정지" : "Paused", trialing: isKo ? "체험 중" : "Trial" } as Record<string, string>)[status.subscriptionStatus] ?? status.subscriptionStatus}</p> : null}
        {status?.paidThrough ? <p className="text-sm">{isKo ? "결제한 이용 기간 종료" : "Paid period ends"}: {date(status.paidThrough)}</p> : null}
        {status?.cancelAt ? <p className="text-sm">{isKo ? "해지 예약일" : "Scheduled cancellation"}: {date(status.cancelAt)}</p> : null}
        <p className="text-sm leading-6 text-muted-foreground">{isKo ? "해지를 예약하면 결제한 기간까지 이용할 수 있어요. Free로 돌아가도 기존 컬러북은 삭제되지 않아요." : "After scheduling cancellation, access lasts through your paid period. Existing colorbooks are kept when you return to Free."}</p>
        <p role="status" className="text-sm">{message || (busy ? (isKo ? "확인 중…" : "Checking…") : !config.enabled ? (isKo ? "결제 설정을 준비하고 있어요." : "Payments are being set up.") : "")}</p>
        <div className="flex flex-wrap gap-2">
          {!user ? <Button disabled={loading} onClick={() => { void signIn().catch(error => setMessage(billingErrorMessage(error, locale))); }}>{isKo ? "Google로 로그인" : "Sign in with Google"}</Button> : <>
            {status?.hasSubscription ? <Button disabled={busy} onClick={() => { void portal(); }}>{isKo ? "해지·결제수단·영수증 관리" : "Cancellation, payment methods & receipts"}</Button> : <Button disabled={busy} onClick={() => setUpgradeOpen(true)}>{isKo ? "Pro 플랜 보기" : "View Pro plan"}</Button>}
            <Button variant="outline" disabled={busy || !config.enabled} onClick={() => { void refresh(); }}>{isKo ? "상태 새로고침" : "Refresh status"}</Button>
          </>}
        </div>
      </section>
      <PlanUpgradeDialog open={upgradeOpen} onOpenChange={setUpgradeOpen} />
    </main>
  </div>;
}
