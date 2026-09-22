import { CORE_TOKENS, flattenObject, getToken, type ColorSystemResult } from "@/lib/color-engine";
import type { Copy } from "@/lib/copy";

export function ColorsTab({
  result,
  copy,
}: {
  result: ColorSystemResult;
  copy: Copy;
}) {
  const tokens = result.semantic.light;

  return (
    <div className="space-y-6 bg-[var(--color-bg-canvas)] p-4">
      <div>
        <p className="mb-2 text-xs tracking-wide text-[var(--color-text-tertiary)]">
          Primary 50–950
        </p>
        <div className="grid grid-cols-11 overflow-hidden rounded-xl">
          {Object.entries(result.primitive.primary).map(([step, hex]) => (
            <div key={step} className="h-14" style={{ background: hex }} title={`${step} ${hex}`} />
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {CORE_TOKENS.map((token) => {
          const hex = getToken(tokens, token.path);
          const label =
            copy.tokens.labels[token.key as keyof typeof copy.tokens.labels] ?? token.key;
          return (
            <div key={token.key} className="overflow-hidden rounded-xl border border-[var(--color-border-subtle)]">
              <div className="h-14" style={{ background: hex }} />
              <div className="bg-[var(--color-surface-default)] px-2 py-1.5">
                <p className="text-[11px] font-medium">{label}</p>
                <p className="font-mono text-[10px] text-[var(--color-text-tertiary)]">{hex}</p>
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-[11px] text-[var(--color-text-tertiary)]">
        {flattenObject(tokens).length} semantic · {result.meta.engineVersion}
      </p>
    </div>
  );
}
