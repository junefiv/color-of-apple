"use client";

import { useState } from "react";

export function WebOverlay({
  open = false,
  onClose,
  onOpen,
}: {
  open?: boolean;
  onClose?: () => void;
  onOpen?: () => void;
} = {}) {
  const [toast, setToast] = useState(false);

  if (!open) {
    return (
      <div className="space-y-4 p-5">
        <button className="pv-btn pv-btn-primary" type="button" onClick={onOpen}>
          모달 열기
        </button>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-xl bg-[var(--color-success-surface)] px-3 py-2 text-sm text-[var(--color-success-text)]">
            목표 달성
          </div>
          <div className="rounded-xl bg-[var(--color-warning-surface)] px-3 py-2 text-sm text-[var(--color-warning-text)]">
            마감 임박
          </div>
          <div className="rounded-xl bg-[var(--color-danger-surface)] px-3 py-2 text-sm text-[var(--color-danger-text)]">
            인증 미인정
          </div>
          <div className="rounded-xl bg-[var(--color-info-surface)] px-3 py-2 text-sm text-[var(--color-info-text)]">
            안내 메시지
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center p-6" style={{ background: "var(--color-overlay-scrim)" }}>
      <div className="pv-card w-full max-w-md p-5" style={{ background: "var(--color-surface-overlay)" }}>
        <h3 className="text-base font-semibold">목표 선택 완료</h3>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">한 화면의 핵심 행동만 Primary로 둡니다.</p>
        <div className="mt-4 flex justify-end gap-2">
          <button className="pv-btn pv-btn-outline" type="button" onClick={onClose}>
            닫기
          </button>
          <button
            className="pv-btn pv-btn-primary"
            type="button"
            onClick={() => {
              setToast(true);
              onClose?.();
            }}
          >
            확인
          </button>
        </div>
        {toast ? <p className="mt-3 text-xs text-[var(--color-text-secondary)]">저장했어요</p> : null}
      </div>
    </div>
  );
}
