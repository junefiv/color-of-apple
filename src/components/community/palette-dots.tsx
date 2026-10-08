import { paletteDots } from "@/lib/community/palette";
import type { Copy } from "@/lib/copy";

export function PaletteDots({
  snapshot,
  labels,
  missingLabel,
  large = false,
}: {
  snapshot: Record<string, string> | undefined;
  labels: Copy["community"]["roles"];
  missingLabel: string;
  large?: boolean;
}) {
  const dots = paletteDots(snapshot);
  return (
    <span className={large ? "palette-dice palette-dice-large" : "palette-dice"} aria-hidden={false}>
      {dots.map((dot) => {
        const label = dot.hex ? `${labels[dot.role]} ${dot.hex}` : `${labels[dot.role]} ${missingLabel}`;
        return (
          <i
            key={dot.path}
            className="palette-dice-dot"
            title={label}
            aria-label={label}
            style={dot.hex ? { background: dot.hex } : undefined}
            data-empty={dot.hex ? undefined : "true"}
          />
        );
      })}
    </span>
  );
}
