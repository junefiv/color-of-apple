"use client";

import { useMemo, useRef, useState, type CSSProperties } from "react";
import { Copy, RotateCcw } from "lucide-react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import {
  CORE_TOKENS,
  flattenObject,
  getToken,
  TOKEN_USES,
  type ColorSystemResult,
  type GenerateInput,
} from "@/lib/color-engine";
import { formatExport, type ExportFormat } from "@/lib/export";
import { useCopy } from "@/hooks/use-copy";
import { useMatchuStore } from "@/lib/store";

export function TokenPanel({
  result,
  input,
  overrides,
  onTokenChange,
  onTokenReset,
  onResetAll,
}: {
  result: ColorSystemResult;
  input: GenerateInput;
  overrides: Record<string, string>;
  onTokenChange: (path: string, value: string) => void;
  onTokenReset: (path: string) => void;
  onResetAll: () => void;
}) {
  const copy = useCopy();
  const viewAll = useMatchuStore((state) => state.viewAllTokens);
  const setViewAll = useMatchuStore((state) => state.setViewAllTokens);
  const [panel, setPanel] = useState<"tokens" | "export">("tokens");
  const [format, setFormat] = useState<ExportFormat>("css");
  const tokens = result.semantic.light;
  const report = result.accessibility.light;
  const exportResult = useMemo(() => applyOverrides(result, overrides), [result, overrides]);
  const file = useMemo(() => formatExport(format, exportResult, input), [format, exportResult, input]);

  const grouped = CORE_TOKENS.reduce<Record<string, typeof CORE_TOKENS>>((acc, token) => {
    acc[token.group] = acc[token.group] ?? [];
    acc[token.group].push(token);
    return acc;
  }, {});

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(file.code);
      toast.success(copy.result.copied);
    } catch {
      toast.error(copy.result.copyFailed);
    }
  }

  return (
    <aside className="token-panel-shell">
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
          <button type="button" className="token-reset-all" disabled={Object.keys(overrides).length === 0} onClick={onResetAll}>
            <RotateCcw aria-hidden />{copy.tokens.resetAll}
          </button>
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
                    role={TOKEN_USES[entry.path]}
                    usesLabel={copy.tokens.usesLabel}
                    edited={Boolean(overrides[entry.path])}
                    onChange={onTokenChange}
                    onReset={onTokenReset}
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
                          onReset={onTokenReset}
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
            ], ["tailwind", copy.export.tailwind], ["react-native", copy.export.reactNative], ["json", copy.export.json]] as const).map(([key, label]) => (
              <button key={key} type="button" role="radio" aria-checked={format === key} onClick={() => setFormat(key)}>{label}</button>
            ))}
          </div>
          <pre>{file.code}</pre>
          <div className="token-export-actions">
            <button type="button" data-primary onClick={copyCode}><Copy aria-hidden />{copy.export.copy}</button>
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
  onChange,
  onReset,
}: {
  path: string;
  group: string;
  label: string;
  hex: string;
  role?: string;
  uses?: string;
  usesLabel: string;
  edited: boolean;
  onChange: (path: string, value: string) => void;
  onReset: (path: string) => void;
}) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [tipStyle, setTipStyle] = useState<CSSProperties | null>(null);
  const colorValue = /^#[0-9a-f]{6}$/i.test(hex) ? hex : "#000000";

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
      onMouseEnter={showTip}
      onMouseLeave={hideTip}
      onFocus={showTip}
      onBlur={hideTip}
    >
      <label className="token-color-picker" title={label}>
        <input type="color" value={colorValue} aria-label={`${label} ${hex}`} onChange={(event) => onChange(path, event.target.value.toUpperCase())} />
        <span style={{ background: hex }} />
      </label>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-semibold">{label}</p>
        <p className="token-name text-[var(--text-tertiary)]">{hex.toUpperCase()}</p>
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
