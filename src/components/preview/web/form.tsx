"use client";

import { useState } from "react";
import { Alert } from "../widgets";
import { ChoiceCard } from "../widgets";

const fieldStates = [
  ["Default", ""],
  ["Filled", "Northwind"],
  ["Focus", "focus"],
  ["Error", "error"],
  ["Success", "success"],
  ["Disabled", "disabled"],
] as const;

export function WebForm() {
  const [plan, setPlan] = useState("team");
  const [loading, setLoading] = useState(false);

  return (
    <div className="p-5" data-token="background" style={{ background: "var(--color-bg-canvas)" }}>
      <div className="pv-card mx-auto max-w-3xl space-y-6 p-5" data-token="surface">
        <div>
          <h2 className="text-lg font-semibold" data-token="text">
            새 프로젝트
          </h2>
          <p className="text-sm text-[var(--color-text-secondary)]" data-token="text">
            Border, Focus, Surface, Text Secondary를 이 화면에서 검사합니다.
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {fieldStates.map(([label, state]) => (
            <label key={label} className="block text-sm">
              <span className="mb-1.5 block text-[var(--color-text-secondary)]" data-token="text">
                {label}
              </span>
              <input
                className="pv-input"
                data-token="surface"
                data-state={state === "focus" || state === "error" || state === "success" ? state : undefined}
                disabled={state === "disabled"}
                readOnly={label === "Default"}
                defaultValue={label === "Filled" || state === "focus" || state === "error" || state === "success" ? "Northwind" : ""}
              />
            </label>
          ))}
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-1.5 block text-[var(--color-text-secondary)]" data-token="text">
              Search
            </span>
            <input className="pv-input" placeholder="검색" data-token="surface" />
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block text-[var(--color-text-secondary)]" data-token="text">
              Password
            </span>
            <input className="pv-input" type="password" defaultValue="••••••" data-token="surface" />
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block text-[var(--color-text-secondary)]" data-token="text">
              Number
            </span>
            <input className="pv-input" type="number" defaultValue={12} data-token="surface" />
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block text-[var(--color-text-secondary)]" data-token="text">
              Prefix
            </span>
            <div className="flex">
              <span className="grid place-items-center rounded-l-lg border border-r-0 border-[var(--color-border-default)] bg-[var(--color-surface-subtle)] px-2 text-xs" data-token="text">
                @
              </span>
              <input className="pv-input rounded-l-none" defaultValue="workspace" data-token="surface" />
            </div>
          </label>
          <label className="block text-sm md:col-span-2">
            <span className="mb-1.5 block text-[var(--color-text-secondary)]" data-token="text">
              Notes
            </span>
            <textarea className="pv-input min-h-20" defaultValue="이번 주 목표와 범위를 적습니다." data-token="surface" />
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block text-[var(--color-text-secondary)]" data-token="text">
              Select
            </span>
            <select className="pv-input" data-token="surface" defaultValue="public">
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block text-[var(--color-text-secondary)]" data-token="text">
              Date / Time
            </span>
            <div className="flex gap-2">
              <input className="pv-input" type="date" data-token="surface" />
              <input className="pv-input" type="time" data-token="surface" />
            </div>
          </label>
        </div>
        <div className="grid gap-2 md:grid-cols-3">
          <ChoiceCard title="Starter" body="개인 작업" selected={plan === "solo"} onClick={() => setPlan("solo")} />
          <ChoiceCard title="Team" body="작은 팀" selected={plan === "team"} onClick={() => setPlan("team")} />
          <ChoiceCard title="Scale" body="조직" selected={plan === "scale"} onClick={() => setPlan("scale")} />
        </div>
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <label className="flex items-center gap-2" data-token="text">
            <input type="checkbox" defaultChecked /> 알림 받기
          </label>
          <label className="flex items-center gap-2" data-token="text">
            <input type="radio" name="cycle" defaultChecked /> 주간
          </label>
          <label className="flex items-center gap-2" data-token="text">
            <input type="radio" name="cycle" /> 월간
          </label>
          <button
            type="button"
            data-token="primary"
            className="h-6 w-11 rounded-full p-0.5"
            style={{ background: "var(--color-primary-default)" }}
          >
            <span className="block size-5 translate-x-5 rounded-full bg-[var(--color-primary-on)]" />
          </button>
          <input type="range" className="w-28" defaultValue={40} />
        </div>
        <div className="flex flex-wrap gap-2">
          {["Design", "Dev", "Review"].map((chip, index) => (
            <button key={chip} type="button" className="pv-chip" data-selected={index === 0} data-token={index === 0 ? "primary" : "text"}>
              {chip}
            </button>
          ))}
          <span className="pv-chip" data-token="secondary">
            tag +
          </span>
        </div>
        <div
          data-token="surface"
          className="rounded-xl border border-dashed border-[var(--color-border-default)] px-3 py-6 text-center text-sm text-[var(--color-text-secondary)]"
        >
          <span data-token="text">파일을 놓거나 찾아보기</span>
        </div>
        <div className="grid gap-2 md:grid-cols-2">
          <Alert tone="info" title="안내" body="저장하면 워크스페이스 멤버에게 보입니다." />
          <Alert tone="danger" title="오류" body="이름 필드를 확인하세요." />
        </div>
        <div className="flex justify-end gap-2">
          <button className="pv-btn pv-btn-ghost" type="button" data-token="text">
            취소
          </button>
          <button className="pv-btn pv-btn-outline" type="button" data-token="text">
            초기화
          </button>
          <button
            className="pv-btn pv-btn-primary"
            type="button"
            data-token="primary"
            onClick={() => {
              setLoading(true);
              window.setTimeout(() => setLoading(false), 900);
            }}
          >
            {loading ? "저장 중…" : "저장"}
          </button>
        </div>
      </div>
    </div>
  );
}
