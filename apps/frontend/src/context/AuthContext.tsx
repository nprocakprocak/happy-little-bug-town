"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { fetchAuthMe, logout as logoutRequest, type AuthUser } from "../api/auth";
import { AID_STORAGE_KEY } from "../constants/aid";
import { useRegisterUserMutation } from "../hooks/useUser";
import { setGoogleAuthHandlers } from "../lib/authReceiver";

interface AuthContextValue {
  anonymousId: string;
  authUser: AuthUser | null;
  isSessionLoading: boolean;
  requiresLogin: boolean;
  setRequiresLogin: (value: boolean) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [anonymousId, setAnonymousId] = useState("");
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [isSessionLoading, setIsSessionLoading] = useState(true);
  const [requiresLogin, setRequiresLogin] = useState(false);
  const { mutateAsync: registerUser } = useRegisterUserMutation();
  const queryClient = useQueryClient();

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
      if (me) {
        setAnonymousId(me.id);
        localStorage.setItem(AID_STORAGE_KEY, me.id);
      }
      setIsSessionLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [registerUser]);

  useEffect(() => {
    setGoogleAuthHandlers({
      onSuccess: async (user) => {
        setAnonymousId(user.id);
        setAuthUser(user);
        setRequiresLogin(false);
        queryClient.clear();
        await queryClient.refetchQueries();
      },
      onError: (error) => {
        console.error("Google auth failed:", error);
      },
    });

    return () => {
      setGoogleAuthHandlers(null);
    };
  }, [queryClient]);

  const logout = useCallback(async () => {
    await logoutRequest();

    const newAid = crypto.randomUUID();
    localStorage.setItem(AID_STORAGE_KEY, newAid);
    await registerUser();

    setAnonymousId(newAid);
    setAuthUser(null);
    setRequiresLogin(false);
    queryClient.clear();
    await queryClient.refetchQueries();

    google?.accounts?.id?.disableAutoSelect();
  }, [queryClient, registerUser]);

  const value = useMemo(
    () => ({
      anonymousId,
      authUser,
      isSessionLoading,
      requiresLogin,
      setRequiresLogin,
      logout,
    }),
    [anonymousId, authUser, isSessionLoading, requiresLogin, logout],
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
