"use client";

import { useState } from "react";
import { Alert, EmptySlot } from "../widgets";

const kinds = ["Sheet", "Dialog", "Action", "Toast", "States"] as const;

export function AppFeedback({
  openKind,
  onClose,
}: {
  openKind?: (typeof kinds)[number] | null;
  onClose?: () => void;
} = {}) {
  const [kind, setKind] = useState<(typeof kinds)[number]>(openKind ?? "Sheet");
  const [open, setOpen] = useState(true);

  return (
    <div className="relative min-h-full px-4 py-3" data-token="background">
      <div className="flex flex-wrap gap-2">
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
      <p className="mt-4 text-sm text-[var(--color-text-secondary)]" data-token="text">
        Bottom sheet와 Action sheet를 실제로 엽니다.
      </p>
      {open && kind === "Sheet" ? (
        <div className="absolute inset-0 z-20 flex items-end" style={{ background: "var(--color-overlay-scrim)" }}>
          <div className="w-full rounded-t-3xl p-5" data-token="surface" style={{ background: "var(--color-surface-overlay)" }}>
            <div className="mx-auto mb-4 h-1 w-12 rounded-full bg-[var(--color-border-default)]" />
            <h3 className="font-semibold" data-token="text">
              옵션
            </h3>
            <p className="mt-1 text-sm text-[var(--color-text-secondary)]" data-token="text">
              Secondary 동작과 Accent 알림을 함께 둡니다.
            </p>
            <button className="pv-btn pv-btn-primary mt-4 w-full" type="button" data-token="primary" onClick={() => { setOpen(false); onClose?.(); }}>
              확인
            </button>
          </div>
        </div>
      ) : null}
      {open && kind === "Dialog" ? (
        <div className="absolute inset-0 z-20 grid place-items-center p-6" style={{ background: "var(--color-overlay-scrim)" }}>
          <div className="w-full rounded-2xl p-4" data-token="surface" style={{ background: "var(--color-surface-overlay)" }}>
            <h3 className="font-semibold" data-token="text">
              권한을 허용할까요?
            </h3>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button className="pv-btn pv-btn-outline" type="button" data-token="text" onClick={() => setOpen(false)}>
                나중에
              </button>
              <button className="pv-btn pv-btn-primary" type="button" data-token="primary" onClick={() => setOpen(false)}>
                허용
              </button>
            </div>
          </div>
        </div>
      ) : null}
      {open && kind === "Action" ? (
        <div className="absolute inset-0 z-20 flex items-end" style={{ background: "var(--color-overlay-scrim)" }}>
          <div className="w-full space-y-2 p-3">
            <div className="overflow-hidden rounded-2xl" data-token="surface" style={{ background: "var(--color-surface-overlay)" }}>
              {["공유", "복제", "삭제"].map((item) => (
                <button
                  key={item}
                  type="button"
                  className="block w-full border-b border-[var(--color-border-subtle)] px-3 py-3 text-sm last:border-b-0"
                  data-token="text"
                  style={item === "삭제" ? { color: "var(--color-danger-text)" } : undefined}
                  onClick={() => setOpen(false)}
                >
                  {item}
                </button>
              ))}
            </div>
            <button className="pv-btn w-full" type="button" data-token="surface" style={{ background: "var(--color-surface-overlay)" }} onClick={() => setOpen(false)}>
              취소
            </button>
          </div>
        </div>
      ) : null}
      {open && kind === "Toast" ? (
        <div
          className="absolute bottom-6 left-4 right-4 z-20 rounded-xl px-3 py-3 text-sm"
          data-token="surface"
          style={{ background: "var(--color-surface-inverse)", color: "var(--color-text-inverse)" }}
        >
          오프라인입니다.
          <button type="button" className="ml-3 underline" onClick={() => setOpen(false)}>
            닫기
          </button>
        </div>
      ) : null}
      {kind === "States" ? (
        <div className="mt-4 space-y-2">
          <Alert tone="success" title="완료" body="동기화했습니다." />
          <Alert tone="danger" title="오류" body="다시 시도하세요." />
          <EmptySlot label="Empty" />
          <p className="text-xs text-[var(--color-text-tertiary)]" data-token="text">
            Loading · Offline
          </p>
        </div>
      ) : null}
    </div>
  );
}
