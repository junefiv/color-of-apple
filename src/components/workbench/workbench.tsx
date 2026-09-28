"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { Share2 } from "lucide-react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/brand/site-header";
import { LocaleToggle } from "@/components/brand/locale-toggle";
import { ChromeChip } from "@/components/chrome/chrome-chip";
import { PalettePicker } from "@/components/flow/palette-picker";
import { PreviewCanvas } from "@/components/preview/preview-canvas";
import { ThemeScope } from "@/components/preview/theme-scope";
import { useColorSystem } from "@/hooks/use-color-system";
import { useCopy } from "@/hooks/use-copy";
import { chooseOnColor, deriveBrandTokenOverrides, getToken, tokenPathToCssVar } from "@/lib/color-engine";
import { encodeShare } from "@/lib/share/encode";
import { useMatchuStore } from "@/lib/store";
import { TokenPanel, type TokenFocusRole } from "./token-panel";

function sameOverrides(left: Record<string, string>, right: Record<string, string>) {
  const entries = Object.entries(left);
  return entries.length === Object.keys(right).length && entries.every(([key, value]) => right[key] === value);
}

export function Workbench({ initialTokenOverrides = {} }: { initialTokenOverrides?: Record<string, string> }) {
  const copy = useCopy();
  const input = useMatchuStore((state) => state.input);
  const hasMatched = useMatchuStore((state) => state.hasMatched);
  const platform = useMatchuStore((state) => state.platform);
  const setPlatform = useMatchuStore((state) => state.setPlatform);
  const previewTab = useMatchuStore((state) => state.previewTab);
  const setPreviewTab = useMatchuStore((state) => state.setPreviewTab);
  const matchStage = useMatchuStore((state) => state.matchStage);
  const selectedPaletteId = useMatchuStore((state) => state.selectedPaletteId);
  const [tokenOverridesByPalette, setTokenOverridesByPalette] = useState<Record<string, Record<string, string>>>(() => (
    Object.keys(initialTokenOverrides).length > 0
      ? { [selectedPaletteId]: { ...initialTokenOverrides } }
      : {}
  ));
  const [tokenHistoryByPalette, setTokenHistoryByPalette] = useState<Record<string, Array<Record<string, string>>>>({});
  const [tokenFocus, setTokenFocus] = useState<TokenFocusRole | null>(null);
  const activeTokenEdit = useRef<{ paletteId: string; before: Record<string, string> } | null>(null);
  const tokenOverridesRef = useRef<Record<string, string>>({});

  const result = useColorSystem(input, selectedPaletteId);
  const stage = hasMatched ? "done" : matchStage;
  const view = previewTab === "components" ? "components" : platform;
  const tokenOverrides = tokenOverridesByPalette[selectedPaletteId] ?? {};
  const overrideVars = useMemo(() => Object.fromEntries(
    Object.entries(tokenOverrides).map(([path, value]) => [tokenPathToCssVar(path), value]),
  ), [tokenOverrides]);
  const effectivePrimary = tokenOverrides["primary.default"] ?? result.semantic.light.primary.default;
  const tokenHistory = tokenHistoryByPalette[selectedPaletteId] ?? [];

  tokenOverridesRef.current = tokenOverrides;

  useEffect(() => setTokenFocus(null), [selectedPaletteId, platform, previewTab]);

  function commitTokenOverrides(next: Record<string, string>) {
    activeTokenEdit.current = null;
    if (sameOverrides(tokenOverrides, next)) return;
    setTokenHistoryByPalette((current) => ({
      ...current,
      [selectedPaletteId]: [...(current[selectedPaletteId] ?? []), { ...tokenOverrides }],
    }));
    setTokenOverridesByPalette((current) => ({ ...current, [selectedPaletteId]: next }));
  }

  function nextTokenOverrides(path: string, value: string) {
    return {
      ...tokenOverridesRef.current,
      ...deriveBrandTokenOverrides(result.semantic.light, path, value),
    };
  }

  function beginTokenEdit() {
    activeTokenEdit.current = {
      paletteId: selectedPaletteId,
      before: { ...tokenOverridesRef.current },
    };
  }

  function previewTokenEdit(path: string, value: string) {
    if (activeTokenEdit.current?.paletteId !== selectedPaletteId) beginTokenEdit();
    const next = nextTokenOverrides(path, value);
    tokenOverridesRef.current = next;
    setTokenOverridesByPalette((current) => ({ ...current, [selectedPaletteId]: next }));
  }

  function finishTokenEdit(path: string, value: string) {
    const edit = activeTokenEdit.current;
    const next = nextTokenOverrides(path, value);
    tokenOverridesRef.current = next;
    setTokenOverridesByPalette((current) => ({ ...current, [selectedPaletteId]: next }));

    if (edit?.paletteId === selectedPaletteId && !sameOverrides(edit.before, next)) {
      setTokenHistoryByPalette((current) => ({
        ...current,
        [selectedPaletteId]: [...(current[selectedPaletteId] ?? []), edit.before],
      }));
    }
    activeTokenEdit.current = null;
  }

  function undoTokenChange() {
    activeTokenEdit.current = null;
    const previous = tokenHistory.at(-1);
    if (!previous) return;
    setTokenOverridesByPalette((current) => ({ ...current, [selectedPaletteId]: previous }));
    setTokenHistoryByPalette((current) => ({
      ...current,
      [selectedPaletteId]: (current[selectedPaletteId] ?? []).slice(0, -1),
    }));
  }

  async function share() {
    const url = `${window.location.origin}/result?d=${encodeShare({
      input,
      selectedPaletteId,
      overrides: tokenOverrides,
    })}`;
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
            <button type="button" className="studio-gnb-action" onClick={share}>
              <Share2 aria-hidden />
              <span>{copy.result.share}</span>
            </button>
            <LocaleToggle />
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

      <div
        className="workbench-main match-transition relative min-h-0 flex-1"
        data-stage={stage}
        data-token-panel="open"
      >
        <div className="workbench-preview min-h-0 min-w-0" data-token-focus={tokenFocus ?? undefined}>
          <ThemeScope result={result} extraVars={overrideVars} className="flex h-full min-h-0 flex-col bg-transparent p-2">
            <div className="min-h-0 flex-1">
              <PreviewCanvas platform={platform} tab={previewTab} />
            </div>
          </ThemeScope>
        </div>

        <aside
          className="token-inspector"
          aria-label={copy.tokens.title}
          style={{
            "--token-accent": effectivePrimary,
            "--token-accent-on": chooseOnColor(effectivePrimary),
          } as CSSProperties}
        >
          <TokenPanel
            result={result}
            input={input}
            overrides={tokenOverrides}
            canUndo={tokenHistory.length > 0}
            onUndo={undoTokenChange}
            onTokenFocus={setTokenFocus}
            onTokenEditStart={beginTokenEdit}
            onTokenPreview={previewTokenEdit}
            onTokenChange={finishTokenEdit}
            onTokenReset={(path) => {
              const next = { ...tokenOverrides };
              const resetPaths = Object.keys(
                deriveBrandTokenOverrides(result.semantic.light, path, getToken(result.semantic.light, path)),
              );
              for (const resetPath of resetPaths) delete next[resetPath];
              commitTokenOverrides(next);
            }}
            onResetAll={() => commitTokenOverrides({})}
          />
        </aside>
      </div>
    </div>
  );
}
