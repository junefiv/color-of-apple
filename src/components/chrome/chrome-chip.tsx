"use client";

export function ChromeChip({
  active,
  matched,
  onClick,
  label,
}: {
  active: boolean;
  matched?: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-active={active}
      data-matched={matched ? "true" : "false"}
      className="chrome-chip"
    >
      {label}
    </button>
  );
}
