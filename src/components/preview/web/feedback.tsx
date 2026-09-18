"use client";

import { useState } from "react";
import { Alert, EmptySlot } from "../widgets";

const kinds = ["Modal", "Drawer", "Popover", "Toast", "States"] as const;

export function WebFeedback() {
  const [kind, setKind] = useState<(typeof kinds)[number]>("Modal");
  const [open, setOpen] = useState(true);

  return (
    <div className="relative min-h-full p-5" data-token="background" style={{ background: "var(--color-bg-canvas)" }}>
      <div className="mb-4 flex flex-wrap gap-2">
        {kinds.map((item) => (
          <button
            key={item}
            type="button"
            className="pv-chip"
            data-selected={kind === item}
            data-token={kind === item ? "primary" : "text"}
            onClick={() => {
              setKind(item);
              setOpen(true);
            }}
          >
            {item}
          </button>
        ))}
      </div>
      <div className="pv-card p-5" data-token="surface">
        <h2 className="text-lg font-semibold" data-token="text">
          Feedback
        </h2>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]" data-token="text">
          오버레이는 한 번에 하나만 엽니다. 상태색은 팔레트와 분리합니다.
        </p>
        <div className="mt-4">
          <button className="pv-btn pv-btn-primary" type="button" data-token="primary" onClick={() => setOpen(true)}>
            {kind} 열기
          </button>
        </div>
      </div>
      {open && kind === "Modal" ? (
        <div className="absolute inset-0 z-20 grid place-items-center p-6" style={{ background: "var(--color-overlay-scrim)" }} data-token="background">
          <div className="pv-card w-full max-w-md p-5" data-token="surface" style={{ background: "var(--color-surface-overlay)" }}>
            <h3 className="text-base font-semibold" data-token="text">
              항목을 삭제할까요?
            </h3>
            <p className="mt-1 text-sm text-[var(--color-text-secondary)]" data-token="text">
              이 동작은 되돌릴 수 없습니다.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button className="pv-btn pv-btn-outline" type="button" data-token="text" onClick={() => setOpen(false)}>
                취소
              </button>
              <button className="pv-btn pv-btn-danger" type="button" data-token="primary" onClick={() => setOpen(false)}>
                삭제
              </button>
            </div>
          </div>
        </div>
      ) : null}
      {open && kind === "Drawer" ? (
        <div className="absolute inset-0 z-20 flex justify-end" style={{ background: "var(--color-overlay-scrim)" }}>
          <div className="h-full w-80 p-5" data-token="surface" style={{ background: "var(--color-surface-overlay)" }}>
            <h3 className="font-semibold" data-token="text">
              세부 정보
            </h3>
            <p className="mt-2 text-sm text-[var(--color-text-secondary)]" data-token="text">
              Side drawer
            </p>
            <button className="pv-btn pv-btn-primary mt-4 w-full" type="button" data-token="primary" onClick={() => setOpen(false)}>
              닫기
            </button>
          </div>
        </div>
      ) : null}
      {open && kind === "Popover" ? (
        <div className="absolute left-8 top-28 z-20 w-56 rounded-xl p-3 shadow-[0_16px_40px_var(--color-shadow-default)]" data-token="surface" style={{ background: "var(--color-surface-overlay)" }}>
          <p className="text-sm" data-token="text">
            Accent는 면적의 10%만
          </p>
          <button className="pv-btn pv-btn-ghost mt-2" type="button" data-token="text" onClick={() => setOpen(false)}>
            닫기
          </button>
        </div>
      ) : null}
      {open && kind === "Toast" ? (
        <div
          className="absolute bottom-6 right-6 z-20 rounded-xl px-4 py-3 text-sm shadow-[0_16px_40px_var(--color-shadow-default)]"
          data-token="surface"
          style={{ background: "var(--color-surface-inverse)", color: "var(--color-text-inverse)" }}
        >
          저장했습니다.
          <button type="button" className="ml-3 underline" onClick={() => setOpen(false)}>
            닫기
          </button>
        </div>
      ) : null}
      {kind === "States" ? (
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <Alert tone="success" title="완료" body="변경 사항을 반영했습니다." />
          <Alert tone="warning" title="주의" body="일부 필드가 비어 있습니다." />
          <Alert tone="danger" title="실패" body="다시 시도하세요." />
          <Alert tone="info" title="안내" body="오프라인에서도 초안이 유지됩니다." />
          <EmptySlot label="Empty state" />
          <div className="pv-card space-y-2 p-3" data-token="surface">
            <div className="h-3 w-2/3 rounded bg-[var(--color-border-subtle)]" />
            <div className="h-3 w-1/2 rounded bg-[var(--color-border-subtle)]" />
            <p className="text-xs text-[var(--color-text-tertiary)]" data-token="text">
              Skeleton · Spinner
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
