"use client";

import { useEffect, useState } from "react";

function restDelay() {
  return 8000 + Math.random() * 7000;
}

export function useAppleHop(enabled = true) {
  const [hopping, setHopping] = useState(false);
  const [tip, setTip] = useState(false);

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
      setHopping(true);
      setTip(true);
      timers.push(
        window.setTimeout(() => {
          if (!cancelled) setHopping(false);
        }, 1900),
      );
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
  }, [enabled]);

  return { hopping, tip };
}
