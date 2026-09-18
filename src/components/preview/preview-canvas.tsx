"use client";

import type { PreviewTab } from "@/lib/store";
import { AppComponentsCatalog } from "./app/components-catalog";
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
    return platform === "web" ? <WebComponentsCatalog /> : <AppComponentsCatalog />;
  }

  return platform === "web" ? <WebPages /> : <AppPages />;
}
