const SERIES = [
  "var(--color-primary-default)",
  "var(--color-secondary-default)",
  "var(--color-accent-default)",
  "color-mix(in oklab, var(--color-primary-default) 42%, var(--color-bg-canvas))",
  "color-mix(in oklab, var(--color-secondary-default) 42%, var(--color-bg-canvas))",
];

const TOKENS = ["primary", "secondary", "accent", "primary", "secondary"] as const;

export function BarChart({ compact = false }: { compact?: boolean } = {}) {
  const bars = compact
    ? [
        [64, 42, 78],
        [48, 70, 36],
        [80, 28, 54],
        [36, 52, 44],
        [22, 38, 30],
      ]
    : [
        [64, 42, 78, 36, 58],
        [48, 70, 36, 62, 40],
        [80, 28, 54, 72, 46],
        [36, 52, 44, 28, 34],
        [22, 38, 30, 48, 26],
      ];

  return (
    <div className="flex h-28 items-end gap-2">
      {bars[0].map((_, index) => (
        <div key={index} className="flex h-full flex-1 items-end gap-0.5">
          {bars.map((series, seriesIndex) => (
            <div
              key={seriesIndex}
              data-token={TOKENS[seriesIndex]}
              className="flex-1 rounded-t"
              style={{
                height: `${series[index]}%`,
                background: SERIES[seriesIndex],
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export function LineChart() {
  return (
    <svg viewBox="0 0 200 80" className="h-28 w-full">
      <polyline
        data-token="primary"
        fill="none"
        stroke="var(--color-primary-default)"
        strokeWidth="2.4"
        points="0,58 40,46 80,52 120,28 160,34 200,18"
      />
      <polyline
        data-token="secondary"
        fill="none"
        stroke="var(--color-secondary-default)"
        strokeWidth="2.4"
        points="0,68 40,60 80,44 120,48 160,38 200,42"
      />
      <polyline
        data-token="accent"
        fill="none"
        stroke="var(--color-accent-default)"
        strokeWidth="2.4"
        points="0,72 40,64 80,66 120,50 160,22 200,30"
      />
      <circle data-token="accent" cx="160" cy="22" r="4" fill="var(--color-accent-default)" />
    </svg>
  );
}

export function DonutChart() {
  return (
    <div className="flex items-center gap-4">
      <svg viewBox="0 0 42 42" className="size-20">
        <circle cx="21" cy="21" r="15.5" fill="none" stroke="var(--color-border-subtle)" strokeWidth="6" />
        <circle
          data-token="primary"
          cx="21"
          cy="21"
          r="15.5"
          fill="none"
          stroke="var(--color-primary-default)"
          strokeDasharray="58 97"
          strokeWidth="6"
          transform="rotate(-90 21 21)"
        />
        <circle
          data-token="secondary"
          cx="21"
          cy="21"
          r="15.5"
          fill="none"
          stroke="var(--color-secondary-default)"
          strokeDasharray="28 97"
          strokeDashoffset="-58"
          strokeWidth="6"
          transform="rotate(-90 21 21)"
        />
        <circle
          data-token="accent"
          cx="21"
          cy="21"
          r="15.5"
          fill="none"
          stroke="var(--color-accent-default)"
          strokeDasharray="11 97"
          strokeDashoffset="-86"
          strokeWidth="6"
          transform="rotate(-90 21 21)"
        />
      </svg>
      <ChartLegend />
    </div>
  );
}

export function ChartLegend({ full = false }: { full?: boolean } = {}) {
  const items: Array<[string, string, string]> = [
    ["Primary", "var(--color-primary-default)", "primary"],
    ["Secondary", "var(--color-secondary-default)", "secondary"],
    ["Accent", "var(--color-accent-default)", "accent"],
  ];
  if (full) {
    items.push(
      ["Primary 파생", "color-mix(in oklab, var(--color-primary-default) 42%, var(--color-bg-canvas))", "primary"],
      ["Secondary 파생", "color-mix(in oklab, var(--color-secondary-default) 42%, var(--color-bg-canvas))", "secondary"],
    );
  }
  return (
    <ul className="space-y-1 text-xs">
      {items.map(([label, color, token]) => (
        <li key={label} className="flex items-center gap-2" data-token="text">
          <span className="size-2 rounded-full" data-token={token} style={{ background: color }} />
          {label}
        </li>
      ))}
    </ul>
  );
}
