"use client";

import { Suspense } from "react";
import { Workbench } from "@/components/workbench/workbench";

export default function CommunityPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--background)]" />}>
      <Workbench mode="community" />
    </Suspense>
  );
}
