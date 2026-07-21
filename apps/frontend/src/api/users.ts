import { apiFetch } from "./client";

export interface UserDto {
  id: string;
  name?: string;
  email?: string;
  isLinked: boolean;
}

export function registerUser(): Promise<UserDto> {
  return apiFetch<UserDto>(`/api/users/register`, {
    method: "POST",
  });
}
