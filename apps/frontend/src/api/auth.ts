import { User } from "../types/user";
import { apiFetch } from "./client";

export function loginWithGoogle(credential: string): Promise<User> {
  return apiFetch<User>("/api/auth/google", {
    method: "POST",
    body: JSON.stringify({ credential }),
  });
}

export function logout(): Promise<{ ok: boolean }> {
  return apiFetch<{ ok: boolean }>("/api/auth/logout", {
    method: "POST",
  });
}

export async function fetchAuthMe(): Promise<User | null> {
  try {
    return await apiFetch<User>("/api/auth/me");
  } catch {
    return null;
  }
}
