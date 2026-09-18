"use client";

export function AppSettings({ onBack }: { onBack?: () => void } = {}) {
  return (
    <div className="space-y-1 px-4 py-3" data-token="background">
      {onBack ? (
        <button className="mb-2 text-sm" type="button" data-token="primary" style={{ color: "var(--color-primary-text)" }} onClick={onBack}>
          ← Back
        </button>
      ) : null}
      <div className="flex items-center gap-3 py-3" data-token="surface">
        <span className="pv-avatar size-12" data-token="secondary">
          YU
        </span>
        <div>
          <p className="font-medium" data-token="text">
            You
          </p>
          <p className="text-xs text-[var(--color-text-secondary)]" data-token="text">
            you@studio.com
          </p>
        </div>
      </div>
      {[
        ["계정", ""],
        ["워크스페이스", "Team"],
        ["알림", "switch"],
        ["언어", "한국어"],
        ["배지", "badge"],
      ].map(([label, extra]) => (
        <div key={label} className="flex items-center justify-between border-b border-[var(--color-border-subtle)] py-3">
          <span className="text-sm" data-token="text">
            {label}
          </span>
          {extra === "switch" ? (
            <span className="h-6 w-11 rounded-full p-0.5" data-token="primary" style={{ background: "var(--color-primary-default)" }}>
              <span className="block size-5 translate-x-5 rounded-full bg-[var(--color-primary-on)]" />
            </span>
          ) : extra === "badge" ? (
            <span className="pv-badge" data-token="accent" style={{ background: "var(--color-accent-default)", color: "var(--color-accent-on)" }}>
              Pro
            </span>
          ) : (
            <span className="text-sm text-[var(--color-text-secondary)]" data-token="text">
              {extra || "›"}
            </span>
          )}
        </div>
      ))}
      <button type="button" className="w-full py-3 text-left text-sm text-[var(--color-danger-text)]">
        계정 삭제
      </button>
      <button type="button" className="w-full py-3 text-left text-sm text-[var(--color-text-disabled)]" data-token="text">
        비활성 동작
      </button>
      <button className="pv-btn pv-btn-outline mt-2 w-full" type="button" data-token="text">
        로그아웃
      </button>
      <p className="pt-4 text-center text-[11px] text-[var(--color-text-tertiary)]" data-token="text">
        Version 1.0.0
      </p>
    </div>
  );
}
