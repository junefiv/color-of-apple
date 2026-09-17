"use client";

import { useEffect, useState } from "react";
import { useCopy } from "@/hooks/use-copy";
import { prefersReducedMotion } from "@/lib/match-reveal";
import { FALLBACK_HEX, isHexColor, normalizeHex } from "@/lib/picked-color";
import { useMatchuStore } from "@/lib/store";

const LOAD_MS = 5400;

export function MatchingLoader({ onDone }: { onDone: () => void }) {
  const copy = useCopy();
  const rawHex = useMatchuStore((state) => state.input.hex);
  const completeMatch = useMatchuStore((state) => state.completeMatch);
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);
  const phrases = copy.loading.phrases;
  const hex = isHexColor(rawHex) ? normalizeHex(rawHex) : FALLBACK_HEX;

  useEffect(() => {
    if (prefersReducedMotion()) {
      setReduceMotion(true);
      completeMatch(hex);
      const timeout = window.setTimeout(onDone, 200);
      return () => window.clearTimeout(timeout);
    }

    const slot = LOAD_MS / phrases.length;
    const timers = phrases.map((_, index) =>
      window.setTimeout(() => setPhraseIndex(index), index * slot),
    );
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [completeMatch, hex, onDone, phrases]);

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
        <p key={phrases[phraseIndex]} className="match-load-phrase">
          {phrases[phraseIndex]}
        </p>
      </div>
    </div>
  );
}
