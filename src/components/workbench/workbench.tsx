"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/brand/site-header";
import { ChromeChip } from "@/components/chrome/chrome-chip";
import { ColorField } from "@/components/flow/color-field";
import { PalettePicker } from "@/components/flow/palette-picker";
import { KindPicker } from "@/components/preview/kind-picker";
import { PreviewCanvas } from "@/components/preview/preview-canvas";
import { ThemeScope } from "@/components/preview/theme-scope";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { parseToOklch } from "@/lib/color-engine";
import { useMatchuStore, type PreviewTab } from "@/lib/store";
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
  const hasMatched = useMatchuStore((state) => state.hasMatched);
  const matchStage = useMatchuStore((state) => state.matchStage);
  const selectedPaletteId = useMatchuStore((state) => state.selectedPaletteId);
  const [exportOpen, setExportOpen] = useState(false);
  const [tokensOpen, setTokensOpen] = useState(false);
  const [hexError, setHexError] = useState<string | null>(null);

  const result = useColorSystem(input, selectedPaletteId);
  const stage = hasMatched ? "done" : matchStage;

  const tabs = useMemo(
    () =>
      [
        ["overview", copy.preview.overview],
        ["components", copy.preview.components],
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
      <SiteHeader>
        <div className="studio-color min-w-[11rem] max-w-xs flex-1">
          <ColorField hideLabel value={input.hex} onChange={onHexChange} error={hexError} />
        </div>
        <div className="min-w-[10rem] max-w-[16rem] shrink-0">
          <PalettePicker hex={input.hex} />
        </div>
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
          {previewTab === "overview" ? <KindPicker /> : null}
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
        <button
          type="button"
          className="shrink-0 rounded-full border border-[var(--border-default)] px-3 py-1 text-sm text-[var(--text-secondary)]"
          onClick={() => setTokensOpen(true)}
        >
          {copy.result.tokens}
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger className="shrink-0 rounded-full border border-[var(--border-default)] px-3 py-1 text-sm text-[var(--text-secondary)]">
            {copy.result.export}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={copyCss}>{copy.result.copy}</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setExportOpen(true)}>{copy.result.export}</DropdownMenuItem>
            <DropdownMenuItem onClick={saveDraft}>{copy.result.save}</DropdownMenuItem>
            <DropdownMenuItem onClick={share}>{copy.result.share}</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SiteHeader>

      <div className="match-transition flex min-h-0 flex-1 flex-col" data-stage={stage}>
        <ThemeScope result={result} mode={themeMode} className="flex h-full min-h-0 flex-col bg-transparent p-2">
          <div className="min-h-0 flex-1">
            <PreviewCanvas platform={platform} tab={previewTab} />
          </div>
        </ThemeScope>
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
