"use client";

import { ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/brand/site-header";
import { ChromeChip } from "@/components/chrome/chrome-chip";
import { PalettePicker } from "@/components/flow/palette-picker";
import { PreviewCanvas } from "@/components/preview/preview-canvas";
import { ThemeScope } from "@/components/preview/theme-scope";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useColorSystem } from "@/hooks/use-color-system";
import { useCopy } from "@/hooks/use-copy";
import { exportCss } from "@/lib/export";
import { encodeShare } from "@/lib/share/encode";
import { isHexColor, normalizeHex, resolvePickedHex } from "@/lib/picked-color";
import { useMatchuStore, type PreviewTab } from "@/lib/store";
import { ExportSheet } from "./export-sheet";
import { TokenPanel } from "./token-panel";
import { WorkbenchMoreMenu } from "./workbench-more-menu";

export function Workbench() {
  const copy = useCopy();
  const router = useRouter();
  const input = useMatchuStore((state) => state.input);
  const matchedHex = useMatchuStore((state) => state.matchedHex);
  const hasMatched = useMatchuStore((state) => state.hasMatched);
  const hydrated = useMatchuStore((state) => state.hydrated);
  const resetSession = useMatchuStore((state) => state.resetSession);
  const themeMode = useMatchuStore((state) => state.themeMode);
  const setThemeMode = useMatchuStore((state) => state.setThemeMode);
  const platform = useMatchuStore((state) => state.platform);
  const setPlatform = useMatchuStore((state) => state.setPlatform);
  const previewTab = useMatchuStore((state) => state.previewTab);
  const setPreviewTab = useMatchuStore((state) => state.setPreviewTab);
  const matchStage = useMatchuStore((state) => state.matchStage);
  const selectedPaletteId = useMatchuStore((state) => state.selectedPaletteId);
  const [exportOpen, setExportOpen] = useState(false);
  const [tokensOpen, setTokensOpen] = useState(false);

  const result = useColorSystem(input, selectedPaletteId);
  const stage = hasMatched ? "done" : matchStage;
  const mainColor =
    hydrated && hasMatched && matchedHex && isHexColor(matchedHex)
      ? normalizeHex(matchedHex)
      : resolvePickedHex(input.hex);

  const tabs = useMemo(
    () =>
      [
        ["overview", copy.preview.overview],
        ["components", copy.preview.components],
      ] as Array<[PreviewTab, string]>,
    [copy],
  );

  function remake() {
    resetSession();
    router.push("/");
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
    <div className="flex h-dvh flex-col overflow-hidden bg-[var(--background)]">
      <SiteHeader
        endAction={
          <WorkbenchMoreMenu
            onTokens={() => setTokensOpen(true)}
            onCopyCss={copyCss}
            onExport={() => setExportOpen(true)}
            onSave={saveDraft}
            onShare={share}
          />
        }
      >
        <button type="button" className="studio-remake" onClick={remake}>
          <span className="studio-remake-swatch" style={{ background: mainColor }} aria-hidden />
          <span className="studio-remake-copy">
            <span className="studio-remake-title">{copy.result.remake}</span>
            <span className="studio-remake-hint">{copy.result.remakeHint}</span>
          </span>
          <ChevronRight className="studio-remake-icon" aria-hidden />
        </button>
        <div className="studio-nav" role="group" aria-label={copy.result.platforms}>
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
        </div>
        <div className="studio-nav-sub" role="group" aria-label={copy.preview.overview}>
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
        <button
          type="button"
          className="studio-theme"
          aria-pressed={themeMode === "dark"}
          onClick={() => setThemeMode(themeMode === "light" ? "dark" : "light")}
        >
          <span data-on={themeMode === "light"}>{copy.result.light}</span>
          <span data-on={themeMode === "dark"}>{copy.result.dark}</span>
        </button>
      </SiteHeader>

      <div className="match-transition relative flex min-h-0 flex-1 flex-col" data-stage={stage}>
        <ThemeScope result={result} mode={themeMode} className="flex h-full min-h-0 flex-col bg-transparent p-2">
          <div className="min-h-0 flex-1">
            <PreviewCanvas platform={platform} tab={previewTab} />
          </div>
        </ThemeScope>
        <PalettePicker hex={input.hex} variant="floating" />
      </div>

      <Sheet open={tokensOpen} onOpenChange={setTokensOpen}>
        <SheetContent side="right" className="w-[min(100vw,26rem)] p-0 sm:max-w-md">
          <SheetHeader className="sr-only">
            <SheetTitle>{copy.result.tokens}</SheetTitle>
          </SheetHeader>
          <TokenPanel result={result} mode={themeMode} />
        </SheetContent>
      </Sheet>
      <ExportSheet
        open={exportOpen}
        onOpenChange={setExportOpen}
        result={result}
        input={input}
      />
    </div>
  );
}
