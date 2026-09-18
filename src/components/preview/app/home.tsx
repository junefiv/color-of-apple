"use client";

import { useState } from "react";
import { StatusBadge } from "../shared";
import { Avatar, Progress } from "../widgets";

export function AppHome({
  onOpen,
}: {
  onOpen?: (screen: "list" | "detail" | "form") => void;
} = {}) {
  const [seg, setSeg] = useState("all");

  return (
    <div className="flex min-h-full flex-col" data-token="background">
      <div className="flex items-center justify-between px-5 pt-2">
        <Avatar initials="YU" />
        <div className="flex gap-2">
          <button type="button" className="relative grid size-8 place-items-center rounded-full border border-[var(--color-border-default)]" data-token="text">
            🔔
            <span data-token="accent" className="absolute right-1 top-1 size-2 rounded-full bg-[var(--color-accent-default)]" />
          </button>
          <button type="button" className="grid size-8 place-items-center rounded-full border border-[var(--color-border-default)]" data-token="secondary">
            +
          </button>
        </div>
      </div>
      <div className="px-5 pt-4">
        <h2 className="text-xl font-semibold" data-token="text">
          안녕하세요
        </h2>
        <input className="pv-input mt-3" placeholder="검색" data-token="surface" />
        <div className="mt-3 flex gap-1 rounded-full bg-[var(--color-surface-subtle)] p-1" data-token="surface">
          {[
            ["all", "전체"],
            ["saved", "저장"],
          ].map(([id, label]) => (
            <button
              key={id}
              type="button"
              data-token={seg === id ? "primary" : "text"}
              className="flex-1 rounded-full py-1 text-xs"
              style={
                seg === id
                  ? { background: "var(--color-primary-default)", color: "var(--color-primary-on)" }
                  : { color: "var(--color-text-secondary)" }
              }
              onClick={() => setSeg(id)}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="mt-3 flex gap-2">
          {["최근", "공유"].map((chip, index) => (
            <button key={chip} type="button" className="pv-chip" data-selected={index === 0} data-token={index === 0 ? "primary" : "text"}>
              {chip}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 space-y-3 px-5 py-4">
        <button
          type="button"
          data-token="primary"
          className="w-full rounded-2xl p-4 text-left"
          style={{ background: "var(--color-primary-default)", color: "var(--color-primary-on)" }}
          onClick={() => onOpen?.("detail")}
        >
          <p className="text-xs opacity-80">이번 달 활동</p>
          <p className="mt-1 text-2xl font-semibold">1,284</p>
          <p className="mt-2 text-xs" data-token="accent">
            +12% · 핵심 지표
          </p>
        </button>
        <div className="grid grid-cols-2 gap-2">
          <div className="pv-card p-3" data-token="surface">
            <p className="text-xs text-[var(--color-text-tertiary)]" data-token="text">
              진행
            </p>
            <p className="text-lg font-semibold" data-token="text">
              72%
            </p>
            <Progress value={72} />
          </div>
          <div className="pv-card p-3" data-token="secondary" style={{ background: "var(--color-secondary-default)", color: "var(--color-secondary-on)" }}>
            <p className="text-xs opacity-80">대기</p>
            <p className="text-lg font-semibold">9</p>
          </div>
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {["Northwind", "Harbor", "Atlas"].map((title) => (
            <button key={title} type="button" className="pv-card min-w-28 shrink-0 p-3 text-left" data-token="surface" onClick={() => onOpen?.("detail")}>
              <p className="text-sm" data-token="text">
                {title}
              </p>
              <StatusBadge tone="success">Active</StatusBadge>
            </button>
          ))}
        </div>
        <button type="button" className="flex w-full items-center gap-3 text-left" data-token="text" onClick={() => onOpen?.("list")}>
          <Avatar initials="NW" />
          <div>
            <p className="text-sm">최근 항목</p>
            <p className="text-xs text-[var(--color-text-secondary)]">업데이트됨</p>
          </div>
        </button>
        <div className="rounded-xl border border-dashed border-[var(--color-border-default)] px-3 py-5 text-center text-xs text-[var(--color-text-tertiary)]" data-token="surface">
          <span data-token="text">비어 있는 슬롯</span>
        </div>
      </div>
      <div className="relative px-5 pb-2">
        <button className="pv-btn pv-btn-primary w-full" type="button" data-token="primary" onClick={() => onOpen?.("form")}>
          새 항목
        </button>
        <button
          type="button"
          data-token="accent"
          className="absolute -top-5 right-6 grid size-11 place-items-center rounded-full text-lg shadow-[0_10px_24px_var(--color-shadow-default)]"
          style={{ background: "var(--color-accent-default)", color: "var(--color-accent-on)" }}
          onClick={() => onOpen?.("form")}
        >
          +
        </button>
      </div>
    </div>
  );
}
