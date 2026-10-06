"use client";

import { useState, type ComponentProps } from "react";
import { Check, Coffee, Gift, PenLine, Sandwich } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { uiToast } from "@/components/ui/toast";
import { SUPPORT_GIFTS, formatSupportAmount, type SupportGiftId } from "@/lib/billing/gifts";
import { useMatchuStore } from "@/lib/store";

const icons = { pen: PenLine, latte: Coffee, "big-mac": Sandwich };

export function GiftDonationDialog({ open, onOpenChange, finalFocus }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  finalFocus?: ComponentProps<typeof DialogContent>["finalFocus"];
}) {
  const locale = useMatchuStore((state) => state.locale);
  const isKo = locale === "ko";
  const [selectedId, setSelectedId] = useState<SupportGiftId>("latte");
  const selected = SUPPORT_GIFTS.find((gift) => gift.id === selectedId)!;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent finalFocus={finalFocus} className="max-h-[88dvh] grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden sm:max-w-2xl">
        <DialogHeader className="pr-7">
          <DialogTitle className="flex items-center gap-2 leading-6"><Gift className="size-5 shrink-0" aria-hidden />{isKo ? "개발자에게 선물하기" : "Send the developer a gift"}</DialogTitle>
          <DialogDescription>{isKo ? "Color of Apple이 마음에 들었다면 작은 선물로 응원해 주세요." : "Enjoying Color of Apple? Support its development with a little gift."}</DialogDescription>
        </DialogHeader>
        <div className="min-h-0 space-y-4 overflow-y-auto">
          <fieldset>
            <legend className="sr-only">{isKo ? "선물 선택" : "Choose a gift"}</legend>
            <div className="grid gap-3 sm:grid-cols-3">
              {SUPPORT_GIFTS.map((gift) => {
                const Icon = icons[gift.id];
                return (
                  <label key={gift.id} className="relative cursor-pointer">
                    <input type="radio" name="support-gift" value={gift.id} checked={selectedId === gift.id} onChange={() => setSelectedId(gift.id)} className="peer sr-only" />
                    <span className="flex h-full items-center gap-3 rounded-xl border border-border p-4 transition-colors peer-checked:border-foreground peer-checked:bg-muted/50 peer-focus-visible:ring-2 peer-focus-visible:ring-ring sm:min-h-40 sm:flex-col sm:items-start">
                      <Icon className="size-7 shrink-0" aria-hidden />
                      <span className="flex-1">
                        <span className="block text-sm font-medium leading-5">{isKo ? `${gift.nameKo} 선물하기` : gift.nameEn}</span>
                        <span className="mt-2 block text-lg font-semibold">{formatSupportAmount(gift.amount, locale)}</span>
                      </span>
                    </span>
                    {selectedId === gift.id ? <Check className="absolute right-3 top-3 size-4" aria-hidden /> : null}
                  </label>
                );
              })}
            </div>
          </fieldset>
          <p className="text-xs leading-5 text-muted-foreground">{isKo ? "개발자에게 전달되는 일회성 후원금이에요. 실제 상품이 배송되지는 않아요." : "This is a one-time tip to the developer. No physical product is delivered."}</p>
          <div className="flex items-center justify-between gap-4 rounded-xl bg-muted/50 px-4 py-3">
            <span className="text-sm text-muted-foreground">{isKo ? "예정 후원금 · KRW" : "Planned tip · KRW"}</span>
            <strong aria-live="polite" className="text-lg">{formatSupportAmount(selected.amount, locale)}</strong>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => uiToast.info(isKo ? "선물 후원 결제 연동을 준비하고 있어요." : "Gift payment integration is being prepared.", locale)}><Gift aria-hidden />{isKo ? "선물 보내기" : "Send gift"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
