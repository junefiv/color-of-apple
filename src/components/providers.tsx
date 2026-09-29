"use client";

import { PersistGate } from "@/components/persist-gate";
import { AuthProvider } from "@/components/auth/auth-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <TooltipProvider>
        <PersistGate />
        {children}
        <Toaster theme="light" position="bottom-center" />
      </TooltipProvider>
    </AuthProvider>
  );
}
