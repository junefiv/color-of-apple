"use client";

import { toast as sonnerToast } from "sonner";
import type { Locale } from "@/lib/copy";

type FeedbackTone = "success" | "error" | "info";

const TITLES: Record<Locale, Record<FeedbackTone, string>> = {
  ko: { success: "성공", error: "실패", info: "안내" },
  en: { success: "Success", error: "Failed", info: "Info" },
};

function show(tone: FeedbackTone, message: string, locale: Locale = "ko") {
  return sonnerToast[tone](TITLES[locale][tone], {
    description: message,
    duration: tone === "error" ? 5000 : 3200,
  });
}

export const uiToast = {
  success: (message: string, locale?: Locale) => show("success", message, locale),
  error: (message: string, locale?: Locale) => show("error", message, locale),
  info: (message: string, locale?: Locale) => show("info", message, locale),
};
