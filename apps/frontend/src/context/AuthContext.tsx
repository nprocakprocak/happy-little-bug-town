"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

import { fetchAuthMe, type AuthUser } from "../api/auth";
import { AID_STORAGE_KEY } from "../constants/aid";
import { useRegisterUserMutation } from "../hooks/useUser";

interface AuthContextValue {
  anonymousId: string;
  authUser: AuthUser | null;
  isSessionLoading: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [anonymousId, setAnonymousId] = useState("");
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [isSessionLoading, setIsSessionLoading] = useState(true);
  const { mutateAsync: registerUser } = useRegisterUserMutation();

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const stored = localStorage.getItem(AID_STORAGE_KEY);
      const anonId = stored ?? crypto.randomUUID();
      if (!stored) {
        localStorage.setItem(AID_STORAGE_KEY, anonId);
        await registerUser();
      }

      if (cancelled) {
        return;
      }

      setAnonymousId(anonId);

      const me = await fetchAuthMe();
      if (cancelled) {
        return;
      }

      setAuthUser(me);
      setIsSessionLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [registerUser]);

  const value = useMemo(
    () => ({ anonymousId, authUser, isSessionLoading }),
    [anonymousId, authUser, isSessionLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
