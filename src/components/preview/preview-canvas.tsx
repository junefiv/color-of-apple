"use client";

import type { ColorSystemResult, ThemeMode } from "@/lib/color-engine";
import type { Copy } from "@/lib/copy";
import type { AppScreen, PreviewTab, WebScreen } from "@/lib/store";
import { AppComponentsCatalog } from "./app/components-catalog";
import { AppDetail } from "./app/detail";
import { AppForm } from "./app/form";
import { AppList } from "./app/list";
import { AppOverlay } from "./app/overlay";
import { AppStates } from "./app/states";
import { ColorsTab } from "./colors-tab";
import { WebAppShell } from "./web/app-shell";
import { WebComponentsCatalog } from "./web/components-catalog";
import { WebData } from "./web/data";
import { WebForm } from "./web/form";
import { WebOverlay } from "./web/overlay";
import { WebStates } from "./web/states";

export function PreviewCanvas({
  platform,
  tab,
  webScreen,
  appScreen,
  result,
  mode,
  copy,
}: {
  platform: "web" | "app";
  tab: PreviewTab;
  webScreen: WebScreen;
  appScreen: AppScreen;
  result: ColorSystemResult;
  mode: ThemeMode;
  copy: Copy;
}) {
  if (tab === "colors") {
    return <ColorsTab result={result} mode={mode} copy={copy} />;
  }

  if (platform === "web") {
    if (tab === "components") return <WebComponentsCatalog />;
    if (tab === "states") return <WebStates />;
    if (webScreen === "form") return <WebForm />;
    if (webScreen === "data") return <WebData />;
    if (webScreen === "overlay") return <WebOverlay />;
    return <WebAppShell />;
  }

  if (tab === "components") return <AppComponentsCatalog />;
  if (tab === "states") return <AppStates />;
  if (appScreen === "detail") return <AppDetail />;
  if (appScreen === "form") return <AppForm />;
  if (appScreen === "overlay") return <AppOverlay />;
  return <AppList />;
}
