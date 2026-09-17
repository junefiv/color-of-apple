import { MiniChart, StatusBadge } from "../shared";

function Cell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="pv-card space-y-3 p-3">
      <p className="text-[11px] tracking-wide text-[var(--color-text-tertiary)]">{title}</p>
      {children}
    </div>
  );
}

export function WebComponentsCatalog() {
  return (
    <div className="space-y-6 bg-[var(--color-bg-canvas)] p-4">
      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        <Cell title="Primary Button">
          <button className="pv-btn pv-btn-primary" type="button">
            Primary action
          </button>
        </Cell>
        <Cell title="Secondary Button">
          <button className="pv-btn pv-btn-secondary" type="button">
            Secondary action
          </button>
        </Cell>
        <Cell title="Outline Button">
          <button className="pv-btn pv-btn-outline" type="button">
            Secondary action
          </button>
        </Cell>
        <Cell title="Ghost Button">
          <button className="pv-btn pv-btn-ghost" type="button">
            Ghost
          </button>
        </Cell>
        <Cell title="Danger Button">
          <button className="pv-btn pv-btn-danger" type="button">
            Danger action
          </button>
        </Cell>
        <Cell title="Icon Button">
          <button className="pv-btn pv-btn-outline size-9 p-0" type="button">
            +
          </button>
        </Cell>
        <Cell title="Link">
          <a className="text-sm text-[var(--color-text-link)] underline" href="#preview">
            View details
          </a>
        </Cell>
        <Cell title="Text Input">
          <input className="pv-input" defaultValue="Text input" readOnly />
        </Cell>
        <Cell title="Textarea">
          <textarea className="pv-input min-h-16" defaultValue="Supporting text" readOnly />
        </Cell>
        <Cell title="Select">
          <select className="pv-input">
            <option>Select</option>
          </select>
        </Cell>
        <Cell title="Search">
          <input className="pv-input" defaultValue="Search" readOnly />
        </Cell>
        <Cell title="Checkbox">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" defaultChecked readOnly /> Checkbox
          </label>
        </Cell>
        <Cell title="Radio">
          <label className="flex items-center gap-2 text-sm">
            <input type="radio" defaultChecked readOnly /> Option one
          </label>
        </Cell>
        <Cell title="Switch">
          <span className="inline-flex h-5 w-9 rounded-full bg-[var(--color-primary-default)] p-0.5">
            <span className="ml-auto size-4 rounded-full bg-[var(--color-primary-on)]" />
          </span>
        </Cell>
        <Cell title="Slider">
          <input type="range" className="w-full" defaultValue={50} readOnly />
        </Cell>
        <Cell title="Header">
          <div className="rounded-lg bg-[var(--color-surface-default)] px-3 py-2 text-sm">
            LOGO · Search · Profile
          </div>
        </Cell>
        <Cell title="Sidebar">
          <div className="rounded-lg bg-[var(--color-primary-subtle)] px-3 py-2 text-sm text-[var(--color-primary-text)]">
            Overview
          </div>
        </Cell>
        <Cell title="Tabs">
          <div className="flex gap-3 text-sm">
            <span className="border-b-2 border-[var(--color-primary-default)] pb-1">All</span>
            <span className="text-[var(--color-text-tertiary)]">Active</span>
          </div>
        </Cell>
        <Cell title="Breadcrumb">
          <p className="text-xs text-[var(--color-text-tertiary)]">Overview / Library / Item title</p>
        </Cell>
        <Cell title="Pagination">
          <div className="flex gap-2 text-xs">
            <span className="pv-chip">1</span>
            <span className="pv-chip" data-selected="true">
              2
            </span>
          </div>
        </Cell>
        <Cell title="Dropdown Menu">
          <div className="rounded-lg border border-[var(--color-border-default)] bg-[var(--color-surface-raised)] p-2 text-sm">
            Item title
          </div>
        </Cell>
        <Cell title="Card">
          <p className="text-sm">Item title</p>
          <p className="text-xs text-[var(--color-text-secondary)]">Supporting text</p>
        </Cell>
        <Cell title="Table">
          <p className="text-sm">Item title · Active</p>
        </Cell>
        <Cell title="List">
          <p className="text-sm">Item title</p>
        </Cell>
        <Cell title="Badge">
          <StatusBadge tone="success">Active</StatusBadge>
        </Cell>
        <Cell title="Chip">
          <span className="pv-chip" data-selected="true">
            Active
          </span>
        </Cell>
        <Cell title="Avatar">
          <span className="grid size-8 place-items-center rounded-full bg-[var(--color-primary-subtle)] text-[var(--color-primary-text)]">
            P
          </span>
        </Cell>
        <Cell title="Progress">
          <div className="h-2 rounded-full bg-[var(--color-border-subtle)]">
            <div className="h-2 w-2/3 rounded-full bg-[var(--color-primary-default)]" />
          </div>
        </Cell>
        <Cell title="Chart">
          <MiniChart />
        </Cell>
        <Cell title="Divider">
          <div className="h-px bg-[var(--color-border-subtle)]" />
        </Cell>
        <Cell title="Alert">
          <div className="rounded-lg bg-[var(--color-info-surface)] px-2 py-1 text-xs text-[var(--color-info-text)]">
            Info message
          </div>
        </Cell>
        <Cell title="Toast">
          <div className="rounded-lg bg-[var(--color-surface-inverse)] px-2 py-1 text-xs text-[var(--color-text-inverse)]">
            Toast
          </div>
        </Cell>
        <Cell title="Tooltip">
          <span className="rounded bg-[var(--color-surface-inverse)] px-2 py-1 text-[10px] text-[var(--color-text-inverse)]">
            Tooltip
          </span>
        </Cell>
        <Cell title="Modal">
          <p className="text-sm">Page title</p>
        </Cell>
        <Cell title="Popover">
          <div className="rounded-lg bg-[var(--color-surface-overlay)] p-2 text-xs">Popover</div>
        </Cell>
        <Cell title="Skeleton">
          <div className="h-3 w-2/3 animate-pulse rounded bg-[var(--color-border-subtle)]" />
        </Cell>
        <Cell title="Empty State">
          <p className="text-sm">Empty state</p>
        </Cell>
        <Cell title="Error State">
          <p className="text-sm text-[var(--color-text-danger)]">Failed</p>
        </Cell>
      </section>
    </div>
  );
}
