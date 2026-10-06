"use client";

import { useRef, useState } from "react";
import { Gift } from "lucide-react";
import { useMatchuStore } from "@/lib/store";
import { GiftDonationDialog } from "./gift-donation-dialog";

export function GiftSupportButton() {
  const locale = useMatchuStore((state) => state.locale);
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const label = locale === "ko" ? "개발자에게 선물하기" : "Send the developer a gift";

  return (
    <>
      <button ref={triggerRef} type="button" className="gift-support-button" aria-label={label} aria-haspopup="dialog" onClick={() => setOpen(true)}>
        <Gift aria-hidden />
        <span className="gift-support-label-full">{label}</span>
        <span className="gift-support-label-short" aria-hidden>{locale === "ko" ? "선물하기" : "Send a gift"}</span>
      </button>
      <GiftDonationDialog open={open} onOpenChange={setOpen} finalFocus={triggerRef} />
    </>
  );
}
