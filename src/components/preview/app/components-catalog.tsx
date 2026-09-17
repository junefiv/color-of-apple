import { PhoneFrame } from "../phone-frame";
import { StatusBadge } from "../shared";

function Row({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <p className="text-[11px] tracking-wide text-[var(--color-text-tertiary)]">{title}</p>
      {children}
    </div>
  );
}

export function AppComponentsCatalog() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <PhoneFrame>
        <div className="space-y-5 px-5 py-5">
          <Row title="Filled Button">
            <button className="pv-btn pv-btn-primary w-full" type="button">
              Primary action
            </button>
          </Row>
          <Row title="Tonal Button">
            <button
              className="pv-btn w-full"
              style={{
                background: "var(--color-primary-subtle)",
                color: "var(--color-primary-text)",
              }}
              type="button"
            >
              Secondary action
            </button>
          </Row>
          <Row title="Outline / Text / Danger">
            <div className="grid grid-cols-3 gap-2">
              <button className="pv-btn pv-btn-outline" type="button">
                Out
              </button>
              <button className="pv-btn pv-btn-ghost" type="button">
                Text
              </button>
              <button className="pv-btn pv-btn-danger" type="button">
                Del
              </button>
            </div>
          </Row>
          <Row title="Icon / FAB">
            <div className="flex items-center justify-between">
              <button className="pv-btn pv-btn-outline size-9 p-0" type="button">
                +
              </button>
              <button className="pv-btn pv-btn-primary size-12 rounded-full p-0" type="button">
                +
              </button>
            </div>
          </Row>
          <Row title="Text Field / Search">
            <input className="pv-input" defaultValue="Text field" readOnly />
          </Row>
          <Row title="Textarea">
            <textarea className="pv-input min-h-16" defaultValue="Supporting text" readOnly />
          </Row>
          <Row title="Checkbox / Radio / Switch">
            <div className="flex items-center gap-4 text-sm">
              <input type="checkbox" defaultChecked readOnly />
              <input type="radio" defaultChecked readOnly />
              <span className="inline-flex h-5 w-9 rounded-full bg-[var(--color-primary-default)] p-0.5">
                <span className="ml-auto size-4 rounded-full bg-[var(--color-primary-on)]" />
              </span>
            </div>
          </Row>
          <Row title="Slider / Segmented">
            <input type="range" className="w-full" defaultValue={40} readOnly />
            <div className="mt-2 grid grid-cols-3 gap-1 rounded-lg bg-[var(--color-surface-sunken)] p-1 text-xs">
              <span className="rounded-md bg-[var(--color-surface-default)] py-1 text-center">All</span>
              <span className="py-1 text-center text-[var(--color-text-tertiary)]">Active</span>
              <span className="py-1 text-center text-[var(--color-text-tertiary)]">New</span>
            </div>
          </Row>
        </div>
      </PhoneFrame>
      <PhoneFrame>
        <div className="space-y-5 px-5 py-5">
          <Row title="App Bar">
            <div className="flex items-center justify-between">
              <span className="font-semibold">Page title</span>
              <span>○</span>
            </div>
          </Row>
          <Row title="Bottom Navigation">
            <div className="grid grid-cols-3 text-center text-xs">
              <span className="text-[var(--color-primary-text)]">Home</span>
              <span className="text-[var(--color-text-tertiary)]">Search</span>
              <span className="text-[var(--color-text-tertiary)]">Saved</span>
            </div>
          </Row>
          <Row title="Tabs / Back / Drawer">
            <p className="text-sm text-[var(--color-primary-text)]">← Back · Tabs · Drawer</p>
          </Row>
          <Row title="Page Indicator">
            <div className="flex gap-1">
              <span className="size-1.5 rounded-full bg-[var(--color-primary-default)]" />
              <span className="size-1.5 rounded-full bg-[var(--color-border-default)]" />
            </div>
          </Row>
          <Row title="Card / List Item">
            <div className="pv-card p-3">
              <p className="font-medium">Item title</p>
              <p className="text-sm text-[var(--color-text-secondary)]">Supporting text</p>
            </div>
          </Row>
          <Row title="Avatar / Badge / Chip">
            <div className="flex items-center gap-2">
              <span className="grid size-8 place-items-center rounded-full bg-[var(--color-secondary-subtle)]">
                P
              </span>
              <StatusBadge tone="warning">Pending</StatusBadge>
              <span className="pv-chip">Recent</span>
            </div>
          </Row>
          <Row title="Progress / Divider / Image">
            <div className="h-24 rounded-xl bg-[var(--color-bg-subtle)]" />
            <div className="mt-2 h-px bg-[var(--color-border-subtle)]" />
          </Row>
          <Row title="Snackbar / Banner / Dialog">
            <div className="rounded-lg bg-[var(--color-surface-inverse)] px-2 py-1 text-xs text-[var(--color-text-inverse)]">
              Snackbar
            </div>
          </Row>
          <Row title="Bottom Sheet / Skeleton / Empty / Error">
            <p className="text-sm">Empty state</p>
            <p className="text-sm text-[var(--color-text-danger)]">Error state</p>
          </Row>
        </div>
      </PhoneFrame>
    </div>
  );
}
