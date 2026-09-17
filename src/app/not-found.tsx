"use client";

import Link from "next/link";
import { SiteHeader } from "@/components/brand/site-header";
import { Button } from "@/components/ui/button";
import { useCopy } from "@/hooks/use-copy";

export default function NotFound() {
  const copy = useCopy();

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto flex max-w-lg flex-1 flex-col justify-center px-5">
        <h1 className="h1-title">{copy.notFound.title}</h1>
        <p className="lead mt-3">{copy.notFound.body}</p>
        <Button className="mt-6 w-fit" nativeButton={false} render={<Link href="/" />}>
          {copy.notFound.cta}
        </Button>
      </main>
    </div>
  );
}
