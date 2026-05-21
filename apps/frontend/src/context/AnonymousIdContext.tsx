"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

import { AID_STORAGE_KEY } from "../constants/aid";
import { useUpdateUserMutation } from "../hooks/useUser";

interface AnonymousIdContextValue {
  anonymousId: string;
}

const AnonymousIdContext = createContext<AnonymousIdContextValue | null>(null);

interface AnonymousIdProviderProps {
  children: React.ReactNode;
}

export function AnonymousIdProvider({ children }: AnonymousIdProviderProps) {
  const [anonymousId, setAnonymousId] = useState("");
  const { mutateAsync: registerUser } = useUpdateUserMutation();

  useEffect(() => {
    (async () => {
      const stored = localStorage.getItem(AID_STORAGE_KEY);
      const anonId = stored ?? crypto.randomUUID();
      if (!stored) {
        localStorage.setItem(AID_STORAGE_KEY, anonId);
        await registerUser(anonId);
      }
      setAnonymousId(anonId);
    })();
  }, [registerUser]);

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
