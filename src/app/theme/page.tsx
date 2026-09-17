"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { SiteHeader } from "@/components/brand/site-header";
import { Button } from "@/components/ui/button";
import { useCopy } from "@/hooks/use-copy";
import { decodeShare } from "@/lib/share/encode";
import { useMatchuStore } from "@/lib/store";

function ThemeRestore() {
  const copy = useCopy();
  const router = useRouter();
  const params = useSearchParams();
  const replaceInput = useMatchuStore((state) => state.replaceInput);
  const setSkipLoader = useMatchuStore((state) => state.setSkipLoader);
  const payload = params.get("d");
  const decoded = payload ? decodeShare(payload) : null;

  useEffect(() => {
    if (!decoded) return;
    replaceInput(decoded);
    useMatchuStore.getState().resetMatch();
    setSkipLoader(false);
    router.replace("/result");
  }, [decoded, replaceInput, router, setSkipLoader]);

  if (decoded) {
    return null;
  }

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

export default function ThemePage() {
  return (
    <Suspense>
      <ThemeRestore />
    </Suspense>
  );
}
