import { apiFetch } from "./client";

export interface UserDto {
  id: string;
  name?: string;
  email?: string;
  isLinked: boolean;
}

let registerInflight: Promise<UserDto> | null = null;

export function registerUser(): Promise<UserDto> {
  if (!registerInflight) {
    registerInflight = apiFetch<UserDto>(`/api/users/register`, {
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
