"use client";

import { InboxForm } from "@/components/brand/inbox-form";
import { SiteDocument } from "@/components/brand/site-document";
import { useMatchuStore } from "@/lib/store";

export function ContactDocument() {
  const isKo = useMatchuStore((state) => state.locale) === "ko";
  return (
    <SiteDocument title="Contact us">
      <p className="mt-4 text-base leading-8">
        {isKo
          ? "문의 종류를 고르면 그에 맞는 항목만 나옵니다. 회신은 입력한 메일 주소로 드립니다."
          : "Choose a topic and the form asks only for what that message needs. We reply to the email you enter."}
      </p>
      <InboxForm mode="inquiry" />
    </SiteDocument>
  );
}
