"use client";

import type { PreviewTab } from "@/lib/store";
import { AppPages } from "./app-pages";
import { WebComponentsCatalog } from "./web/components-catalog";
import { WebPages } from "./web-pages";

export function PreviewCanvas({
  platform,
  tab,
}: {
  platform: "web" | "app";
  tab: PreviewTab;
}) {
  if (tab === "components") {
    return <WebComponentsCatalog />;
  }

  return platform === "web" ? <WebPages /> : <AppPages />;
}
