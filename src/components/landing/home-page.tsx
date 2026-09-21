"use client";

import dynamic from "next/dynamic";
import { HomePageFallback } from "@/components/landing/home-page-fallback";

const HomeClient = dynamic(() => import("@/components/landing/home-client"), {
  ssr: false,
  loading: () => <HomePageFallback />,
});

export function HomePage() {
  return <HomeClient />;
}
