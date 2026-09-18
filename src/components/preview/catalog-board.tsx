"use client";

import { BarChart } from "./charts";
import { StatusBadge } from "./shared";
import { Alert, Avatar, AvatarGroup, EmptySlot, Progress } from "./widgets";

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="pv-card space-y-3 p-3" data-token="surface">
      <p className="text-[11px] tracking-wide text-[var(--color-text-tertiary)]" data-token="text">
        {title}
      </p>
      {children}
    </div>
  );
}

export function CatalogBoard({ platform }: { platform: "web" | "app" }) {
  const pressed = platform === "app" ? "Pressed" : "Hover";

  return (
    <div className="preview-viewport">
      <div className="preview-scroll h-full space-y-4 p-4" style={{ background: "var(--color-bg-canvas)" }}>
        <section id="kit-actions" className="space-y-3">
          <h3 className="text-sm font-semibold" data-token="text">
            Actions
          </h3>
          <Card title="Primary">
            <div className="flex flex-wrap gap-2">
              <button className="pv-btn pv-btn-primary" type="button" data-token="primary">
                Default
              </button>
              <button className="pv-btn pv-btn-primary" type="button" data-state="hover" data-token="primary">
                {pressed}
              </button>
              <button className="pv-btn pv-btn-primary" type="button" data-state="pressed" data-token="primary">
                Active
              </button>
              <button className="pv-btn pv-btn-primary" type="button" disabled>
                Disabled
              </button>
              <button className="pv-btn pv-btn-primary opacity-80" type="button" data-token="primary">
                Loading
              </button>
            </div>
          </Card>
          <Card title="Other">
            <div className="flex flex-wrap gap-2">
              <button className="pv-btn pv-btn-secondary-fill" type="button" data-token="secondary">
                Secondary
              </button>
              <button className="pv-btn pv-btn-outline" type="button" data-token="text">
                Tertiary
              </button>
              <button className="pv-btn pv-btn-ghost" type="button" data-token="text">
                Ghost
              </button>
              <button className="pv-btn pv-btn-danger" type="button">
                Destructive
              </button>
              <button className="pv-btn pv-btn-accent" type="button" data-token="accent">
                Accent
              </button>
              <button type="button" className="text-sm underline" data-token="primary" style={{ color: "var(--color-text-link)" }}>
                Link
              </button>
            </div>
          </Card>
        </section>
        <section id="kit-inputs" className="space-y-3">
          <h3 className="text-sm font-semibold" data-token="text">
            Inputs
          </h3>
          <Card title="Field states">
            <div className="grid gap-2 md:grid-cols-2">
              <input className="pv-input" placeholder="Empty" data-token="surface" />
              <input className="pv-input" defaultValue="Filled" data-token="surface" />
              <input className="pv-input" defaultValue="Focus" data-state="focus" data-token="surface" />
              <input className="pv-input" defaultValue="Error" data-state="error" data-token="surface" />
              <input className="pv-input" disabled defaultValue="Disabled" />
              <textarea className="pv-input min-h-16" defaultValue="Textarea" data-token="surface" />
            </div>
          </Card>
          <Card title="Choices">
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <label className="flex items-center gap-2" data-token="text">
                <input type="checkbox" defaultChecked /> Checkbox
              </label>
              <label className="flex items-center gap-2" data-token="text">
                <input type="radio" name="kit" defaultChecked /> Radio
              </label>
              <span className="h-6 w-11 rounded-full p-0.5" data-token="primary" style={{ background: "var(--color-primary-default)" }}>
                <span className="block size-5 translate-x-5 rounded-full bg-[var(--color-primary-on)]" />
              </span>
              <input type="range" defaultValue={40} />
            </div>
          </Card>
        </section>
        <section id="kit-navigation" className="space-y-3">
          <h3 className="text-sm font-semibold" data-token="text">
            Navigation
          </h3>
          <Card title="Tabs / breadcrumb / pagination">
            <p className="text-xs text-[var(--color-text-tertiary)]" data-token="text">
              Home / Library / Northwind
            </p>
            <div className="mt-2 flex gap-3 text-sm">
              <span data-token="primary" style={{ borderBottom: "2px solid var(--color-primary-default)" }}>
                All
              </span>
              <span className="text-[var(--color-text-tertiary)]" data-token="text">
                Active
              </span>
            </div>
            <div className="mt-3 flex gap-1">
              <button className="pv-btn pv-btn-ghost" type="button" data-token="text">
                Prev
              </button>
              <button className="pv-btn pv-btn-outline" type="button" data-token="text">
                Next
              </button>
            </div>
          </Card>
        </section>
        <section id="kit-data" className="space-y-3">
          <h3 className="text-sm font-semibold" data-token="text">
            Data display
          </h3>
          <Card title="Card / list / badge">
            <div className="flex items-center gap-2">
              <Avatar initials="NW" />
              <AvatarGroup />
              <StatusBadge tone="success">Active</StatusBadge>
              <span className="pv-chip" data-selected="true" data-token="primary">
                Chip
              </span>
            </div>
            <Progress value={64} />
            <BarChart compact />
          </Card>
        </section>
        <section id="kit-feedback" className="space-y-3">
          <h3 className="text-sm font-semibold" data-token="text">
            Feedback
          </h3>
          <Card title="Alerts">
            <div className="grid gap-2 md:grid-cols-2">
              <Alert tone="success" title="Success" body="저장했습니다." />
              <Alert tone="warning" title="Warning" body="확인이 필요합니다." />
              <Alert tone="danger" title="Error" body="다시 시도하세요." />
              <Alert tone="info" title="Info" body="상태색은 팔레트와 분리합니다." />
            </div>
            <EmptySlot label="Empty state" />
          </Card>
        </section>
        <section id="kit-states" className="space-y-3">
          <h3 className="text-sm font-semibold" data-token="text">
            States
          </h3>
          <Card title={platform === "web" ? "Hover / Focus / Disabled" : "Pressed / Focused / Disabled"}>
            <div className="flex flex-wrap gap-2">
              <button className="pv-btn pv-btn-primary" type="button" data-token="primary">
                Default
              </button>
              <button className="pv-btn pv-btn-primary" type="button" data-state="hover" data-token="primary">
                {pressed}
              </button>
              <button className="pv-btn pv-btn-primary ring-2 ring-[var(--color-interaction-focus-ring)]" type="button" data-token="primary">
                Focus
              </button>
              <button className="pv-btn pv-btn-primary" type="button" disabled>
                Disabled
              </button>
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
}
