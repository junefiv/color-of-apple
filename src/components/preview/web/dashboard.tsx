"use client";

import { useState } from "react";
import { BarChart, ChartLegend, DonutChart, LineChart } from "../charts";
import { StatusBadge } from "../shared";
import { Avatar, AvatarGroup, PeopleRow, Progress } from "../widgets";

export function WebDashboard() {
  const [picked, setPicked] = useState(0);
  const [range, setRange] = useState("30d");
  const [openMenu, setOpenMenu] = useState(false);

  return (
    <div className="flex min-h-full" data-token="background" style={{ background: "var(--color-bg-canvas)" }}>
      <aside
        data-token="surface"
        className="hidden w-48 shrink-0 flex-col border-r border-[var(--color-border-subtle)] bg-[var(--color-surface-subtle)] md:flex"
      >
        <div className="px-3 py-3 text-xs font-semibold tracking-[0.18em] text-[var(--color-text-tertiary)]" data-token="text">
          LOGO
        </div>
        <nav className="space-y-1 px-2">
          {(
            [
              ["Overview", true, "12"],
              ["Projects", false, ""],
              ["Reports", false, "3"],
              ["Members", false, ""],
            ] as const
          ).map(([label, active, badge]) => (
            <button
              key={label}
              type="button"
              data-token={active ? "primary" : "text"}
              className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-sm"
              style={
                active
                  ? { background: "var(--color-primary-subtle)", color: "var(--color-primary-text)" }
                  : { color: "var(--color-text-secondary)" }
              }
            >
              {label}
              {badge ? (
                <span
                  data-token="accent"
                  className="rounded-full px-1.5 text-[10px]"
                  style={{ background: "var(--color-accent-default)", color: "var(--color-accent-on)" }}
                >
                  {badge}
                </span>
              ) : null}
            </button>
          ))}
          <button type="button" className="w-full rounded-lg px-2.5 py-2 text-left text-sm text-[var(--color-text-secondary)]" data-token="text">
            Library ▾
          </button>
        </nav>
        <div className="mt-auto space-y-1 border-t border-[var(--color-border-subtle)] px-2 py-3">
          <button type="button" className="w-full rounded-lg px-2.5 py-2 text-left text-sm text-[var(--color-text-secondary)]" data-token="text">
            Settings
          </button>
          <button type="button" className="w-full rounded-lg px-2.5 py-2 text-left text-sm text-[var(--color-text-tertiary)]" data-token="text">
            Collapse
          </button>
        </div>
      </aside>
      <div className="min-w-0 flex-1">
        <header
          data-token="surface"
          className="flex flex-wrap items-center gap-2 border-b border-[var(--color-border-subtle)] bg-[var(--color-surface-default)] px-4 py-3"
        >
          <span className="text-xs text-[var(--color-text-tertiary)]" data-token="text">
            Workspace ▾
          </span>
          <input className="pv-input max-w-56 flex-1" defaultValue="Search" data-token="surface" />
          <button type="button" className="relative grid size-8 place-items-center rounded-full border border-[var(--color-border-default)]" data-token="secondary">
            <span data-token="text">?</span>
          </button>
          <button type="button" className="relative grid size-8 place-items-center rounded-full border border-[var(--color-border-default)]" data-token="text">
            🔔
            <span data-token="accent" className="absolute right-1 top-1 size-2 rounded-full bg-[var(--color-accent-default)]" />
          </button>
          <Avatar initials="YU" />
          <button className="pv-btn pv-btn-secondary-fill" type="button" data-token="secondary">
            Filter
          </button>
          <button className="pv-btn pv-btn-primary" type="button" data-token="primary">
            새 항목
          </button>
        </header>
        <div className="space-y-4 p-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[11px] text-[var(--color-text-tertiary)]" data-token="text">
                Home / Overview
              </p>
              <h2 className="text-lg font-semibold" data-token="text">
                Overview
              </h2>
              <p className="text-sm text-[var(--color-text-secondary)]" data-token="text">
                이번 달 활동과 최근 업데이트를 한 화면에서 봅니다.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {["7d", "30d", "90d"].map((id) => (
                <button
                  key={id}
                  type="button"
                  className="pv-chip"
                  data-selected={range === id}
                  data-token={range === id ? "primary" : "text"}
                  onClick={() => setRange(id)}
                >
                  {id}
                </button>
              ))}
              <button className="pv-btn pv-btn-ghost" type="button" data-token="text">
                ⋮
              </button>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              ["이번 달 활동", "1,284", "+12%", "default"],
              ["진행 상태", "72%", "+4%", "emphasis"],
              ["새 항목", "36", "-3%", "selected"],
            ].map(([label, value, delta, kind]) => (
              <div
                key={label}
                data-token={kind === "emphasis" ? "secondary" : "surface"}
                className="pv-card p-3"
                style={
                  kind === "emphasis"
                    ? { background: "var(--color-secondary-default)", color: "var(--color-secondary-on)" }
                    : kind === "selected"
                      ? { outline: "2px solid var(--color-primary-default)" }
                      : undefined
                }
              >
                <p className="text-xs opacity-70" data-token="text">
                  {label}
                </p>
                <div className="mt-1 flex items-end justify-between">
                  <p className="text-2xl font-semibold" data-token={kind === "selected" ? "accent" : "text"}>
                    {value}
                  </p>
                  <span
                    className="text-xs"
                    data-token={delta.startsWith("+") ? "accent" : "text"}
                    style={delta.startsWith("+") ? { color: "var(--color-accent-default)" } : undefined}
                  >
                    {delta}
                  </span>
                </div>
                <div className="mt-3">
                  <Progress value={kind === "emphasis" ? 72 : 48} tone={kind === "selected" ? "accent" : "primary"} />
                </div>
              </div>
            ))}
          </div>
          <div className="grid gap-3 lg:grid-cols-[1.3fr_1fr]">
            <div className="pv-card p-3" data-token="surface">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-medium" data-token="text">
                  프로젝트
                </p>
                <ChartLegend />
              </div>
              <BarChart />
            </div>
            <div className="pv-card p-3" data-token="surface">
              <p className="mb-3 text-sm font-medium" data-token="text">
                진행 상태
              </p>
              <DonutChart />
            </div>
          </div>
          <div className="grid gap-3 lg:grid-cols-[1.2fr_1fr]">
            <div className="pv-card p-3" data-token="surface">
              <p className="mb-3 text-sm font-medium" data-token="text">
                최근 업데이트
              </p>
              <LineChart />
            </div>
            <div className="pv-card space-y-1 p-2" data-token="surface">
              <div className="flex items-center justify-between px-1 py-1">
                <p className="text-sm font-medium" data-token="text">
                  활동
                </p>
                <div className="relative">
                  <button className="pv-btn pv-btn-ghost" type="button" data-token="text" onClick={() => setOpenMenu((value) => !value)}>
                    더보기
                  </button>
                  {openMenu ? (
                    <div
                      data-token="surface"
                      className="absolute right-0 z-10 mt-1 w-32 rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-surface-overlay)] p-1 shadow-[0_12px_28px_var(--color-shadow-default)]"
                    >
                      {["Open", "Share", "Archive"].map((item) => (
                        <button key={item} type="button" className="block w-full rounded-md px-2 py-1.5 text-left text-sm" data-token="text">
                          {item}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
              <PeopleRow name="Jordan Miles" meta="2분 전" status="Active" selected />
              <PeopleRow name="Ava Lee" meta="1시간 전" status="Pending" />
              <div className="rounded-xl border border-dashed border-[var(--color-border-default)] px-3 py-4 text-center text-xs text-[var(--color-text-tertiary)]" data-token="surface">
                <span data-token="text">비어 있는 슬롯</span>
              </div>
            </div>
          </div>
          <div className="pv-card overflow-hidden" data-token="surface">
            <table className="w-full text-left text-sm">
              <thead className="bg-[var(--color-surface-subtle)] text-[var(--color-text-tertiary)]">
                <tr>
                  <th className="px-3 py-2" />
                  <th className="px-3 py-2 font-medium" data-token="text">
                    프로젝트 ↕
                  </th>
                  <th className="px-3 py-2 font-medium" data-token="text">
                    진행 상태
                  </th>
                  <th className="px-3 py-2 font-medium" data-token="text">
                    Owner
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Northwind", "Active", 82],
                  ["Harbor", "Pending", 46],
                  ["Atlas", "Paused", 18],
                ].map(([title, status, value], index) => (
                  <tr
                    key={title}
                    className="border-t border-[var(--color-border-subtle)]"
                    data-token={picked === index ? "primary" : "surface"}
                    style={picked === index ? { background: "var(--color-interaction-selected)" } : undefined}
                    onClick={() => setPicked(index)}
                  >
                    <td className="px-3 py-2">
                      <input type="checkbox" defaultChecked={index === 0} />
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <Avatar initials={String(title).slice(0, 2)} size="sm" />
                        <span data-token="text">{title}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <StatusBadge tone={status === "Active" ? "success" : status === "Pending" ? "warning" : "info"}>
                          {status}
                        </StatusBadge>
                        <div className="w-16">
                          <Progress value={Number(value)} />
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <AvatarGroup />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex items-center justify-between border-t border-[var(--color-border-subtle)] px-3 py-2 text-xs text-[var(--color-text-tertiary)]">
              <span data-token="text">1 / 8</span>
              <div className="flex gap-1">
                <button className="pv-btn pv-btn-ghost" type="button" data-token="text">
                  Prev
                </button>
                <button className="pv-btn pv-btn-outline" type="button" data-token="text">
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
