"use client";

import type { ComponentType } from "react";
import { useMatchuStore, type PreviewGenre, type PreviewTab } from "@/lib/store";
import { BudgetApp, BudgetWeb } from "./budget-preview";
import { BookingApp, BookingWeb } from "./genres/booking-preview";
import { ShopApp, ShopWeb } from "./genres/shop-preview";
import { TravelApp, TravelWeb } from "./genres/travel-preview";
import { WebComponentsCatalog } from "./web/components-catalog";

// One sample service per genre, each with a web page and an app screen.
const GENRES: Record<PreviewGenre, { web: ComponentType; app: ComponentType }> = {
  budget: { web: BudgetWeb, app: BudgetApp },
  shop: { web: ShopWeb, app: ShopApp },
  booking: { web: BookingWeb, app: BookingApp },
  travel: { web: TravelWeb, app: TravelApp },
};

export function PreviewCanvas({
  platform,
  tab,
}: {
  platform: "web" | "app";
  tab: PreviewTab;
}) {
  const genre = useMatchuStore((state) => state.genre);
  if (tab === "components") {
    return <WebComponentsCatalog />;
  }
  const sample = GENRES[genre] ?? GENRES.budget;
  const Sample = platform === "web" ? sample.web : sample.app;
  // Keyed by genre so switching starts the new sample from its first screen.
  return <Sample key={`${genre}-${platform}`} />;
}
