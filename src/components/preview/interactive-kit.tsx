"use client";

import { useState } from "react";
import { StatusBadge } from "./shared";

export function KitCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="pv-card space-y-3 p-3">
      <p className="text-[11px] tracking-wide text-[var(--color-text-tertiary)]">{title}</p>
      {children}
    </div>
  );
}

export function InteractiveActions() {
  const [pressed, setPressed] = useState("idle");
  return (
    <div className="flex flex-wrap gap-2">
      <button className="pv-btn pv-btn-primary" type="button" onClick={() => setPressed("primary")}>
        Primary action
      </button>
      <button className="pv-btn pv-btn-outline" type="button" onClick={() => setPressed("secondary")}>
        Secondary
      </button>
      <button
        className="pv-btn"
        style={{
          background: "var(--color-accent-default)",
          color: "var(--color-accent-on)",
        }}
        type="button"
        onClick={() => setPressed("accent")}
      >
        +240P
      </button>
      <span className="self-center text-xs text-[var(--color-text-secondary)]">
        {pressed === "idle" ? "대기" : `${pressed} 눌림`}
      </span>
    </div>
  );
}

export function InteractiveFields() {
  const [query, setQuery] = useState("Search");
  const [agree, setAgree] = useState(true);
  const [plan, setPlan] = useState("weekly");
  return (
    <div className="space-y-3">
      <input className="pv-input" value={query} onChange={(event) => setQuery(event.target.value)} />
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={agree} onChange={(event) => setAgree(event.target.checked)} />
        인증 알림 받기
      </label>
      <div className="flex gap-3 text-sm">
        {["weekly", "monthly"].map((value) => (
          <label key={value} className="flex items-center gap-2">
            <input
              type="radio"
              name="plan"
              checked={plan === value}
              onChange={() => setPlan(value)}
            />
            {value === "weekly" ? "주간" : "월간"}
          </label>
        ))}
      </div>
    </div>
  );
}

export function InteractiveSwitch() {
  const [on, setOn] = useState(true);
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={() => setOn((value) => !value)}
      className="inline-flex h-6 w-11 rounded-full p-0.5 transition"
      style={{
        background: on ? "var(--color-primary-default)" : "var(--color-border-default)",
      }}
    >
      <span
        className="size-5 rounded-full bg-[var(--color-primary-on)] transition"
        style={{ transform: on ? "translateX(1.15rem)" : "translateX(0)" }}
      />
    </button>
  );
}

export function InteractiveTabs() {
  const [tab, setTab] = useState("all");
  return (
    <div>
      <div className="flex gap-4 text-sm">
        {[
          ["all", "All"],
          ["active", "Active"],
          ["done", "Done"],
        ].map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className="pb-1"
            style={
              tab === id
                ? { borderBottom: "2px solid var(--color-primary-default)", color: "var(--color-text-primary)" }
                : { color: "var(--color-text-tertiary)" }
            }
          >
            {label}
          </button>
        ))}
      </div>
      <p className="mt-2 text-xs text-[var(--color-text-secondary)]">
        {tab === "all" ? "전체 12개" : tab === "active" ? "진행 4개" : "완료 8개"}
      </p>
    </div>
  );
}

export function InteractiveAccordion() {
  const [open, setOpen] = useState("one");
  const items = [
    ["one", "리그 규칙", "한 화면에서 가장 중요한 행동만 Primary로 씁니다."],
    ["two", "인증 기준", "Secondary는 아웃라인이나 연한 면으로 둡니다."],
    ["three", "리워드", "Accent는 1위, D-day, +포인트에만 씁니다."],
  ] as const;
  return (
    <div className="overflow-hidden rounded-lg border border-[var(--color-border-subtle)]">
      {items.map(([id, title, body]) => {
        const expanded = open === id;
        return (
          <div key={id} className="border-b border-[var(--color-border-subtle)] last:border-b-0">
            <button
              type="button"
              className="flex w-full items-center justify-between px-3 py-2 text-left text-sm"
              onClick={() => setOpen(expanded ? "" : id)}
            >
              {title}
              <span className="text-[var(--color-text-tertiary)]">{expanded ? "–" : "+"}</span>
            </button>
            {expanded ? (
              <p className="px-3 pb-3 text-xs text-[var(--color-text-secondary)]">{body}</p>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

export function InteractiveTooltip() {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative inline-flex">
      <button
        type="button"
        className="pv-btn pv-btn-outline"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onClick={() => setOpen((value) => !value)}
      >
        도움말
      </button>
      {open ? (
        <span className="absolute bottom-[calc(100%+8px)] left-0 z-10 whitespace-nowrap rounded-md bg-[var(--color-surface-inverse)] px-2 py-1 text-[11px] text-[var(--color-text-inverse)]">
          Accent는 면적의 5–10%만
        </span>
      ) : null}
    </div>
  );
}

export function InteractiveDialog() {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button className="pv-btn pv-btn-primary" type="button" onClick={() => setOpen(true)}>
        모달 열기
      </button>
      {open ? (
        <div className="absolute inset-0 z-40 grid place-items-center bg-[var(--color-overlay-scrim)] p-4">
          <div className="w-full max-w-sm rounded-2xl bg-[var(--color-surface-overlay)] p-4 shadow-[0_16px_40px_var(--color-shadow-default)]">
            <h3 className="text-base font-semibold">목표 선택 완료</h3>
            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
              Primary 행동 하나에만 채워진 버튼을 씁니다.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button className="pv-btn pv-btn-outline" type="button" onClick={() => setOpen(false)}>
                닫기
              </button>
              <button className="pv-btn pv-btn-primary" type="button" onClick={() => setOpen(false)}>
                확인
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function InteractiveStates() {
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <button className="pv-btn pv-btn-primary" type="button">
          Default
        </button>
        <button className="pv-btn pv-btn-primary opacity-80" type="button">
          Hover
        </button>
        <button className="pv-btn" type="button" disabled>
          Disabled
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        <StatusBadge tone="success">목표 달성</StatusBadge>
        <StatusBadge tone="warning">마감 임박</StatusBadge>
        <StatusBadge tone="danger">미인정</StatusBadge>
        <StatusBadge tone="info">안내</StatusBadge>
        <span
          className="pv-badge"
          style={{
            background: "var(--color-accent-default)",
            color: "var(--color-accent-on)",
          }}
        >
          1위
        </span>
      </div>
    </div>
  );
}

export function KitStack({ children }: { children: React.ReactNode }) {
  return <div className="space-y-3 p-3">{children}</div>;
}

export function InteractiveCatalog() {
  return (
    <div className="preview-viewport">
      <div className="preview-scroll p-4">
        <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <KitCard title="Actions">
            <InteractiveActions />
          </KitCard>
          <KitCard title="Inputs">
            <InteractiveFields />
          </KitCard>
          <KitCard title="Switch">
            <InteractiveSwitch />
          </KitCard>
          <KitCard title="Tabs">
            <InteractiveTabs />
          </KitCard>
          <KitCard title="Accordion">
            <InteractiveAccordion />
          </KitCard>
          <KitCard title="Tooltip">
            <InteractiveTooltip />
          </KitCard>
          <KitCard title="Modal">
            <InteractiveDialog />
          </KitCard>
          <KitCard title="States">
            <InteractiveStates />
          </KitCard>
          <KitCard title="Surface">
            <div className="rounded-lg bg-[var(--color-surface-default)] px-3 py-4 text-sm">
              카드 · 입력창 · 시트
            </div>
          </KitCard>
        </section>
      </div>
    </div>
  );
}
