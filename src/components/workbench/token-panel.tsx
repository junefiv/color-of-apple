"use client";

import { useEffect, useId, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Copy, Crown, Download, Library, Save, Send, Share2, Undo2 } from "lucide-react";
import { createPortal } from "react-dom";
import { useAuth } from "@/components/auth/auth-provider";
import { FREE_PROJECT_LIMIT, subscribeProjects } from "@/lib/firebase/data";
import { uiToast } from "@/components/ui/toast";
import {
  CORE_TOKENS,
  getToken,
  type ColorSystemResult,
  type GenerateInput,
} from "@/lib/color-engine";
import { formatExport, type ExportFormat } from "@/lib/export";
import { useCopy } from "@/hooks/use-copy";
import { preventProtectedCopy, preventProtectedCopyShortcut } from "@/lib/copy-protection";
import { useMatchuStore } from "@/lib/store";
import { trackProductEvent } from "@/lib/analytics";



import { ColorPickerPopover } from "@/components/flow/color-picker-popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export function TokenPanel({
  result,
  input,
  overrides,
  saving,
  projectTitle,
  savedProject,
  paletteControls,
  onOpenProjects,
  onUpgradePlan,
  onSave,
  onPublish,
  publishLabel,
  onShare,
  onTokenChange,
  onTokenEditStart,
  onTokenPreview,
  onTokenCancel,
  undoableTokens,
  onTokenUndo,
  onTokenFocus,
}: {
  result: ColorSystemResult;
  input: GenerateInput;
  overrides: Record<string, string>;
  saving: boolean;
  projectTitle: string | null;
  savedProject: boolean;
  paletteControls: ReactNode;
  onOpenProjects: () => void;
  onUpgradePlan: () => void;
  onSave: () => void;
  onPublish: () => void;
  publishLabel: string;
  onShare: () => void;
  onTokenChange: (path: string, value: string) => void;
  onTokenEditStart: () => void;
  onTokenPreview: (path: string, value: string) => void;
  onTokenCancel: () => void;
  undoableTokens: string[];
  onTokenUndo: (path: string) => void;
  onTokenFocus: (role: TokenFocusRole | null) => void;
}) {
  const copy = useCopy();
  const { user, profile, signIn } = useAuth();
  const locale = useMatchuStore((state) => state.locale);
  const [exportOpen, setExportOpen] = useState(false);

  const [projectCount, setProjectCount] = useState(0);
  const [occupiedFreeSlots, setOccupiedFreeSlots] = useState(0);

  const [format, setFormat] = useState<ExportFormat>("css");
  const tokens = result.semantic.light;

  const file = useMemo(() => {
    return formatExport(format, applyOverrides(result, overrides), input);
  }, [format, result, overrides, input]);

  useEffect(() => {
    if (!user) {
      setProjectCount(0);
      setOccupiedFreeSlots(0);
      return;
    }
    return subscribeProjects(user.uid, (projects) => {
      const slotIds = new Set(Array.from({ length: FREE_PROJECT_LIMIT }, (_, i) => `slot-${i + 1}`));
      setProjectCount(projects.length);
      setOccupiedFreeSlots(projects.filter((project) => slotIds.has(project.id)).length);
    });
  }, [user]);

  const projectSlots = profile?.plan === "pro" ? "∞" : String(FREE_PROJECT_LIMIT);
  const folderCount = `${projectCount}/${projectSlots}`;
  const saveLabel = saving
    ? (locale === "ko" ? "저장 중…" : "Saving…")
    : savedProject
      ? (locale === "ko" ? "이어서 저장" : "Continue saving")
      : (locale === "ko" ? "컬러북 저장" : "Save colorbook");

  const grouped = CORE_TOKENS.reduce<Record<string, typeof CORE_TOKENS>>((acc, token) => {
    acc[token.group] = acc[token.group] ?? [];
    acc[token.group].push(token);
    return acc;
  }, {});

  async function downloadFile() {
    if (!file) return;
    try {
      if (!user) {
        await signIn();
        void trackProductEvent("user_login", { source: "export_download" });
      }
      const blob = new Blob([file.code], {
        type: file.language === "json" ? "application/json;charset=utf-8" : "text/plain;charset=utf-8",
      });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = file.filename;
      anchor.click();
      URL.revokeObjectURL(url);
      uiToast.success(copy.result.downloaded, locale);
      void trackProductEvent("export_downloaded", { format });
    } catch {
      uiToast.error(locale === "ko" ? "파일을 다운로드하지 못했습니다." : "Could not download the file.", locale);
    }
  }

  async function copyFile() {
    if (!file) return;
    try {
      if (!user) {
        await signIn();
        void trackProductEvent("user_login", { source: "export_copy" });
      }
    } catch {
      uiToast.error(locale === "ko" ? "로그인을 완료하지 못했습니다." : "Could not complete sign-in.", locale);
      return;
    }
    try {
      await navigator.clipboard.writeText(file.code);
      uiToast.success(copy.result.copied, locale);
      void trackProductEvent("export_copied", { format });
    } catch {
      uiToast.error(copy.result.copyFailed, locale);
    }
  }

  return (
    <Dialog open={exportOpen} onOpenChange={setExportOpen}>
    <aside
      className="token-panel-shell copy-protected"
      onCopyCapture={preventProtectedCopy}
      onKeyDownCapture={preventProtectedCopyShortcut}
    >
      <header className="token-panel-header" data-project={savedProject || undefined}>
        <div className="token-panel-title-row">
          {savedProject ? <span className="token-panel-saved-badge"><Library aria-hidden />{locale === "ko" ? "프로젝트" : "Project"}</span> : null}
          <h2 title={savedProject ? projectTitle ?? undefined : undefined}>{savedProject ? projectTitle || (locale === "ko" ? "저장된 프로젝트" : "Saved project") : copy.result.tokens}</h2>
          <DialogTrigger className="token-panel-export-btn" onClick={() => { void trackProductEvent("export_opened"); }}>
            <Download aria-hidden />{copy.result.export}
          </DialogTrigger>
        </div>
      </header>

      <div className="token-panel-body token-card-viewport">
        <div className="token-card-page">
          {paletteControls}
          <div className="token-panel-list">
            {Object.entries(grouped).map(([group, items]) => (
              <div key={group} className="mb-4">
                <p className="mb-1.5 px-1 text-[10px] tracking-wide text-muted-foreground uppercase">
                  {copy.tokens.groups[group as keyof typeof copy.tokens.groups]}
                </p>
                <div className="space-y-1">
                  {items.map((token) => {
                    const guide = copy.tokens.guides[token.key as keyof typeof copy.tokens.guides];
                    return (
                      <TokenRow
                        key={token.key}
                        path={token.path}
                        group={copy.tokens.groups[group as keyof typeof copy.tokens.groups]}
                        label={copy.tokens.labels[token.key as keyof typeof copy.tokens.labels] ?? token.key}
                        hex={overrides[token.path] ?? getToken(tokens, token.path)}
                        role={guide?.role}
                        uses={guide?.uses}
                        usesLabel={copy.tokens.usesLabel}
                        canUndo={undoableTokens.includes(token.path)}
                        undoLabel={copy.tokens.undo}
                        onChange={onTokenChange}
                        onEditStart={onTokenEditStart}
                        onPreview={onTokenPreview}
                        onCancel={onTokenCancel}
                        onUndo={onTokenUndo}
                        onFocusToken={onTokenFocus}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <DialogContent
        className="token-export-dialog copy-protected"
        style={{ "--token-accent": overrides["primary.default"] ?? tokens.primary.default, "--token-accent-on": overrides["primary.onPrimary"] ?? tokens.primary.onPrimary } as CSSProperties}
        onCopyCapture={preventProtectedCopy}
        onKeyDownCapture={preventProtectedCopyShortcut}
      >
        <DialogHeader><DialogTitle>{copy.export.title}</DialogTitle></DialogHeader>
        <div className="token-export-panel">
          <div className="token-export-formats" role="radiogroup" aria-label={copy.export.title}>
            {([[
              "css", copy.export.css,
            ], ["tailwind", copy.export.tailwind], ["react-native", copy.export.reactNative], ["json", copy.export.json], ["figma", copy.export.figma]] as const).map(([key, label]) => (
              <button key={key} type="button" role="radio" aria-checked={format === key} onClick={() => {
                setFormat(key);
                void trackProductEvent("export_format_selected", { format: key });
              }}>{label}</button>
            ))}
          </div>
          <pre>{file?.code}</pre>
          <div className="token-export-actions">
            <button type="button" data-primary onClick={downloadFile}><Download aria-hidden />{copy.export.download}</button>
            <button type="button" onClick={copyFile}><Copy aria-hidden />{copy.export.copy}</button>
          </div>
        </div>
      </DialogContent>

      <footer className="token-panel-footer">
        {user && profile?.plan === "free" && occupiedFreeSlots >= FREE_PROJECT_LIMIT ? (
          <div className="flex items-center justify-between gap-2 px-1 pb-2 text-[11px] text-muted-foreground">
            <span>{locale === "ko" ? "무료 저장 공간을 모두 사용했어요." : "All free slots are in use."}</span>
            <button type="button" className="inline-flex shrink-0 items-center gap-1 underline underline-offset-2" onClick={onUpgradePlan}>
              <Crown className="size-3" aria-hidden />{locale === "ko" ? "Pro 혜택 보기" : "Explore Pro"}
            </button>
          </div>
        ) : null}
        <div className="token-panel-project-actions">
          <button
            type="button"
            className="token-panel-colorbook-btn"
            onClick={onOpenProjects}
          >
            <Library aria-hidden />
            <span className="token-panel-colorbook-copy">
              <span>{locale === "ko" ? "컬러북 폴더" : "Colorbook folder"}</span>
              <span className="token-panel-colorbook-count">{folderCount}</span>
            </span>
          </button>
          <button
            type="button"
            className="token-panel-colorbook-btn"
            disabled={saving}
            aria-label={saveLabel}
            onClick={onSave}
          >
            <Save aria-hidden />
            <span>{saveLabel}</span>
          </button>
          {savedProject ? (
            <button
              type="button"
              className="token-panel-colorbook-btn token-panel-publish-btn"
              disabled={saving}
              onClick={onPublish}
            >
              <Send aria-hidden />
              <span>{publishLabel}</span>
            </button>
          ) : null}
          <button
            type="button"
            className="token-panel-share-btn"
            aria-label={locale === "ko" ? "공유 링크 만들기" : "Create share link"}
            onClick={onShare}
          >
            <Share2 aria-hidden />
            <span className="sr-only">{copy.result.share}</span>
          </button>
        </div>
      </footer>
    </aside>
    </Dialog>
  );
}

function TokenRow({
  path,
  group,
  label,
  hex,
  role,
  uses,
  usesLabel,
  canUndo,
  undoLabel,
  neutralAlias,
  onChange,
  onEditStart,
  onPreview,
  onCancel,
  onUndo,
  onFocusToken,
}: {
  path: string;
  group: string;
  label: string;
  hex: string;
  role?: string;
  uses?: string;
  usesLabel: string;
  canUndo: boolean;
  undoLabel: string;
  neutralAlias?: string | null;
  onChange: (path: string, value: string) => void;
  onEditStart: () => void;
  onPreview: (path: string, value: string) => void;
  onCancel: () => void;
  onUndo: (path: string) => void;
  onFocusToken: (role: TokenFocusRole | null) => void;
}) {
  const rowRef = useRef<HTMLDivElement>(null);
  const helpRef = useRef<HTMLButtonElement>(null);
  const tooltipId = useId();
  const swatchRef = useRef<HTMLButtonElement>(null);
  const originRef = useRef(hex);
  const [open, setOpen] = useState(false);
  const [tipStyle, setTipStyle] = useState<CSSProperties | null>(null);

  const hideTip = () => setTipStyle(null);
  const showTip = () => {
    const rect = rowRef.current?.getBoundingClientRect();
    if (!rect || !role) return;
    const width = Math.min(280, window.innerWidth - 24);
    const fitsLeft = rect.left >= width + 24;
    setTipStyle({
      width,
      ...(fitsLeft ? { right: window.innerWidth - rect.left + 12 }
        : { left: Math.max(12, Math.min(rect.right - width, window.innerWidth - width - 12)) }),
      top: Math.max(12, Math.min(fitsLeft ? rect.top - 18 : rect.bottom + 8, window.innerHeight - 180)),
    });
  };
  const keyboardTip = () => helpRef.current?.matches(":focus-visible") ?? false;

  useEffect(() => {
    const row = rowRef.current;
    if (!tipStyle || !row) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) return;
      setTipStyle(null);
      onFocusToken(null);
    }, { threshold: 0.5 });
    observer.observe(row);
    const dismiss = () => { setTipStyle(null); };
    window.addEventListener("scroll", dismiss, true);
    window.addEventListener("resize", dismiss);
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", dismiss, true);
      window.removeEventListener("resize", dismiss);
    };
  }, [onFocusToken, tipStyle]);

  return (
    <div
      ref={rowRef}
      className="token-row"
      onPointerEnter={() => { onFocusToken(tokenFocusFromPath(path)); }}
      onPointerLeave={() => {
        if (keyboardTip()) return;
        hideTip();
        onFocusToken(null);
      }}
    >
      <button
        ref={swatchRef}
        type="button"
        className="token-color-picker"
        aria-label={`${label} ${hex}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => {
          if (open) {
            onCancel();
            setOpen(false);
            return;
          }
          originRef.current = hex;
          onEditStart();
          setOpen(true);
        }}
      >
        <span style={{ background: hex }} />
      </button>
      {open ? (
        <ColorPickerPopover
          anchorRef={swatchRef}
          color={hex}
          title={label}
          actionLabel="Change Color"
          onChange={(next) => onPreview(path, next)}
          onAction={(next) => {
            if (next.toUpperCase() === originRef.current.toUpperCase()) onCancel();
            else onChange(path, next);
            setOpen(false);
          }}
          onDismiss={() => {
            onCancel();
            setOpen(false);
          }}
        />
      ) : null}
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-semibold">{label}</p>
        <p className="token-name text-[var(--text-tertiary)]">
          {hex.toUpperCase()}{neutralAlias ? <span className="token-neutral-alias"> ({neutralAlias})</span> : null}
        </p>
      </div>
      {canUndo ? <button type="button" className="token-reset" title={undoLabel} aria-label={`${label} ${undoLabel}`} onClick={() => onUndo(path)}><Undo2 aria-hidden /></button> : null}
      {role ? (
        <button
          ref={helpRef}
          type="button"
          className="token-help"
          aria-label={`${label} ${usesLabel}`}
          aria-describedby={tipStyle ? tooltipId : undefined}
          onPointerEnter={showTip}
          onPointerLeave={() => { if (!keyboardTip()) hideTip(); }}
          onFocus={() => { showTip(); onFocusToken(tokenFocusFromPath(path)); }}
          onBlur={() => { hideTip(); onFocusToken(null); }}
          onKeyDown={(event) => { if (event.key === "Escape") hideTip(); }}
        >?</button>
      ) : null}
      {role && tipStyle
        ? createPortal(
            <div id={tooltipId} className="token-tip token-tip-left" role="tooltip" style={tipStyle}>
              <p className="token-tip-kicker">{group}</p>
              <p className="token-tip-name">{label}</p>
              <p className="token-tip-role">{role}</p>
              {uses ? <p className="token-tip-uses"><span>{usesLabel}</span>{uses}</p> : null}
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}

export type TokenFocusRole = "primary" | "secondary" | "accent" | "surface" | "background" | "text";

function tokenFocusFromPath(path: string): TokenFocusRole | null {
  const root = path.split(".")[0]?.toLowerCase();
  if (root === "primary" || root === "secondary" || root === "accent" || root === "surface" || root === "background" || root === "text") {
    return root;
  }
  if (root?.startsWith("on")) return "text";
  return null;
}

function applyOverrides(result: ColorSystemResult, overrides: Record<string, string>) {
  const next = structuredClone(result);
  for (const [path, value] of Object.entries(overrides)) {
    const parts = path.split(".");
    let cursor = next.semantic.light as unknown as Record<string, unknown>;
    for (const part of parts.slice(0, -1)) {
      const nested = cursor[part];
      if (!nested || typeof nested !== "object") break;
      cursor = nested as Record<string, unknown>;
    }
    cursor[parts.at(-1)!] = value;
  }
  return next;
}
