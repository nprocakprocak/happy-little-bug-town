import { apiFetch } from "./client";

export interface AuthUser {
  id: string;
  name?: string;
  email?: string;
  isLinked: boolean;
}

export function loginWithGoogle(credential: string): Promise<AuthUser> {
  return apiFetch<AuthUser>("/api/auth/google", {
    method: "POST",
    body: JSON.stringify({ credential }),
  });
}

export function logout(): Promise<{ ok: boolean }> {
  return apiFetch<{ ok: boolean }>("/api/auth/logout", {
    method: "POST",
  });
}

export async function fetchAuthMe(): Promise<AuthUser | null> {
  try {
    return await apiFetch<AuthUser>("/api/auth/me");
  } catch {
    return null;
  }
}
