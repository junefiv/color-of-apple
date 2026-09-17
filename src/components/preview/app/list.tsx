import { PhoneFrame } from "../phone-frame";
import { StatusBadge } from "../shared";

export function AppList() {
  return (
    <PhoneFrame>
      <div className="flex min-h-[640px] flex-col">
        <div className="px-5 pt-3">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-semibold">Page title</h2>
              <p className="text-sm text-[var(--color-text-secondary)]">Supporting text</p>
            </div>
            <span className="grid size-8 place-items-center rounded-full border border-[var(--color-border-default)]">
              ○
            </span>
          </div>
          <input className="pv-input mt-4" defaultValue="Search" readOnly />
          <div className="mt-3 flex gap-2">
            {["All", "Active", "New"].map((chip, index) => (
              <span key={chip} className="pv-chip" data-selected={index === 0}>
                {chip}
              </span>
            ))}
          </div>
        </div>
        <div className="flex-1 space-y-3 px-5 py-4">
          {[0, 1, 2].map((index) => (
            <div key={index} className="pv-card p-3">
              <div className="flex items-center justify-between">
                <p className="font-medium">Item title</p>
                <span className="text-[var(--color-text-tertiary)]">›</span>
              </div>
              <p className="text-sm text-[var(--color-text-secondary)]">Supporting text</p>
              {index === 0 ? (
                <div className="mt-2">
                  <StatusBadge tone="info">Active</StatusBadge>
                </div>
              ) : null}
            </div>
          ))}
          <button className="pv-btn pv-btn-primary w-full" type="button">
            Primary action
          </button>
        </div>
        <nav className="grid grid-cols-3 border-t border-[var(--color-border-subtle)] bg-[var(--color-surface-default)] text-center text-xs">
          {["Home", "Search", "Saved"].map((item, index) => (
            <div
              key={item}
              className="py-3"
              style={{
                color:
                  index === 0
                    ? "var(--color-primary-text)"
                    : "var(--color-text-tertiary)",
              }}
            >
              {item}
            </div>
          ))}
        </nav>
      </div>
    </PhoneFrame>
  );
}
