"use client";

import { useState } from "react";
import { useCopy } from "@/hooks/use-copy";

const VALUES = [72, 48, 88, 61, 36];

export function DataChartShowcase() {
  const k = useCopy().preview.kit;
  const [selected, setSelected] = useState(2);

  return (
    <div className="kit-chart-card">
      <div className="kit-chart-panel">
        <header>
          <span><strong>{k.barChart}</strong><small>{k.chartCaption}</small></span>
          <b>{VALUES[selected]}</b>
        </header>
        <div className="kit-bar-chart" aria-label={k.barChart}>
          {VALUES.map((value, index) => (
            <button
              key={k.chartLabels[index]}
              type="button"
              aria-label={`${k.chartLabels[index]} ${value}`}
              aria-pressed={selected === index}
              style={{
                "--bar-height": `${value}%`,
                "--bar-color":
                  selected === index
                    ? "var(--color-data-primary)"
                    : "var(--color-data-comparison-previous)",
              } as React.CSSProperties}
              onClick={() => setSelected(index)}
            >
              {selected === index ? <span className="kit-chart-tooltip">{k.chartLabels[index]} · {value}</span> : null}
              <i aria-hidden />
              <small>{k.chartLabels[index]}</small>
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}
