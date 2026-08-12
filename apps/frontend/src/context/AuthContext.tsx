"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { fetchAuthMe, logout as logoutRequest, type AuthUser } from "../api/auth";
import { registerUser, resetRegisterUserCache } from "../api/users";
import { queryKeys } from "../constants/queryKeys";
import { useMainStore } from "../stores/main";
import { setGoogleAuthHandlers } from "../utils/authReceiver";

interface AuthContextValue {
  anonymousId: string;
  authUser: AuthUser | null;
  isSessionLoading: boolean;
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
  const setRequiresLogin = useMainStore((state) => state.setRequiresLogin);
  const setIsTransformingToAnthill = useMainStore((state) => state.setIsTransformingToAnthill);
  const queryClient = useQueryClient();

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const registered = await registerUser();
        if (cancelled) {
          return;
        }

        setAnonymousId(registered.id);
        queryClient.setQueryData(queryKeys.user(registered.id), registered);

        const me = await fetchAuthMe();
        if (cancelled) {
          return;
        }

        setAuthUser(me);
        if (me) {
          setAnonymousId(me.id);
        }
      } catch (error) {
        console.error("Failed to register anonymous user:", error);
      } finally {
        if (!cancelled) {
          setIsSessionLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [queryClient]);

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
  }, [queryClient, setRequiresLogin]);

  const logout = useCallback(async () => {
    await logoutRequest();

    resetRegisterUserCache();
    const registered = await registerUser();

    setAnonymousId(registered.id);
    queryClient.setQueryData(queryKeys.user(registered.id), registered);
    setAuthUser(null);
    setRequiresLogin(false);
    setIsTransformingToAnthill(false);
    queryClient.clear();
    await queryClient.refetchQueries();

    google?.accounts?.id?.disableAutoSelect();
  }, [queryClient, setRequiresLogin, setIsTransformingToAnthill]);

  const value = useMemo(
    () => ({
      anonymousId,
      authUser,
      isSessionLoading,
      logout,
    }),
    [anonymousId, authUser, isSessionLoading, logout],
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
