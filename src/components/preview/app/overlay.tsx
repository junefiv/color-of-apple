"use client";

export function AppOverlay({
  open = false,
  onClose,
}: {
  open?: boolean;
  onClose?: () => void;
} = {}) {
  if (!open) return null;

  return (
    <div className="absolute inset-0 z-20 flex items-end" style={{ background: "var(--color-overlay-scrim)" }}>
      <div className="w-full rounded-t-3xl p-5" style={{ background: "var(--color-surface-overlay)" }}>
        <button
          type="button"
          className="mx-auto mb-4 block h-1 w-12 rounded-full bg-[var(--color-border-default)]"
          onClick={onClose}
        />
        <h3 className="font-semibold">인증 옵션</h3>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">성공·경고는 상태색, 포인트는 Accent.</p>
        <div className="mt-4 space-y-2 text-sm">
          <div className="rounded-lg bg-[var(--color-success-surface)] px-3 py-2 text-[var(--color-success-text)]">
            목표 달성
          </div>
          <div className="rounded-lg bg-[var(--color-warning-surface)] px-3 py-2 text-[var(--color-warning-text)]">
            마감 임박
          </div>
          <button className="pv-btn pv-btn-primary w-full" type="button" onClick={onClose}>
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
