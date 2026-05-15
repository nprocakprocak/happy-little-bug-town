"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

interface AnonymousIdContextValue {
  anonymousId: string;
}

const AnonymousIdContext = createContext<AnonymousIdContextValue | null>(null);

interface AnonymousIdProviderProps {
  children: React.ReactNode;
}

export function AnonymousIdProvider({ children }: AnonymousIdProviderProps) {
  const [anonymousId, setAnonymousId] = useState("");

  useEffect(() => {
    (async () => {
      const stored = localStorage.getItem("aid");
      const anonId = stored ?? crypto.randomUUID();
      if (!stored) {
        localStorage.setItem("aid", anonId);
      }
      await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/${anonId}`, {
        method: "PUT",
        credentials: "include",
      });
      setAnonymousId(anonId);
    })();
  }, []);

  const value = useMemo(() => ({ anonymousId }), [anonymousId]);

  return <AnonymousIdContext.Provider value={value}>{children}</AnonymousIdContext.Provider>;
}

export function useAnonymousId(): AnonymousIdContextValue {
  const context = useContext(AnonymousIdContext);
  if (!context) {
    throw new Error("useAnonymousId must be used within AnonymousIdProvider");
  }
  return context;
}
