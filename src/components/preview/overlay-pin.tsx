"use client";

export function OverlayPin<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: Array<[T, string]>;
  onChange: (value: T) => void;
}) {
  return (
    <div className="absolute bottom-3 left-3 z-50 flex flex-wrap items-center gap-1 rounded-full border border-[var(--color-border-subtle)] bg-[var(--color-surface-overlay)] px-2 py-1 text-[11px] shadow-[0_8px_20px_var(--color-shadow-default)]">
      <span className="px-1 text-[var(--color-text-tertiary)]">오버레이</span>
      {options.map(([id, label]) => (
        <button
          key={id}
          type="button"
          className="rounded-full px-2 py-0.5"
          style={
            value === id
              ? { background: "var(--color-primary-subtle)", color: "var(--color-primary-text)" }
              : { color: "var(--color-text-secondary)" }
          }
          onClick={() => onChange(id)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
