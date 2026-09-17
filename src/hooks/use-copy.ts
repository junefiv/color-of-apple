"use client";

import { en } from "@/lib/copy/en";
import { ko } from "@/lib/copy/ko";
import { useMatchuStore } from "@/lib/store";

export function useCopy() {
  const locale = useMatchuStore((state) => state.locale);
  return locale === "en" ? en : ko;
}
