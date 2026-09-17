"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/brand/site-header";
import { ChromeChip } from "@/components/chrome/chrome-chip";
import { ColorField } from "@/components/flow/color-field";
import { PalettePicker } from "@/components/flow/palette-picker";
import { MatchButton } from "@/components/flow/match-button";
import { PreviewCanvas } from "@/components/preview/preview-canvas";
import { ThemeScope } from "@/components/preview/theme-scope";
import { Button } from "@/components/ui/button";
import { useColorSystem } from "@/hooks/use-color-system";
import { useCopy } from "@/hooks/use-copy";
import { interpolate } from "@/lib/copy";
import { exportCss } from "@/lib/export";
import { encodeShare } from "@/lib/share/encode";
import { parseToOklch } from "@/lib/color-engine";
import { getSpacePalette, palettePreviewVars } from "@/lib/space-palettes";
import { useMatchuStore, type AppScreen, type PreviewTab, type WebScreen } from "@/lib/store";
import { ExportSheet } from "./export-sheet";
import { TokenPanel } from "./token-panel";

export function Workbench() {
  const copy = useCopy();
  const input = useMatchuStore((state) => state.input);
  const setInput = useMatchuStore((state) => state.setInput);
  const themeMode = useMatchuStore((state) => state.themeMode);
  const setThemeMode = useMatchuStore((state) => state.setThemeMode);
  const platform = useMatchuStore((state) => state.platform);
  const setPlatform = useMatchuStore((state) => state.setPlatform);
  const previewTab = useMatchuStore((state) => state.previewTab);
  const setPreviewTab = useMatchuStore((state) => state.setPreviewTab);
  const webScreen = useMatchuStore((state) => state.webScreen);
  const setWebScreen = useMatchuStore((state) => state.setWebScreen);
  const appScreen = useMatchuStore((state) => state.appScreen);
  const setAppScreen = useMatchuStore((state) => state.setAppScreen);
  const hasMatched = useMatchuStore((state) => state.hasMatched);
  const matchStage = useMatchuStore((state) => state.matchStage);
  const selectedPaletteId = useMatchuStore((state) => state.selectedPaletteId);
  const completeMatch = useMatchuStore((state) => state.completeMatch);
  const resetMatch = useMatchuStore((state) => state.resetMatch);
  const [exportOpen, setExportOpen] = useState(false);
  const [mobilePane, setMobilePane] = useState<"preview" | "tokens" | "export">("preview");
  const [hexError, setHexError] = useState<string | null>(null);
  const [pressed, setPressed] = useState(false);

  const result = useColorSystem(input);
  const selectedPalette = getSpacePalette(input.hex, selectedPaletteId);
  const paletteVars = palettePreviewVars(selectedPalette.colors);
  const failCount =
    result.accessibility.light.failCount + result.accessibility.dark.failCount;
  const stage = hasMatched ? "done" : matchStage;

  const tabs = useMemo(
    () =>
      [
        ["overview", copy.preview.overview],
        ["components", copy.preview.components],
        ["states", copy.preview.states],
        ["colors", copy.preview.colors],
      ] as Array<[PreviewTab, string]>,
    [copy],
  );

  function onHexChange(value: string) {
    setInput({ hex: value });
    try {
      parseToOklch(value);
      setHexError(null);
    } catch {
      setHexError(copy.input.invalid);
    }
  }

  function rematchFromHere() {
    try {
      parseToOklch(input.hex);
      setHexError(null);
      setPressed(true);
      completeMatch(input.hex);
      window.setTimeout(() => setPressed(false), 240);
    } catch {
      setHexError(copy.input.invalid);
    }
  }

  async function copyCss() {
    try {
      await navigator.clipboard.writeText(exportCss(result));
      toast.success(copy.result.copied);
    } catch {
      toast.error(copy.result.copyFailed);
    }
  }

  async function share() {
    const url = `${window.location.origin}/theme?d=${encodeShare(input)}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success(copy.result.shared);
    } catch {
      toast.error(copy.result.shareFailed);
    }
  }

  function saveDraft() {
    toast.success(copy.result.saved);
  }

  return (
    <div className="flex min-h-screen flex-col bg-[var(--background)]">
      <SiteHeader compact />
      <div className="border-b border-[var(--border-default)] px-5 pb-5 md:px-8">
        <p className="h1-title">{copy.result.title}</p>
        <p className="lead mt-3">{copy.result.body}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="caption rounded-full bg-[var(--neutral-50)] px-2.5 py-1">
            {interpolate(copy.result.colors, { count: result.meta.coreTokenCount })}
          </span>
          <span className="caption rounded-full bg-[var(--neutral-50)] px-2.5 py-1">{copy.result.modes}</span>
          <span className="caption rounded-full bg-[var(--neutral-50)] px-2.5 py-1">{copy.result.platforms}</span>
          <span className="caption rounded-full bg-[var(--neutral-50)] px-2.5 py-1">
            {interpolate(copy.result.contrast, { count: failCount })}
          </span>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(15rem,22rem)] md:items-start">
          <ColorField value={input.hex} onChange={onHexChange} error={hexError} />
          <PalettePicker hex={input.hex} />
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 border-b border-[var(--border-default)] px-5 py-3 md:px-8">
        <div className="flex flex-wrap gap-2">
          <ChromeChip
            active={platform === "web"}
            matched={hasMatched}
            onClick={() => setPlatform("web")}
            label={copy.result.web}
          />
          <ChromeChip
            active={platform === "app"}
            matched={hasMatched}
            onClick={() => setPlatform("app")}
            label={copy.result.app}
          />
          <span className="mx-1 h-5 w-px bg-[var(--border-default)]" />
          {tabs.map(([key, label]) => (
            <ChromeChip
              key={key}
              active={previewTab === key}
              matched={hasMatched}
              onClick={() => setPreviewTab(key)}
              label={label}
            />
          ))}
        </div>
        <Link
          href="/generate"
          onClick={() => resetMatch()}
          className="hidden text-sm text-[var(--text-secondary)] underline-offset-4 hover:underline md:inline"
        >
          {copy.result.rematch}
        </Link>
      </div>

      {previewTab === "overview" ? (
        <div className="flex flex-wrap gap-2 px-5 py-3 md:px-8">
          {platform === "web"
            ? (["shell", "form", "data", "overlay"] as WebScreen[]).map((screen) => (
                <ChromeChip
                  key={screen}
                  active={webScreen === screen}
                  matched={hasMatched}
                  onClick={() => setWebScreen(screen)}
                  label={copy.preview.screens[screen]}
                />
              ))
            : (["list", "detail", "form", "overlay"] as AppScreen[]).map((screen) => (
                <ChromeChip
                  key={screen}
                  active={appScreen === screen}
                  matched={hasMatched}
                  onClick={() => setAppScreen(screen)}
                  label={copy.preview.screens[screen]}
                />
              ))}
        </div>
      ) : null}

      <div className="flex gap-2 border-b border-[var(--border-default)] px-5 py-2 md:hidden">
        {(["preview", "tokens", "export"] as const).map((pane) => (
          <ChromeChip
            key={pane}
            active={mobilePane === pane}
            matched={hasMatched}
            onClick={() => {
              setMobilePane(pane);
              if (pane === "export") setExportOpen(true);
            }}
            label={copy.preview.mobile[pane]}
          />
        ))}
      </div>

      <div className="grid min-h-0 flex-1 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className={mobilePane === "tokens" ? "hidden lg:block" : ""}>
          <div className="match-transition bg-[var(--background)]" data-stage={stage}>
            <ThemeScope
              result={result}
              mode={themeMode}
              extraVars={paletteVars}
              className="min-h-[640px] bg-transparent p-4 md:p-6"
            >
              <PreviewCanvas
                platform={platform}
                tab={previewTab}
                webScreen={webScreen}
                appScreen={appScreen}
                result={result}
                mode={themeMode}
                copy={copy}
              />
            </ThemeScope>
          </div>
        </div>
        <div className={mobilePane === "preview" ? "hidden lg:block" : ""}>
          <TokenPanel result={result} mode={themeMode} />
        </div>
      </div>

      <div className="sticky bottom-0 z-20 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border-default)] bg-[var(--background)]/95 px-5 py-3 backdrop-blur md:px-8">
        <div className="flex gap-2">
          <ChromeChip
            active={themeMode === "light"}
            matched={hasMatched}
            onClick={() => setThemeMode("light")}
            label={copy.result.light}
          />
          <ChromeChip
            active={themeMode === "dark"}
            matched={hasMatched}
            onClick={() => setThemeMode("dark")}
            label={copy.result.dark}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={copyCss}>
            {copy.result.copy}
          </Button>
          <Button variant="outline" onClick={() => setExportOpen(true)}>
            {copy.result.export}
          </Button>
          <Button variant="outline" onClick={saveDraft}>
            {copy.result.save}
          </Button>
          <Button variant="outline" onClick={share}>
            {copy.result.share}
          </Button>
          <MatchButton
            hex={input.hex}
            label={copy.result.rematch}
            pressed={pressed}
            disabled={pressed}
            onClick={rematchFromHere}
          />
        </div>
      </div>

      <ExportSheet
        open={exportOpen}
        onOpenChange={setExportOpen}
        result={result}
        input={input}
      />
    </div>
  );
}
