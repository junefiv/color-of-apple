export function WebOverlay() {
  return (
    <div className="relative min-h-[540px] bg-[var(--color-bg-subtle)] p-5">
      <div className="grid gap-3 md:grid-cols-2">
        <div
          className="rounded-xl border px-3 py-2 text-sm"
          style={{
            background: "var(--color-success-surface)",
            borderColor: "var(--color-success-border)",
            color: "var(--color-success-text)",
          }}
        >
          Success message
        </div>
        <div
          className="rounded-xl border px-3 py-2 text-sm"
          style={{
            background: "var(--color-warning-surface)",
            borderColor: "var(--color-warning-border)",
            color: "var(--color-warning-text)",
          }}
        >
          Warning message
        </div>
        <div
          className="rounded-xl border px-3 py-2 text-sm"
          style={{
            background: "var(--color-danger-surface)",
            borderColor: "var(--color-danger-border)",
            color: "var(--color-danger-text)",
          }}
        >
          Danger message
        </div>
        <div
          className="rounded-xl border px-3 py-2 text-sm"
          style={{
            background: "var(--color-info-surface)",
            borderColor: "var(--color-info-border)",
            color: "var(--color-info-text)",
          }}
        >
          Info message
        </div>
      </div>
      <div
        className="absolute inset-0 mt-40 flex items-start justify-center p-6"
        style={{ background: "var(--color-overlay-scrim)" }}
      >
        <div className="pv-card w-full max-w-md p-5" style={{ background: "var(--color-surface-overlay)" }}>
          <h3 className="text-base font-semibold">Page title</h3>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">Supporting text</p>
          <div className="mt-4 rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-surface-raised)] p-3 text-sm">
            <p>Dropdown</p>
            <p className="text-[var(--color-text-tertiary)]">Tooltip · Popover</p>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <button className="pv-btn pv-btn-outline" type="button">
              Secondary action
            </button>
            <button className="pv-btn pv-btn-primary" type="button">
              Primary action
            </button>
          </div>
        </div>
      </div>
      <div className="absolute right-6 bottom-6 rounded-lg bg-[var(--color-surface-inverse)] px-3 py-2 text-xs text-[var(--color-text-inverse)]">
        Toast
      </div>
    </div>
  );
}
