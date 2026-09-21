"use client";

import { useEffect, useLayoutEffect } from "react";
import { readDraft, useMatchuStore, writeDraft } from "@/lib/store";

const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

export function PersistGate() {
  useIsomorphicLayoutEffect(() => {
    const saved = readDraft();
    if (saved) {
      useMatchuStore.getState().hydrate(saved);
    } else {
      useMatchuStore.getState().hydrate({});
    }

    const unsubscribe = useMatchuStore.subscribe((state) => {
      writeDraft(state);
      document.documentElement.lang = state.locale;
      if (state.hasMatched && state.matchedHex) {
        document.documentElement.style.setProperty("--match-primary", state.matchedHex);
      } else {
        document.documentElement.style.removeProperty("--match-primary");
      }
    });

    const current = useMatchuStore.getState();
    document.documentElement.lang = current.locale;

    return unsubscribe;
  }, []);

  return null;
}
