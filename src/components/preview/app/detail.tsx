"use client";

import { useState } from "react";
import { AvatarGroup, Progress } from "../widgets";

export function AppDetail({
  onBack,
  onForm,
}: {
  onBack?: () => void;
  onForm?: () => void;
} = {}) {
  const [tab, setTab] = useState("info");
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-full flex-col" data-token="background">
      <div className="flex items-center justify-between px-5 pt-2">
        <button className="text-sm" type="button" data-token="primary" style={{ color: "var(--color-primary-text)" }} onClick={onBack}>
          ← Back
        </button>
        <button type="button" data-token="text" onClick={() => setOpen((value) => !value)}>
          ⋮
        </button>
      </div>
      {open ? (
        <div className="mx-5 mt-2 rounded-xl bg-[var(--color-surface-overlay)] p-2 text-sm shadow-[0_12px_28px_var(--color-shadow-default)]" data-token="surface">
          {["Share", "Copy", "Archive"].map((item) => (
            <button key={item} type="button" className="block w-full rounded-md px-2 py-1.5 text-left" data-token="text">
              {item}
            </button>
          ))}
        </div>
      ) : null}
      <div className="mx-5 mt-3 h-36 rounded-2xl pv-bg-primary" data-token="primary" />
      <div className="flex-1 space-y-3 px-5 py-4">
        <h2 className="text-2xl font-semibold" data-token="text">
          Northwind
        </h2>
        <p className="text-xs text-[var(--color-text-tertiary)]" data-token="text">
          업데이트됨 · 프로젝트
        </p>
        <AvatarGroup />
        <Progress value={72} tone="accent" />
        <div className="flex gap-3 text-sm">
          {["info", "activity"].map((id) => (
            <button
              key={id}
              type="button"
              data-token={tab === id ? "primary" : "text"}
              style={
                tab === id
                  ? { borderBottom: "2px solid var(--color-primary-default)" }
                  : { color: "var(--color-text-tertiary)" }
              }
              onClick={() => setTab(id)}
            >
              {id === "info" ? "정보" : "활동"}
            </button>
          ))}
        </div>
        {tab === "info" ? (
          <div className="space-y-2 text-sm">
            {[
              ["Owner", "Jordan Miles"],
              ["상태", "Active"],
              ["범위", "Team"],
            ].map(([key, value]) => (
              <div key={key} className="flex justify-between border-b border-[var(--color-border-subtle)] py-2">
                <span className="text-[var(--color-text-secondary)]" data-token="text">
                  {key}
                </span>
                <span data-token="text">{value}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2 text-sm">
            <p data-token="text">초안을 올렸습니다.</p>
            <p className="text-[var(--color-text-secondary)]" data-token="text">
              2시간 전
            </p>
          </div>
        )}
      </div>
      <div className="grid grid-cols-[1fr_auto] gap-2 px-5 pb-3">
        <button className="pv-btn pv-btn-primary" type="button" data-token="primary" onClick={onForm}>
          계속
        </button>
        <button className="pv-btn pv-btn-secondary-fill" type="button" data-token="secondary">
          공유
        </button>
      </div>
    </div>
  );
}
