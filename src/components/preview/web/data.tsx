"use client";

import { useState } from "react";
import { BarChart, DonutChart, LineChart } from "../charts";
import { StatusBadge } from "../shared";
import { Avatar, AvatarGroup, Progress } from "../widgets";

export function WebData() {
  const [tab, setTab] = useState("table");
  const [filter, setFilter] = useState("All");

  return (
    <div className="space-y-4 p-5" data-token="background" style={{ background: "var(--color-bg-canvas)" }}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold" data-token="text">
            데이터
          </h2>
          <p className="text-sm text-[var(--color-text-secondary)]" data-token="text">
            그래프 계열은 Primary · Secondary · Accent만 사용합니다.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <input className="pv-input w-40" placeholder="검색" data-token="surface" />
          <select className="pv-input w-28" data-token="surface" defaultValue="updated">
            <option value="updated">최신순</option>
            <option value="name">이름순</option>
          </select>
          <input className="pv-input w-36" type="date" data-token="surface" />
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {["All", "Active", "Shared"].map((chip) => (
          <button
            key={chip}
            type="button"
            className="pv-chip"
            data-selected={filter === chip}
            data-token={filter === chip ? "primary" : "text"}
            onClick={() => setFilter(chip)}
          >
            {chip}
          </button>
        ))}
      </div>
      <div className="flex gap-4 text-sm">
        {[
          ["table", "Table"],
          ["cards", "Cards"],
          ["charts", "Charts"],
        ].map(([id, label]) => (
          <button
            key={id}
            type="button"
            data-token={tab === id ? "primary" : "text"}
            style={
              tab === id
                ? { borderBottom: "2px solid var(--color-primary-default)", color: "var(--color-text-primary)" }
                : { color: "var(--color-text-tertiary)" }
            }
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </div>
      {tab === "table" ? (
        <div className="pv-card overflow-hidden" data-token="surface">
          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--color-surface-subtle)] text-[var(--color-text-tertiary)]">
              <tr>
                <th className="px-3 py-2" data-token="text">
                  이름
                </th>
                <th className="px-3 py-2" data-token="text">
                  상태
                </th>
                <th className="px-3 py-2" data-token="text">
                  진행
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Northwind", "Active", 82],
                ["Harbor", "Pending", 46],
                ["Atlas", "Paused", 18],
              ].map(([title, status, value]) => (
                <tr key={title} className="border-t border-[var(--color-border-subtle)]">
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <Avatar initials={String(title).slice(0, 2)} size="sm" />
                      <span data-token="text">{title}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <StatusBadge tone={status === "Active" ? "success" : status === "Pending" ? "warning" : "info"}>
                      {status}
                    </StatusBadge>
                  </td>
                  <td className="px-3 py-2">
                    <Progress value={Number(value)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
      {tab === "cards" ? (
        <div className="grid gap-3 md:grid-cols-2">
          {["최근 항목", "저장한 항목", "공유됨"].map((title) => (
            <div key={title} className="pv-card p-3" data-token="surface">
              <p className="text-sm font-medium" data-token="text">
                {title}
              </p>
              <p className="mt-1 text-xs text-[var(--color-text-secondary)]" data-token="text">
                업데이트됨 · 2시간 전
              </p>
              <div className="mt-3">
                <AvatarGroup />
              </div>
            </div>
          ))}
        </div>
      ) : null}
      {tab === "charts" ? (
        <div className="grid gap-3 lg:grid-cols-3">
          <div className="pv-card p-3" data-token="surface">
            <p className="mb-2 text-sm" data-token="text">
              Bar
            </p>
            <BarChart />
          </div>
          <div className="pv-card p-3" data-token="surface">
            <p className="mb-2 text-sm" data-token="text">
              Line
            </p>
            <LineChart />
          </div>
          <div className="pv-card p-3" data-token="surface">
            <p className="mb-2 text-sm" data-token="text">
              Donut
            </p>
            <DonutChart />
          </div>
        </div>
      ) : null}
      <div className="grid gap-3 md:grid-cols-2">
        <div className="pv-card p-3" data-token="surface">
          <p className="mb-2 text-sm font-medium" data-token="text">
            Timeline
          </p>
          <ol className="space-y-2 text-sm">
            {["초안 생성", "리뷰 요청", "게시"].map((item, index) => (
              <li key={item} className="flex gap-2">
                <span
                  className="mt-1 size-2 rounded-full"
                  data-token={index === 2 ? "accent" : "primary"}
                  style={{ background: index === 2 ? "var(--color-accent-default)" : "var(--color-primary-default)" }}
                />
                <span data-token="text">{item}</span>
              </li>
            ))}
          </ol>
        </div>
        <div className="pv-card p-3" data-token="surface">
          <p className="mb-2 text-sm font-medium" data-token="text">
            Tree
          </p>
          <ul className="space-y-1 text-sm text-[var(--color-text-secondary)]">
            <li data-token="primary" style={{ color: "var(--color-primary-text)" }}>
              Workspace
            </li>
            <li className="pl-3" data-token="text">
              Projects
            </li>
            <li className="pl-6" data-token="text">
              Northwind
            </li>
            <li className="pl-3" data-token="text">
              Archive
            </li>
          </ul>
        </div>
      </div>
      <div className="pv-card p-3" data-token="surface">
        <div className="mb-2 grid grid-cols-7 gap-1 text-center text-[11px] text-[var(--color-text-tertiary)]">
          {["S", "M", "T", "W", "T", "F", "S"].map((day) => (
            <span key={day} data-token="text">
              {day}
            </span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-xs">
          {Array.from({ length: 28 }, (_, index) => (
            <span
              key={index}
              data-token={index === 11 ? "primary" : "text"}
              className="rounded-md py-1"
              style={
                index === 11
                  ? { background: "var(--color-primary-default)", color: "var(--color-primary-on)" }
                  : undefined
              }
            >
              {index + 1}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
