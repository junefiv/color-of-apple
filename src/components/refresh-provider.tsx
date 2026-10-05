"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { createPortal } from "react-dom";
import { LoaderCircle } from "lucide-react";

type RefreshContextValue = {
  runRefresh: <T>(message: string, action: () => T | Promise<T>) => Promise<T>;
};

const RefreshContext = createContext<RefreshContextValue | null>(null);

export function RefreshProvider({ children }: { children: React.ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);
  const runRefresh = useCallback(async <T,>(label: string, action: () => T | Promise<T>) => {
    const started = performance.now();
    setMessage(label);
    try {
      return await action();
    } finally {
      // Keep even instant language changes visible long enough to register.
      const remaining = Math.max(0, 500 - (performance.now() - started));
      await new Promise(resolve => window.setTimeout(resolve, remaining));
      setMessage(null);
    }
  }, []);

  return (
    <RefreshContext.Provider value={{ runRefresh }}>
      <div className="contents" inert={message !== null} aria-busy={message !== null}>{children}</div>
      {message !== null ? createPortal(
        <div className="fixed inset-0 z-[100] grid place-items-center bg-background/90 backdrop-blur-sm animate-in fade-in duration-150 motion-reduce:animate-none">
          <div role="status" aria-live="polite" className="flex flex-col items-center gap-3 px-6 text-center text-foreground">
            <LoaderCircle aria-hidden className="size-7 animate-spin motion-reduce:animate-none" />
            <p className="text-sm font-medium">{message}</p>
          </div>
        </div>, document.body,
      ) : null}
    </RefreshContext.Provider>
  );
}

export function useRefresh() {
  const value = useContext(RefreshContext);
  if (!value) throw new Error("useRefresh must be used inside RefreshProvider");
  return value;
}
