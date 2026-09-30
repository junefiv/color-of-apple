"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { Palette } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import { SiteHeader } from "@/components/brand/site-header";
import { ChromeChip } from "@/components/chrome/chrome-chip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { uiToast } from "@/components/ui/toast";
import { PalettePicker } from "@/components/flow/palette-picker";
import { PreviewCanvas } from "@/components/preview/preview-canvas";
import { ThemeScope } from "@/components/preview/theme-scope";
import { useColorSystem } from "@/hooks/use-color-system";
import { useCopy } from "@/hooks/use-copy";
import { chooseOnColor, deriveBrandTokenOverrides, getToken, tokenPathToCssVar } from "@/lib/color-engine";
import { encodeShare } from "@/lib/share/encode";
import { isPlanRequiredError, quotaErrorMessage, saveProject } from "@/lib/firebase/data";
import { trackProductEvent } from "@/lib/analytics";
import { applyTokenSnapshot, createTokenSnapshot, diffTokenSnapshots, type ColorHistoryEntry } from "@/lib/project-tokens";
import { MEDIA_QUERIES } from "@/lib/responsive";
import { useMatchuStore } from "@/lib/store";
import { TokenPanel, type TokenFocusRole } from "./token-panel";
import { ProjectLibraryDialog } from "./project-library-dialog";

function sameOverrides(left: Record<string, string>, right: Record<string, string>) {
  const entries = Object.entries(left);
  return entries.length === Object.keys(right).length && entries.every(([key, value]) => right[key] === value);
}

export function Workbench({
  initialTokenOverrides = {},
  initialTokenSnapshot = {},
  initialProjectTitle,
  projectId = null,
}: {
  initialTokenOverrides?: Record<string, string>;
  initialTokenSnapshot?: Record<string, string>;
  initialProjectTitle?: string;
  projectId?: string | null;
}) {
  const copy = useCopy();
  const router = useRouter();
  const { user, signIn } = useAuth();
  const locale = useMatchuStore((state) => state.locale);
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
  const [savedProjectId, setSavedProjectId] = useState<string | null>(projectId);
  const [projectTitle, setProjectTitle] = useState(initialProjectTitle?.trim() ?? "");
  const [projectNameDraft, setProjectNameDraft] = useState(initialProjectTitle?.trim() ?? "");
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [startNewAfterSave, setStartNewAfterSave] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pendingColorHistory, setPendingColorHistory] = useState<ColorHistoryEntry[]>([]);
  const [savedSignature, setSavedSignature] = useState<string | null>(null);
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
  const [projectLimitOpen, setProjectLimitOpen] = useState(false);
  const [projectLibraryOpen, setProjectLibraryOpen] = useState(false);
  const [mobilePreviewOnly, setMobilePreviewOnly] = useState(false);
  const [tokenPanelOpen, setTokenPanelOpen] = useState(false);
  const activeTokenEdit = useRef<{ paletteId: string; before: Record<string, string> } | null>(null);
  const tokenOverridesRef = useRef<Record<string, string>>({});
  const tokenPanelSwipeStart = useRef<number | null>(null);

  const generatedResult = useColorSystem(input, selectedPaletteId);
  const [initialPaletteId] = useState(selectedPaletteId);
  const result = useMemo(
    () => applyTokenSnapshot(generatedResult, selectedPaletteId === initialPaletteId ? initialTokenSnapshot : undefined),
    [generatedResult, initialPaletteId, initialTokenSnapshot, selectedPaletteId],
  );
  const stage = hasMatched ? "done" : matchStage;
  const view = previewTab === "components" ? "components" : platform;
  const tokenOverrides = useMemo(
    () => tokenOverridesByPalette[selectedPaletteId] ?? {},
    [selectedPaletteId, tokenOverridesByPalette],
  );
  const overrideVars = useMemo(() => Object.fromEntries(
    Object.entries(tokenOverrides).map(([path, value]) => [tokenPathToCssVar(path), value]),
  ), [tokenOverrides]);
  const effectivePrimary = tokenOverrides["primary.default"] ?? result.semantic.light.primary.default;
  const tokenHistory = tokenHistoryByPalette[selectedPaletteId] ?? [];
  const effectiveSnapshot = useMemo(() => createTokenSnapshot(result, tokenOverrides), [result, tokenOverrides]);
  const currentSignature = useMemo(
    () => JSON.stringify({ input, selectedPaletteId, tokens: effectiveSnapshot }),
    [effectiveSnapshot, input, selectedPaletteId],
  );
  const hasUnsavedChanges = savedProjectId === null || savedSignature !== currentSignature;

  async function openProjectLibrary() {
    try {
      if (!user) {
        await signIn();
        void trackProductEvent("user_login", { source: "project_library" });
      }
      void trackProductEvent("project_library_opened");
      setProjectLibraryOpen(true);
    } catch {
      uiToast.error(locale === "ko" ? "프로젝트를 불러오려면 로그인이 필요합니다." : "Sign in to open your projects.", locale);
    }
  }

  useEffect(() => {
    tokenOverridesRef.current = tokenOverrides;
  }, [tokenOverrides]);

  useEffect(() => {
    if (projectId && savedSignature === null) queueMicrotask(() => setSavedSignature(currentSignature));
  }, [currentSignature, projectId, savedSignature]);

  useEffect(() => setTokenFocus(null), [selectedPaletteId, platform, previewTab]);

  useEffect(() => {
    const media = window.matchMedia(MEDIA_QUERIES.mobile);
    const syncMobilePreview = () => setMobilePreviewOnly(media.matches);

    syncMobilePreview();
    media.addEventListener("change", syncMobilePreview);
    return () => media.removeEventListener("change", syncMobilePreview);
  }, []);

  useEffect(() => {
    if (mobilePreviewOnly && platform === "web") setPlatform("app");
  }, [mobilePreviewOnly, platform, setPlatform]);

  useEffect(() => {
    if (!savedProjectId || !projectTitle || pendingColorHistory.length === 0) return;
    const timer = window.setTimeout(() => {
      void save({ silent: true });
    }, 1200);
    return () => window.clearTimeout(timer);
    // A committed edit changes pendingColorHistory. `save` intentionally stays
    // out of the dependency list so saving state changes cannot create retries.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSignature, pendingColorHistory, projectTitle, savedProjectId]);

  function commitTokenOverrides(next: Record<string, string>) {
    activeTokenEdit.current = null;
    if (sameOverrides(tokenOverrides, next)) return;
    setTokenHistoryByPalette((current) => ({
      ...current,
      [selectedPaletteId]: [...(current[selectedPaletteId] ?? []), { ...tokenOverrides }],
    }));
    setTokenOverridesByPalette((current) => ({ ...current, [selectedPaletteId]: next }));
    const changes = diffTokenSnapshots(
      createTokenSnapshot(result, tokenOverrides),
      createTokenSnapshot(result, next),
    );
    if (changes.length > 0) setPendingColorHistory((current) => [...current, ...changes]);
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
      const changes = diffTokenSnapshots(
        createTokenSnapshot(result, edit.before),
        createTokenSnapshot(result, next),
      );
      if (changes.length > 0) {
        setPendingColorHistory((current) => [...current, ...changes]);
        void trackProductEvent("token_edited", { changed_token_count: changes.length });
      }
    }
    activeTokenEdit.current = null;
  }

  function undoTokenChange() {
    activeTokenEdit.current = null;
    const previous = tokenHistory.at(-1);
    if (!previous) return;
    const changes = diffTokenSnapshots(
      createTokenSnapshot(result, tokenOverrides),
      createTokenSnapshot(result, previous),
    );
    setTokenOverridesByPalette((current) => ({ ...current, [selectedPaletteId]: previous }));
    setTokenHistoryByPalette((current) => ({
      ...current,
      [selectedPaletteId]: (current[selectedPaletteId] ?? []).slice(0, -1),
    }));
    if (changes.length > 0) setPendingColorHistory((current) => [...current, ...changes]);
  }

  async function share() {
    const url = `${window.location.origin}/result?d=${encodeShare({
      input,
      selectedPaletteId,
      overrides: tokenOverrides,
      tokenSnapshot: effectiveSnapshot,
      platform,
      previewTab,
      projectTitle: projectTitle || undefined,
    })}`;
    try {
      if (!user) {
        await signIn();
        void trackProductEvent("user_login", { source: "share" });
      }
      await navigator.clipboard.writeText(url);
      void trackProductEvent("palette_shared", { platform, preview_tab: previewTab });
      uiToast.success(copy.result.shared, locale);
    } catch {
      uiToast.error(copy.result.shareFailed, locale);
    }
  }

  async function save({ silent = false, titleOverride }: { silent?: boolean; titleOverride?: string } = {}) {
    if (saving) return false;
    const titleToSave = (titleOverride ?? projectTitle).trim();
    if (!titleToSave) {
      setProjectNameDraft("");
      setSaveDialogOpen(true);
      return false;
    }
    const historyToSave = pendingColorHistory;
    const signatureToSave = currentSignature;
    setSaving(true);
    try {
      const currentUser = user ?? await signIn();
      if (!user) void trackProductEvent("user_login", { source: "project_save" });
      const nextProjectId = await saveProject({
        uid: currentUser.uid,
        projectId: savedProjectId,
        title: titleToSave,
        input,
        selectedPaletteId,
        overrides: tokenOverrides,
        tokenSnapshot: effectiveSnapshot,
        historyEntries: historyToSave,
      });
      setSavedProjectId(nextProjectId);
      setProjectTitle(titleToSave);
      setProjectNameDraft(titleToSave);
      setPendingColorHistory((current) => current.slice(historyToSave.length));
      setSavedSignature(signatureToSave);
      void trackProductEvent("project_saved", { updated_existing: Boolean(savedProjectId) });
      if (!silent) uiToast.success(copy.result.saved, locale);
      return true;
    } catch (error) {
      if (isPlanRequiredError(error)) {
        uiToast.info(
          locale === "ko" ? "무료 한도를 모두 사용했어요. Pro 플랜은 곧 제공됩니다." : "You reached the free limit. Pro is coming soon.",
          locale,
        );
        setLeaveDialogOpen(false);
        setProjectLimitOpen(true);
        void trackProductEvent("limit_reached", { kind: "project" });
        return false;
      }
      console.error("Project save failed", error);
      uiToast.error(quotaErrorMessage(error, locale), locale);
      return false;
    } finally {
      setSaving(false);
    }
  }

  function startNewPalette() {
    useMatchuStore.getState().resetSession();
    router.push("/");
  }

  function requestRemake() {
    if (hasUnsavedChanges) setLeaveDialogOpen(true);
    else startNewPalette();
  }

  function requestProjectSave() {
    setStartNewAfterSave(false);
    setProjectNameDraft(projectTitle);
    setSaveDialogOpen(true);
  }

  async function saveAndStartNew() {
    if (!projectTitle) {
      setLeaveDialogOpen(false);
      setStartNewAfterSave(true);
      setProjectNameDraft("");
      setSaveDialogOpen(true);
      return;
    }
    if (await save()) {
      setLeaveDialogOpen(false);
      startNewPalette();
    }
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-[var(--background)]">
      <SiteHeader remakeWordmark onRemake={requestRemake}>
        <PalettePicker hex={input.hex} variant="header" />
        <div
          className="studio-nav"
          role="radiogroup"
          aria-label={copy.result.platforms}
          data-view={view}
          data-mobile-preview={mobilePreviewOnly || undefined}
          style={{
            "--studio-switch-fill": effectivePrimary,
            "--studio-switch-on": chooseOnColor(effectivePrimary),
          } as CSSProperties}
        >
          {!mobilePreviewOnly ? (
            <ChromeChip
              active={view === "web"}
              matched={hasMatched}
              onClick={() => {
                setPlatform("web");
                setPreviewTab("overview");
              }}
              label={copy.result.web}
            />
          ) : null}
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
        data-token-panel={tokenPanelOpen ? "open" : "closed"}
      >
        <div className="workbench-preview min-h-0 min-w-0" data-token-focus={tokenFocus ?? undefined}>
          <ThemeScope result={result} extraVars={overrideVars} className="flex h-full min-h-0 flex-col bg-transparent p-2">
            <div className="min-h-0 flex-1">
              <PreviewCanvas platform={platform} tab={previewTab} />
            </div>
          </ThemeScope>
        </div>

        <button
          type="button"
          className="token-inspector-backdrop"
          aria-label={locale === "ko" ? "컬러 토큰 패널 닫기" : "Close color token panel"}
          onClick={() => setTokenPanelOpen(false)}
        />

        <button
          type="button"
          className="token-inspector-bookmark"
          style={{
            "--token-accent": effectivePrimary,
            "--token-accent-on": chooseOnColor(effectivePrimary),
          } as CSSProperties}
          aria-label={locale === "ko"
            ? `컬러 토큰 패널 ${tokenPanelOpen ? "닫기" : "열기"}`
            : `${tokenPanelOpen ? "Close" : "Open"} color token panel`}
          aria-expanded={tokenPanelOpen}
          onTouchStart={(event) => {
            tokenPanelSwipeStart.current = event.touches[0]?.clientX ?? null;
          }}
          onTouchEnd={(event) => {
            if (tokenPanelSwipeStart.current === null) return;
            const distance = (event.changedTouches[0]?.clientX ?? tokenPanelSwipeStart.current) - tokenPanelSwipeStart.current;
            tokenPanelSwipeStart.current = null;
            if (Math.abs(distance) < 36) return;
            event.preventDefault();
            setTokenPanelOpen(distance < 0);
          }}
          onTouchCancel={() => {
            tokenPanelSwipeStart.current = null;
          }}
          onClick={() => setTokenPanelOpen((open) => !open)}
        >
          <Palette aria-hidden className="token-inspector-bookmark-icon" />
        </button>

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
            saving={saving}
            projectTitle={projectTitle || null}
            savedProject={Boolean(savedProjectId)}
            onOpenProjects={() => { void openProjectLibrary(); }}
            onSave={requestProjectSave}
            onShare={share}
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

      <Dialog open={leaveDialogOpen} onOpenChange={setLeaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{locale === "ko" ? "새 컬러를 선택할까요?" : "Choose a new color?"}</DialogTitle>
            <DialogDescription>
              {locale === "ko"
                ? "저장하지 않은 컬러 팔레트와 수정 내용은 사라집니다."
                : "Your unsaved palette and color changes will be lost."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>
              {locale === "ko" ? "현재 화면 유지" : "Stay here"}
            </DialogClose>
            <Button variant="outline" onClick={() => { setLeaveDialogOpen(false); startNewPalette(); }}>
              {locale === "ko" ? "저장 안 하고 새 컬러 선택" : "Discard and choose"}
            </Button>
            <Button disabled={saving} onClick={() => { void saveAndStartNew(); }}>
              {locale === "ko" ? "저장하고 새 컬러 선택" : "Save and choose"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={saveDialogOpen} onOpenChange={(open) => {
        setSaveDialogOpen(open);
        if (!open) setStartNewAfterSave(false);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {savedProjectId
                ? (locale === "ko" ? "프로젝트 저장" : "Save project")
                : (locale === "ko" ? "프로젝트 추가" : "Add project")}
            </DialogTitle>
            <DialogDescription>
              {savedProjectId
                ? (locale === "ko"
                    ? "현재 컬러와 변경 이력을 이 프로젝트에 덮어씁니다. 프로젝트 이름도 변경할 수 있습니다."
                    : "This overwrites the project with the current colors and history. You can also rename it.")
                : (locale === "ko"
                    ? "컬러 팔레트를 구분할 프로젝트 이름을 입력해 주세요."
                    : "Enter a name that will help you identify this palette.")}
            </DialogDescription>
          </DialogHeader>
          <label className="grid gap-2 text-sm font-medium">
            {locale === "ko" ? "프로젝트 이름" : "Project name"}
            <Input
              autoFocus
              value={projectNameDraft}
              maxLength={60}
              placeholder={locale === "ko" ? "예: 브랜드 메인 컬러" : "e.g. Brand primary colors"}
              onChange={(event) => setProjectNameDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key !== "Enter" || !projectNameDraft.trim() || saving) return;
                event.preventDefault();
                void (async () => {
                  if (await save({ titleOverride: projectNameDraft })) {
                    setSaveDialogOpen(false);
                    if (startNewAfterSave) startNewPalette();
                  }
                })();
              }}
            />
          </label>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>
              {locale === "ko" ? "취소" : "Cancel"}
            </DialogClose>
            <Button disabled={!projectNameDraft.trim() || saving} onClick={async () => {
              if (await save({ titleOverride: projectNameDraft })) {
                setSaveDialogOpen(false);
                if (startNewAfterSave) startNewPalette();
              }
            }}>
              {saving
                ? (locale === "ko" ? "저장 중…" : "Saving…")
                : savedProjectId
                  ? (locale === "ko" ? "덮어쓰기 저장" : "Overwrite project")
                  : (locale === "ko" ? "프로젝트 추가" : "Add project")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ProjectLibraryDialog
        open={projectLibraryOpen}
        onOpenChange={setProjectLibraryOpen}
        currentProjectId={savedProjectId}
      />

      <Dialog open={projectLimitOpen} onOpenChange={setProjectLimitOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{locale === "ko" ? "무료 프로젝트 5개를 모두 사용했어요" : "All 5 free project slots are in use"}</DialogTitle>
            <DialogDescription>
              {locale === "ko"
                ? "기존 프로젝트를 하나 삭제하고 다시 저장하거나 Pro 플랜을 확인해 주세요."
                : "Delete an existing project and save again, or review the Pro plan."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setProjectLimitOpen(false);
              void openProjectLibrary();
            }}>
              {locale === "ko" ? "기존 프로젝트 관리" : "Manage projects"}
            </Button>
            <Button onClick={() => router.push("/coming-soon")}>
              {locale === "ko" ? "Pro 플랜 보기" : "View Pro plan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
