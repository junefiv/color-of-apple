"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { SiteHeader } from "@/components/brand/site-header";
import { ColorBleed } from "@/components/flow/color-bleed";
import { MatchingLoader } from "@/components/flow/matching-loader";
import { Button } from "@/components/ui/button";
import { Workbench } from "@/components/workbench/workbench";
import { useCopy } from "@/hooks/use-copy";
import { parseToOklch } from "@/lib/color-engine";
import { decodeShare } from "@/lib/share/encode";
import { useMatchuStore } from "@/lib/store";

function ResultContent() {
  const router = useRouter();
  const params = useSearchParams();
  const payload = params.get("d");
  const projectId = params.get("p");
  const decoded = useMemo(() => payload ? decodeShare(payload) : null, [payload]);
  const skipLoader = useMatchuStore((state) => state.skipLoader);
  const matchNonce = useMatchuStore((state) => state.matchNonce);
  const setSkipLoader = useMatchuStore((state) => state.setSkipLoader);
  const pendingBleed = useMatchuStore((state) => state.pendingBleed);
  const setPendingBleed = useMatchuStore((state) => state.setPendingBleed);
  const bleedKey = useMatchuStore((state) => state.bleedKey);
  const hydrated = useMatchuStore((state) => state.hydrated);
  const hex = useMatchuStore((state) => state.input.hex);
  const [ready, setReady] = useState(skipLoader);
  const [restoredPayload, setRestoredPayload] = useState<string | null>(null);

  useEffect(() => {
    if (!hydrated || !payload || !decoded) return;
    useMatchuStore.setState({
      input: decoded.input,
      selectedPaletteId: decoded.selectedPaletteId,
      platform: decoded.platform,
      previewTab: decoded.previewTab,
      hasMatched: true,
      matchedHex: decoded.input.hex,
      matchStage: "done",
      skipLoader: true,
      pendingBleed: false,
      palettesRevealed: true,
    });
    setReady(true);
    setRestoredPayload(payload);
  }, [decoded, hydrated, payload]);

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

  if (payload && !decoded) {
    return <InvalidShare />;
  }

  if (!hydrated || (payload && restoredPayload !== payload)) {
    return <div className="min-h-screen bg-[var(--background)]" />;
  }

  try {
    parseToOklch(hex);
  } catch {
    return <div className="min-h-screen bg-[var(--background)]" />;
  }

  if (!ready && !decoded) {
    return <MatchingLoader onDone={finish} />;
  }

  return (
    <div className="color-bleed-root" data-pending-bleed={pendingBleed ? "true" : "false"}>
      <Workbench
        key={payload ?? "local"}
        projectId={projectId}
        initialTokenOverrides={decoded?.overrides}
        initialTokenSnapshot={decoded?.tokenSnapshot}
        initialProjectTitle={decoded?.projectTitle}
      />
      {pendingBleed ? (
        <ColorBleed key={bleedKey} hex={hex} play onDone={finishBleed} />
      ) : null}
    </div>
  );
}

function InvalidShare() {
  const copy = useCopy();
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto flex max-w-lg flex-1 flex-col justify-center px-5">
        <h1 className="text-3xl font-semibold">{copy.share.invalid}</h1>
        <Button className="mt-6 w-fit" nativeButton={false} render={<Link href="/" />}>
          {copy.share.back}
        </Button>
      </main>
    </div>
  );
}

export default function ResultPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--background)]" />}>
      <ResultContent />
    </Suspense>
  );
}
