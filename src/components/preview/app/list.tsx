"use client";

import { useState } from "react";
import { StatusBadge } from "../shared";
import { Avatar } from "../widgets";

const items = [
  { title: "최근 항목", meta: "2분 전", status: "Active" as const },
  { title: "저장한 항목", meta: "어제", status: "Pending" as const },
  { title: "공유됨", meta: "업데이트됨", status: "Paused" as const },
];

export function AppList({
  onOpen,
}: {
  onOpen?: (screen: "detail" | "form") => void;
} = {}) {
  const [filter, setFilter] = useState("All");
  const [picked, setPicked] = useState(0);

  return (
    <div className="flex min-h-full flex-col" data-token="background">
      <div className="px-5 pt-2">
        <h2 className="text-xl font-semibold" data-token="text">
          목록
        </h2>
        <input className="pv-input mt-3" placeholder="검색" data-token="surface" />
        <div className="mt-3 flex gap-2">
          {["All", "Saved", "Shared"].map((chip) => (
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
      </div>
      <div className="flex-1 space-y-2 px-5 py-4">
        {items.map((item, index) => (
          <button
            key={item.title}
            type="button"
            data-token={picked === index ? "primary" : "surface"}
            className="pv-card flex w-full items-center gap-3 p-3 text-left"
            style={picked === index ? { outline: "2px solid var(--color-primary-default)" } : index === 2 ? { opacity: 0.5 } : undefined}
            onClick={() => {
              if (index === 2) return;
              setPicked(index);
              onOpen?.("detail");
            }}
          >
            {index === 1 ? (
              <div className="size-10 rounded-lg bg-[var(--color-secondary-default)]" data-token="secondary" />
            ) : (
              <Avatar initials={item.title.slice(0, 2)} />
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium" data-token="text">
                {item.title}
              </p>
              <p className="text-xs text-[var(--color-text-secondary)]" data-token="text">
                {item.meta}
              </p>
            </div>
            <StatusBadge tone={item.status === "Active" ? "success" : item.status === "Pending" ? "warning" : "info"}>
              {item.status}
            </StatusBadge>
          </button>
        ))}
        <p className="py-3 text-center text-xs text-[var(--color-text-tertiary)]" data-token="text">
          더 불러오는 중…
        </p>
      </div>
    </div>
  );
}
