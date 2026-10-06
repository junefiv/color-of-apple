"use client";

import type { ComponentProps } from "react";
import { CreditCard, Crown, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FREE_PROJECT_LIMIT } from "@/lib/firebase/data";
import { useMatchuStore } from "@/lib/store";
import { uiToast } from "@/components/ui/toast";
import { ProPlanDetails } from "./pro-plan-details";

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
              ? (isKo ? `무료 저장 공간 ${FREE_PROJECT_LIMIT}개를 모두 사용했어요. Pro의 예정 혜택과 가격을 확인하거나 기존 컬러북을 정리해 주세요.` : `All ${FREE_PROJECT_LIMIT} free slots are in use. Compare Pro benefits and pricing, or make room by managing your colorbooks.`)
              : (isKo ? "더 많은 컬러북을 모으고, 광고 없이 작업하세요." : "Keep more colorbooks and work without ads.")}
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 overflow-y-auto">
          <ProPlanDetails locale={locale} compact />
        </div>

        <DialogFooter>
          {onManageProjects ? (
            <Button variant="outline" onClick={manageProjects}><FolderOpen aria-hidden />{isKo ? "기존 컬러북 정리하기" : "Manage colorbooks"}</Button>
          ) : null}
          <Button autoFocus={storageFull} onClick={() => uiToast.info(isKo ? "결제 서비스 연동을 준비하고 있어요." : "Payment integration is being prepared.", locale)}>
            <CreditCard aria-hidden />{isKo ? "플랜 결제하기" : "Subscribe to Pro"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
