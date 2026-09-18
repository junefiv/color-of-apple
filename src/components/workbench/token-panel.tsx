"use client";

import {
  CORE_TOKENS,
  flattenObject,
  getToken,
  TOKEN_USES,
  type ColorSystemResult,
  type ThemeMode,
} from "@/lib/color-engine";
import { useCopy } from "@/hooks/use-copy";
import { useMatchuStore } from "@/lib/store";

export function TokenPanel({
  result,
  mode,
}: {
  result: ColorSystemResult;
  mode: ThemeMode;
}) {
  const copy = useCopy();
  const viewAll = useMatchuStore((state) => state.viewAllTokens);
  const setViewAll = useMatchuStore((state) => state.setViewAllTokens);
  const tokens = result.semantic[mode];
  const report = result.accessibility[mode];

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
                label={entry.path}
                hex={entry.value}
                hint={TOKEN_USES[entry.path]}
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
                {items.map((token) => (
                  <TokenRow
                    key={token.key}
                    label={
                      copy.tokens.labels[token.key as keyof typeof copy.tokens.labels] ??
                      token.key
                    }
                    hex={getToken(tokens, token.path)}
                    hint={TOKEN_USES[token.path]}
                  />
                ))}
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
  label,
  hex,
  hint,
}: {
  label: string;
  hex: string;
  hint?: string;
}) {
  return (
    <div
      className="flex items-center gap-2 rounded-lg px-1.5 py-1.5 hover:bg-muted/70"
      title={hint}
    >
      <span className="size-5 shrink-0 rounded-md border border-border" style={{ background: hex }} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-semibold">{label}</p>
        <p className="token-name text-[var(--text-tertiary)]">{hex.toUpperCase()}</p>
      </div>
    </div>
  );
}
