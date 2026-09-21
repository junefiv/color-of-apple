export function StatusBadge({
  tone,
  children,
}: {
  tone: "success" | "warning" | "danger" | "info" | "neutral" | "accent";
  children: React.ReactNode;
}) {
  return (
    <span className="pv-badge" data-tone={tone}>
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
