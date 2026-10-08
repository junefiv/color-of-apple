"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { Palette } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import { CommunityPanel } from "@/components/community/community-panel";
import { PublishDialog } from "@/components/community/publish-dialog";
import { fetchPublications } from "@/lib/community/client";
import { PlanUpgradeDialog } from "@/components/billing/plan-upgrade-dialog";
import { SiteHeader } from "@/components/brand/site-header";
import { SiteFooter } from "@/components/brand/site-footer";
import { ChromeChip } from "@/components/chrome/chrome-chip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { uiToast } from "@/components/ui/toast";
import { PreviewCanvas } from "@/components/preview/preview-canvas";
import { ThemeScope } from "@/components/preview/theme-scope";
import { useColorSystem } from "@/hooks/use-color-system";
import { useCopy } from "@/hooks/use-copy";
import { chooseOnColor, deriveBrandTokenOverrides, tokenPathToCssVar } from "@/lib/color-engine";
import { undoToken } from "@/lib/token-undo";
import { encodeShare } from "@/lib/share/encode";
import { writePreviewDraft } from "@/lib/preview-draft";
import { hasAvailableProjectSlot, isPlanRequiredError, quotaErrorMessage, saveProject } from "@/lib/firebase/data";
import { trackProductEvent } from "@/lib/analytics";
import type { ProjectSource } from "@/lib/community/source";
import type { CommunityPost } from "@/lib/community/types";
import { applyTokenSnapshot, createTokenSnapshot, diffTokenSnapshots, type ColorHistoryEntry } from "@/lib/project-tokens";
import { MEDIA_QUERIES } from "@/lib/responsive";
import { useMatchuStore } from "@/lib/store";
import { TokenPanel, type TokenFocusRole } from "./token-panel";
import { ProjectLibraryDialog } from "./project-library-dialog";
import { PaletteControls } from "./palette-controls";
import { PalettePicker } from "@/components/flow/palette-picker";

function sameOverrides(left: Record<string, string>, right: Record<string, string>) {
  const entries = Object.entries(left);
  return entries.length === Object.keys(right).length && entries.every(([key, value]) => right[key] === value);
}

export function Workbench({
  initialTokenOverrides = {},
  initialTokenSnapshot = {},
  initialProjectTitle,
  initialSource = null,
  projectId = null,
  mode = "edit",
}: {
  initialTokenOverrides?: Record<string, string>;
  initialTokenSnapshot?: Record<string, string>;
  initialProjectTitle?: string;
  initialSource?: ProjectSource | null;
  projectId?: string | null;
  mode?: "edit" | "community";
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
  const [committedOverridesByPalette, setCommittedOverridesByPalette] = useState(tokenOverridesByPalette);
  const [tokenFocus, setTokenFocus] = useState<TokenFocusRole | null>(null);
  const [savedProjectId, setSavedProjectId] = useState<string | null>(projectId);
  const [projectTitle, setProjectTitle] = useState(initialProjectTitle?.trim() ?? "");
  const [projectNameDraft, setProjectNameDraft] = useState(initialProjectTitle?.trim() ?? "");
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pendingColorHistory, setPendingColorHistory] = useState<ColorHistoryEntry[]>([]);
  const [savedSignature, setSavedSignature] = useState<string | null>(null);
  const [checkingSave, setCheckingSave] = useState(false);
  const [freeingProjectSlot, setFreeingProjectSlot] = useState(false);
  const [upgradeDialog, setUpgradeDialog] = useState<"limit" | "plan" | null>(null);
  const [projectLibraryOpen, setProjectLibraryOpen] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);
  const [publishedPostId, setPublishedPostId] = useState<string | null>(null);
  const [mobilePreviewOnly, setMobilePreviewOnly] = useState(false);
  const [tokenPanelOpen, setTokenPanelOpen] = useState(false);
  const [inspector, setInspector] = useState<"tokens" | "community">(mode === "community" ? "community" : "tokens");
  const [communityPost, setCommunityPost] = useState<CommunityPost | null>(null);
  const [narrowWorkbench, setNarrowWorkbench] = useState(false);
  const [sourceMissing, setSourceMissing] = useState(false);
  const [resetNonce, setResetNonce] = useState(0);
  const activeTokenEdit = useRef<{ paletteId: string; before: Record<string, string> } | null>(null);
  const tokenOverridesRef = useRef<Record<string, string>>({});
  const tokenPanelSwipeStart = useRef<number | null>(null);
  const previewScrollRef = useRef<HTMLDivElement>(null);
  const previewToolbarRef = useRef<HTMLDivElement>(null);
  const [previewToolbarHidden, setPreviewToolbarHidden] = useState(false);
  const [previewDockMounted, setPreviewDockMounted] = useState(false);
  const [previewDockOpen, setPreviewDockOpen] = useState(false);

  const generatedResult = useColorSystem(input, selectedPaletteId);
  const communityGenerated = useColorSystem(
    communityPost?.palette.input ?? input,
    communityPost?.palette.selectedPaletteId ?? selectedPaletteId,
  );
  const [initialPaletteId] = useState(selectedPaletteId);
  const [useInitialSnapshot, setUseInitialSnapshot] = useState(true);
  const result = useMemo(
    () => applyTokenSnapshot(generatedResult, useInitialSnapshot && selectedPaletteId === initialPaletteId ? initialTokenSnapshot : undefined),
    [generatedResult, initialPaletteId, initialTokenSnapshot, selectedPaletteId, useInitialSnapshot],
  );
  const showingCommunity = (mode === "community" || inspector === "community") && Boolean(communityPost);
  const previewResult = useMemo(
    () => showingCommunity && communityPost
      ? applyTokenSnapshot(communityGenerated, communityPost.palette.tokenSnapshot)
      : result,
    [communityGenerated, communityPost, result, showingCommunity],
  );
  const stage = mode === "community" || hasMatched ? "done" : matchStage;
  const view = previewTab === "components" ? "components" : platform;
  const tokenOverrides = useMemo(
    () => tokenOverridesByPalette[selectedPaletteId] ?? {},
    [selectedPaletteId, tokenOverridesByPalette],
  );
  const overrideVars = useMemo(() => Object.fromEntries(
    Object.entries(tokenOverrides).map(([path, value]) => [tokenPathToCssVar(path), value]),
  ), [tokenOverrides]);
  const previewVars = showingCommunity ? {} : overrideVars;
  const effectivePrimary = showingCommunity
    ? previewResult.semantic.light.primary.default
    : tokenOverrides["primary.default"] ?? result.semantic.light.primary.default;
  const tokenHistory = tokenHistoryByPalette[selectedPaletteId] ?? [];
  const effectiveSnapshot = useMemo(() => createTokenSnapshot(result, tokenOverrides), [result, tokenOverrides]);
  const effectiveTheme = useMemo(() => applyTokenSnapshot(result, effectiveSnapshot).semantic.light, [result, effectiveSnapshot]);
  const commentTheme = useMemo(() => applyTokenSnapshot(
    result, createTokenSnapshot(result, committedOverridesByPalette[selectedPaletteId] ?? {}),
  ).semantic.light, [result, committedOverridesByPalette, selectedPaletteId]);
  const currentSignature = useMemo(
    () => JSON.stringify({ input, selectedPaletteId, tokens: effectiveSnapshot }),
    [effectiveSnapshot, input, selectedPaletteId],
  );
  useEffect(() => {
    if (mode === "community" || !hasMatched) return;
    writePreviewDraft({ input, selectedPaletteId, overrides: tokenOverrides,
      tokenSnapshot: effectiveSnapshot, platform, previewTab, projectTitle,
      engineVersion: result.meta.engineVersion }, savedProjectId);
  }, [effectiveSnapshot, hasMatched, input, mode, platform, previewTab, projectTitle, result.meta.engineVersion, savedProjectId, selectedPaletteId, tokenOverrides]);
  async function openProjectLibrary() {
    try {
      if (!user) {
        await signIn();
        void trackProductEvent("user_login", { source: "project_library" });
      }
      void trackProductEvent("project_library_opened");
      setProjectLibraryOpen(true);
    } catch {
      uiToast.error(locale === "ko" ? "저장한 컬러를 보려면 로그인이 필요합니다." : "Sign in to view your saved colors.", locale);
    }
  }

  useEffect(() => {
    if (projectLibraryOpen || !user || !savedProjectId) {
      if (!user || !savedProjectId) setPublishedPostId(null);
      return;
    }
    let cancel = false;
    void fetchPublications(user).then((result) => {
      if (!cancel) setPublishedPostId(result.items.find((item) => item.projectId === savedProjectId)?.postId ?? null);
    }).catch(() => undefined);
    return () => { cancel = true; };
  }, [projectLibraryOpen, savedProjectId, user]);

  useEffect(() => {
    tokenOverridesRef.current = tokenOverrides;
  }, [tokenOverrides]);

  useEffect(() => {
    if (projectId && savedSignature === null) queueMicrotask(() => setSavedSignature(currentSignature));
  }, [currentSignature, projectId, savedSignature]);

  useEffect(() => setTokenFocus(null), [selectedPaletteId, platform, previewTab]);

  useEffect(() => {
    const root = previewScrollRef.current;
    const toolbar = previewToolbarRef.current;
    if (!root || !toolbar) return;
    const observer = new IntersectionObserver(
      ([entry]) => setPreviewToolbarHidden(!entry.isIntersecting),
      { root, threshold: 0 },
    );
    observer.observe(toolbar);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (previewToolbarHidden) {
      setPreviewDockMounted(true);
      let second = 0;
      const first = requestAnimationFrame(() => {
        second = requestAnimationFrame(() => setPreviewDockOpen(true));
      });
      return () => {
        cancelAnimationFrame(first);
        cancelAnimationFrame(second);
      };
    }
    setPreviewDockOpen(false);
  }, [previewToolbarHidden]);

  useEffect(() => {
    if (previewToolbarHidden || previewDockOpen || !previewDockMounted) return;
    const timer = window.setTimeout(() => setPreviewDockMounted(false), 300);
    return () => window.clearTimeout(timer);
  }, [previewDockMounted, previewDockOpen, previewToolbarHidden]);

  useEffect(() => {
    if (!initialSource) return;
    let cancel = false;
    void fetch(`/api/community/posts/${initialSource.postId}`).then((response) => {
      if (!cancel) setSourceMissing(response.status === 404 || response.status === 422);
    }).catch(() => undefined);
    return () => { cancel = true; };
  }, [initialSource]);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 1199px)");
    const sync = () => setNarrowWorkbench(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

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
    setCommittedOverridesByPalette((current) => ({ ...current, [selectedPaletteId]: next }));

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

  function cancelTokenEdit() {
    const edit = activeTokenEdit.current;
    activeTokenEdit.current = null;
    if (!edit || edit.paletteId !== selectedPaletteId) return;
    tokenOverridesRef.current = edit.before;
    setTokenOverridesByPalette((current) => ({ ...current, [selectedPaletteId]: edit.before }));
  }

  function undoTokenChange(path: string) {
    activeTokenEdit.current = null;
    const undone = undoToken(path, tokenOverrides, tokenHistory);
    if (!undone) return;
    setResetNonce(value => value + 1);
    const changes = diffTokenSnapshots(
      createTokenSnapshot(result, tokenOverrides),
      createTokenSnapshot(result, undone.overrides),
    );
    tokenOverridesRef.current = undone.overrides;
    setTokenOverridesByPalette((current) => ({ ...current, [selectedPaletteId]: undone.overrides }));
    setCommittedOverridesByPalette((current) => ({ ...current, [selectedPaletteId]: undone.overrides }));
    setTokenHistoryByPalette((current) => ({
      ...current,
      [selectedPaletteId]: undone.history,
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
        setSaveDialogOpen(false);
        setUpgradeDialog("limit");
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

  function generateFromPrimary(hex: string) {
    setUseInitialSnapshot(false);
    setTokenOverridesByPalette({});
    setCommittedOverridesByPalette({});
    setTokenHistoryByPalette({});
    tokenOverridesRef.current = {};
    activeTokenEdit.current = null;
    setPendingColorHistory([]);
    setSavedProjectId(null);
    setProjectTitle("");
    setSavedSignature(null);
    setTokenFocus(null);
    const store = useMatchuStore.getState();
    const paletteId = store.selectedPaletteId;
    store.setInput({ hex });
    store.resetMatch();
    store.setSelectedPaletteId(paletteId);
    // Drop saved/shared payloads so the new run uses the chosen Primary.
    router.replace("/result");
    void trackProductEvent("generate", { source: "token_panel" });
  }

  async function requestProjectSave() {
    if (checkingSave || saving) return;
    setCheckingSave(true);
    try {
      const currentUser = user ?? await signIn();
      if (!user) void trackProductEvent("user_login", { source: "project_save" });
      setProjectNameDraft(projectTitle);
      if (!savedProjectId && !await hasAvailableProjectSlot(currentUser.uid)) {
        setUpgradeDialog("limit");
        void trackProductEvent("limit_reached", { kind: "project" });
        return;
      }
      setSaveDialogOpen(true);
    } catch {
      uiToast.error(locale === "ko" ? "저장 준비를 완료하지 못했습니다. 다시 시도해 주세요." : "Could not prepare to save. Please try again.", locale);
    } finally {
      setCheckingSave(false);
    }
  }

  function openPublish() {
    if (!savedProjectId) return;
    setPublishOpen(true);
  }

  const showPalettePicker = mode === "edit" && inspector === "tokens" && !savedProjectId;
  function previewViewSwitch() {
    return (
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
      {showingCommunity ? <span className="community-readonly">{copy.community.readonly}</span> : null}
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
    );
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-[var(--background)]">
      <SiteHeader compact remakeWordmark onRemake={startNewPalette} />

      <div
        className="workbench-main match-transition relative min-h-0 flex-1"
        data-stage={stage}
        data-inspector={mode === "community" ? "community" : inspector}
        data-token-panel={tokenPanelOpen ? "open" : "closed"}
      >
        <div className="workbench-preview min-h-0 min-w-0" data-token-focus={tokenFocus ?? undefined} data-dock={previewToolbarHidden ? "true" : "false"}>
          <div className="workbench-preview-scroll" ref={previewScrollRef}>
          <div className="workbench-preview-stage">
          <div className="workbench-preview-toolbar" ref={previewToolbarRef} inert={previewToolbarHidden || undefined} aria-hidden={previewToolbarHidden || undefined}>
            <div className="workbench-preview-toolbar-end">
              {previewViewSwitch()}
              {showPalettePicker && !previewToolbarHidden ? <PalettePicker hex={input.hex} variant="panel" /> : null}
            </div>
          </div>
          {sourceMissing && inspector === "tokens" ? <p className="community-source-note">{copy.community.sourceMissing}</p> : null}
          <ThemeScope result={previewResult} extraVars={previewVars} className="flex min-h-0 flex-1 flex-col bg-transparent p-2">
            <div className="min-h-0 flex-1">
              <PreviewCanvas platform={platform} tab={previewTab} />
            </div>
          </ThemeScope>
          </div>
          <SiteFooter />
          {previewDockMounted ? <div className="workbench-preview-dock-spacer" /> : null}
          </div>
          {previewDockMounted ? (
            <div className="workbench-preview-dock" data-state={previewDockOpen ? "open" : "closed"} role="region" aria-hidden={previewDockOpen ? undefined : true} aria-label={locale === "ko" ? "미리보기 조작" : "Preview controls"}>
              {previewViewSwitch()}
              {showPalettePicker ? <PalettePicker hex={input.hex} variant="panel" /> : null}
            </div>
          ) : null}
        </div>

        {tokenPanelOpen ? (
          <button
            type="button"
            className="token-inspector-dismiss"
            aria-label={locale === "ko" ? "컬러 토큰 패널 닫기" : "Close color token panel"}
            onClick={() => setTokenPanelOpen(false)}
          />
        ) : null}

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
            const touch = event.touches[0];
            tokenPanelSwipeStart.current = touch ? (inspector === "community" && narrowWorkbench ? touch.clientY : touch.clientX) : null;
          }}
          onTouchEnd={(event) => {
            if (tokenPanelSwipeStart.current === null) return;
            const touch = event.changedTouches[0];
            const next = inspector === "community" && narrowWorkbench ? touch?.clientY : touch?.clientX;
            const distance = (next ?? tokenPanelSwipeStart.current) - tokenPanelSwipeStart.current;
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
            "--color-primary-default": tokenOverrides["primary.default"] ?? result.semantic.light.primary.default,
            "--color-primary-text": tokenOverrides["primary.text"] ?? result.semantic.light.primary.text,
            "--color-surface-default": tokenOverrides["surface.default"] ?? result.semantic.light.surface.default,
          } as CSSProperties}
        >
          {mode === "edit" ? (
            <div className="community-tabs" role="tablist" aria-label={copy.community.entry}>
              <button type="button" role="tab" aria-selected={inspector === "tokens"} className="community-tab" onClick={() => setInspector("tokens")}>{copy.community.tokens}</button>
              <button type="button" role="tab" aria-selected={inspector === "community"} className="community-tab" onClick={() => setInspector("community")}>{copy.community.entry}</button>
            </div>
          ) : null}
          {mode === "community" || inspector === "community" ? (
            <CommunityPanel
              mode={mode}
              selectedId={communityPost?.id ?? null}
              onSelect={setCommunityPost}
              onProjectLimit={() => setUpgradeDialog("limit")}
            />
          ) : (
          <TokenPanel
            paletteControls={<PaletteControls theme={effectiveTheme} commentTheme={commentTheme} locale={locale} savedProject={Boolean(savedProjectId)} resetNonce={resetNonce} onGenerate={generateFromPrimary} />}
            result={result}
            input={input}
            overrides={tokenOverrides}
            saving={saving || checkingSave}
            projectTitle={projectTitle || null}
            savedProject={Boolean(savedProjectId)}
            onOpenProjects={() => { void openProjectLibrary(); }}
            onUpgradePlan={() => setUpgradeDialog("plan")}
            onSave={requestProjectSave}
            onPublish={openPublish}
            publishLabel={publishedPostId ? copy.community.manage : copy.community.publish}
            onShare={share}
            undoableTokens={Array.from(new Set(tokenHistory.flatMap(entry => Object.keys(entry)).concat(Object.keys(tokenOverrides))))
              .filter(path => tokenHistory.some(entry => entry[path] !== tokenOverrides[path]))}
            onTokenUndo={undoTokenChange}
            onTokenFocus={setTokenFocus}
            onTokenEditStart={beginTokenEdit}
            onTokenPreview={previewTokenEdit}
            onTokenChange={finishTokenEdit}
            onTokenCancel={cancelTokenEdit}
          />
          )}
        </aside>
      </div>

      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {savedProjectId
                ? (locale === "ko" ? "저장한 컬러 수정" : "Update saved colors")
                : (locale === "ko" ? "현재 컬러 저장" : "Save current colors")}
            </DialogTitle>
            <DialogDescription>
              {savedProjectId
                ? (locale === "ko"
                    ? "현재 컬러와 변경 이력을 저장된 내용에 반영합니다. 이름도 변경할 수 있습니다."
                    : "Update the saved colors and history. You can also rename them.")
                : (locale === "ko"
                    ? "나중에 알아보기 쉬운 저장 이름을 입력해 주세요."
                    : "Enter a name that will help you identify these colors later.")}
            </DialogDescription>
          </DialogHeader>
          <label className="grid gap-2 text-sm font-medium">
            {locale === "ko" ? "저장 이름" : "Saved color name"}
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
              }
            }}>
              {saving
                ? (locale === "ko" ? "저장 중…" : "Saving…")
                : savedProjectId
                  ? (locale === "ko" ? "변경 내용 저장" : "Save changes")
                  : (locale === "ko" ? "저장" : "Save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <PlanUpgradeDialog
        open={upgradeDialog !== null}
        onOpenChange={(open) => { if (!open) setUpgradeDialog(null); }}
        storageFull={upgradeDialog === "limit"}
        onManageProjects={() => {
          setFreeingProjectSlot(upgradeDialog === "limit");
          setProjectLibraryOpen(true);
        }}
      />

      {savedProjectId ? (
        <PublishDialog
          open={publishOpen}
          onOpenChange={setPublishOpen}
          snapshot={effectiveSnapshot}
          projectId={savedProjectId}
          defaultTitle={projectTitle}
          existingPostId={publishedPostId}
          needsSave={savedSignature !== null && (savedSignature !== currentSignature || pendingColorHistory.length > 0)}
          onSaveFirst={() => save()}
          onSaved={(post) => setPublishedPostId(post.id)}
        />
      ) : null}

      <ProjectLibraryDialog
        open={projectLibraryOpen}
        onOpenChange={(open) => { setProjectLibraryOpen(open); if (!open) setFreeingProjectSlot(false); }}
        currentProjectId={savedProjectId}
        unsaved={Boolean(savedProjectId) && savedSignature !== null && (savedSignature !== currentSignature || pendingColorHistory.length > 0)}
        onSaveCurrent={() => save()}
        freeSlot={freeingProjectSlot}
        onSlotFreed={() => {
          setProjectLibraryOpen(false);
          setFreeingProjectSlot(false);
          setSaveDialogOpen(true);
        }}
      />
    </div>
  );
}
