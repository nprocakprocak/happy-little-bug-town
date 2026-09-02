"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { fetchAuthMe, logout as logoutRequest } from "../api/auth";
import { registerUser, resetGame as resetGameRequest, resetRegisterUserCache } from "../api/users";
import { setGoogleAuthHandlers } from "../components/helpers/googleAuth";
import { queryKeys } from "../constants/queryKeys";
import { useMainStore } from "../stores/main";
import { User } from "../types/user";

interface AuthContextValue {
  anonymousId: string;
  authUser: User | null;
  isSessionLoading: boolean;
  logout: () => Promise<void>;
  resetGame: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [anonymousId, setAnonymousId] = useState("");
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [isSessionLoading, setIsSessionLoading] = useState(true);
  const setRequiresLogin = useMainStore((state) => state.setRequiresLogin);
  const setEvolvingToStructureType = useMainStore((state) => state.setEvolvingToStructureType);
  const setIsDemolishMode = useMainStore((state) => state.setIsDemolishMode);
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
        setIsDemolishMode(false);
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
  }, [queryClient, setRequiresLogin, setIsDemolishMode]);

  const applyUserSession = useCallback(
    async (user: User) => {
      setAnonymousId(user.id);
      queryClient.setQueryData(queryKeys.user(user.id), user);
      setAuthUser(user.isLinked ? user : null);
      setRequiresLogin(false);
      setEvolvingToStructureType(null);
      setIsDemolishMode(false);
      queryClient.clear();
      await queryClient.refetchQueries();
    },
    [queryClient, setRequiresLogin, setEvolvingToStructureType, setIsDemolishMode],
  );

  const logout = useCallback(async () => {
    await logoutRequest();

    resetRegisterUserCache();
    const registered = await registerUser();
    await applyUserSession(registered);

    google?.accounts?.id?.disableAutoSelect();
  }, [applyUserSession]);

  const resetGame = useCallback(async () => {
    const user = await resetGameRequest();
    resetRegisterUserCache();
    await applyUserSession(user);
  }, [applyUserSession]);

  const value = useMemo(
    () => ({
      anonymousId,
      authUser,
      isSessionLoading,
      logout,
      resetGame,
    }),
    [anonymousId, authUser, isSessionLoading, logout, resetGame],
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
