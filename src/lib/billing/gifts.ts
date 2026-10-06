// Owner-selected fixed support amounts, not a live retail-price feed.
export const SUPPORT_GIFTS = [
  { id: "pen", amount: 1000, nameKo: "BIC 볼펜", nameEn: "A BIC ballpoint pen" },
  { id: "latte", amount: 4700, nameKo: "스타벅스 카페라떼", nameEn: "A Starbucks Caffè Latte" },
  { id: "big-mac", amount: 5700, nameKo: "빅맥", nameEn: "A Big Mac" },
] as const;

export type SupportGiftId = (typeof SUPPORT_GIFTS)[number]["id"];

export function formatSupportAmount(amount: number, locale: "ko" | "en") {
  return new Intl.NumberFormat(locale === "ko" ? "ko-KR" : "en-US", {
    style: "currency", currency: "KRW", maximumFractionDigits: 0,
  }).format(amount);
}
