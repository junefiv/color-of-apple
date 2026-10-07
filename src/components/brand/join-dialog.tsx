"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { InboxForm } from "@/components/brand/inbox-form";
import { useMatchuStore } from "@/lib/store";

export function JoinDialog() {
  const isKo = useMatchuStore((state) => state.locale) === "ko";
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex rounded-lg bg-black px-5 py-3 text-sm font-medium text-white">Join US</DialogTrigger>
      <DialogContent className="max-h-[min(40rem,calc(100dvh-2rem))] overflow-y-auto sm:max-w-lg">
        <DialogHeader className="pr-8">
          <DialogTitle className="text-lg">Join us</DialogTitle>
          <DialogDescription className="leading-6 text-foreground">
            {isKo
              ? "GIT_IN과 함께 만들고 싶은 내용을 남겨 주세요. 회신은 입력한 메일 주소로 드립니다."
              : "Tell GIT_IN what you want to build together. We reply to the email you enter."}
          </DialogDescription>
        </DialogHeader>
        <InboxForm mode="join" layout="dialog" onSent={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
