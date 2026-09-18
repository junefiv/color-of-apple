"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ColorBleed } from "@/components/flow/color-bleed";
import { MatchingLoader } from "@/components/flow/matching-loader";
import { Workbench } from "@/components/workbench/workbench";
import { parseToOklch } from "@/lib/color-engine";
import { useMatchuStore } from "@/lib/store";

export default function ResultPage() {
  const router = useRouter();
  const skipLoader = useMatchuStore((state) => state.skipLoader);
  const matchNonce = useMatchuStore((state) => state.matchNonce);
  const setSkipLoader = useMatchuStore((state) => state.setSkipLoader);
  const pendingBleed = useMatchuStore((state) => state.pendingBleed);
  const setPendingBleed = useMatchuStore((state) => state.setPendingBleed);
  const bleedKey = useMatchuStore((state) => state.bleedKey);
  const hydrated = useMatchuStore((state) => state.hydrated);
  const hex = useMatchuStore((state) => state.input.hex);
  const [ready, setReady] = useState(skipLoader);

  useEffect(() => {
    setReady(skipLoader);
  }, [skipLoader, matchNonce]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      parseToOklch(hex);
    } catch {
      router.replace("/");
    }
  }, [hex, hydrated, router]);

  const finish = useCallback(() => {
    setReady(true);
    setSkipLoader(true);
  }, [setSkipLoader]);

  const finishBleed = useCallback(() => {
    setPendingBleed(false);
  }, [setPendingBleed]);

  if (!hydrated) {
    return <div className="min-h-screen bg-[var(--background)]" />;
  }

  try {
    parseToOklch(hex);
  } catch {
    return <div className="min-h-screen bg-[var(--background)]" />;
  }

  if (!ready) {
    return <MatchingLoader onDone={finish} />;
  }

  return (
    <div className="color-bleed-root" data-pending-bleed={pendingBleed ? "true" : "false"}>
      <Workbench />
      {pendingBleed ? (
        <ColorBleed key={bleedKey} hex={hex} play onDone={finishBleed} />
      ) : null}
    </div>
  );
}
