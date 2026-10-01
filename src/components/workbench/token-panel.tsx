"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { Copy, Download, Library, RotateCcw, Save, Share2, Undo2 } from "lucide-react";
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
import { PrimaryApplePicker } from "./primary-apple-picker";
import { AppleCommentBubble } from "./apple-comment-bubble";
import { PalettePicker } from "@/components/flow/palette-picker";
import { ColorPickerPopover } from "@/components/flow/color-picker-popover";

export function TokenPanel({
  result,
  input,
  overrides,
  saving,
  projectTitle,
  savedProject,
  onOpenProjects,
  onSave,
  onShare,
  onTokenChange,
  onTokenEditStart,
  onTokenPreview,
  onTokenCancel,
  onTokenReset,
  onResetAll,
  canUndo,
  onUndo,
  onTokenFocus,
  onNewPalette,
}: {
  result: ColorSystemResult;
  input: GenerateInput;
  overrides: Record<string, string>;
  saving: boolean;
  projectTitle: string | null;
  savedProject: boolean;
  onOpenProjects: () => void;
  onSave: () => void;
  onShare: () => void;
  onTokenChange: (path: string, value: string) => void;
  onTokenEditStart: () => void;
  onTokenPreview: (path: string, value: string) => void;
  onTokenCancel: () => void;
  onTokenReset: (path: string) => void;
  onResetAll: () => void;
  canUndo: boolean;
  onUndo: () => void;
  onTokenFocus: (role: TokenFocusRole | null) => void;
  onNewPalette: (hex: string) => void;
}) {
  const copy = useCopy();
  const { user, profile, signIn } = useAuth();
  const locale = useMatchuStore((state) => state.locale);
  const [panel, setPanel] = useState<"tokens" | "export">("tokens");
  const [projectCount, setProjectCount] = useState(0);
  const [resetNonce, setResetNonce] = useState(0);
  const [format, setFormat] = useState<ExportFormat>("css");
  const tokens = result.semantic.light;
  const theme = useMemo(() => applyOverrides(result, overrides).semantic.light, [overrides, result]);
  const file = useMemo(() => {
    return formatExport(format, applyOverrides(result, overrides), input);
  }, [format, result, overrides, input]);

  useEffect(() => {
    if (!user) {
      setProjectCount(0);
      return;
    }
    return subscribeProjects(user.uid, (projects) => setProjectCount(projects.length));
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
    <aside
      className="token-panel-shell copy-protected"
      onCopyCapture={preventProtectedCopy}
      onKeyDownCapture={preventProtectedCopyShortcut}
    >
      <header className="token-panel-header">
        <div className="token-panel-tabs" data-panel={panel} role="tablist" aria-label={copy.tokens.title}>
          <button type="button" role="tab" aria-selected={panel === "tokens"} onClick={() => setPanel("tokens")}>
            {copy.result.tokens}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={panel === "export"}
            onClick={() => {
              setPanel("export");
              void trackProductEvent("export_opened");
            }}
          >
            {copy.result.export}
          </button>
        </div>
        <div className="token-panel-project-heading">
          <p className="ui-label text-[var(--text-tertiary)]">{projectTitle ?? copy.tokens.title}</p>
          {savedProject ? (
            <span className="token-panel-saved-badge">
              {locale === "ko" ? "저장된 컬러" : "Saved color"}
            </span>
          ) : null}
        </div>
        {panel === "tokens" ? (
          <div className="token-history-actions token-panel-toolbar">
            <button type="button" disabled={!canUndo} onClick={() => { setResetNonce((value) => value + 1); onUndo(); }}>
              <Undo2 aria-hidden />{copy.tokens.undo}
            </button>
            <button type="button" disabled={Object.keys(overrides).length === 0} onClick={() => { setResetNonce((value) => value + 1); onResetAll(); }}>
              <RotateCcw aria-hidden />{copy.tokens.resetAll}
            </button>
          </div>
        ) : null}
      </header>

      <div className="token-panel-body token-card-viewport">
        <div className="token-card-track" data-panel={panel}>
        <div className="token-card-page" aria-hidden={panel !== "tokens"} inert={panel !== "tokens"}>
          <div className="token-palette-setup">
            <div className="token-apple-row">
              <PrimaryApplePicker hex={overrides["primary.default"] ?? tokens.primary.default} locale={locale} onGenerate={onNewPalette} />
              <AppleCommentBubble
                theme={theme}
                resetNonce={resetNonce}
                locale={locale}
                prompt={locale === "ko" ? "저를 클릭해서 새로운 Primary 컬러를 선택하세요!" : "Click me to choose a new Primary color!"}
              />
            </div>
            <PalettePicker hex={input.hex} variant="panel" />
          </div>
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
                        edited={Boolean(overrides[token.path])}
                        onChange={onTokenChange}
                        onEditStart={onTokenEditStart}
                        onPreview={onTokenPreview}
                        onCancel={onTokenCancel}
                        onReset={onTokenReset}
                        onFocusToken={onTokenFocus}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="token-card-page" aria-hidden={panel !== "export"} inert={panel !== "export"}>
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
        </div>
        </div>
      </div>

      <footer className="token-panel-footer">
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
  edited,
  neutralAlias,
  onChange,
  onEditStart,
  onPreview,
  onCancel,
  onReset,
  onFocusToken,
}: {
  path: string;
  group: string;
  label: string;
  hex: string;
  role?: string;
  uses?: string;
  usesLabel: string;
  edited: boolean;
  neutralAlias?: string | null;
  onChange: (path: string, value: string) => void;
  onEditStart: () => void;
  onPreview: (path: string, value: string) => void;
  onCancel: () => void;
  onReset: (path: string) => void;
  onFocusToken: (role: TokenFocusRole | null) => void;
}) {
  const rowRef = useRef<HTMLDivElement>(null);
  const swatchRef = useRef<HTMLButtonElement>(null);
  const originRef = useRef(hex);
  const [open, setOpen] = useState(false);
  const [tipStyle, setTipStyle] = useState<CSSProperties | null>(null);

  const hideTip = () => setTipStyle(null);
  const showTip = () => {
    const rect = rowRef.current?.getBoundingClientRect();
    if (!rect || !role) return;
    setTipStyle({
      width: 280,
      right: window.innerWidth - rect.left + 12,
      top: Math.min(Math.max(12, rect.top - 18), window.innerHeight - 180),
    });
  };
  const keyboardTip = () => rowRef.current?.matches(":focus-visible") ?? false;

  useEffect(() => {
    const row = rowRef.current;
    if (!tipStyle || !row) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) return;
      setTipStyle(null);
      onFocusToken(null);
    }, { threshold: 0.5 });
    observer.observe(row);
    return () => observer.disconnect();
  }, [onFocusToken, tipStyle]);

  return (
    <div
      ref={rowRef}
      className="token-row"
      tabIndex={role ? 0 : undefined}
      onPointerEnter={() => { showTip(); onFocusToken(tokenFocusFromPath(path)); }}
      onPointerLeave={() => {
        if (keyboardTip()) return;
        hideTip();
        onFocusToken(null);
      }}
      onFocus={(event) => {
        if (!event.currentTarget.matches(":focus-visible")) return;
        showTip();
        onFocusToken(tokenFocusFromPath(path));
      }}
      onBlur={(event) => {
        hideTip();
        if (!event.currentTarget.contains(event.relatedTarget)) onFocusToken(null);
      }}
    >
      <button
        ref={swatchRef}
        type="button"
        className="token-color-picker"
        title={label}
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
      {edited ? <button type="button" className="token-reset" aria-label="Reset color" onClick={() => onReset(path)}><RotateCcw aria-hidden /></button> : null}
      {role && tipStyle
        ? createPortal(
            <div className="token-tip token-tip-left" role="tooltip" style={tipStyle}>
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
