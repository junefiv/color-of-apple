"use client";

import { useMatchuStore } from "@/lib/store";
import { CommunityApp } from "./kinds/community";
import { EducationApp } from "./kinds/education";
import { FinanceApp } from "./kinds/finance";
import { FoodApp } from "./kinds/food";
import { HealthApp } from "./kinds/health";
import { MediaApp } from "./kinds/media";
import { ShopApp } from "./kinds/shop";
import { TravelApp } from "./kinds/travel";
import { WorkApp } from "./kinds/work";

const SCREENS = {
  work: WorkApp,
  shop: ShopApp,
  finance: FinanceApp,
  travel: TravelApp,
  community: CommunityApp,
  education: EducationApp,
  health: HealthApp,
  media: MediaApp,
  food: FoodApp,
} as const;

export function AppPages() {
  const kind = useMatchuStore((state) => state.previewKind);
  const Screen = SCREENS[kind];
  return <Screen />;
}
