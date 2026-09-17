import { PhoneFrame } from "../phone-frame";

export function AppDetail() {
  return (
    <PhoneFrame>
      <div className="flex min-h-[640px] flex-col">
        <div className="px-5 pt-3">
          <button className="text-sm text-[var(--color-primary-text)]" type="button">
            ← Back
          </button>
        </div>
        <div className="mx-5 mt-3 h-36 rounded-2xl bg-[var(--color-bg-subtle)]" />
        <div className="flex-1 space-y-3 px-5 py-4">
          <h2 className="text-2xl font-semibold">Page title</h2>
          <p className="text-xs text-[var(--color-text-tertiary)]">Supporting text · 24 items</p>
          <p className="text-sm leading-6 text-[var(--color-text-secondary)]">
            Supporting text. Supporting text. Supporting text.
          </p>
          <div className="h-px bg-[var(--color-border-subtle)]" />
          <div className="flex gap-2">
            <span className="pv-chip" data-selected="true">
              Active
            </span>
            <span className="pv-chip">Recent</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 px-5 pb-5">
          <button className="pv-btn pv-btn-outline" type="button">
            Secondary action
          </button>
          <button className="pv-btn pv-btn-primary" type="button">
            Primary action
          </button>
        </div>
      </div>
    </PhoneFrame>
  );
}
