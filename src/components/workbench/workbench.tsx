"use client";

import { useMemo, useState, type CSSProperties } from "react";
import { Palette, Share2 } from "lucide-react";
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
import { chooseOnColor, tokenPathToCssVar } from "@/lib/color-engine";
import { encodeShare } from "@/lib/share/encode";
import { useMatchuStore } from "@/lib/store";
import { TokenPanel } from "./token-panel";

export function Workbench() {
  const copy = useCopy();
  const input = useMatchuStore((state) => state.input);
  const hasMatched = useMatchuStore((state) => state.hasMatched);
  const platform = useMatchuStore((state) => state.platform);
  const setPlatform = useMatchuStore((state) => state.setPlatform);
  const previewTab = useMatchuStore((state) => state.previewTab);
  const setPreviewTab = useMatchuStore((state) => state.setPreviewTab);
  const matchStage = useMatchuStore((state) => state.matchStage);
  const selectedPaletteId = useMatchuStore((state) => state.selectedPaletteId);
  const setViewAllTokens = useMatchuStore((state) => state.setViewAllTokens);
  const locale = useMatchuStore((state) => state.locale);
  const setLocale = useMatchuStore((state) => state.setLocale);
  const [tokensOpen, setTokensOpen] = useState(false);
  const [tokenOverridesByPalette, setTokenOverridesByPalette] = useState<Record<string, Record<string, string>>>({});

  const result = useColorSystem(input, selectedPaletteId);
  const stage = hasMatched ? "done" : matchStage;
  const view = previewTab === "components" ? "components" : platform;
  const tokenOverrides = tokenOverridesByPalette[selectedPaletteId] ?? {};
  const overrideVars = useMemo(() => Object.fromEntries(
    Object.entries(tokenOverrides).map(([path, value]) => [tokenPathToCssVar(path), value]),
  ), [tokenOverrides]);
  const effectivePrimary = tokenOverrides["primary.default"] ?? result.semantic.light.primary.default;

  async function share() {
    const url = `${window.location.origin}/theme?d=${encodeShare(input)}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success(copy.result.shared);
    } catch {
      toast.error(copy.result.shareFailed);
    }
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-[var(--background)]">
      <SiteHeader
        remakeWordmark
        endAction={
          <div className="studio-gnb-actions">
            <button type="button" className="studio-gnb-action" onClick={() => { setViewAllTokens(false); setTokensOpen(true); }}>
              <Palette aria-hidden />
              <span>{copy.result.tokens}</span>
            </button>
            <button type="button" className="studio-gnb-action" onClick={share}>
              <Share2 aria-hidden />
              <span>{copy.result.share}</span>
            </button>
            <button
              type="button"
              className="studio-locale-action"
              aria-label={locale === "ko" ? copy.otherLocaleName : copy.localeName}
              onClick={() => setLocale(locale === "ko" ? "en" : "ko")}
            >
              {locale === "ko" ? "EN" : "한"}
            </button>
          </div>
        }
      >
        <PalettePicker hex={input.hex} variant="header" />
        <div
          className="studio-nav"
          role="radiogroup"
          aria-label={copy.result.platforms}
          data-view={view}
          style={{
            "--studio-switch-fill": effectivePrimary,
            "--studio-switch-on": chooseOnColor(effectivePrimary),
          } as CSSProperties}
        >
          <ChromeChip
            active={view === "web"}
            matched={hasMatched}
            onClick={() => {
              setPlatform("web");
              setPreviewTab("overview");
            }}
            label={copy.result.web}
          />
          <ChromeChip
            active={view === "app"}
            matched={hasMatched}
            onClick={() => {
              setPlatform("app");
              setPreviewTab("overview");
            }}
            label={copy.result.app}
          />
          <ChromeChip
            active={view === "components"}
            matched={hasMatched}
            onClick={() => setPreviewTab("components")}
            label={copy.preview.components}
          />
        </div>
      </SiteHeader>

      <div className="match-transition relative flex min-h-0 flex-1 flex-col" data-stage={stage}>
        <ThemeScope result={result} extraVars={overrideVars} className="flex h-full min-h-0 flex-col bg-transparent p-2">
          <div className="min-h-0 flex-1">
            <PreviewCanvas platform={platform} tab={previewTab} />
          </div>
        </ThemeScope>
      </div>

      <Sheet open={tokensOpen} onOpenChange={setTokensOpen}>
        <SheetContent
          side="right"
          className="w-[min(100vw,30rem)] p-0 sm:max-w-[30rem]"
          style={{
            "--token-accent": effectivePrimary,
            "--token-accent-on": chooseOnColor(effectivePrimary),
          } as CSSProperties}
        >
          <SheetHeader className="sr-only">
            <SheetTitle>{copy.result.tokens}</SheetTitle>
          </SheetHeader>
          <TokenPanel
            result={result}
            input={input}
            overrides={tokenOverrides}
            onTokenChange={(path, value) => setTokenOverridesByPalette((current) => ({
              ...current,
              [selectedPaletteId]: { ...(current[selectedPaletteId] ?? {}), [path]: value },
            }))}
            onTokenReset={(path) => setTokenOverridesByPalette((current) => {
              const paletteOverrides = { ...(current[selectedPaletteId] ?? {}) };
              delete paletteOverrides[path];
              return { ...current, [selectedPaletteId]: paletteOverrides };
            })}
            onResetAll={() => setTokenOverridesByPalette((current) => ({ ...current, [selectedPaletteId]: {} }))}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}
