"use client";

import { useEffect, useMemo, useState } from "react";
import { LoadingPhrase } from "@/components/flow/loading-phrase";
import { useCopy } from "@/hooks/use-copy";
import { prefersReducedMotion } from "@/lib/match-reveal";
import { countDistinctPaletteGroups } from "@/lib/palette-groups";
import { resolvePickedHex } from "@/lib/picked-color";
import { useMatchuStore } from "@/lib/store";

const LOAD_MS = 5400;

export function MatchingLoader({ onDone }: { onDone: () => void }) {
  const copy = useCopy();
  const rawHex = useMatchuStore((state) => state.input.hex);
  const completeMatch = useMatchuStore((state) => state.completeMatch);
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);
  const hex = resolvePickedHex(rawHex);
  const paletteGroupCount = useMemo(() => countDistinctPaletteGroups(hex), [hex]);
  const templates = copy.loading.phrases;
  const activeTemplate = templates[phraseIndex] ?? templates[0];

  useEffect(() => {
    if (prefersReducedMotion()) {
      setReduceMotion(true);
      completeMatch(hex);
      const timeout = window.setTimeout(onDone, 200);
      return () => window.clearTimeout(timeout);
    }

    const slot = LOAD_MS / templates.length;
    const timers = templates.map((_, index) =>
      window.setTimeout(() => setPhraseIndex(index), index * slot),
    );
    const safety = window.setTimeout(() => {
      completeMatch(hex);
      onDone();
    }, LOAD_MS + 160);
    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
      window.clearTimeout(safety);
    };
  }, [completeMatch, hex, onDone, templates]);

  function finish(event: React.AnimationEvent<HTMLDivElement>) {
    if (event.target !== event.currentTarget) return;
    completeMatch(hex);
    onDone();
  }

  return (
    <div className="match-load-root">
      {reduceMotion ? (
        <div className="match-load-wash is-instant" style={{ ["--wash-hex" as string]: hex }} />
      ) : (
        <div
          className="match-load-wash"
          style={{ ["--wash-hex" as string]: hex, ["--match-load-ms" as string]: `${LOAD_MS}ms` }}
          onAnimationEnd={finish}
        />
      )}
      <div className="match-load-copy">
        <p className="match-load-kicker">{copy.loading.title}</p>
        <p key={`${phraseIndex}-${hex}-${paletteGroupCount}`} className="match-load-phrase">
          <LoadingPhrase template={activeTemplate} hex={hex} count={paletteGroupCount} />
        </p>
      </div>
    </div>
  );
}
