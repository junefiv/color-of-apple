"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth/auth-provider";
import { SiteHeader } from "@/components/brand/site-header";
import { Button } from "@/components/ui/button";
import { billingErrorMessage, billingRequest, confirmCheckoutPayment, openProCheckout, useBillingConfiguration } from "@/lib/billing/client";
import type { BillingStatus } from "@/lib/billing/types";
import { useMatchuStore } from "@/lib/store";

export function CheckoutReturn({ transactionId, paymentLink }: { transactionId: string | null; paymentLink: boolean }) {
  const { user, loading, signIn } = useAuth();
  const locale = useMatchuStore(state => state.locale);
  const isKo = locale === "ko";
  const config = useBillingConfiguration();
  const started = useRef<string | null>(null);
  const [status, setStatus] = useState<BillingStatus | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function check() {
    if (!user || !transactionId || busy) return;
    setBusy(true); setMessage("");
    let opened = false;
    try {
      // The server verifies that this transaction belongs to the signed-in account.
      const result = paymentLink
        ? await billingRequest<BillingStatus & { paymentStatus: string }>("confirm", user, { transactionId })
        : await confirmCheckoutPayment(user, transactionId);
      setStatus(result);
      if (paymentLink && result.plan !== "pro" && ["draft", "ready", "billed", "past_due"].includes(result.paymentStatus)) {
        await openProCheckout({ user, config, locale, transactionId,
          onPhase: phase => setBusy(phase !== "idle"), onComplete: setStatus,
          onError: error => setMessage(billingErrorMessage(error, locale)) });
        opened = true;
      }
    } catch (error) { setMessage(billingErrorMessage(error, locale)); }
    finally { if (!opened) setBusy(false); }
  }

  useEffect(() => {
    if (!user || !config.enabled || !transactionId || started.current === transactionId) return;
    started.current = transactionId;
    void check();
    // A redirect is checked once; subsequent attempts are initiated by the user.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, config.enabled, transactionId]);

  const confirmed = status?.plan === "pro";
  return <div className="graph-paper-page min-h-dvh"><SiteHeader />
    <main className="mx-auto max-w-xl px-4 py-12 text-center">
      <h1 className="text-2xl font-semibold">{confirmed ? (isKo ? "결제가 확인됐어요" : "Payment confirmed") : (isKo ? "결제 확인" : "Confirm payment")}</h1>
      <p className="mt-4 text-sm leading-6 text-muted-foreground" role="status">
        {message || (confirmed ? (status.environment === "sandbox"
          ? (isKo ? "테스트 결제가 완료됐어요. 실제 청구와 실제 Pro 권한 변경은 없어요." : "Test payment completed. No real charge or change to live Pro access.")
          : (isKo ? "Pro 구독이 시작됐어요. 이제 컬러북을 무제한으로 저장할 수 있어요." : "Pro is active. You can now save unlimited colorbooks."))
          : !transactionId ? (isKo ? "결제 링크가 없어요. 플랜 화면에서 결제를 시작해 주세요." : "No payment link. Start checkout from the plan page.")
          : !config.enabled ? (isKo ? "결제 설정을 준비하고 있어요." : "Payments are being set up.")
          : busy || loading ? (isKo ? "서버에서 결제 내역을 확인하고 있어요…" : "Checking the payment on the server…")
          : (isKo ? "결제한 계정으로 로그인해 상태를 확인해 주세요." : "Sign in with the account used for payment to check its status."))}
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {!user ? <Button disabled={loading} onClick={() => { void signIn().catch(error => setMessage(billingErrorMessage(error, locale))); }}>{isKo ? "Google로 로그인" : "Sign in with Google"}</Button>
          : !confirmed && transactionId && config.enabled ? <Button disabled={busy} onClick={() => { void check(); }}>{isKo ? "결제 다시 확인" : "Check again"}</Button> : null}
        <Button variant="outline" render={<Link href="/" />}>{isKo ? "컬러 작업으로 돌아가기" : "Return to your colors"}</Button>
        <Button variant="outline" render={<Link href="/billing" />}>{isKo ? "구독 관리" : "Manage subscription"}</Button>
      </div>
    </main>
  </div>;
}
