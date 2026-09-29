"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { Copy, Download, RotateCcw, Undo2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { useAuth } from "@/components/auth/auth-provider";
import { uiToast } from "@/components/ui/toast";
import {
  CORE_TOKENS,
  flattenObject,
  getToken,
  neutralAliasForValue,
  TOKEN_USES,
  type ColorSystemResult,
  type GenerateInput,
} from "@/lib/color-engine";
import { formatExport, type ExportFormat } from "@/lib/export";
import { useCopy } from "@/hooks/use-copy";
import { preventProtectedCopy, preventProtectedCopyShortcut } from "@/lib/copy-protection";
import { consumeQuota, isPlanRequiredError, quotaErrorMessage } from "@/lib/firebase/data";
import { useMatchuStore } from "@/lib/store";

export function TokenPanel({
  result,
  input,
  overrides,
  onTokenChange,
  onTokenEditStart,
  onTokenPreview,
  onTokenReset,
  onResetAll,
  canUndo,
  onUndo,
  onTokenFocus,
}: {
  result: ColorSystemResult;
  input: GenerateInput;
  overrides: Record<string, string>;
  onTokenChange: (path: string, value: string) => void;
  onTokenEditStart: () => void;
  onTokenPreview: (path: string, value: string) => void;
  onTokenReset: (path: string) => void;
  onResetAll: () => void;
  canUndo: boolean;
  onUndo: () => void;
  onTokenFocus: (role: TokenFocusRole | null) => void;
}) {
  const copy = useCopy();
  const router = useRouter();
  const { user, signIn } = useAuth();
  const locale = useMatchuStore((state) => state.locale);
  const viewAll = useMatchuStore((state) => state.viewAllTokens);
  const setViewAll = useMatchuStore((state) => state.setViewAllTokens);
  const [panel, setPanel] = useState<"tokens" | "export">("tokens");
  const [format, setFormat] = useState<ExportFormat>("css");
  const tokens = result.semantic.light;
  const report = result.accessibility.light;
  const file = useMemo(() => {
    if (panel !== "export") return null;
    return formatExport(format, applyOverrides(result, overrides), input);
  }, [panel, format, result, overrides, input]);

  const grouped = CORE_TOKENS.reduce<Record<string, typeof CORE_TOKENS>>((acc, token) => {
    acc[token.group] = acc[token.group] ?? [];
    acc[token.group].push(token);
    return acc;
  }, {});

  async function copyCode() {
    if (!file) return;
    try {
      const currentUser = user ?? await signIn();
      await consumeQuota(currentUser.uid, "export");
      await navigator.clipboard.writeText(file.code);
      uiToast.success(copy.result.copied, locale);
    } catch (error) {
      if (isPlanRequiredError(error)) {
        uiToast.info(
          locale === "ko" ? "무료 내보내기 한도를 모두 사용했어요. Pro 플랜은 곧 제공됩니다." : "You reached the free export limit. Pro is coming soon.",
          locale,
        );
        router.push("/coming-soon");
        return;
      }
      uiToast.error(error instanceof Error && error.name === "QuotaLimitError" ? quotaErrorMessage(error, locale) : copy.result.copyFailed, locale);
    }
  }

  async function downloadFile() {
    if (!file) return;
    try {
      const currentUser = user ?? await signIn();
      await consumeQuota(currentUser.uid, "export");
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
    } catch (error) {
      if (isPlanRequiredError(error)) {
        uiToast.info(
          locale === "ko" ? "무료 내보내기 한도를 모두 사용했어요. Pro 플랜은 곧 제공됩니다." : "You reached the free export limit. Pro is coming soon.",
          locale,
        );
        router.push("/coming-soon");
        return;
      }
      uiToast.error(quotaErrorMessage(error, locale), locale);
    }
  }

  return (
    <aside
      className="token-panel-shell copy-protected"
      onCopyCapture={preventProtectedCopy}
      onKeyDownCapture={preventProtectedCopyShortcut}
    >
      <header className="token-panel-header">
        <p className="ui-label text-[var(--text-tertiary)]">{copy.tokens.title}</p>
        <div className="token-panel-tabs" role="tablist">
          <button type="button" role="tab" aria-selected={panel === "tokens"} onClick={() => setPanel("tokens")}>{copy.result.tokens}</button>
          <button type="button" role="tab" aria-selected={panel === "export"} onClick={() => setPanel("export")}>{copy.export.title}</button>
        </div>
      </header>

      {panel === "tokens" ? (
        <>
          <div className="token-scope-switch" data-view={viewAll ? "all" : "core"} role="radiogroup" aria-label={copy.tokens.title}>
            <button type="button" role="radio" aria-checked={!viewAll} onClick={() => setViewAll(false)}>{copy.tokens.viewCore}</button>
            <button type="button" role="radio" aria-checked={viewAll} onClick={() => setViewAll(true)}>{copy.tokens.viewAll}</button>
          </div>
          <div className="token-history-actions">
            <button type="button" disabled={!canUndo} onClick={onUndo}>
              <Undo2 aria-hidden />{copy.tokens.undo}
            </button>
            <button type="button" disabled={Object.keys(overrides).length === 0} onClick={onResetAll}>
              <RotateCcw aria-hidden />{copy.tokens.resetAll}
            </button>
          </div>
          <div className="token-panel-list">
            {viewAll ? (
              <div className="space-y-1">
                {flattenObject(tokens).map((entry) => (
                  <TokenRow
                    key={entry.path}
                    path={entry.path}
                    group={copy.tokens.groups.all}
                    label={entry.path}
                    hex={overrides[entry.path] ?? entry.value}
                    neutralAlias={neutralAliasForValue(entry.path, overrides[entry.path] ?? entry.value, result.primitive.neutral)}
                    role={TOKEN_USES[entry.path]}
                    usesLabel={copy.tokens.usesLabel}
                    edited={Boolean(overrides[entry.path])}
                    onChange={onTokenChange}
                    onEditStart={onTokenEditStart}
                    onPreview={onTokenPreview}
                    onReset={onTokenReset}
                    onFocusToken={onTokenFocus}
                  />
                ))}
              </div>
            ) : (
              Object.entries(grouped).map(([group, items]) => (
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
                          onReset={onTokenReset}
                          onFocusToken={onTokenFocus}
                        />
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="token-panel-report">
            <p>{copy.result.contrast.replace("{count}", String(report.failCount))}</p>
            {report.failCount > 0 ? <p className="mt-1">{copy.result.fixContrast}</p> : null}
          </div>
        </>
      ) : (
        <div className="token-export-panel">
          <div className="token-export-formats" role="radiogroup" aria-label={copy.export.title}>
            {([[
              "css", copy.export.css,
            ], ["tailwind", copy.export.tailwind], ["react-native", copy.export.reactNative], ["json", copy.export.json], ["figma", copy.export.figma]] as const).map(([key, label]) => (
              <button key={key} type="button" role="radio" aria-checked={format === key} onClick={() => setFormat(key)}>{label}</button>
            ))}
          </div>
          <pre>{file?.code}</pre>
          <div className="token-export-actions">
            <button type="button" onClick={copyCode}><Copy aria-hidden />{copy.export.copy}</button>
            <button type="button" data-primary onClick={downloadFile}><Download aria-hidden />{copy.export.download}</button>
          </div>
        </div>
      )}
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
  onReset: (path: string) => void;
  onFocusToken: (role: TokenFocusRole | null) => void;
}) {
  const rowRef = useRef<HTMLDivElement>(null);
  const colorInputRef = useRef<HTMLInputElement>(null);
  const commitRef = useRef<(value: string) => void>(() => undefined);
  const [tipStyle, setTipStyle] = useState<CSSProperties | null>(null);
  const colorValue = /^#[0-9a-f]{6}$/i.test(hex) ? hex : "#000000";

  useEffect(() => {
    commitRef.current = (value: string) => onChange(path, value);
  }, [onChange, path]);

  useEffect(() => {
    const input = colorInputRef.current;
    if (!input) return;
    const commitNativeChange = () => commitRef.current(input.value.toUpperCase());
    input.addEventListener("change", commitNativeChange);
    return () => input.removeEventListener("change", commitNativeChange);
  }, []);

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

  return (
    <div
      ref={rowRef}
      className="token-row"
      tabIndex={role ? 0 : undefined}
      onMouseEnter={() => { showTip(); onFocusToken(tokenFocusFromPath(path)); }}
      onMouseLeave={() => {
        hideTip();
        if (!rowRef.current?.contains(document.activeElement)) onFocusToken(null);
      }}
      onFocus={() => { showTip(); onFocusToken(tokenFocusFromPath(path)); }}
      onBlur={(event) => {
        hideTip();
        if (!event.currentTarget.contains(event.relatedTarget)) onFocusToken(null);
      }}
    >
      <label className="token-color-picker" title={label}>
        <input
          ref={colorInputRef}
          type="color"
          value={colorValue}
          aria-label={`${label} ${hex}`}
          onPointerDown={onEditStart}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") onEditStart();
          }}
          onInput={(event) => onPreview(path, event.currentTarget.value.toUpperCase())}
        />
        <span style={{ background: hex }} />
      </label>
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
