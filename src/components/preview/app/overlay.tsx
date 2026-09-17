import { PhoneFrame } from "../phone-frame";

export function AppOverlay() {
  return (
    <PhoneFrame>
      <div className="relative min-h-[640px] bg-[var(--color-bg-subtle)]">
        <div className="px-5 pt-6">
          <h2 className="text-xl font-semibold">Page title</h2>
          <p className="text-sm text-[var(--color-text-secondary)]">Supporting text</p>
        </div>
        <div
          className="absolute inset-0 flex items-end"
          style={{ background: "var(--color-overlay-scrim)" }}
        >
          <div
            className="w-full rounded-t-3xl p-5"
            style={{ background: "var(--color-surface-overlay)" }}
          >
            <div className="mx-auto mb-4 h-1 w-12 rounded-full bg-[var(--color-border-default)]" />
            <h3 className="font-semibold">Page title</h3>
            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">Supporting text</p>
            <div className="mt-4 space-y-2 text-sm">
              <div
                className="rounded-lg px-3 py-2"
                style={{
                  background: "var(--color-success-surface)",
                  color: "var(--color-success-text)",
                }}
              >
                Success message
              </div>
              <div
                className="rounded-lg px-3 py-2"
                style={{
                  background: "var(--color-warning-surface)",
                  color: "var(--color-warning-text)",
                }}
              >
                Warning message
              </div>
              <button className="pv-btn pv-btn-danger w-full" type="button">
                Danger action
              </button>
            </div>
          </div>
        </div>
      </div>
    </PhoneFrame>
  );
}
