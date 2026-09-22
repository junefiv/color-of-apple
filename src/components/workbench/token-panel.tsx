"use client";

import { useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import {
  CORE_TOKENS,
  flattenObject,
  getToken,
  TOKEN_USES,
  type ColorSystemResult,
} from "@/lib/color-engine";
import { useCopy } from "@/hooks/use-copy";
import { useMatchuStore } from "@/lib/store";

export function TokenPanel({
  result,
}: {
  result: ColorSystemResult;
}) {
  const copy = useCopy();
  const viewAll = useMatchuStore((state) => state.viewAllTokens);
  const setViewAll = useMatchuStore((state) => state.setViewAllTokens);
  const tokens = result.semantic.light;
  const report = result.accessibility.light;

  const grouped = CORE_TOKENS.reduce<Record<string, typeof CORE_TOKENS>>((acc, token) => {
    acc[token.group] = acc[token.group] ?? [];
    acc[token.group].push(token);
    return acc;
  }, {});

  return (
    <aside className="flex h-full min-h-0 flex-col bg-[var(--surface)]">
      <div className="flex items-center justify-between px-4 py-3">
        <p className="ui-label text-[var(--text-tertiary)]">
          {copy.tokens.title}
        </p>
        <button
          type="button"
          className="text-[11px] text-foreground/70 underline-offset-2 hover:underline"
          onClick={() => setViewAll(!viewAll)}
        >
          {viewAll ? copy.tokens.viewCore : copy.tokens.viewAll}
        </button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-4">
        {viewAll ? (
          <div className="space-y-1">
            {flattenObject(tokens).map((entry) => (
              <TokenRow
                key={entry.path}
                group={copy.tokens.groups.all}
                label={entry.path}
                hex={entry.value}
                role={TOKEN_USES[entry.path]}
                usesLabel={copy.tokens.usesLabel}
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
                      group={copy.tokens.groups[group as keyof typeof copy.tokens.groups]}
                      label={
                        copy.tokens.labels[token.key as keyof typeof copy.tokens.labels] ??
                        token.key
                      }
                      hex={getToken(tokens, token.path)}
                      role={guide?.role}
                      uses={guide?.uses}
                      usesLabel={copy.tokens.usesLabel}
                    />
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
      <div className="border-t border-border px-4 py-2 text-[11px] text-muted-foreground">
        <p>{copy.result.contrast.replace("{count}", String(report.failCount))}</p>
        {report.failCount > 0 ? (
          <p className="mt-1">{copy.result.fixContrast}</p>
        ) : null}
      </div>
    </aside>
  );
}

function TokenRow({
  group,
  label,
  hex,
  role,
  uses,
  usesLabel,
}: {
  group: string;
  label: string;
  hex: string;
  role?: string;
  uses?: string;
  usesLabel: string;
}) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [tipStyle, setTipStyle] = useState<CSSProperties | null>(null);

  const hideTip = () => setTipStyle(null);
  const showTip = () => {
    const rect = rowRef.current?.getBoundingClientRect();
    if (!rect || !role) return;
    const width = Math.min(Math.max(rect.width, 240), 320);
    const left = Math.min(Math.max(12, rect.left), window.innerWidth - width - 12);
    const preferAbove = rect.top > 188;
    setTipStyle(
      preferAbove
        ? { left, width, bottom: window.innerHeight - rect.top + 8 }
        : { left, width, top: rect.bottom + 8 },
    );
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
      <span className="size-5 shrink-0 rounded-md border border-border" style={{ background: hex }} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-semibold">{label}</p>
        <p className="token-name text-[var(--text-tertiary)]">{hex.toUpperCase()}</p>
      </div>
      {role && tipStyle
        ? createPortal(
            <div className="token-tip" role="tooltip" style={tipStyle}>
              <p className="token-tip-kicker">{group}</p>
              <p className="token-tip-name">{label}</p>
              <p className="token-tip-role">{role}</p>
              {uses ? (
                <p className="token-tip-uses">
                  <span>{usesLabel}</span>
                  {uses}
                </p>
              ) : null}
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
