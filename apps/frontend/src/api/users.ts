import { User } from "../types/user";
import { apiFetch } from "./client";

let registerInflight: Promise<User> | null = null;

export function registerUser(): Promise<User> {
  if (!registerInflight) {
    registerInflight = apiFetch<User>(`/api/users/register`, {
      method: "POST",
    }).catch((error: unknown) => {
      registerInflight = null;
      throw error;
    });
  }

  return registerInflight;
}

export function resetRegisterUserCache(): void {
  registerInflight = null;
}

export function resetGame(): Promise<User> {
  return apiFetch<User>("/api/users/reset-game", {
    method: "POST",
  });
}
