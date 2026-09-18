"use client";

import { useMatchuStore } from "@/lib/store";
import { CommunityWeb } from "./kinds/community";
import { EducationWeb } from "./kinds/education";
import { FinanceWeb } from "./kinds/finance";
import { FoodWeb } from "./kinds/food";
import { HealthWeb } from "./kinds/health";
import { MediaWeb } from "./kinds/media";
import { ShopWeb } from "./kinds/shop";
import { TravelWeb } from "./kinds/travel";
import { WorkWeb } from "./kinds/work";

const SCREENS = {
  work: WorkWeb,
  shop: ShopWeb,
  finance: FinanceWeb,
  travel: TravelWeb,
  community: CommunityWeb,
  education: EducationWeb,
  health: HealthWeb,
  media: MediaWeb,
  food: FoodWeb,
} as const;

export function WebPages() {
  const kind = useMatchuStore((state) => state.previewKind);
  const Screen = SCREENS[kind];
  return <Screen />;
}
