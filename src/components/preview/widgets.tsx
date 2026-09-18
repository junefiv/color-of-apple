"use client";

import { StatusBadge } from "./shared";

export function Avatar({
  initials,
  size = "md",
}: {
  initials: string;
  size?: "sm" | "md";
}) {
  return (
    <span
      data-token="secondary"
      className={`pv-avatar ${size === "sm" ? "size-6" : "size-8"}`}
    >
      {initials}
    </span>
  );
}

export function AvatarGroup() {
  return (
    <div className="flex -space-x-1.5">
      {["JM", "AL", "SK"].map((initials) => (
        <Avatar key={initials} initials={initials} size="sm" />
      ))}
    </div>
  );
}

export function Progress({
  value,
  tone = "primary",
}: {
  value: number;
  tone?: "primary" | "secondary" | "accent";
}) {
  return (
    <div className="pv-progress" data-tone={tone} data-token={tone}>
      <span style={{ width: `${value}%` }} />
    </div>
  );
}

export function EmptySlot({ label }: { label: string }) {
  return (
    <div
      data-token="surface"
      className="rounded-xl border border-dashed border-[var(--color-border-default)] px-3 py-6 text-center text-xs text-[var(--color-text-tertiary)]"
    >
      <span data-token="text">{label}</span>
    </div>
  );
}

export function Alert({
  tone,
  title,
  body,
}: {
  tone: "info" | "danger" | "success" | "warning";
  title: string;
  body: string;
}) {
  const map = {
    info: ["var(--color-info-surface)", "var(--color-info-text)"],
    danger: ["var(--color-danger-surface)", "var(--color-danger-text)"],
    success: ["var(--color-success-surface)", "var(--color-success-text)"],
    warning: ["var(--color-warning-surface)", "var(--color-warning-text)"],
  } as const;
  return (
    <div className="rounded-xl px-3 py-2" style={{ background: map[tone][0], color: map[tone][1] }}>
      <p className="text-sm font-medium">{title}</p>
      <p className="text-xs opacity-80">{body}</p>
    </div>
  );
}

export function PeopleRow({
  name,
  meta,
  status,
  selected = false,
}: {
  name: string;
  meta: string;
  status: "Active" | "Pending" | "Paused";
  selected?: boolean;
}) {
  return (
    <div
      data-token={selected ? "primary" : "surface"}
      className="flex items-center gap-3 rounded-xl px-3 py-2"
      style={selected ? { background: "var(--color-interaction-selected)" } : undefined}
    >
      <Avatar initials={name.slice(0, 2).toUpperCase()} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm" data-token="text">
          {name}
        </p>
        <p className="truncate text-xs text-[var(--color-text-secondary)]" data-token="text">
          {meta}
        </p>
      </div>
      <StatusBadge tone={status === "Active" ? "success" : status === "Pending" ? "warning" : "info"}>
        {status}
      </StatusBadge>
    </div>
  );
}

export function ChoiceCard({
  title,
  body,
  selected,
  onClick,
}: {
  title: string;
  body: string;
  selected?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      data-token={selected ? "primary" : "surface"}
      onClick={onClick}
      className="pv-card w-full p-3 text-left"
      style={selected ? { outline: "2px solid var(--color-primary-default)" } : undefined}
    >
      <p className="text-sm font-medium" data-token="text">
        {title}
      </p>
      <p className="mt-1 text-xs text-[var(--color-text-secondary)]" data-token="text">
        {body}
      </p>
    </button>
  );
}
