"use client";

import { useState, type ComponentProps } from "react";
import { CreditCard, Crown, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FREE_PROJECT_LIMIT } from "@/lib/firebase/data";
import { useMatchuStore } from "@/lib/store";
import { uiToast } from "@/components/ui/toast";
import { ProPlanDetails } from "./pro-plan-details";
import { useAuth } from "@/components/auth/auth-provider";
import { billingErrorMessage, openProCheckout, useBillingConfiguration, type CheckoutPhase } from "@/lib/billing/client";

export function PlanUpgradeDialog({
  open,
  onOpenChange,
  storageFull = false,
  onManageProjects,
  finalFocus,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  storageFull?: boolean;
  onManageProjects?: () => void;
  finalFocus?: ComponentProps<typeof DialogContent>["finalFocus"];
}) {
  const locale = useMatchuStore((state) => state.locale);
  const isKo = locale === "ko";
  const { user, signIn } = useAuth();
  const billing = useBillingConfiguration(open);
  const [phase, setPhase] = useState<CheckoutPhase>("idle");
  async function checkout() {
    if (phase !== "idle") return;
    if (!billing.enabled) {
      uiToast.info(isKo ? "결제 서비스 연동을 준비하고 있어요." : "Payment integration is being prepared.", locale);
      return;
    }
    try {
      setPhase("opening");
      const identity = user ?? await signIn();
      await openProCheckout({ user: identity, config: billing, locale, onPhase: setPhase,
        onError: error => uiToast.error(billingErrorMessage(error, locale), locale),
        onComplete: status => {
          if (status.plan !== "pro") {
            uiToast.info(isKo ? "결제 반영을 확인하고 있어요. 구독 관리에서 상태를 확인해 주세요." : "Your payment is being confirmed. Check subscription settings for updates.", locale);
            return;
          }
          onOpenChange(false);
          if (status.environment === "sandbox") uiToast.info(isKo ? "테스트 결제가 확인됐어요. 실제 Pro 권한은 변경되지 않아요." : "Test payment confirmed. Live Pro access is unchanged.", locale);
          else uiToast.success(isKo ? "Pro 구독이 시작됐어요." : "Your Pro subscription is active.", locale);
        },
      });
    } catch (error) { setPhase("idle"); uiToast.error(billingErrorMessage(error, locale), locale); }
  }
  function manageProjects() {
    onOpenChange(false);
    onManageProjects?.();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent finalFocus={finalFocus} className="max-h-[88dvh] grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden sm:max-w-2xl">
        <DialogHeader className="pr-7">
          <DialogTitle className="flex items-center gap-2 leading-6">
            {storageFull ? <FolderOpen className="size-5 shrink-0" aria-hidden /> : <Crown className="size-5 shrink-0" aria-hidden />}
            {storageFull ? (isKo ? "저장 공간이 가득 찼어요" : "Your saved-color space is full") : (isKo ? "Pro에서는 무엇이 달라지나요?" : "What changes with Pro?")}
          </DialogTitle>
          <DialogDescription>
            {storageFull
              ? (isKo ? `무료 저장 공간 ${FREE_PROJECT_LIMIT}개를 모두 사용했어요. Pro의 혜택과 가격을 확인하거나 기존 컬러북을 정리해 주세요.` : `All ${FREE_PROJECT_LIMIT} free slots are in use. Compare Pro benefits and pricing, or make room by managing your colorbooks.`)
              : (isKo ? "더 많은 컬러북을 모으고, 광고 없이 작업하세요." : "Keep more colorbooks and work without ads.")}
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 overflow-y-auto">
          <ProPlanDetails locale={locale} compact billing={billing} />
          {billing.enabled ? <p className="mt-3 text-center text-xs text-[var(--text-secondary)]"><a href="/terms" target="_blank" rel="noreferrer">{isKo ? "이용약관" : "Terms"}</a> · <a href="/refund-policy" target="_blank" rel="noreferrer">{isKo ? "환불 정책" : "Refund policy"}</a> · <a href="/privacy" target="_blank" rel="noreferrer">{isKo ? "개인정보 처리방침" : "Privacy"}</a></p> : null}
        </div>

        <DialogFooter>
          {onManageProjects ? (
            <Button variant="outline" onClick={manageProjects}><FolderOpen aria-hidden />{isKo ? "기존 컬러북 정리하기" : "Manage colorbooks"}</Button>
          ) : null}
          <Button autoFocus={storageFull} disabled={phase !== "idle"} onClick={() => { void checkout(); }}>
            <CreditCard aria-hidden />{phase === "confirming" ? (isKo ? "결제 확인 중…" : "Confirming payment…") : phase !== "idle" ? (isKo ? "결제창 여는 중…" : "Opening checkout…") : (isKo ? "플랜 결제하기" : "Subscribe to Pro")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
