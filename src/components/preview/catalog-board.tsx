"use client";

import { useCopy } from "@/hooks/use-copy";

const COLOR_TONES = ["neutral", "primary", "secondary", "accent", "info", "success", "warning", "error"] as const;
const SOFT_TONES = ["default", ...COLOR_TONES.slice(1)] as const;

function ButtonRow({
  look,
  tones,
  labels,
}: {
  look: "solid" | "soft" | "outline" | "dash";
  tones: readonly string[];
  labels: Record<string, string>;
}) {
  return (
    <div className="kit-btn-row">
      {tones.map((tone) => (
        <button key={`${look}-${tone}`} type="button" className="kit-btn" data-look={look} data-tone={tone}>
          {labels[tone]}
        </button>
      ))}
    </div>
  );
}

export function CatalogBoard({ platform }: { platform: "web" | "app" }) {
  const copy = useCopy();
  const b = copy.preview.buttons;
  const labels = {
    default: b.default,
    neutral: b.neutral,
    primary: b.primary,
    secondary: b.secondary,
    accent: b.accent,
    info: b.info,
    success: b.success,
    warning: b.warning,
    error: b.error,
  };

  return (
    <div className="preview-viewport">
      <div className="preview-scroll kit-docs" data-platform={platform} style={{ background: "var(--color-bg-canvas)" }}>
        <section className="kit-docs-section">
          <h2># {b.color}</h2>
          <div className="kit-docs-preview">
            <ButtonRow look="solid" tones={COLOR_TONES} labels={labels} />
          </div>
        </section>

        <section className="kit-docs-section">
          <h2># {b.soft}</h2>
          <div className="kit-docs-preview">
            <ButtonRow look="soft" tones={SOFT_TONES} labels={labels} />
          </div>
        </section>

        <section className="kit-docs-section">
          <h2># {b.outline}</h2>
          <div className="kit-docs-preview">
            <ButtonRow look="outline" tones={COLOR_TONES} labels={labels} />
          </div>
        </section>

        <section className="kit-docs-section">
          <h2># {b.dash}</h2>
          <div className="kit-docs-preview">
            <ButtonRow look="dash" tones={COLOR_TONES} labels={labels} />
          </div>
        </section>
      </div>
    </div>
  );
}
