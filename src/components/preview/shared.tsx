export function StatusBadge({
  tone,
  children,
}: {
  tone: "success" | "warning" | "danger" | "info" | "neutral";
  children: React.ReactNode;
}) {
  const map = {
    success: {
      background: "var(--color-success-surface)",
      color: "var(--color-success-text)",
    },
    warning: {
      background: "var(--color-warning-surface)",
      color: "var(--color-warning-text)",
    },
    danger: {
      background: "var(--color-danger-surface)",
      color: "var(--color-danger-text)",
    },
    info: {
      background: "var(--color-info-surface)",
      color: "var(--color-info-text)",
    },
    neutral: {
      background: "var(--color-primary-subtle)",
      color: "var(--color-primary-text)",
    },
  } as const;

  return (
    <span className="pv-badge" style={map[tone]}>
      {children}
    </span>
  );
}

export function MiniChart() {
  const bars = [64, 42, 78, 36, 58];
  return (
    <div className="flex h-28 items-end gap-2">
      {bars.map((height, index) => (
        <div
          key={index}
          className="flex-1 rounded-t"
          style={{
            height: `${height}%`,
            background: `var(--color-chart-${index + 1})`,
          }}
        />
      ))}
    </div>
  );
}

export const rows = [
  { title: "Item title", meta: "Supporting text", status: "Active" as const },
  { title: "Item title", meta: "Supporting text", status: "Pending" as const },
  { title: "Item title", meta: "Supporting text", status: "Failed" as const },
];
