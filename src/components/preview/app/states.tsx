import { PhoneFrame } from "../phone-frame";

export function AppStates() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <PhoneFrame>
        <div className="space-y-4 px-5 py-5">
          <p className="text-sm font-semibold">Button</p>
          <button className="pv-btn pv-btn-primary w-full" type="button">
            Default
          </button>
          <button className="pv-btn w-full" style={{ background: "var(--color-primary-pressed)", color: "var(--color-primary-on)" }} type="button">
            Pressed
          </button>
          <button className="pv-btn pv-btn-primary w-full ring-2 ring-[var(--color-interaction-focus-ring)]" type="button">
            Focused
          </button>
          <button className="pv-btn w-full" data-disabled="true" type="button">
            Disabled
          </button>
          <button className="pv-btn pv-btn-primary w-full opacity-70" type="button">
            Loading
          </button>
          <p className="pt-2 text-sm font-semibold">Text Field</p>
          <input className="pv-input" placeholder="Default" readOnly />
          <input className="pv-input" defaultValue="Filled" readOnly />
          <input className="pv-input" data-error="true" defaultValue="Error" readOnly />
          <input className="pv-input" disabled defaultValue="Disabled" />
        </div>
      </PhoneFrame>
      <PhoneFrame>
        <div className="space-y-4 px-5 py-5">
          <p className="text-sm font-semibold">List / Chip / Nav / Switch</p>
          <div className="pv-card p-3">Default item</div>
          <div className="pv-card p-3" style={{ background: "var(--color-interaction-pressed)" }}>
            Pressed item
          </div>
          <div className="pv-card p-3" style={{ background: "var(--color-interaction-selected)" }}>
            Selected item
          </div>
          <div className="flex gap-2">
            <span className="pv-chip">Default</span>
            <span className="pv-chip" data-selected="true">
              Selected
            </span>
            <span className="pv-chip text-[var(--color-text-disabled)]">Disabled</span>
          </div>
          <div className="grid grid-cols-2 text-center text-xs">
            <span className="text-[var(--color-primary-text)]">Selected</span>
            <span className="text-[var(--color-text-tertiary)]">Unselected</span>
          </div>
          <div className="flex gap-4">
            <span className="inline-flex h-5 w-9 rounded-full bg-[var(--color-primary-default)] p-0.5">
              <span className="ml-auto size-4 rounded-full bg-[var(--color-primary-on)]" />
            </span>
            <span className="inline-flex h-5 w-9 rounded-full bg-[var(--color-border-default)] p-0.5">
              <span className="size-4 rounded-full bg-[var(--color-surface-default)]" />
            </span>
            <span className="inline-flex h-5 w-9 rounded-full bg-[var(--color-interaction-disabled-bg)] p-0.5">
              <span className="size-4 rounded-full bg-[var(--color-interaction-disabled-fg)]" />
            </span>
          </div>
        </div>
      </PhoneFrame>
    </div>
  );
}
