"use client";

import { useCallback, useEffect, useRef, useState } from "react";

function restDelay() {
  return 8000 + Math.random() * 7000;
}

export function useAppleHop(enabled = true) {
  const [hopping, setHopping] = useState(false);
  const [tip, setTip] = useState(false);
  const [hopId, setHopId] = useState(0);
  const hopTimer = useRef<number | null>(null);
  const playHop = useCallback(() => {
    if (hopTimer.current !== null) window.clearTimeout(hopTimer.current);
    setHopping(true);
    setHopId(value => value + 1);
    hopTimer.current = window.setTimeout(() => { setHopping(false); hopTimer.current = null; }, 1900);
  }, []);
  useEffect(() => () => {
    if (hopTimer.current !== null) window.clearTimeout(hopTimer.current);
    hopTimer.current = null;
  }, []);

  useEffect(() => {
    if (!enabled) {
      setHopping(false);
      setTip(false);
      return;
    }

    let cancelled = false;
    const timers: number[] = [];

    function hop(nextDelay: number) {
      if (cancelled) return;
      if (hopTimer.current !== null) {
        timers.push(window.setTimeout(() => hop(restDelay()), nextDelay));
        return;
      }
      playHop();
      setTip(true);
      timers.push(
        window.setTimeout(() => {
          if (cancelled) return;
          setTip(false);
          timers.push(window.setTimeout(() => hop(restDelay()), nextDelay));
        }, 3600),
      );
    }

    timers.push(window.setTimeout(() => hop(restDelay()), 2200));

    return () => {
      cancelled = true;
      timers.forEach((id) => window.clearTimeout(id));
    };
  }, [enabled, playHop]);

  return { hopping, tip, hopId, playHop };
}
